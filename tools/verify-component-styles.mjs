#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distRoot = resolve(__dirname, '../dist/packages');

// --- Emitted component styles must be valid plain CSS -----------------------
// Inline `styles:` in a component are NOT Sass-preprocessed by ng-packagr, so
// a Sass `//` line comment leaks into the shipped CSS verbatim. Browsers then
// parse everything up to the next `}` as one invalid declaration, silently
// dropping the declarations caught in between (this shipped once: the icon's
// vertical-align was swallowed). Scan every published bundle's component
// styles for a leaked `//` (`://` as in url(https://…) is allowed).

if (!existsSync(distRoot)) {
  console.error(
    '✗ dist/packages missing — build first: pnpm exec nx run-many --target=build --all'
  );
  process.exit(1);
}

const bundles = [];
for (const pkg of readdirSync(distRoot)) {
  const fesmDir = join(distRoot, pkg, 'fesm2022');
  if (!existsSync(fesmDir)) continue;
  for (const file of readdirSync(fesmDir)) {
    if (file.endsWith('.mjs')) bundles.push({ pkg, path: join(fesmDir, file) });
  }
}

const STYLES_ARRAY = /styles:\s*\[((?:\s*"(?:[^"\\]|\\.)*"\s*,?)+)\]/g;
const STRING_LITERAL = /"((?:[^"\\]|\\.)*)"/g;
const LEAKED_COMMENT = /(?<!:)\/\//;

const errors = [];
let stylesScanned = 0;

for (const { pkg, path } of bundles) {
  const source = readFileSync(path, 'utf8');
  for (const [, arrayBody] of source.matchAll(STYLES_ARRAY)) {
    for (const [, css] of arrayBody.matchAll(STRING_LITERAL)) {
      stylesScanned++;
      const at = css.search(LEAKED_COMMENT);
      if (at !== -1) {
        const snippet = css.slice(Math.max(0, at - 40), at + 60);
        errors.push(
          `✗ [${pkg}] Sass \`//\` comment leaked into emitted CSS: …${snippet}…`
        );
      }
    }
  }
}

if (stylesScanned === 0) {
  errors.push(
    '✗ No component styles found in any fesm2022 bundle — the extraction pattern is stale; update this script.'
  );
}

// --- Bridge line-height guard -----------------------------------------------
// The form field's line-height must stay INHERITED. Material reads
//   line-height: var(--mat-form-field-container-text-line-height,
//                    var(--mat-sys-body-large-line-height))
// and _bridge.scss deliberately sets NEITHER, so the declaration is invalid at
// computed-value time and the value inherits — 24px at the document root, but
// 20px inside mat-dialog-content or a .mat-mdc-row, where an ancestor sets an
// absolute line-height from --mat-sys-body-medium-line-height. Every height
// calculation in the density design depends on that value.
//
// This is guarded STATICALLY because a rendered assertion provably cannot do it:
// at the document root a pinned `1.5em` computes to the same 24px as the
// inherited value, and the showcase renders no form field under either divergent
// ancestor. Tried and confirmed — the e2e suite stayed green with the pin in
// place. Declaring either token converts an inherited, context-dependent value
// into a fixed one and silently changes rendering for nested form fields: it grew
// a rows="3" textarea inside a dialog from 92px to 95px at DEFAULT density.
//
// BOTH _bridge.scss AND _density.scss are scanned. The bridge holds the
// unconditional form-field-overrides(); _density.scss holds the per-level ones,
// and a container-text-line-height pinned inside a level block is the same
// hazard reached a different way (it would fix the line-height whenever that
// level is active). Scanning only the bridge would leave that door open now that
// per-level form-field-overrides() live in _density.scss.
const guardedScssPaths = [
  '../packages/material-preset/src/styles/_bridge.scss',
  '../packages/material-preset/src/styles/_density.scss',
];
for (const rel of guardedScssPaths) {
  const scssPath = resolve(__dirname, rel);
  const scssLines = readFileSync(scssPath, 'utf8').split(/\r?\n/);
  const fileName = rel.split('/').pop();
  for (const banned of ['container-text-line-height', '--mat-sys-body-large-line-height']) {
    // Comment lines name both deliberately, in the explanation above the override.
    const declared = scssLines.some(
      (line) => !line.trim().startsWith('//') && line.includes(banned)
    );
    if (declared) {
      errors.push(
        '✗ ' +
          fileName +
          ' declares `' +
          banned +
          "`. The form field's line-height must stay INHERITED — pinning it changes " +
          'rendering for form fields nested under an ancestor with an absolute ' +
          'line-height (dialog content, table rows), at DEFAULT density. See the ' +
          'comment above mat.form-field-overrides() in _bridge.scss.'
      );
    }
  }
}

if (errors.length > 0) {
  console.error('\nComponent style verification failed:\n');
  errors.forEach((e) => console.error(' ', e));
  console.error(
    '\nUse /* … */ block comments in component styles — inline `styles:` are emitted as raw CSS.\n'
  );
  process.exit(1);
}

console.log(
  `✓ ${stylesScanned} emitted component styles across ${bundles.length} bundles are valid plain CSS (no Sass \`//\` leaks).`
);
