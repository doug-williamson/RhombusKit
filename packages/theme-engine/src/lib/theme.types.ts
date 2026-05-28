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
 * What the user can express as a preference. Either a concrete theme, or
 * 'system' meaning "follow OS preference."
 */
export type ThemePreference = ThemeName | 'system';
