#!/usr/bin/env node
import { cpSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensRoot = resolve(__dirname, '../packages/tokens');

mkdirSync(resolve(tokensRoot, 'dist/css'), { recursive: true });
mkdirSync(resolve(tokensRoot, 'dist/scss'), { recursive: true });

// CSS assets
cpSync(
  resolve(tokensRoot, 'src/generated/primitives.css'),
  resolve(tokensRoot, 'dist/css/primitives.css')
);
cpSync(
  resolve(tokensRoot, 'src/generated/contract.css'),
  resolve(tokensRoot, 'dist/css/contract.css')
);
cpSync(
  resolve(tokensRoot, 'src/generated/theme-rhombus.css'),
  resolve(tokensRoot, 'dist/css/theme-rhombus.css')
);

// SCSS assets — generated partials
const generatedScss = [
  '_primitives.scss',
  '_contract.scss',
  '_theme-rhombus.scss',
  'index.scss',
];
for (const file of generatedScss) {
  cpSync(
    resolve(tokensRoot, 'src/generated', file),
    resolve(tokensRoot, 'dist/scss', file)
  );
}

// SCSS assets — hand-written partials
const handwrittenScss = ['_reset.scss', '_focus.scss', '_typography.scss'];
for (const file of handwrittenScss) {
  cpSync(
    resolve(tokensRoot, 'src/styles', file),
    resolve(tokensRoot, 'dist/scss', file)
  );
}

console.log('✓ Copied token assets to dist/');
