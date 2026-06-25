#!/usr/bin/env node
// New-component scaffolder (contribution flywheel, Wave 5d).
//
// Scaffolds a RhombusKit component in house style so a first-time contributor
// lands on a green-by-construction starting point instead of a blank file:
//
//   • packages/core/src/lib/<name>/rhombus-<name>.component.ts   (bespoke, OnPush)
//   • packages/core/src/lib/<name>/rhombus-<name>.component.scss (token-driven)
//   • packages/core/src/lib/<name>/rhombus-<name>.component.spec.ts (+ jest-axe)
//   • apps/showcase/src/app/pages/<name>/<name>-page.component.ts (component-page)
//
// and idempotently wires the three shared registries:
//   • packages/core/src/index.ts          — public barrel export
//   • apps/showcase/src/app/app.routes.ts — /components/<name> route
//   • apps/showcase/src/app/shared/navigation.ts — sidebar + Cmd-K entry
//
// It does NOT relax any CI gate. The surface-snapshot, token, llms, and a11y
// gates still hold; the generator instead PRINTS the exact follow-up commands a
// contributor must run (so the rigor is taught, not bypassed). See CONTRIBUTING.
//
//   node tools/new-component.mjs <name> [options]
//   node tools/new-component.mjs rating --title "Rating" --group "Status & layout"
//   node tools/new-component.mjs stepper --dry-run
//
// Options:
//   --title "Text"   Showcase display title         (default: Title Case of name)
//   --group "Label"  Nav group to file the page under (default: "Status & layout")
//   --dry-run        Print planned changes, write nothing
//   --force          Overwrite existing component/page files
//   -h, --help       Show this help
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const opts = { title: null, group: 'Status & layout', dryRun: false, force: false };
let name = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '-h' || a === '--help') usage(0);
  else if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--force') opts.force = true;
  else if (a === '--title') opts.title = argv[++i];
  else if (a === '--group') opts.group = argv[++i];
  else if (a.startsWith('--')) fail(`unknown option: ${a}`);
  else if (!name) name = a;
  else fail(`unexpected extra argument: ${a}`);
}

function usage(code) {
  console.log(
    [
      'Scaffold a new RhombusKit component in house style.',
      '',
      '  node tools/new-component.mjs <name> [--title "Text"] [--group "Label"] [--dry-run] [--force]',
      '',
      '  <name>     kebab-case component name, e.g. "rating" or "split-button"',
      '  --title    showcase display title         (default: Title Case of <name>)',
      '  --group    nav group for the doc page     (default: "Status & layout")',
      '  --dry-run  print planned changes, write nothing',
      '  --force    overwrite existing component/page files',
    ].join('\n'),
  );
  process.exit(code);
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!name) usage(1);

const NAME_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
if (!NAME_RE.test(name)) {
  fail(
    `invalid name "${name}". Use kebab-case: a letter, then lowercase ` +
      'letters/digits/hyphens (e.g. "rating", "split-button").',
  );
}

// --- derived identifiers ----------------------------------------------------
const parts = name.split('-');
const pascal = parts.map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const className = `Rhombus${pascal}Component`;
const variantType = `${pascal}Variant`;
const selector = `rhombus-${name}`;
const title = opts.title ?? parts.map((p) => p[0].toUpperCase() + p.slice(1)).join(' ');

// --- EOL handling -----------------------------------------------------------
// No EOL is enforced by lint (no eslint-prettier), and `* text=auto` normalizes
// every commit to LF. We still mirror a sibling source file's working-tree EOL
// so freshly written files don't look mixed next to their neighbours on Windows.
const detectEol = (s) => (s.includes('\r\n') ? '\r\n' : '\n');
const refEol = detectEol(read('packages/core/src/index.ts'));

function read(rel) {
  return readFileSync(resolve(root, rel), 'utf8');
}

// --- planned writes / edits -------------------------------------------------
const writes = []; // { rel, body }  — brand-new files
const edits = []; // { rel, label, apply(content) -> string | null }  — wired files
const skips = []; // strings — idempotent no-ops

const componentDir = `packages/core/src/lib/${name}`;
const pageDir = `apps/showcase/src/app/pages/${name}`;

if (existsSync(resolve(root, componentDir)) && !opts.force) {
  fail(`component already exists: ${componentDir} (pass --force to overwrite)`);
}

writes.push({ rel: `${componentDir}/rhombus-${name}.component.ts`, body: componentTs() });
writes.push({ rel: `${componentDir}/rhombus-${name}.component.scss`, body: componentScss() });
writes.push({ rel: `${componentDir}/rhombus-${name}.component.spec.ts`, body: componentSpec() });
writes.push({ rel: `${pageDir}/${name}-page.component.ts`, body: pageTs() });

queueBarrelEdit();
queueRouteEdit();
queueNavEdit();

// --- execute ----------------------------------------------------------------
const mode = opts.dryRun ? 'DRY RUN — nothing will be written' : 'scaffolding';
console.log(`\nRhombusKit new-component — ${mode}\n  name: ${name}  ·  class: ${className}  ·  title: ${title}\n`);

for (const w of writes) {
  if (opts.dryRun) {
    console.log(`  + ${w.rel}`);
    continue;
  }
  mkdirSync(resolve(root, dirname(w.rel)), { recursive: true });
  writeFileSync(resolve(root, w.rel), w.body.replace(/\n/g, refEol));
  console.log(`  ✓ wrote ${w.rel}`);
}

for (const e of edits) {
  const current = read(e.rel);
  const next = e.apply(current);
  if (next == null) {
    skips.push(`${e.label} (already wired in ${e.rel})`);
    continue;
  }
  if (opts.dryRun) {
    console.log(`  ~ ${e.rel}  (${e.label})`);
    continue;
  }
  writeFileSync(resolve(root, e.rel), next);
  console.log(`  ✓ wired ${e.label} → ${e.rel}`);
}

for (const s of skips) console.log(`  · skipped ${s}`);

printNextSteps();

// ===========================================================================
// Wiring edits — each returns the new file content, or null if already present
// (so re-running the generator is a safe no-op on the shared registries).
// ===========================================================================
function queueBarrelEdit() {
  edits.push({
    rel: 'packages/core/src/index.ts',
    label: 'barrel export',
    apply(content) {
      if (content.includes(`lib/${name}/rhombus-${name}.component`)) return null;
      const eol = detectEol(content);
      const block =
        `${eol}// ${title} — TODO: one-line description. Scaffolded by` +
        ` tools/new-component.mjs.${eol}` +
        `export { ${className} } from './lib/${name}/rhombus-${name}.component';${eol}` +
        `export type { ${variantType} } from './lib/${name}/rhombus-${name}.component';${eol}`;
      return content.replace(/\s*$/, eol) + block;
    },
  });
}

function queueRouteEdit() {
  edits.push({
    rel: 'apps/showcase/src/app/app.routes.ts',
    label: 'route',
    apply(content) {
      if (content.includes(`pages/${name}/${name}-page.component`)) return null;
      const eol = detectEol(content);
      // Insert before the components-group redirect sentinel.
      const sentinel = content
        .split(/\r?\n/)
        .find((l) => l.includes("redirectTo: 'button'"));
      if (!sentinel) return null; // structure changed — fall back to manual note
      const block =
        `      {${eol}` +
        `        path: '${name}',${eol}` +
        `        title: '${title}',${eol}` +
        `        loadComponent: () => import('./pages/${name}/${name}-page.component'),${eol}` +
        `      },${eol}`;
      return content.replace(sentinel, block + sentinel);
    },
  });
}

function queueNavEdit() {
  edits.push({
    rel: 'apps/showcase/src/app/shared/navigation.ts',
    label: `nav entry (group "${opts.group}")`,
    apply(content) {
      if (content.includes(`'/components/${name}'`)) return null;
      const eol = detectEol(content);
      const groupMarker = `label: '${opts.group}',`;
      const gi = content.indexOf(groupMarker);
      if (gi < 0) return null; // unknown group — fall back to manual note
      const itemsIdx = content.indexOf('items: [', gi);
      if (itemsIdx < 0) return null;
      const insertAt = content.indexOf('\n', itemsIdx) + 1;
      const line = `      { path: '/components/${name}', label: '${title}' },${eol}`;
      return content.slice(0, insertAt) + line + content.slice(insertAt);
    },
  });
}

function printNextSteps() {
  const unwired = skips.length; // informational only
  const lines = [
    '',
    'Next steps (these keep the CI gates green — the generator never relaxes them):',
    '',
    '  1. Flesh out the component, its SCSS, and its spec. Replace the TODOs and',
    '     the placeholder `variant` input with the real API.',
    '',
    '  2. Regenerate the public-API surface + showcase API tables (REQUIRED — the',
    '     new barrel export trips the snapshot gate until you do):',
    '       corepack pnpm exec nx build core',
    '       node tools/api-snapshot.mjs --update',
    '',
    '  3. Regenerate the llms.txt discovery files (the new nav entry changes them):',
    '       node tools/generate-llms.mjs',
    '',
    `  4. Add "${name}" to the contrast pass so its colours are AA-checked in both`,
    '     themes: apps/showcase-e2e/tests/contrast.spec.ts.',
    '',
    '  5. If you imported a NEW `@angular/*` package in the component, add it to',
    "     core's peerDependencies (packages/core/package.json) or the publish",
    '     smoke gate (tools/smoke-test-pack.mjs) fails.',
    '',
    '  6. Verify locally before pushing:',
    '       corepack pnpm exec nx lint core',
    '       corepack pnpm exec nx test core',
    '       corepack pnpm exec nx build showcase',
    '',
  ];
  if (unwired) {
    lines.push(
      '  Note: one or more shared registries were left untouched (see "skipped"',
      '  above) — wire them by hand if the scaffold could not.',
      '',
    );
  }
  console.log(lines.join('\n'));
}

// ===========================================================================
// File templates — faithful to the existing house style (see rhombus-spinner
// and the badge showcase page). Authored with \n; written using refEol.
// ===========================================================================
function componentTs() {
  return `import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/** Visual variant of \`<${selector}>\`. TODO: replace with the real variants. */
export type ${variantType} = 'default' | 'accent';

/**
 * \`<${selector}>\` — TODO: one sentence on what this component is and when to
 * reach for it (this doc comment is surfaced verbatim on the showcase API tab).
 *
 * \`\`\`html
 * <${selector}>Content</${selector}>
 * <${selector} variant="accent">Accented</${selector}>
 * \`\`\`
 */
@Component({
  selector: '${selector}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-${name}.component.scss',
  template: \`
    <div class="${selector}" [attr.data-variant]="variant()">
      <ng-content />
    </div>
  \`,
})
export class ${className} {
  /** Visual variant. TODO: replace with the inputs your component needs. */
  readonly variant = input<${variantType}>('default');
}
`;
}

function componentScss() {
  return `// ${title} — host layout + token-driven theming. Colours come from the
// @rhombuskit/tokens CONTRACT (see docs/theming.md); never hard-code a colour,
// always reach through a \`var(--token)\` so themes re-skin the component for free.
.${selector} {
  display: block;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background-color: var(--surface-1);
  color: var(--text-primary);
  font-family: var(--font-sans);

  &[data-variant='accent'] {
    border-color: var(--text-accent);
  }
}
`;
}

function componentSpec() {
  return `import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import { ${className}, ${variantType} } from './rhombus-${name}.component';

@Component({
  standalone: true,
  imports: [${className}],
  template: \`<${selector} [variant]="variant">Content</${selector}>\`,
})
class HostComponent {
  variant: ${variantType} = 'default';
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('${selector}', () => {
  it('projects its content', () => {
    const { el } = setup();
    expect(el.querySelector('.${selector}')?.textContent).toContain('Content');
  });

  it('reflects the variant to a data attribute', () => {
    const { fixture, host, el } = setup();
    host.variant = 'accent';
    fixture.detectChanges();
    expect(
      el.querySelector('.${selector}')?.getAttribute('data-variant'),
    ).toBe('accent');
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
`;
}

function pageTs() {
  return `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ${className} } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-${name}-page',
  standalone: true,
  imports: [RouterLink, ${className}, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <app-component-page title="${title}" apiKey="${className}">
      <div overview class="overview">
        <p class="overview__lead">
          TODO: one paragraph orienting the reader — what ${title} is, the
          problem it solves, and how it routes its colours through the token
          contract so it re-skins with the theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <${selector}>Content</${selector}>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>TODO: the primary scenario this component is for.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              TODO: point to a neighbouring component for the cases this one is
              <em>not</em> for, e.g. <a routerLink="/components/badge">Badge</a>.
            </li>
          </ul>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Variants</h2>
          <div class="showcase-row">
            <${selector}>Default</${selector}>
            <${selector} variant="accent">Accent</${selector}>
          </div>
        </section>
      </div>
    </app-component-page>
  \`,
})
export default class ${pascal}PageComponent {
  /** Minimal import + usage snippet shown in the Overview example. */
  protected readonly usage = \`import { ${className} } from '@rhombuskit/core';

@Component({
  selector: 'app-demo',
  imports: [${className}],
  template: \\\`<${selector}>Content</${selector}>\\\`,
})
export class DemoComponent {}\`;
}
`;
}
