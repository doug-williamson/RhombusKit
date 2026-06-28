import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  addDependency,
  addRootProvider,
  DependencyType,
  InstallBehavior,
  readWorkspace,
} from '@schematics/angular/utility';
import { Schema } from './schema';

// Order matters — tokens (the CONTRACT) → material-preset (Material bridge) →
// core (component/directive globals). Mirrors apps/showcase/src/styles.scss.
// Each layer is aliased so the three `/scss` entry points don't collide on a
// shared default namespace, and so the bridge mixin can be invoked below.
const SCSS_USES =
  "@use '@rhombuskit/tokens/scss' as tokens;\n" +
  "@use '@rhombuskit/material-preset/scss' as rhombus;\n" +
  "@use '@rhombuskit/core/scss' as core;\n";

// As of v1.9 the Material bridge is opt-in: include the mixin on the element
// that carries `data-theme` (here :root) so every --mat-sys-* re-resolves per
// active theme + palette. Appended after the @use layers (and any existing
// rules) so the @use rules stay at the top of the file.
const SCSS_BRIDGE = ':root {\n  @include rhombus.material-bridge();\n}\n';

/** The full SCSS setup block, shown in the manual-setup warning paths. */
const SCSS_SETUP = SCSS_USES + '\n' + SCSS_BRIDGE;

/**
 * `ng add @rhombuskit/core` — wires the providers and the global SCSS layers so
 * a consumer is set up in one command. `@rhombuskit/theme-engine` and
 * `@rhombuskit/tokens` ship as dependencies of core; `@rhombuskit/material-preset`
 * (the Material → token bridge) is added here for the SCSS layer.
 */
export function ngAdd(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const project = options.project ?? workspace.projects.keys().next().value;

    const rules: Rule[] = [
      addDependency('@rhombuskit/material-preset', '^1.5.0', {
        type: DependencyType.Default,
        install: InstallBehavior.Auto,
      }),
    ];

    if (!project) {
      context.logger.warn(
        'RhombusKit: no project found — added the dependency, but wire the providers ' +
          'and SCSS layers manually:\n' +
          SCSS_SETUP,
      );
      return chain(rules);
    }

    rules.push(
      addRootProvider(project, ({ code, external }) =>
        code`${external('provideRhombusTheme', '@rhombuskit/theme-engine')}()`,
      ),
      addRootProvider(project, ({ code, external }) =>
        code`${external('provideRhombusIcons', '@rhombuskit/core')}({})`,
      ),
      addRhombusStyles(project),
    );
    return chain(rules);
  };
}

/** Prepend the three RhombusKit SCSS layers to the project's global stylesheet. */
function addRhombusStyles(projectName: string): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const project = workspace.projects.get(projectName);
    if (!project) {
      return;
    }

    const styles = (project.targets.get('build')?.options?.['styles'] ?? []) as Array<
      string | { input?: string }
    >;
    const stylePath = styles
      .map((entry) => (typeof entry === 'string' ? entry : entry?.input))
      .find((path): path is string => !!path && /\.s[ac]ss$/.test(path));

    if (!stylePath || !tree.exists(stylePath)) {
      context.logger.warn(
        'RhombusKit: no global .scss stylesheet found — add the SCSS layers manually:\n' +
          SCSS_SETUP,
      );
      return;
    }

    const current = tree.read(stylePath)?.toString('utf-8') ?? '';
    if (current.includes('@rhombuskit/core/scss')) return;

    // @use layers go to the top of the file; the bridge include is appended after
    // any existing rules (Sass requires @use before other rules). Both inserts
    // reference original offsets, so they don't interfere.
    const recorder = tree.beginUpdate(stylePath);
    recorder.insertLeft(0, SCSS_USES + '\n');
    recorder.insertRight(current.length, '\n' + SCSS_BRIDGE);
    tree.commitUpdate(recorder);
  };
}
