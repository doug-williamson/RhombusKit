/**
 * Pure helpers for classifying and serialising theme preferences, shared by
 * RhombusThemeService and the pre-paint init script so both derive palette ids
 * and resolve the `system` / `system:<palette>` forms identically.
 */

/** Strip a trailing `-light`/`-dark` from a theme name to get its palette id. */
export function paletteOf(name: string): string {
  return name.replace(/-(light|dark)$/, '');
}

/**
 * A parsed theme preference: either a concrete theme, or a "follow OS" mode
 * (optionally scoped to a palette).
 */
export type ParsedPreference =
  | { kind: 'system'; palette?: string }
  | { kind: 'concrete' };

/**
 * Classify a stored/active preference value. `'system'` follows the OS within
 * the built-in palette; `'system:<palette>'` follows the OS within `<palette>`;
 * anything else is a concrete theme name.
 */
export function parsePreference(value: string): ParsedPreference {
  if (value === 'system') return { kind: 'system' };
  if (value.indexOf('system:') === 0) {
    return { kind: 'system', palette: value.slice('system:'.length) };
  }
  return { kind: 'concrete' };
}

/**
 * Serialise a "follow OS within `<palette>`" preference. Returns bare `'system'`
 * for the built-in palette so a single-palette app keeps emitting the historical
 * value (and the init script's default output stays byte-identical).
 */
export function formatSystem(
  palette: string,
  builtin: string,
): 'system' | `system:${string}` {
  return palette === builtin ? 'system' : `system:${palette}`;
}
