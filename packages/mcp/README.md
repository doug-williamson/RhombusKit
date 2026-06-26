# @rhombuskit/mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that serves
RhombusKit's documentation surface to AI coding assistants — the **interactive
companion to [`llms.txt`](https://rhombuskit.online/llms.txt)**.

It reads the same committed, CI-guarded sources the rest of the docs do (`etc/*.api.md`,
the design-token CONTRACT, the showcase navigation, and the theming guide), bundled into
the package at build time, so what the server tells an assistant can never drift from
what RhombusKit actually ships.

## Add it to your AI tool

The server runs over stdio and needs no install — `npx` fetches it on demand.

**Claude Code** (`.mcp.json` or `claude mcp add`):

```json
{
  "mcpServers": {
    "rhombuskit": {
      "command": "npx",
      "args": ["-y", "@rhombuskit/mcp"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`) and other MCP-aware tools use the same shape: command
`npx`, args `["-y", "@rhombuskit/mcp"]`.

## What it exposes

**Resources**

| URI                            | Contents                                        |
| ------------------------------ | ----------------------------------------------- |
| `rhombuskit://api/core`         | `@rhombuskit/core` public API surface           |
| `rhombuskit://api/theme-engine` | `@rhombuskit/theme-engine` public API surface   |
| `rhombuskit://api/tokens`       | `@rhombuskit/tokens` public API surface         |
| `rhombuskit://tokens/contract`  | The design-token CONTRACT with light/dark values |
| `rhombuskit://docs/theming`     | The theming guide                               |
| `rhombuskit://components`       | The component + guide page list                 |

**Tools**

- `search_components(query?)` — find components by name, slug, or group.
- `get_component_api(name)` — the public API for a symbol (class, type, interface…).
- `list_tokens(query?)` — list CONTRACT tokens, optionally filtered by name or type.
- `get_token(name)` — a token's type and its light/dark values.

## Programmatic use

```ts
import { createServer } from '@rhombuskit/mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

await createServer().connect(new StdioServerTransport());
```

The pure data accessors (`searchComponents`, `getComponentApi`, `listTokens`, `getToken`)
are exported too, for building your own surface over the same snapshot.
