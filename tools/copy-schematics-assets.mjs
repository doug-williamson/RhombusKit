#!/usr/bin/env node
// Copies the schematics' non-TS assets (collection.json, migration.json, every
// schema.json) into dist/packages/core/schematics, alongside the JS that
// tsconfig.schematics.json emits. ng-packagr ignores schematics/ (it only
// compiles src/**), so the schematics are built by a separate `tsc` and their
// JSON copied here. Mirrors tools/copy-core-assets.mjs.

import { cpSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'packages/core/schematics');
const dest = resolve(root, 'dist/packages/core/schematics');

/** Recursively copy every *.json under schematics/, preserving structure. */
function copyJson(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      copyJson(full);
    } else if (entry.endsWith('.json')) {
      const out = resolve(dest, relative(src, full));
      mkdirSync(dirname(out), { recursive: true });
      cpSync(full, out);
    }
  }
}

mkdirSync(dest, { recursive: true });
copyJson(src);
console.log('✓ Copied schematics JSON assets to dist/packages/core/schematics/');
