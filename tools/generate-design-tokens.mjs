#!/usr/bin/env node
// Emits apps/showcase/public/design-tokens.json — the RhombusKit token CONTRACT
// and light/dark theme packs as W3C / Tokens-Studio design-token JSON, so a Figma
// kit's variables can be imported (and kept in sync) instead of hand-keyed.
//
// Generated from the SAME canonical token source @rhombuskit/tokens ships from
// (packages/tokens/src/spec/* + types.ts), and cross-checked against the committed
// CONTRACT snapshot (packages/tokens/contract.snapshot.json) — so the export can
// never silently drift from the frozen contract, exactly like generate-llms.mjs.
//
// Run via tsx (it imports the TypeScript token specs):
//   pnpm exec tsx tools/generate-design-tokens.mjs           # write the file
//   pnpm exec tsx tools/generate-design-tokens.mjs --check   # fail if stale (CI)
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'apps', 'showcase', 'public', 'design-tokens.json');
const SNAPSHOT = resolve(ROOT, 'packages', 'tokens', 'contract.snapshot.json');

// --- Pure helpers ---------------------------------------------------------
// Kebab/flatten logic mirrors tools/generate-tokens.mjs so the primitive token
// names match the generated CSS custom properties 1:1 (slate-50, font-family-sans…).

export function toKebab(str) {
  return String(str).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function flattenPrimitives(obj, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const flat = prefix ? `${prefix}-${toKebab(key)}` : toKebab(key);
    if (value && typeof value === 'object') Object.assign(out, flattenPrimitives(value, flat));
    else out[flat] = value;
  }
  return out;
}

// W3C $type for a primitive, keyed off its family.
function primitiveType(flatKey) {
  if (flatKey.startsWith('font-family-')) return 'fontFamily';
  if (flatKey.startsWith('radius-')) return 'dimension';
  if (flatKey.startsWith('border-width')) return 'dimension';
  if (flatKey.startsWith('motion-duration-')) return 'duration';
  if (flatKey.startsWith('motion-ease-')) return 'cubicBezier';
  return 'color'; // slate / violet / green / amber / red scales
}

// W3C $type for a semantic CONTRACT token (shadows, font aliases, else colour).
function semanticType(name) {
  if (name.startsWith('--shadow-')) return 'shadow';
  if (name.startsWith('--font-')) return 'fontFamily';
  return 'color';
}

// A theme value of `var(--X)` where X is a primitive becomes a DTCG alias into
// the primitives set; everything else is kept as a verbatim literal.
function aliasOrLiteral(value, primitiveKeys) {
  const m = /^var\(\s*--([a-z0-9-]+)\s*\)$/i.exec(String(value).trim());
  if (m && primitiveKeys.has(m[1])) return `{primitives.${m[1]}}`;
  return value;
}

const token = ($type, $value) => ({ $type, $value });

/**
 * Build the W3C / Tokens-Studio design-token document. Pure — takes the canonical
 * token data, returns the JSON-able object (no I/O).
 */
export function buildDesignTokens({ primitives, contract, light, dark }) {
  const flatPrim = flattenPrimitives(primitives);
  const primitiveKeys = new Set(Object.keys(flatPrim));

  const primitivesSet = {};
  for (const [key, value] of Object.entries(flatPrim)) {
    primitivesSet[key] = token(primitiveType(key), value);
  }

  const semanticSet = (pack) => {
    const set = {};
    for (const name of contract) {
      const key = name.replace(/^--/, '');
      set[key] = token(semanticType(name), aliasOrLiteral(pack[name], primitiveKeys));
    }
    return set;
  };

  return {
    $description:
      'RhombusKit design tokens — generated from @rhombuskit/tokens; do not edit by ' +
      'hand. Token names map to CSS custom properties by prefixing "--" (e.g. ' +
      'text-primary → --text-primary). The "primitives" set is the palette / radius / ' +
      'motion / font base; "light" and "dark" are the semantic theme packs, with the ' +
      'font tokens aliased into primitives. Import into Figma via Tokens Studio.',
    primitives: primitivesSet,
    light: semanticSet(light),
    dark: semanticSet(dark),
    $themes: [
      {
        id: 'rhombus-light',
        name: 'Light',
        selectedTokenSets: { primitives: 'enabled', light: 'enabled', dark: 'disabled' },
      },
      {
        id: 'rhombus-dark',
        name: 'Dark',
        selectedTokenSets: { primitives: 'enabled', light: 'disabled', dark: 'enabled' },
      },
    ],
    $metadata: { tokenSetOrder: ['primitives', 'light', 'dark'] },
  };
}

export const serialize = (doc) => JSON.stringify(doc, null, 2) + '\n';

// --- CLI (imports the TS specs via tsx; skipped when imported by the test) ----

const isMain =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const { primitives } = await import('../packages/tokens/src/spec/primitives.ts');
  const { CONTRACT } = await import('../packages/tokens/src/types.ts');
  const { rhombusLight } = await import('../packages/tokens/src/spec/themes/rhombus-light.ts');
  const { rhombusDark } = await import('../packages/tokens/src/spec/themes/rhombus-dark.ts');

  // Cross-check the live CONTRACT against the committed snapshot (the same source
  // llms.txt reads) so this export stays bound to the frozen token contract.
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8').replace(/\r\n/g, '\n'));
  const inSnapshotOnly = snapshot.filter((n) => !CONTRACT.includes(n));
  const inContractOnly = CONTRACT.filter((n) => !snapshot.includes(n));
  if (inSnapshotOnly.length || inContractOnly.length) {
    console.error('✗ CONTRACT and contract.snapshot.json disagree:');
    if (inSnapshotOnly.length)
      console.error('    in snapshot, not CONTRACT: ' + inSnapshotOnly.join(', '));
    if (inContractOnly.length)
      console.error('    in CONTRACT, not snapshot: ' + inContractOnly.join(', '));
    console.error('  → reconcile, then run: node tools/verify-tokens.mjs --update-snapshot');
    process.exit(1);
  }

  const content = serialize(
    buildDesignTokens({ primitives, contract: CONTRACT, light: rhombusLight, dark: rhombusDark }),
  );

  if (process.argv.includes('--check')) {
    let current = '';
    try {
      current = readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n');
    } catch {
      current = '';
    }
    if (current !== content) {
      console.error('✗ apps/showcase/public/design-tokens.json is out of date.');
      console.error('  → regenerate with: pnpm exec tsx tools/generate-design-tokens.mjs');
      process.exit(1);
    }
    console.log('✓ design-tokens.json is in sync.');
  } else {
    writeFileSync(OUT, content);
    console.log(`✓ wrote apps/showcase/public/design-tokens.json (${content.length} bytes)`);
  }
}
