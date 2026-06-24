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
const SCSS_USES =
  "@use '@rhombuskit/tokens/scss';\n" +
  "@use '@rhombuskit/material-preset/scss';\n" +
  "@use '@rhombuskit/core/scss';\n";

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
          SCSS_USES,
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
          SCSS_USES,
      );
      return;
    }

    const current = tree.read(stylePath)?.toString('utf-8') ?? '';
    if (current.includes('@rhombuskit/core/scss')) return;

    const recorder = tree.beginUpdate(stylePath);
    recorder.insertLeft(0, SCSS_USES + '\n');
    tree.commitUpdate(recorder);
  };
}
