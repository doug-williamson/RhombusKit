#!/usr/bin/env node
// Generates the showcase's /llms.txt and /llms-full.txt from the committed,
// CI-guarded source artifacts — so the machine-readable docs AI assistants read
// stay accurate by construction and can never silently drift:
//
//   - etc/*.api.md                          (the frozen public API surface)
//   - packages/tokens/contract.snapshot.json (the frozen design-token CONTRACT)
//   - apps/showcase/src/app/shared/navigation.ts (the component/guide page list)
//   - docs/theming.md                        (the theming guide, inlined in -full)
//
// Usage:
//   node tools/generate-llms.mjs           # write the two files
//   node tools/generate-llms.mjs --check   # fail if the committed files are stale
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://rhombuskit.online';
const REPO = 'https://github.com/doug-williamson/RhombusKit';
const OUT_DIR = join('apps', 'showcase', 'public');

const SUMMARY =
  'Accessible, signal-based Angular 21 components built over Angular Material ' +
  'and themed by a frozen design-token contract. Light/dark theming with WCAG ' +
  '2.1 AA verified in CI.';

const PACKAGES = [
  ['@rhombuskit/core', 'standalone, signal-based Angular components'],
  ['@rhombuskit/tokens', 'framework-agnostic design-token contract (CSS / SCSS / TS)'],
  ['@rhombuskit/theme-engine', 'light / dark / system theming runtime'],
  ['@rhombuskit/material-preset', "bridges Angular Material's M3 tokens onto the contract"],
];

// Normalize CRLF → LF on read so generated output is identical on Windows and
// Linux (the repo stores LF via `* text=auto`); without this the CI --check
// would flake against a Windows-authored commit.
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8').replace(/\r\n/g, '\n');

/** Pull the ordered { path, label } page list out of navigation.ts. */
function navItems() {
  const src = read('apps', 'showcase', 'src', 'app', 'shared', 'navigation.ts');
  return [...src.matchAll(/\{\s*path:\s*'([^']+)',\s*label:\s*'([^']+)'\s*\}/g)].map(
    (m) => ({ path: m[1], label: m[2] }),
  );
}

/** Inline an API report, dropping its H1 title and the "do not edit" note. */
function apiBody(file) {
  return read('etc', file)
    .split('\n')
    .filter((line) => !line.startsWith('# ') && !line.startsWith('> '))
    .join('\n')
    .trim();
}

function packagesBlock() {
  return PACKAGES.map(([name, desc]) => `- \`${name}\` — ${desc}`).join('\n');
}

function buildLlmsTxt() {
  const items = navItems();
  const components = items.filter((i) => i.path.startsWith('/components/'));
  const guides = items.filter((i) => i.path !== '/' && !i.path.startsWith('/components/'));

  const componentLinks = components
    .map((c) => `- [${c.label}](${SITE}${c.path})`)
    .join('\n');
  const guideLinks = guides.map((g) => `- [${g.label}](${SITE}${g.path})`).join('\n');

  return `# RhombusKit

> ${SUMMARY}

RhombusKit ships four npm packages, versioned and released in lockstep:

${packagesBlock()}

Install: \`pnpm add @rhombuskit/core @rhombuskit/tokens @rhombuskit/theme-engine\`

## Documentation

- [Component reference](${SITE}): live showcase — a page per component with variants, states, and accessibility notes
- [Theming guide](${SITE}/theming): setup, runtime switching, custom themes, the Material bridge
- [Full API + token reference (for LLMs)](${SITE}/llms-full.txt): the complete machine-readable API surface and design-token contract
- [Source, issues & contributing](${REPO})

## Components

${componentLinks}

## Guides

${guideLinks}

## Optional

- [Contributing guide](${REPO}/blob/main/CONTRIBUTING.md)
- [Suggest a feature or component](${REPO}/issues/new/choose)
`;
}

function buildLlmsFullTxt() {
  const items = navItems();
  const components = items.filter((i) => i.path.startsWith('/components/'));
  const tokens = JSON.parse(read('packages', 'tokens', 'contract.snapshot.json'));
  const tokenList = tokens.map((t) => `\`${t}\``).join(', ');

  const componentLinks = components
    .map((c) => `- ${c.label}: ${SITE}${c.path}`)
    .join('\n');

  return `# RhombusKit — Full reference for LLMs

> ${SUMMARY}

This file is generated from the committed API snapshots (\`etc/*.api.md\`), the
design-token CONTRACT (\`packages/tokens/contract.snapshot.json\`), and the
theming guide. It is the machine-readable companion to ${SITE}.

## Packages

${packagesBlock()}

Install with \`pnpm add @rhombuskit/core @rhombuskit/tokens @rhombuskit/theme-engine\`.
See the **Theming** section at the end for the full provider + SCSS setup.

## Components (showcase pages)

${componentLinks}

---

## API surface — @rhombuskit/core

${apiBody('core.api.md')}

---

## API surface — @rhombuskit/theme-engine

${apiBody('theme-engine.api.md')}

---

## API surface — @rhombuskit/tokens

${apiBody('tokens.api.md')}

---

## Design tokens — the CONTRACT (${tokens.length} CSS custom properties)

These names are the frozen design-token contract. Override their values to
theme; the names themselves are covered by semver.

${tokenList}

---

## Theming guide

${read('docs', 'theming.md').trim()}
`;
}

const targets = [
  [join(OUT_DIR, 'llms.txt'), buildLlmsTxt()],
  [join(OUT_DIR, 'llms-full.txt'), buildLlmsFullTxt()],
];

if (process.argv.includes('--check')) {
  const stale = [];
  for (const [path, content] of targets) {
    let current = '';
    try {
      current = readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');
    } catch {
      current = '';
    }
    if (current !== content) stale.push(path);
  }
  if (stale.length) {
    console.error('✗ llms files are out of date:\n' + stale.map((p) => `    ${p}`).join('\n'));
    console.error('  → regenerate with: node tools/generate-llms.mjs');
    process.exit(1);
  }
  console.log('✓ llms.txt / llms-full.txt are in sync.');
} else {
  for (const [path, content] of targets) {
    writeFileSync(join(ROOT, path), content);
    console.log(`✓ wrote ${path} (${content.length} bytes)`);
  }
}
