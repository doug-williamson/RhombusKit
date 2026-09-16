#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// --- Setup surfaces must agree, and none may prescribe @angular/animations ---
// RhombusKit imports nothing from @angular/animations (every transition is CSS
// on the motion tokens) and Angular Material 21 needs no animations provider
// either. The README, the showcase config and the StackBlitz starter once all
// told consumers to install and register it anyway — dead weight for every app
// that followed them, and a contradiction with the `ng add` schematic, which
// wires only provideRhombusTheme() + provideRhombusIcons({}). Two checks:
//   1. no setup surface or package source imports/prescribes @angular/animations;
//   2. the README's "Providers" snippet names exactly the providers `ng add`
//      adds, so the two cannot drift again.

const errors = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      walk(path, out);
    } else {
      out.push(path);
    }
  }
  return out;
}

const rel = (p) => relative(root, p).replace(/\\/g, '/');

// 1. Prescriptions of @angular/animations. Prose mentions ("no
//    @angular/animations") are fine; imports, provider calls and dependency
//    entries are not.
const PRESCRIPTIONS = [
  /from\s+['"]@angular\/(?:platform-browser\/)?animations(?:\/async)?['"]/,
  /\bprovideAnimations(?:Async)?\s*\(/,
  /['"]@angular\/animations['"]\s*:/,
];

const sourceFiles = [
  ...walk(join(root, 'packages')).filter(
    (p) =>
      /[\\/]src[\\/]/.test(p) &&
      /\.(ts|mjs|md)$/.test(p) &&
      !/\.spec(?:-helpers)?\.ts$/.test(p) &&
      !/[\\/]src[\\/]testing[\\/]/.test(p) &&
      !/[\\/]generated[\\/]/.test(p)
  ),
  ...walk(join(root, 'apps', 'showcase', 'src')).filter(
    (p) => /\.ts$/.test(p) && !/\.spec\.ts$/.test(p) && !/[\\/]generated[\\/]/.test(p)
  ),
  join(root, 'packages', 'core', 'README.md'),
  join(root, 'README.md'),
  join(root, 'docs', 'theming.md'),
  join(root, 'apps', 'showcase', 'public', 'llms.txt'),
  join(root, 'apps', 'showcase', 'public', 'llms-full.txt'),
];

for (const file of sourceFiles) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (PRESCRIPTIONS.some((re) => re.test(line))) {
      errors.push(`${rel(file)}:${i + 1} prescribes @angular/animations: ${line.trim()}`);
    }
  });
}

// 2. README "Providers" snippet == the providers `ng add` wires.
const schematic = readFileSync(
  join(root, 'packages', 'core', 'schematics', 'ng-add', 'index.ts'),
  'utf8'
);
const ngAddProviders = [
  ...schematic.matchAll(/addRootProvider\([^]*?external\('(provide\w+)'/g),
].map((m) => m[1]);

const readme = readFileSync(join(root, 'packages', 'core', 'README.md'), 'utf8');
const providersSnippet = /\*\*2\. Providers\*\*[^]*?```ts\r?\n([^]*?)```/.exec(readme)?.[1];
if (!providersSnippet) {
  errors.push('packages/core/README.md: could not find the "**2. Providers**" ```ts snippet');
}
const readmeProviders = (providersSnippet ?? '')
  .split('\n')
  .filter((line) => !/^\s*\/\//.test(line)) // commented-out optional providers
  .flatMap((line) => [...line.matchAll(/\b(provide\w+)\s*\(/g)].map((m) => m[1]));

const sameSet =
  ngAddProviders.length === readmeProviders.length &&
  ngAddProviders.every((p) => readmeProviders.includes(p));
if (!sameSet) {
  errors.push(
    `packages/core/README.md "Providers" snippet lists [${readmeProviders.join(', ')}] ` +
      `but \`ng add\` wires [${ngAddProviders.join(', ')}] (packages/core/schematics/ng-add/index.ts)`
  );
}

if (errors.length) {
  console.error('✗ setup docs drift:\n' + errors.map((e) => `  ${e}`).join('\n'));
  process.exit(1);
}
console.log(
  `✓ ${sourceFiles.length} setup surfaces prescribe no @angular/animations; ` +
    `README providers match ng add (${ngAddProviders.join(', ')}).`
);
