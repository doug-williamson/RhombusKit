/**
 * App-wide geometry scale.
 *
 * Density owns the **box** — heights, padding, gaps. It deliberately changes no
 * font size: Angular Material's own density scale changes none either, and
 * keeping type out of it means compact reads as "less chrome", not "smaller
 * text", and stays clear of the M3 typescale entirely.
 *
 * `'default'` is a real, assertable state rather than the absence of one — the
 * attribute is always written when a level is provided.
 */
export type RhombusDensity = 'compact' | 'default' | 'comfortable';

/**
 * Density levels a data table accepts on its own `density` input: the three
 * app-wide {@link RhombusDensity} levels plus a table-only `'dense'` (36px rows)
 * that has no global equivalent because it drops below every other component's
 * WCAG target floor.
 *
 * Authored as a flat string-literal union (rather than `RhombusDensity | 'dense'`)
 * so the API-doc generator surfaces all four values — it expands a named
 * literal-union alias but not an inline literal added to a referenced alias.
 * The three shared members are frozen, so this cannot drift from `RhombusDensity`.
 */
export type RhombusTableDensity = 'compact' | 'default' | 'comfortable' | 'dense';
