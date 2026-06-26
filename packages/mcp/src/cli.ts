#!/usr/bin/env node
// npx entry: wire the RhombusKit MCP server to stdio. Stdout is the protocol
// channel, so all human-facing logging goes to stderr.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server';

async function main(): Promise<void> {
  const server = createServer();
  await server.connect(new StdioServerTransport());
  console.error('RhombusKit MCP server running on stdio.');
}

main().catch((error) => {
  console.error('Fatal error starting RhombusKit MCP server:', error);
  process.exit(1);
});
