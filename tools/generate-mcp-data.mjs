#!/usr/bin/env node
// Bundles RhombusKit's docs surface into packages/mcp/src/generated/mcp-data.ts,
// the snapshot the @rhombuskit/mcp server serves to AI assistants. Built from the
// SAME committed, CI-guarded sources generate-llms.mjs reads — plus the PR-#94
// design-token export for concrete light/dark token values — so the MCP server can
// never drift from what RhombusKit ships. The data is bundled INTO the package
// because an npx'd server has no access to the repo's etc/ at runtime.
//
//   - etc/*.api.md                                (frozen public API surface)
//   - packages/tokens/contract.snapshot.json      (the token CONTRACT names)
//   - apps/showcase/public/design-tokens.json     (token values, light/dark)
//   - apps/showcase/src/app/shared/navigation.ts  (component / guide page list)
//   - docs/theming.md                             (theming guide)
//
// Usage:
//   node tools/generate-mcp-data.mjs           # write the data module
//   node tools/generate-mcp-data.mjs --check   # fail if the committed module is stale
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'packages', 'mcp', 'src', 'generated', 'mcp-data.ts');

const SITE = 'https://rhombuskit.online';
const REPO = 'https://github.com/doug-williamson/RhombusKit';
const SUMMARY =
  'Accessible, signal-based Angular 21 components built over Angular Material ' +
  'and themed by a frozen design-token contract. Light/dark theming with WCAG ' +
  '2.1 AA verified in CI.';
const PACKAGES = [
  { name: '@rhombuskit/core', description: 'standalone, signal-based Angular components' },
  { name: '@rhombuskit/tokens', description: 'framework-agnostic design-token contract (CSS / SCSS / TS)' },
  { name: '@rhombuskit/theme-engine', description: 'light / dark / system theming runtime' },
  { name: '@rhombuskit/material-preset', description: "bridges Angular Material's M3 tokens onto the contract" },
];

// Normalize CRLF → LF on read so the generated module is byte-identical on Windows
// and Linux (the repo stores LF via `* text=auto`); otherwise CI --check flakes.
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8').replace(/\r\n/g, '\n');

// --- Pure parsing helpers -------------------------------------------------

/** Pull ordered { group, path, label } items out of navigation.ts NAV_GROUPS. */
export function parseNavigation(source) {
  const items = [];
  const groupRe = /label:\s*'([^']+)',\s*items:\s*\[([\s\S]*?)\]/g;
  const itemRe = /\{\s*path:\s*'([^']+)',\s*label:\s*'([^']+)'\s*\}/g;
  let g;
  while ((g = groupRe.exec(source))) {
    const group = g[1];
    let it;
    while ((it = itemRe.exec(g[2]))) {
      items.push({ group, path: it[1], label: it[2] });
    }
  }
  return items;
}

/** Split an api-snapshot .api.md into { name, kind, body } symbol blocks. */
export function parseApiSymbols(md) {
  const parts = md.split(/\n### /);
  const symbols = [];
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i];
    const nl = block.indexOf('\n');
    const head = (nl === -1 ? block : block.slice(0, nl)).trim();
    const body = (nl === -1 ? '' : block.slice(nl + 1)).replace(/\s+$/, '');
    const m = /^(.+?)\s+\((.+?)\)$/.exec(head);
    if (m) symbols.push({ name: m[1], kind: m[2], body });
  }
  return symbols;
}

/** Resolve a DTCG `{primitives.x}` alias to its concrete value; else verbatim. */
function deref(value, primitives) {
  const m = /^\{primitives\.(.+)\}$/.exec(String(value));
  return m && primitives[m[1]] ? primitives[m[1]].$value : value;
}

/**
 * Build the MCP data bundle. Pure — takes the already-read sources, returns the
 * JSON-able object the server (and its tests) consume.
 */
export function buildMcpData({ apis, snapshot, navigationSource, theming, designTokens }) {
  const nav = parseNavigation(navigationSource);
  const components = nav
    .filter((i) => i.path.startsWith('/components/'))
    .map((i) => ({ slug: i.path.replace('/components/', ''), label: i.label, group: i.group, url: `${SITE}${i.path}` }));
  const guides = nav
    .filter((i) => i.path !== '/' && !i.path.startsWith('/components/'))
    .map((i) => ({ path: i.path, label: i.label, url: `${SITE}${i.path}` }));

  const api = {};
  for (const [pkg, md] of Object.entries(apis)) {
    api[pkg] = { md, symbols: parseApiSymbols(md) };
  }

  const primitives = designTokens.primitives;
  const tokens = Object.keys(designTokens.light).map((key) => {
    const name = `--${key}`;
    return {
      name,
      type: designTokens.light[key].$type,
      light: deref(designTokens.light[key].$value, primitives),
      dark: deref(designTokens.dark[key].$value, primitives),
    };
  });
  // Bind to the frozen CONTRACT: the value source must cover exactly the snapshot.
  const have = new Set(tokens.map((t) => t.name));
  const missing = snapshot.filter((n) => !have.has(n));
  if (missing.length) {
    throw new Error(`design-tokens.json is missing CONTRACT tokens: ${missing.join(', ')}`);
  }

  return { site: SITE, repo: REPO, summary: SUMMARY, packages: PACKAGES, components, guides, api, tokens, theming };
}

function serialize(data) {
  return (
    '// GENERATED by tools/generate-mcp-data.mjs — do not edit by hand.\n' +
    '// Regenerate after changing any committed docs source:\n' +
    '//   node tools/generate-mcp-data.mjs\n\n' +
    `export const MCP_DATA = ${JSON.stringify(data, null, 2)} as const;\n\n` +
    'export type McpData = typeof MCP_DATA;\n'
  );
}

// --- CLI ------------------------------------------------------------------

const isMain = process.argv[1] && join(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const data = buildMcpData({
    apis: {
      core: read('etc', 'core.api.md'),
      'theme-engine': read('etc', 'theme-engine.api.md'),
      tokens: read('etc', 'tokens.api.md'),
    },
    snapshot: JSON.parse(read('packages', 'tokens', 'contract.snapshot.json')),
    navigationSource: read('apps', 'showcase', 'src', 'app', 'shared', 'navigation.ts'),
    theming: read('docs', 'theming.md'),
    designTokens: JSON.parse(read('apps', 'showcase', 'public', 'design-tokens.json')),
  });
  const content = serialize(data);

  if (process.argv.includes('--check')) {
    let current = '';
    try {
      current = readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n');
    } catch {
      current = '';
    }
    if (current !== content) {
      console.error('✗ packages/mcp/src/generated/mcp-data.ts is out of date.');
      console.error('  → regenerate with: node tools/generate-mcp-data.mjs');
      process.exit(1);
    }
    console.log('✓ mcp-data.ts is in sync.');
  } else {
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, content);
    console.log(`✓ wrote packages/mcp/src/generated/mcp-data.ts (${content.length} bytes)`);
  }
}
