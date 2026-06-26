import { readFileSync } from 'node:fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MCP_DATA } from './generated/mcp-data';
import { searchComponents, getComponentApi, listTokens, getToken } from './lib';

// The server reports the package's own version (matches the published tag, since
// it is read from the sibling package.json at runtime — bundled dist/*.mjs and
// the tsx-run source both resolve `../package.json` to the package root).
const VERSION = (
  JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }
).version;

const API_PACKAGES = [
  ['core', '@rhombuskit/core'],
  ['theme-engine', '@rhombuskit/theme-engine'],
  ['tokens', '@rhombuskit/tokens'],
] as const;

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] });

/**
 * Build the RhombusKit MCP server with all resources and tools registered.
 * Transport-agnostic: connect it to stdio (the CLI) or an in-memory pair (tests).
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: 'rhombuskit', version: VERSION });

  // --- Resources ----------------------------------------------------------
  for (const [key, pkg] of API_PACKAGES) {
    server.registerResource(
      `api-${key}`,
      `rhombuskit://api/${key}`,
      {
        title: `${pkg} API`,
        description: `The frozen public API surface of ${pkg}.`,
        mimeType: 'text/markdown',
      },
      async (uri) => ({ contents: [{ uri: uri.href, text: MCP_DATA.api[key].md }] }),
    );
  }

  server.registerResource(
    'tokens-contract',
    'rhombuskit://tokens/contract',
    {
      title: 'Design-token CONTRACT',
      description: 'The frozen token names with their light/dark values and types.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(MCP_DATA.tokens, null, 2) }],
    }),
  );

  server.registerResource(
    'docs-theming',
    'rhombuskit://docs/theming',
    { title: 'Theming guide', description: 'How to theme RhombusKit.', mimeType: 'text/markdown' },
    async (uri) => ({ contents: [{ uri: uri.href, text: MCP_DATA.theming }] }),
  );

  server.registerResource(
    'components',
    'rhombuskit://components',
    {
      title: 'Components & guides',
      description: 'The RhombusKit showcase page list (components and guides).',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({ components: MCP_DATA.components, guides: MCP_DATA.guides }, null, 2),
        },
      ],
    }),
  );

  // --- Tools --------------------------------------------------------------
  server.registerTool(
    'search_components',
    {
      title: 'Search components',
      description: 'Find RhombusKit components by name, slug, or group. Omit the query to list all.',
      inputSchema: { query: z.string().optional().describe('Substring matched against label, slug, or group') },
    },
    async ({ query }) => {
      const matches = searchComponents(query);
      if (!matches.length) return text(`No components matched "${query ?? ''}".`);
      return text(matches.map((c) => `- ${c.label} (${c.group}) — ${c.url}`).join('\n'));
    },
  );

  server.registerTool(
    'get_component_api',
    {
      title: 'Get component API',
      description:
        'Public API (classes, types, interfaces, functions…) for a RhombusKit symbol or component name.',
      inputSchema: {
        name: z.string().describe('A symbol or component name, e.g. "Button" or "RhombusThemeService"'),
      },
    },
    async ({ name }) => {
      const { symbols, components } = getComponentApi(name);
      if (!symbols.length && !components.length) return text(`No API found for "${name}".`);
      const lines: string[] = [];
      for (const c of components) lines.push(`Showcase: ${c.label} — ${c.url}`);
      if (components.length && symbols.length) lines.push('');
      for (const s of symbols) lines.push(`### ${s.name} (${s.kind}) — ${s.package}\n${s.body}`);
      return text(lines.join('\n'));
    },
  );

  server.registerTool(
    'list_tokens',
    {
      title: 'List design tokens',
      description:
        'List the design-token CONTRACT (name, type, light/dark values), optionally filtered by name or type.',
      inputSchema: {
        query: z.string().optional().describe('Substring matched against token name or type, e.g. "--toast" or "shadow"'),
      },
    },
    async ({ query }) => {
      const matches = listTokens(query);
      if (!matches.length) return text(`No tokens matched "${query ?? ''}".`);
      return text(matches.map((t) => `${t.name} (${t.type}) — light: ${t.light} · dark: ${t.dark}`).join('\n'));
    },
  );

  server.registerTool(
    'get_token',
    {
      title: 'Get token',
      description:
        'A single design token by CONTRACT name (with or without the leading --), with its light/dark values.',
      inputSchema: { name: z.string().describe('Token name, e.g. "--bg" or "text-primary"') },
    },
    async ({ name }) => {
      const t = getToken(name);
      if (!t) return text(`No token named "${name}". Use list_tokens to see the contract.`);
      return text(`${t.name} (${t.type})\n  light: ${t.light}\n  dark:  ${t.dark}`);
    },
  );

  return server;
}
