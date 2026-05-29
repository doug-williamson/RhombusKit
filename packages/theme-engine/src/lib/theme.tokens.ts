import {
  InjectionToken,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import type { ThemeName, ThemePreference } from './theme.types';

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

/**
 * Resolved theme names the service uses at every runtime path. Lets a consumer
 * (e.g. FolioKit) drive RhombusThemeService with its own theme names instead of
 * the built-in `rhombus-*` ones, while keeping the unconfigured behaviour
 * byte-identical to the defaults below.
 *
 *   - `light`   — concrete theme applied when the system resolves to light, and
 *                 the destination of the light leg of `toggle()`.
 *   - `dark`    — concrete theme applied when the system resolves to dark.
 *   - `default` — the initial preference before anything is stored (usually
 *                 'system'; may be a concrete theme to opt out of OS following).
 */
export interface RhombusThemeConfig {
  light: ThemeName;
  dark: ThemeName;
  default: ThemePreference;
}

/**
 * Built-in defaults. An unconfigured app (no `provideRhombusTheme()`) injects
 * these via the token's root factory, so it behaves exactly as it did before
 * the config existed.
 */
export const RHOMBUS_THEME_DEFAULT_CONFIG: RhombusThemeConfig = {
  light: DEFAULT_RESOLVED_THEME,
  dark: 'rhombus-dark',
  default: 'system',
};

/**
 * DI token carrying the resolved theme names. The `providedIn: 'root'` factory
 * returns the rhombus defaults, so consumers that never call
 * `provideRhombusTheme()` (and the showcase) are unaffected.
 */
export const RHOMBUS_THEME_CONFIG = new InjectionToken<RhombusThemeConfig>(
  'RHOMBUS_THEME_CONFIG',
  { providedIn: 'root', factory: () => RHOMBUS_THEME_DEFAULT_CONFIG },
);

/**
 * Configure the resolved theme names RhombusThemeService uses. Register in an
 * app's `providers` (or a route's environment providers). Any omitted field
 * falls back to its rhombus default.
 *
 * Values are caller-trusted `ThemeName`/`ThemePreference` strings — augment
 * `ThemeRegistry` so your names type-check. No runtime validation is performed.
 *
 * @example
 * provideRhombusTheme({ light: 'foliokit-light', dark: 'foliokit-dark' })
 */
export function provideRhombusTheme(
  config: Partial<RhombusThemeConfig> = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: RHOMBUS_THEME_CONFIG,
      useValue: { ...RHOMBUS_THEME_DEFAULT_CONFIG, ...config },
    },
  ]);
}
