#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsImport } from 'tsx/esm/api';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensRoot = resolve(__dirname, '../packages/tokens');

// Load CONTRACT from source via tsx programmatic API so plain `node` works.
const typesUrl = new URL('../packages/tokens/src/types.ts', import.meta.url).href;
const { CONTRACT } = await tsImport(typesUrl, import.meta.url);

const themeCSS = readFileSync(
  resolve(tokensRoot, 'dist/css/theme-rhombus.css'),
  'utf8'
);

const themeNames = ['rhombus-light', 'rhombus-dark'];
const errors = [];

for (const themeName of themeNames) {
  const blockPattern = new RegExp(
    `\\[data-theme="${themeName}"\\]\\s*\\{([^}]+)\\}`,
    's'
  );
  const match = themeCSS.match(blockPattern);
  if (!match) {
    errors.push(`✗ Theme block missing: [data-theme="${themeName}"]`);
    continue;
  }
  const block = match[1];
  for (const name of CONTRACT) {
    if (!block.includes(name)) {
      errors.push(`✗ [${themeName}] missing token: ${name}`);
    }
  }
}

if (errors.length > 0) {
  console.error('\nToken verification failed:\n');
  errors.forEach(e => console.error(' ', e));
  console.error('\nRerun: pnpm run generate\n');
  process.exit(1);
}

console.log(`✓ All ${CONTRACT.length} contract tokens verified in ${themeNames.length} theme packs.`);
