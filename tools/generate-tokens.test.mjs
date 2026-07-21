// Unit test for the token generator's emitted CSS. Plain node code, run with
// tsx (it imports the TypeScript token specs) — see the `test:tokens` script.
// Kept out of the jest projects like its two siblings.
//   pnpm exec tsx tools/generate-tokens.test.mjs
//
// `generate-tokens.mjs` is a script with top-level writeFileSync side effects,
// so this asserts against the COMMITTED ARTEFACT rather than importing it. That
// is the stronger check anyway: it is the file `verify-tokens.mjs` reads and the
// file a consumer ships, and it fails if someone edits a spec without running
// the generator.
//
// Two independent assertions, per §9.1 row 1 of the density design spec. They
// were fused in an earlier draft into "all five primitives present AND :root is
// byte-identical to main's" — mutually exclusive, since main's :root contains
// none of the five, and it was a PR-1 exit criterion.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const css = readFileSync(
  resolve(root, 'packages/tokens/src/generated/primitives.css'),
  'utf8'
);
// The SCSS entry point is what consumers actually pull in
// (`@use '@rhombuskit/tokens/scss'` — see apps/showcase/src/styles.scss:5), so
// it must carry the level blocks too. Emitting them into primitives.css alone
// left density INERT in every real app: default resolved correctly and
// [data-density] did nothing, which no default-geometry gate can detect because
// nothing about default is wrong. Caught by probing a live page, not by a test —
// hence this assertion.
const scss = readFileSync(
  resolve(root, 'packages/tokens/src/generated/_primitives.scss'),
  'utf8'
);
// Same for the batteries-included theme pack, which embeds the primitives.
const themeCss = readFileSync(
  resolve(root, 'packages/tokens/src/generated/theme-rhombus.css'),
  'utf8'
);
const snapshot = JSON.parse(
  readFileSync(resolve(root, 'packages/tokens/primitives.snapshot.json'), 'utf8')
);

const DENSITY_NAMES = [
  '--control-height-sm',
  '--control-height-md',
  '--control-height-lg',
  '--field-height',
  '--row-height',
];

/** Parse `sel { --a: 1; }` blocks into selector → {name: value}. */
function blocks(source) {
  const out = {};
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(source))) {
    const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!sel) continue;
    const decls = {};
    for (const line of m[2].split(';')) {
      const i = line.indexOf(':');
      if (i === -1) continue;
      const name = line.slice(0, i).trim();
      if (name.startsWith('--')) decls[name] = line.slice(i + 1).trim();
    }
    out[sel] = decls;
  }
  return out;
}

const parsed = blocks(css);
const selectors = Object.keys(parsed);

// ---------------------------------------------------------------------------
// A1 — structure and values.
// ---------------------------------------------------------------------------

assert.deepEqual(
  selectors.sort(),
  [":root", ":root[data-density='comfortable']", ":root[data-density='compact']"],
  'exactly three blocks: :root plus one per non-default level'
);

// `:root[data-density='x']` (0,2,0) rather than `[data-density='x']` (0,1,0),
// so a level block beats the base `:root` block order-independently.
for (const sel of selectors) {
  if (sel === ':root') continue;
  assert.ok(
    sel.startsWith(':root['),
    `level block must be :root-anchored for specificity, got: ${sel}`
  );
}

// 'default' IS the :root block. A [data-density='default'] block would shadow it
// with identical values — dead weight that also breaks the geometry gate's
// precondition reasoning.
assert.ok(
  !css.includes("data-density='default'") && !css.includes('data-density="default"'),
  'no [data-density=default] block may be emitted'
);

for (const sel of selectors) {
  for (const name of DENSITY_NAMES) {
    assert.ok(
      parsed[sel][name],
      `${sel} is missing ${name} — every level must define all five`
    );
  }
}

const expected = {
  ':root': {
    '--control-height-sm': '2rem',
    '--control-height-md': '2.5rem',
    '--control-height-lg': '3rem',
    '--field-height': '3.5rem',
    '--row-height': '3.25rem',
  },
  ":root[data-density='compact']": {
    '--control-height-sm': '1.75rem',
    '--control-height-md': '2.25rem',
    '--control-height-lg': '2.75rem',
    '--field-height': '3.25rem',
    '--row-height': '3rem',
  },
  ":root[data-density='comfortable']": {
    '--control-height-sm': '2.25rem',
    '--control-height-md': '3rem',
    '--control-height-lg': '3.5rem',
    '--field-height': '4rem',
    '--row-height': '3.75rem',
  },
};

for (const [sel, decls] of Object.entries(expected)) {
  for (const [name, value] of Object.entries(decls)) {
    assert.equal(parsed[sel][name], value, `${sel} { ${name} }`);
  }
}

// The type in spec/primitives.ts catches a wrong NAME; only a runtime check
// catches a wrong VALUE (e.g. fieldHeight: '3.5rem' under compact — right name,
// no compaction). Two backstops:

// (a) Every height clears the 1.5rem floor. --control-height-sm at compact is
//     the smallest box the system produces, and icon-only buttons zero their
//     min-width, so that value alone holds WCAG 2.2 SC 2.5.8 for them.
for (const [sel, decls] of Object.entries(parsed)) {
  for (const name of DENSITY_NAMES) {
    const rem = Number.parseFloat(decls[name]);
    assert.ok(
      decls[name].endsWith('rem'),
      `${sel} { ${name} } must be authored in rem so it respects an enlarged base font size`
    );
    assert.ok(rem >= 1.5, `${sel} { ${name} } = ${decls[name]} is below the 1.5rem floor`);
  }
}

// (b) Each level is actually denser / looser than default on every name.
//     Catches a copy-paste that leaves a level un-compacted.
for (const name of DENSITY_NAMES) {
  const base = Number.parseFloat(parsed[':root'][name]);
  const compact = Number.parseFloat(parsed[":root[data-density='compact']"][name]);
  const comfy = Number.parseFloat(parsed[":root[data-density='comfortable']"][name]);
  assert.ok(compact < base, `compact ${name} (${compact}) must be < default (${base})`);
  assert.ok(comfy > base, `comfortable ${name} (${comfy}) must be > default (${base})`);
}

// ---------------------------------------------------------------------------
// A2 — the :root block is ADDITIVE-ONLY with respect to main.
// ---------------------------------------------------------------------------
// Checked against the committed snapshot (main's 17 published names) rather
// than a git checkout. Declaration ORDER is deliberately out of scope:
// flattenPrimitives ordering is an implementation detail, and the api-snapshot
// union-order trap from v1.11–v1.14 says never to chase a reordering.

// The 17 names published BEFORE the density scale, spelled out rather than read
// from primitives.snapshot.json. The snapshot is the thing this epic updates, so
// comparing against it would make the assertion pass trivially the moment
// `--update-snapshot` runs — it would state "the file agrees with itself".
// Published primitives are append-only forever, so this list is stable by
// construction: it may only ever be extended, never edited.
const PRE_DENSITY = [
  '--border-width',
  '--border-width-strong',
  '--motion-duration-base',
  '--motion-duration-fast',
  '--motion-duration-instant',
  '--motion-duration-slow',
  '--motion-ease-accelerate',
  '--motion-ease-decelerate',
  '--motion-ease-emphasized',
  '--motion-ease-standard',
  '--radius-full',
  '--radius-lg',
  '--radius-md',
  '--radius-none',
  '--radius-sm',
  '--radius-xl',
  '--radius-xs',
];

const rootNames = Object.keys(parsed[':root']);
const published = [
  ...new Set(
    rootNames.filter((n) =>
      /^--(radius-|motion-|border-width|control-height-|field-height|row-height)/.test(n)
    )
  ),
].sort();

const missing = PRE_DENSITY.filter((n) => !rootNames.includes(n));
assert.deepEqual(missing, [], 'no previously published primitive may disappear from :root');

assert.deepEqual(
  published,
  [...PRE_DENSITY, ...DENSITY_NAMES].sort(),
  'the published surface is exactly the pre-density 17 plus the five density names'
);

// And the committed snapshot must agree, so a spec edit without a
// `--update-snapshot` is caught here as well as by verify-tokens.
assert.deepEqual(
  [...snapshot].sort(),
  published,
  'primitives.snapshot.json is stale — run `tsx tools/verify-tokens.mjs --update-snapshot`'
);

// The scoped blocks re-declare names already in :root. verify-tokens.mjs scrapes
// primitives.css line-by-line and is block-unaware, so without a dedupe its
// --update-snapshot writes each density name three times. Guard the invariant
// the dedupe exists to protect.
const scraped = [...css.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]);
assert.ok(
  scraped.length > new Set(scraped).size,
  'sanity: scoped blocks are expected to repeat names, which is why verify-tokens must dedupe'
);

// ---------------------------------------------------------------------------
// A3 — every emitted artefact carries the level blocks, not just primitives.css.
// ---------------------------------------------------------------------------

for (const [label, source] of [
  ['_primitives.scss', scss],
  ['theme-rhombus.css', themeCss],
]) {
  const b = blocks(source);
  for (const level of ['compact', 'comfortable']) {
    const sel = `:root[data-density='${level}']`;
    assert.ok(
      b[sel],
      `${label} is missing the ${sel} block — density would be inert for consumers ` +
        `entering through this artefact, while default still resolves correctly`
    );
    for (const name of DENSITY_NAMES) {
      assert.equal(
        b[sel][name],
        expected[sel][name],
        `${label} ${sel} { ${name} } must match primitives.css`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// A4 — tokens.density, the generated data the /density page derives from (§5.4).
// ---------------------------------------------------------------------------
// The docs table is built from `tokens.primitives` (default column + the five
// names) plus `tokens.density.{compact,comfortable}` — NOT hand-authored. So the
// generated const must carry the same five names per level, with bare kebab keys
// (no `--`), matching the values emitted into primitives.css above. tokens.ts is
// a pure data module (no side effects), so importing the committed artefact is
// itself the check — the same "assert the shipped file" philosophy as the rest.
const { tokens } = await import('../packages/tokens/src/generated/tokens.ts');

const DENSITY_KEYS = DENSITY_NAMES.map((n) => n.slice(2)); // strip '--'

assert.ok(tokens.density, 'tokens.density must exist for the /density page derivation (§5.4)');
for (const level of ['compact', 'comfortable']) {
  assert.ok(tokens.density[level], `tokens.density.${level} is missing`);
  assert.deepEqual(
    Object.keys(tokens.density[level]).sort(),
    [...DENSITY_KEYS].sort(),
    `tokens.density.${level} must carry exactly the five density names as bare kebab keys`
  );
  for (const key of DENSITY_KEYS) {
    assert.equal(
      tokens.density[level][key],
      expected[`:root[data-density='${level}']`][`--${key}`],
      `tokens.density.${level}.${key} must equal the emitted primitives.css value`
    );
  }
}
// The default column the page reads from tokens.primitives must agree too.
for (const key of DENSITY_KEYS) {
  assert.equal(
    tokens.primitives[key],
    expected[':root'][`--${key}`],
    `tokens.primitives.${key} must equal the default primitives.css value`
  );
}

console.log(
  `generate-tokens: OK — 3 blocks × 3 artefacts, ${DENSITY_NAMES.length} density names, ` +
    `${new Set(published).size} published primitives, tokens.density × 2 levels`
);
