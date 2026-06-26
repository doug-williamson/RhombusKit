/**
 * Registry of valid theme names. Extensible via TypeScript declaration merging.
 *
 * RhombusKit ships 'rhombus-light' and 'rhombus-dark' by default. Consumers
 * that publish additional themes augment this interface:
 *
 * @example
 * declare module '@rhombuskit/theme-engine' {
 *   interface ThemeRegistry {
 *     'foliokit-light': true;
 *     'foliokit-dark': true;
 *   }
 * }
 *
 * After augmentation, setTheme('foliokit-light') type-checks. The consumer
 * is responsible for shipping the CSS that defines [data-theme="foliokit-light"].
 */
export interface ThemeRegistry {
  'rhombus-light': true;
  'rhombus-dark': true;
}

/**
 * The set of valid concrete theme names. Derived from ThemeRegistry so that
 * consumer augmentations are picked up automatically.
 */
export type ThemeName = keyof ThemeRegistry;

/**
 * What the user can express as a preference:
 *   - a concrete theme name;
 *   - `'system'` — follow the OS within the built-in palette;
 *   - `` `system:${palette}` `` — follow the OS within a specific registered
 *     palette (so "follow system" survives a non-built-in palette choice).
 */
export type ThemePreference = ThemeName | 'system' | `system:${string}`;

/**
 * Metadata describing a theme registered with the engine, so the theme controls
 * can reflect the active theme, offer it, and group light/dark variants.
 *
 * Registration is metadata ONLY — the CSS that defines `[data-theme="<name>"]`
 * is still shipped by the consumer (unchanged from before). It tells the engine
 * the name/label/mode/palette so the controls and persistence can recognise it.
 */
export interface RegisteredTheme {
  /** The concrete theme name; maps 1:1 to a `[data-theme="<name>"]` CSS block. */
  name: ThemeName;
  /** Human label shown in the theme controls (e.g. `'Teal Light'`). */
  label: string;
  /** Light/dark polarity — drives the control icon and the mode highlight. */
  mode: 'light' | 'dark';
  /**
   * Colour family this theme belongs to; two themes sharing a palette are the
   * light/dark variants of each other. Defaults to `name` with a trailing
   * `-light`/`-dark` stripped (so `rhombus-light` → `rhombus`).
   */
  palette?: string;
}
