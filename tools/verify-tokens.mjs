#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsImport } from 'tsx/esm/api';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensRoot = resolve(__dirname, '../packages/tokens');

// Load CONTRACT from source via tsx programmatic API so plain `node` works.
const typesUrl = new URL('../packages/tokens/src/types.ts', import.meta.url).href;
const { CONTRACT } = await tsImport(typesUrl, import.meta.url);

// radius / motion / border-width are theme-independent primitives, but they are a
// PUBLISHED part of the token API: the MCP server's list_tokens surfaces them and
// app-level surfaces consume them. Freeze their NAMES append-only, exactly like
// the semantic CONTRACT. The raw colour palette and font-family primitives stay
// internal (not frozen). Names are read from the generated primitives.css — the
// same generated-artifact posture as the theme-pack check below (and avoids a
// brittle tsx import of the multi-export primitives spec).
const PUBLISHED_PRIMITIVE_PREFIXES = ['--radius-', '--motion-duration-', '--motion-ease-', '--border-width'];
const primitivesCss = readFileSync(
  resolve(tokensRoot, 'src/generated/primitives.css'),
  'utf8'
);
const publishedPrimitives = [...primitivesCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)]
  .map((m) => m[1])
  .filter((n) => PUBLISHED_PRIMITIVE_PREFIXES.some((p) => n.startsWith(p)))
  .sort();
const primitivesSnapshotPath = resolve(tokensRoot, 'primitives.snapshot.json');

// --- CONTRACT freeze guard -------------------------------------------------
// The committed snapshot is the public token CONTRACT. Names are append-only
// within a major version: renaming or removing a name is a breaking change.
// Any drift (add OR remove) fails CI so it is reviewed deliberately; an
// intentional change is recorded with `--update-snapshot`.
const snapshotPath = resolve(tokensRoot, 'contract.snapshot.json');
const sortedContract = [...CONTRACT].sort();

if (process.argv.includes('--update-snapshot')) {
  writeFileSync(snapshotPath, JSON.stringify(sortedContract, null, 2) + '\n');
  console.log(`✓ Updated CONTRACT snapshot (${sortedContract.length} tokens).`);
  writeFileSync(primitivesSnapshotPath, JSON.stringify(publishedPrimitives, null, 2) + '\n');
  console.log(`✓ Updated published-primitives snapshot (${publishedPrimitives.length} tokens).`);
  process.exit(0);
}

const errors = [];

let snapshot = null;
try {
  snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
} catch {
  errors.push(
    '✗ CONTRACT snapshot missing/unreadable — run: node tools/verify-tokens.mjs --update-snapshot'
  );
}
if (snapshot) {
  const snapSet = new Set(snapshot);
  const curSet = new Set(sortedContract);
  const removed = snapshot.filter((n) => !curSet.has(n));
  const added = sortedContract.filter((n) => !snapSet.has(n));
  removed.forEach((n) =>
    errors.push(`✗ CONTRACT token removed/renamed — BREAKING (next major only): ${n}`)
  );
  added.forEach((n) =>
    errors.push(`✗ CONTRACT token added — allowed (append-only) but snapshot not updated: ${n}`)
  );
  if (removed.length || added.length) {
    errors.push('  → If intentional, run: node tools/verify-tokens.mjs --update-snapshot');
  }
}

// --- Published-primitive freeze guard --------------------------------------
// Same append-only contract as CONTRACT, for the published radius / motion /
// border-width primitive names.
let primSnapshot = null;
try {
  primSnapshot = JSON.parse(readFileSync(primitivesSnapshotPath, 'utf8'));
} catch {
  errors.push(
    '✗ Published-primitives snapshot missing/unreadable — run: node tools/verify-tokens.mjs --update-snapshot'
  );
}
if (primSnapshot) {
  const snapSet = new Set(primSnapshot);
  const curSet = new Set(publishedPrimitives);
  const removed = primSnapshot.filter((n) => !curSet.has(n));
  const added = publishedPrimitives.filter((n) => !snapSet.has(n));
  removed.forEach((n) =>
    errors.push(`✗ Published primitive removed/renamed — BREAKING (next major only): ${n}`)
  );
  added.forEach((n) =>
    errors.push(`✗ Published primitive added — allowed (append-only) but snapshot not updated: ${n}`)
  );
  if (removed.length || added.length) {
    errors.push('  → If intentional, run: node tools/verify-tokens.mjs --update-snapshot');
  }
}

// --- Theme-pack completeness (every CONTRACT name resolved in built CSS) ----
const themeCSS = readFileSync(
  resolve(tokensRoot, 'dist/css/theme-rhombus.css'),
  'utf8'
);

const themeNames = ['rhombus-light', 'rhombus-dark'];

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
  errors.forEach((e) => console.error(' ', e));
  console.error('\nRerun: pnpm run generate\n');
  process.exit(1);
}

console.log(
  `✓ All ${CONTRACT.length} contract tokens verified in ${themeNames.length} theme packs; ` +
    `CONTRACT + ${publishedPrimitives.length} published-primitive snapshots match.`
);
