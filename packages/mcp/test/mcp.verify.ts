// Standalone verification for @rhombuskit/mcp, run with tsx (see `test:mcp`).
// Unit-tests the pure accessors, then connects the real server to an in-memory
// MCP client and round-trips its resources and tools. Kept out of jest like the
// schematics verify test — the SDK is ESM and the server needs no jsdom.
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server';
import { searchComponents, getComponentApi, listTokens, getToken } from '../src/lib';

// --- Pure accessors -------------------------------------------------------
assert.ok(searchComponents('button').some((c) => c.slug === 'button'), 'search finds button');
assert.ok(searchComponents('nav').some((c) => c.slug === 'nav-list'), 'search finds nav-list');
assert.ok(searchComponents('Forms').length >= 1, 'search matches by group');
assert.ok(searchComponents().length >= 28, 'empty query returns all components');

const api = getComponentApi('RhombusThemeService');
assert.ok(
  api.symbols.some((s) => s.name === 'RhombusThemeService' && s.kind === 'class' && /setTheme/.test(s.body)),
  'getComponentApi returns the service symbol with its body',
);
assert.ok(getComponentApi('button').components.some((c) => c.slug === 'button'), 'links the showcase page');
assert.deepEqual(getComponentApi('definitely-not-a-symbol'), { symbols: [], components: [] }, 'no match → empty');

const shadows = listTokens('shadow');
assert.equal(shadows.length, 5, 'five shadow tokens');
assert.ok(shadows.every((t) => t.type === 'shadow'), 'shadow filter typed');

// list_tokens returns the 58-name themed CONTRACT plus the published geometry /
// motion primitives (radius / motion / border-width) so downstream tooling sees
// the full token API.
const all = listTokens();
assert.ok(all.length > 58, 'list all = contract + published primitives');
assert.ok(all.some((t) => t.name === '--bg'), 'list includes contract tokens');
assert.ok(
  listTokens('radius').length >= 7 && listTokens('radius').every((t) => t.name.startsWith('--radius-')),
  'radius query returns the radius scale',
);
assert.ok(listTokens('motion').length >= 8, 'motion query returns the motion scale');
assert.ok(
  listTokens('border-width').some((t) => t.name === '--border-width'),
  'border-width is listed',
);

assert.equal(getToken('--bg')?.name, '--bg', 'getToken by full name');
assert.equal(getToken('text-primary')?.name, '--text-primary', 'getToken accepts stripped name');
assert.ok(getToken('--font-sans')?.light.includes('Inter'), 'font token value resolved');
assert.equal(getToken('--radius-xs')?.light, '0.25rem', 'getToken resolves a published primitive');
assert.equal(getToken('nope'), undefined, 'unknown token → undefined');

// --- In-memory server round-trip -----------------------------------------
async function main(): Promise<void> {
  const server = createServer();
  const client = new Client({ name: 'mcp-verify', version: '0.0.0' });
  const [clientTx, serverTx] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTx), client.connect(clientTx)]);

  const { resources } = await client.listResources();
  const uris = resources.map((r) => r.uri);
  for (const u of [
    'rhombuskit://api/core',
    'rhombuskit://api/theme-engine',
    'rhombuskit://api/tokens',
    'rhombuskit://tokens/contract',
    'rhombuskit://docs/theming',
    'rhombuskit://components',
  ]) {
    assert.ok(uris.includes(u), `resource ${u} registered`);
  }

  const apiCore = await client.readResource({ uri: 'rhombuskit://api/core' });
  assert.ok(String(apiCore.contents[0].text).includes('# API Report'), 'api/core resource served');
  const contract = await client.readResource({ uri: 'rhombuskit://tokens/contract' });
  assert.ok(String(contract.contents[0].text).includes('--bg'), 'tokens/contract resource served');

  const { tools } = await client.listTools();
  assert.deepEqual(
    tools.map((t) => t.name).sort(),
    ['get_component_api', 'get_token', 'list_tokens', 'search_components'],
    'all four tools registered',
  );

  const tok = await client.callTool({ name: 'get_token', arguments: { name: '--bg' } });
  assert.ok(String(tok.content[0].text).includes('--bg'), 'get_token round-trips');

  const search = await client.callTool({ name: 'search_components', arguments: { query: 'toast' } });
  assert.ok(/Toast/.test(String(search.content[0].text)), 'search_components round-trips');

  const apiTool = await client.callTool({ name: 'get_component_api', arguments: { name: 'ButtonVariant' } });
  assert.ok(/ButtonVariant/.test(String(apiTool.content[0].text)), 'get_component_api round-trips');

  await client.close();
  await server.close();
  console.log('✓ mcp: pure accessors + in-memory client round-trip (6 resources, 4 tools)');
}

main().catch((error) => {
  console.error('✗ mcp verification failed:\n', error);
  process.exit(1);
});
