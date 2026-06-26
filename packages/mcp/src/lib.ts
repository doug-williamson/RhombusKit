// Pure, transport-agnostic accessors over the bundled docs snapshot. These are
// the unit-test target; server.ts is a thin MCP wrapper over them.
import { MCP_DATA } from './generated/mcp-data';

export type McpData = typeof MCP_DATA;
export type ComponentEntry = McpData['components'][number];
export type TokenEntry = McpData['tokens'][number];
export interface ApiSymbol {
  package: string;
  name: string;
  kind: string;
  body: string;
}

/** The full bundled snapshot (read-only), for callers that want raw access. */
export const data = MCP_DATA;

const norm = (s: string): string => s.toLowerCase().trim();

/** Components whose label, slug, or group matches the query (all if omitted). */
export function searchComponents(query?: string): readonly ComponentEntry[] {
  const q = norm(query ?? '');
  if (!q) return MCP_DATA.components;
  return MCP_DATA.components.filter(
    (c) => norm(c.label).includes(q) || c.slug.includes(q) || norm(c.group).includes(q),
  );
}

/** Public API symbols (and any matching showcase page) for a name query. */
export function getComponentApi(name: string): {
  symbols: ApiSymbol[];
  components: readonly ComponentEntry[];
} {
  const q = norm(name);
  const symbols: ApiSymbol[] = [];
  if (q) {
    for (const [pkg, entry] of Object.entries(MCP_DATA.api)) {
      for (const s of entry.symbols) {
        if (norm(s.name).includes(q)) {
          symbols.push({ package: pkg, name: s.name, kind: s.kind, body: s.body });
        }
      }
    }
  }
  const components = q
    ? MCP_DATA.components.filter((c) => norm(c.label).includes(q) || c.slug.includes(q))
    : [];
  return { symbols, components };
}

/** CONTRACT tokens whose name or type matches the query (all if omitted). */
export function listTokens(query?: string): readonly TokenEntry[] {
  const q = norm(query ?? '');
  if (!q) return MCP_DATA.tokens;
  return MCP_DATA.tokens.filter((t) => t.name.includes(q) || norm(t.type).includes(q));
}

/** A single token by CONTRACT name, with or without the leading `--`. */
export function getToken(name: string): TokenEntry | undefined {
  const want = norm(name).replace(/^--/, '');
  return MCP_DATA.tokens.find((t) => t.name.replace(/^--/, '') === want);
}
