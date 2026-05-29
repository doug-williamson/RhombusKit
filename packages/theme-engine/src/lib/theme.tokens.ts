/**
 * localStorage key for theme preference. Namespaced to avoid collision with
 * consumer code. If this changes in a future major version, document the
 * migration path.
 */
export const STORAGE_KEY = 'rhombuskit:theme-preference';

/**
 * The HTML attribute that theme CSS hooks into. Matches the [data-theme]
 * selectors in @rhombuskit/tokens generated CSS.
 */
export const THEME_ATTRIBUTE = 'data-theme';

/** Default fallback when no preference exists and matchMedia is unavailable. */
export const DEFAULT_RESOLVED_THEME = 'rhombus-light' as const;
