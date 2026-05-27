#!/usr/bin/env node
// Copies global SCSS partials from packages/core/src/styles/ -> dist/scss/.
// These are styles for directive-based components that can't attach their
// own stylesheets via Angular's per-component encapsulation. Consumers load
// them globally via `@use '@rhombuskit/core/scss';`.
// Mirrors tools/copy-token-assets.mjs and tools/copy-material-preset-assets.mjs.

import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const stylesSrc = resolve(root, 'packages/core/scss');
const stylesDest = resolve(root, 'dist/packages/core/scss');

mkdirSync(stylesDest, { recursive: true });

for (const file of readdirSync(stylesSrc)) {
  if (!file.endsWith('.scss')) continue;
  cpSync(resolve(stylesSrc, file), resolve(stylesDest, file));
}

console.log('✓ Copied core SCSS assets to dist/packages/core/scss/');
