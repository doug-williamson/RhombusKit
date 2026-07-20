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
