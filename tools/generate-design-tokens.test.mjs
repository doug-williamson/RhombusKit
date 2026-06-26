// Unit test for the design-token DTCG export builder. Plain node code, run with
// tsx (it imports the TypeScript token specs) — see the `test:design-tokens`
// script. Kept out of the jest projects like the schematics verify test.
//   pnpm exec tsx tools/generate-design-tokens.test.mjs
import assert from 'node:assert/strict';
import { buildDesignTokens } from './generate-design-tokens.mjs';
import { primitives } from '../packages/tokens/src/spec/primitives.ts';
import { CONTRACT } from '../packages/tokens/src/types.ts';
import { rhombusLight } from '../packages/tokens/src/spec/themes/rhombus-light.ts';
import { rhombusDark } from '../packages/tokens/src/spec/themes/rhombus-dark.ts';

const doc = buildDesignTokens({
  primitives,
  contract: CONTRACT,
  light: rhombusLight,
  dark: rhombusDark,
});

// 1. Top-level shape: three Tokens-Studio sets + theme/metadata meta.
assert.ok(doc.primitives && doc.light && doc.dark, 'has primitives/light/dark sets');
assert.deepEqual(doc.$metadata.tokenSetOrder, ['primitives', 'light', 'dark'], 'set order');
assert.ok(Array.isArray(doc.$themes) && doc.$themes.length === 2, 'two themes (light/dark)');
assert.deepEqual(
  doc.$themes.map((t) => t.id),
  ['rhombus-light', 'rhombus-dark'],
  'theme ids',
);

// 2. 1:1 with the CONTRACT — every name (with `--` stripped) is in light AND dark,
//    and nothing extra.
const stripped = CONTRACT.map((n) => n.replace(/^--/, ''));
for (const name of stripped) {
  assert.ok(name in doc.light, `light is missing ${name}`);
  assert.ok(name in doc.dark, `dark is missing ${name}`);
}
assert.equal(Object.keys(doc.light).length, CONTRACT.length, 'light has exactly CONTRACT count');
assert.equal(Object.keys(doc.dark).length, CONTRACT.length, 'dark has exactly CONTRACT count');

// 3. Every token is a valid DTCG node: { $type, $value }.
for (const set of ['primitives', 'light', 'dark']) {
  for (const [key, tok] of Object.entries(doc[set])) {
    assert.ok(tok && typeof tok === 'object', `${set}.${key} is an object`);
    assert.ok('$value' in tok, `${set}.${key} has $value`);
    assert.ok('$type' in tok, `${set}.${key} has $type`);
  }
}

// 4. The three font tokens are DTCG aliases into the primitives set.
assert.equal(doc.light['font-sans'].$type, 'fontFamily', 'font-sans typed fontFamily');
assert.equal(doc.light['font-sans'].$value, '{primitives.font-family-sans}', 'font-sans aliased');
assert.equal(doc.dark['font-mono'].$value, '{primitives.font-family-mono}', 'font-mono aliased');
assert.equal(doc.dark['font-prose'].$value, '{primitives.font-family-prose}', 'font-prose aliased');

// 5. Shadows typed shadow; plain colours typed color with a literal hex/rgb value.
assert.equal(doc.light['shadow-md'].$type, 'shadow', 'shadow typed');
assert.equal(doc.light['bg'].$type, 'color', 'bg typed color');
assert.match(doc.light['bg'].$value, /^#|^rgb/, 'bg is a literal colour');
assert.match(doc.dark['border-accent'].$value, /^rgb/, 'dark border-accent is rgb()');

// 6. Every alias target resolves to a real primitive token (no dangling refs).
const primKeys = new Set(Object.keys(doc.primitives));
for (const set of ['light', 'dark']) {
  for (const [key, tok] of Object.entries(doc[set])) {
    const m = /^\{primitives\.(.+)\}$/.exec(String(tok.$value));
    if (m) assert.ok(primKeys.has(m[1]), `${set}.${key} alias target ${m[1]} exists`);
  }
}

// 7. Primitive categories are typed by family.
assert.equal(doc.primitives['slate-500'].$type, 'color', 'palette → color');
assert.equal(doc.primitives['radius-md'].$type, 'dimension', 'radius → dimension');
assert.equal(doc.primitives['motion-duration-base'].$type, 'duration', 'duration → duration');
assert.equal(doc.primitives['motion-ease-standard'].$type, 'cubicBezier', 'ease → cubicBezier');
assert.equal(doc.primitives['font-family-sans'].$type, 'fontFamily', 'font family → fontFamily');

// 8. Pure / deterministic — same inputs, structurally equal output.
const again = buildDesignTokens({
  primitives,
  contract: CONTRACT,
  light: rhombusLight,
  dark: rhombusDark,
});
assert.deepEqual(again, doc, 'builder is deterministic');

console.log(
  `✓ design-tokens: ${CONTRACT.length} contract tokens × 2 themes + ` +
    `${Object.keys(doc.primitives).length} primitives, DTCG valid`,
);
