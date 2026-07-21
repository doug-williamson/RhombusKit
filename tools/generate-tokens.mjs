#!/usr/bin/env node
// GENERATOR — writes src/generated/* from src/spec/*.
// Run via: tsx tools/generate-tokens.mjs (from workspace root)
// or: pnpm run generate (from packages/tokens)
// Do NOT edit generated files manually.

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensRoot = resolve(__dirname, '../packages/tokens/src');
const generatedDir = resolve(tokensRoot, 'generated');

mkdirSync(generatedDir, { recursive: true });

const BANNER = '/* GENERATED — do not edit. Source: packages/tokens/src/spec/ */\n\n';

// --- Dynamic import of spec files via tsx (handles TS imports) ---
// tsx is required as a workspace devDependency.

const { primitives, densityLevels } = await import('../packages/tokens/src/spec/primitives.ts');
const { CONTRACT } = await import('../packages/tokens/src/types.ts');
const { rhombusLight } = await import('../packages/tokens/src/spec/themes/rhombus-light.ts');
const { rhombusDark } = await import('../packages/tokens/src/spec/themes/rhombus-dark.ts');

const themes = {
  'rhombus-light': rhombusLight,
  'rhombus-dark': rhombusDark,
};

// --- Helpers ---

function toKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function flattenPrimitives(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const cssKey = prefix ? `${prefix}-${toKebab(key)}` : toKebab(key);
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenPrimitives(value, cssKey));
    } else {
      result[cssKey] = value;
    }
  }
  return result;
}

// --- Generate primitives.css ---

const flatPrimitives = flattenPrimitives(primitives);

// Density levels are scoped re-declarations of names ALREADY in :root, emitted
// through the same flattenPrimitives so the two can never drift — there is no
// second name list. `default` is the :root block itself; no
// [data-density='default'] block is emitted.
//
// `:root[data-density='x']` (specificity 0,2,0) rather than `[data-density='x']`
// (0,1,0), so a level block beats the base :root block regardless of the order
// the stylesheets happen to load in.
const densityCSS = Object.entries(densityLevels)
  .map(([level, scale]) => {
    const flat = flattenPrimitives(scale);
    return [
      `\n:root[data-density='${level}'] {\n`,
      ...Object.entries(flat).map(([k, v]) => `  --${k}: ${v};\n`),
      '}\n',
    ].join('');
  })
  .join('');

const primitivesCSS = [
  BANNER,
  ':root {\n',
  ...Object.entries(flatPrimitives).map(([k, v]) => `  --${k}: ${v};\n`),
  '}\n',
  densityCSS,
].join('');

writeFileSync(resolve(generatedDir, 'primitives.css'), primitivesCSS);

// --- Generate contract.css (all semantic names set to initial — docs aid) ---

const contractCSS = [
  BANNER,
  '/* Semantic token contract. Values are intentionally `initial`.\n',
  '   Import a theme pack to supply real values. */\n\n',
  ':root {\n',
  ...CONTRACT.map(name => `  ${name}: initial;\n`),
  '}\n',
].join('');

writeFileSync(resolve(generatedDir, 'contract.css'), contractCSS);

// --- Generate theme-rhombus.css (batteries-included: primitives + both theme blocks) ---

const themeBlocks = Object.entries(themes).map(([packName, values]) => {
  const lines = Object.entries(values).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `[data-theme="${packName}"] {\n${lines}\n}`;
}).join('\n\n');

const themeCSS = [
  BANNER,
  primitivesCSS,
  '\n',
  themeBlocks,
  '\n',
].join('');

writeFileSync(resolve(generatedDir, 'theme-rhombus.css'), themeCSS);

// --- Generate _primitives.scss ---

// NOTE: `densityCSS` is appended here too, not only to primitives.css. The SCSS
// entry point is what consumers actually pull in (`@use '@rhombuskit/tokens/scss'`),
// so emitting the level blocks into the .css alone leaves density inert for every
// real app — default resolves correctly and nothing else does. Both outputs are
// built from the same `densityCSS` string so they cannot diverge again.
const primitivesSCSS = [
  BANNER,
  '// Import via: @use \'@rhombuskit/tokens/scss/primitives\';\n\n',
  ':root {\n',
  ...Object.entries(flatPrimitives).map(([k, v]) => `  --${k}: ${v};\n`),
  '}\n',
  densityCSS,
].join('');

writeFileSync(resolve(generatedDir, '_primitives.scss'), primitivesSCSS);

// --- Generate _contract.scss ---

const contractSCSS = [
  BANNER,
  '// Semantic token contract mixin.\n',
  '// Usage: @include rhombus-contract($values-map);\n\n',
  "@use 'sass:map';\n\n",
  '@mixin rhombus-contract($values) {\n',
  ...CONTRACT.map(name => {
    const key = name.replace(/^--/, '');
    return `  ${name}: map.get($values, '${key}');\n`;
  }),
  '}\n',
].join('');

writeFileSync(resolve(generatedDir, '_contract.scss'), contractSCSS);

// --- Generate _theme-rhombus.scss ---

const themeSCSS = [
  BANNER,
  '@use \'sass:map\';\n\n',
  ...Object.entries(themes).map(([packName, values]) => {
    const lines = Object.entries(values).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    return `[data-theme="${packName}"] {\n${lines}\n}\n`;
  }),
].join('\n');

writeFileSync(resolve(generatedDir, '_theme-rhombus.scss'), themeSCSS);

// --- Generate index.scss ---

// Paths are relative to dist/scss/ (the consumed location), where all partials
// end up as siblings via tools/copy-token-assets.mjs.
const indexSCSS = [
  BANNER,
  "@forward 'primitives';\n",
  "@forward 'theme-rhombus';\n",
  "@use 'reset';\n",
  "@use 'focus';\n",
  "@use 'typography';\n",
].join('');

writeFileSync(resolve(generatedDir, 'index.scss'), indexSCSS);

// --- Generate tokens.ts ---

// tokens.primitives holds the DEFAULT density values (the five names arrive via
// the densityDefaults spread in the primitives barrel), but only the default
// column. The /density docs page needs the compact/comfortable columns too, so
// emit a second `density` map — the flattened level scales, keyed the same bare
// kebab way as `primitives`, so the page derives its 3-column table straight
// from generated data (§5.4) rather than hand-authoring the scoped values.
const densityTS = Object.fromEntries(
  Object.entries(densityLevels).map(([level, scale]) => [level, flattenPrimitives(scale)])
);

const tokensTS = [
  BANNER,
  "import type { SemanticTokenName } from '../types';\n\n",
  `export const tokens = {\n`,
  `  primitives: ${JSON.stringify(flatPrimitives, null, 2)} as const,\n`,
  `  density: ${JSON.stringify(densityTS, null, 2)} as const,\n`,
  `  themes: {\n`,
  ...Object.entries(themes).map(([packName, values]) =>
    `    '${packName}': ${JSON.stringify(values, null, 4)} as Record<SemanticTokenName, string>,\n`
  ),
  `  },\n`,
  `} as const;\n\n`,
  `export type { SemanticTokenName } from '../types';\n`,
].join('');

writeFileSync(resolve(generatedDir, 'tokens.ts'), tokensTS);

console.log('✓ Generated tokens in packages/tokens/src/generated/');
