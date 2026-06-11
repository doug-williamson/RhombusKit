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
