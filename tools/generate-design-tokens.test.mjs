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
assert.equal(doc.primitives['radius-xs'].$value, '0.25rem', 'radius-xs added (4px)');
assert.equal(doc.primitives['border-width'].$type, 'dimension', 'border-width → dimension');
assert.equal(doc.primitives['border-width'].$value, '1px', 'border-width value');
assert.equal(doc.primitives['border-width-strong'].$value, '2px', 'border-width-strong value');

// 7b. Wave A families carry a real DTCG $type.
//
// primitiveType() ends in `return 'color'`, so a family nobody classified does not
// fail — it ships to Figma as a colour with a value like "0.875rem" while every gate
// stays green. This loop is the only thing standing between that and a release.
for (const [key, tok] of Object.entries(doc.primitives)) {
  if (/^(type|space|state)-/.test(key)) {
    assert.notEqual(tok.$type, 'color', `${key} fell through to the colour default`);
  }
}

assert.equal(doc.primitives['type-display-large-size'].$type, 'dimension', 'type size → dimension');
assert.equal(doc.primitives['type-display-large-size'].$value, '3.5625rem', 'exact M3 rem, not Material\'s 3dp rounding');
assert.equal(doc.primitives['type-display-large-tracking'].$value, '-0.015625rem', 'negative tracking survives');
assert.equal(doc.primitives['type-body-medium-line-height'].$type, 'dimension');
assert.equal(doc.primitives['type-title-large-weight'].$value, '400', 'title-large is 400, not 500');

// Every spelling of "weight" in the type family must classify as fontWeight — the
// plain suffix, M3's prominent variant, AND the standalone --type-weight-* constants,
// which do NOT end in "-weight" and were briefly typed as dimensions.
assert.equal(doc.primitives['type-label-large-weight'].$type, 'fontWeight', '-weight → fontWeight');
assert.equal(doc.primitives['type-label-large-weight-prominent'].$type, 'fontWeight', '-weight-prominent → fontWeight');
assert.equal(doc.primitives['type-weight-bold'].$type, 'fontWeight', 'type-weight-* → fontWeight');
assert.equal(doc.primitives['type-weight-bold'].$value, '700');

assert.equal(doc.primitives['space-4'].$type, 'dimension', 'space → dimension');
assert.equal(doc.primitives['space-4'].$value, '1rem');
assert.equal(doc.primitives['space-0'].$value, '0');

assert.equal(doc.primitives['state-hover-opacity'].$type, 'number', 'state → number');
assert.equal(
  doc.primitives['state-focus-opacity'].$value,
  '0.12',
  'Angular Material 21 hardcodes 0.12; the M3 spec says 0.10 and we deliberately follow Material',
);

// 7c. The retuned M3 corner ramp — values, not just names.
assert.equal(doc.primitives['radius-sm'].$value, '0.5rem', 'radius-sm retuned to M3 corner-small (8px)');
assert.equal(doc.primitives['radius-md'].$value, '0.75rem', 'radius-md retuned to M3 corner-medium (12px)');
assert.equal(doc.primitives['radius-lg'].$value, '1rem', 'radius-lg retuned to M3 corner-large (16px)');
assert.equal(doc.primitives['radius-xl'].$value, '1.75rem', 'radius-xl retuned to M3 corner-extra-large (28px)');

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
