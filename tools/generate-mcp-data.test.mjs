// Unit test for the MCP data-bundle builder. Plain node (reads committed sources
// + the PR-#94 design-tokens export, no tsx), run via `test:mcp-data`:
//   node tools/generate-mcp-data.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMcpData } from './generate-mcp-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8').replace(/\r\n/g, '\n');
const snapshot = JSON.parse(read('packages', 'tokens', 'contract.snapshot.json'));

const data = buildMcpData({
  apis: {
    core: read('etc', 'core.api.md'),
    'theme-engine': read('etc', 'theme-engine.api.md'),
    tokens: read('etc', 'tokens.api.md'),
  },
  snapshot,
  navigationSource: read('apps', 'showcase', 'src', 'app', 'shared', 'navigation.ts'),
  theming: read('docs', 'theming.md'),
  designTokens: JSON.parse(read('apps', 'showcase', 'public', 'design-tokens.json')),
});

// 1. Packages + site metadata.
assert.equal(data.packages.length, 4, 'four packages');
assert.ok(data.packages.some((p) => p.name === '@rhombuskit/core'), 'lists core');
assert.equal(data.site, 'https://rhombuskit.online', 'site url');

// 2. Components + guides parsed from navigation.ts, with group + url.
assert.ok(data.components.length >= 28, 'component pages parsed');
assert.ok(
  data.components.every((c) => c.url === `${data.site}/components/${c.slug}`),
  'component urls built from slug',
);
const button = data.components.find((c) => c.slug === 'button');
assert.ok(button && button.label === 'Button' && button.group === 'Primitives', 'button page');
assert.ok(
  data.guides.some((g) => g.label === 'Theming' && g.url === `${data.site}/theming`),
  'theming guide page',
);
assert.ok(
  !data.guides.some((g) => g.path.startsWith('/components/')),
  'guides exclude component pages',
);

// 3. API surface: full md retained for the resource, symbols parsed for the tool.
assert.ok(data.api.core.md.startsWith('# API Report'), 'core full md retained');
assert.ok(data.api.core.symbols.length > 20, 'core symbols parsed');
const svc = data.api['theme-engine'].symbols.find((s) => s.name === 'RhombusThemeService');
assert.ok(svc && svc.kind === 'class' && /setTheme/.test(svc.body), 'service symbol + body');
const btnVariant = data.api.core.symbols.find((s) => s.name === 'ButtonVariant');
assert.ok(btnVariant && btnVariant.kind === 'type', 'type symbol parsed');

// 4. Tokens: every CONTRACT token present (light/dark resolved + typed), PLUS the
//    published geometry/motion primitives appended beyond the CONTRACT.
const names = new Set(data.tokens.map((t) => t.name));
for (const n of snapshot) assert.ok(names.has(n), `token ${n} present`);
assert.ok(data.tokens.length > snapshot.length, 'published primitives appended beyond CONTRACT');
const bg = data.tokens.find((t) => t.name === '--bg');
assert.ok(bg.type === 'color' && /^#|^rgb/.test(bg.light) && /^#|^rgb/.test(bg.dark), 'bg colour');
const fontSans = data.tokens.find((t) => t.name === '--font-sans');
assert.ok(
  fontSans.type === 'fontFamily' && fontSans.light.includes('Inter') && !fontSans.light.includes('{'),
  'font alias resolved to a concrete stack',
);

// 4b. Published primitives (radius / motion / border-width) surface in list_tokens,
//     typed, and theme-invariant (light === dark). Raw palette stays internal.
const radiusMd = data.tokens.find((t) => t.name === '--radius-md');
assert.ok(radiusMd && radiusMd.type === 'dimension' && radiusMd.light === radiusMd.dark, '--radius-md surfaced');
const borderWidth = data.tokens.find((t) => t.name === '--border-width');
assert.ok(borderWidth && borderWidth.type === 'dimension' && borderWidth.light === '1px', '--border-width surfaced');
const motionFast = data.tokens.find((t) => t.name === '--motion-duration-fast');
assert.ok(motionFast && motionFast.type === 'duration', '--motion-duration-fast surfaced');
const ease = data.tokens.find((t) => t.name === '--motion-ease-standard');
assert.ok(ease && ease.type === 'cubicBezier', '--motion-ease-standard surfaced');
assert.ok(!names.has('--slate-500'), 'raw palette primitives stay internal');

// 5. Theming guide inlined.
assert.ok(data.theming.length > 100 && data.theming.includes('#'), 'theming guide inlined');

console.log(
  `✓ mcp-data: ${data.components.length} components, ${data.guides.length} guides, ` +
    `${data.tokens.length} tokens, ` +
    `${data.api.core.symbols.length}+${data.api['theme-engine'].symbols.length}+${data.api.tokens.symbols.length} api symbols`,
);
