#!/usr/bin/env node
// Copies SCSS partials from packages/material-preset/src/styles/ → dist/scss/.
// Mirrors tools/copy-token-assets.mjs.
import { cpSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../packages/material-preset');

mkdirSync(resolve(root, 'dist/scss'), { recursive: true });

const files = ['_bridge.scss', '_compat.scss', 'index.scss'];
for (const file of files) {
  cpSync(
    resolve(root, 'src/styles', file),
    resolve(root, 'dist/scss', file)
  );
}

console.log('✓ Copied material-preset SCSS assets to dist/scss/');
