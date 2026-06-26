// Public entry for programmatic use. The npx CLI lives in cli.ts.
export { createServer } from './server';
export { data, searchComponents, getComponentApi, listTokens, getToken } from './lib';
export type { McpData, ComponentEntry, TokenEntry, ApiSymbol } from './lib';
export { MCP_DATA } from './generated/mcp-data';
