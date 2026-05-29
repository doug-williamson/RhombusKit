import {
  RHOMBUS_THEME_DEFAULT_CONFIG,
  STORAGE_KEY,
  THEME_ATTRIBUTE,
  type RhombusThemeConfig,
} from './theme.tokens';

/**
 * Builds the pre-paint init script body for a given resolved-theme config.
 *
 * Mirrors RhombusThemeService's resolution so the synchronously-applied theme
 * matches what the service computes after hydration, preventing a flash of the
 * wrong theme:
 *   1. Read the stored preference.
 *   2. Effective preference = stored if it's one of {light, dark, 'system'},
 *      else the configured default.
 *   3. If 'system', resolve via prefers-color-scheme; otherwise use it directly.
 *   4. Set data-theme on <html> synchronously, before paint.
 *
 * Fails silently on any error (private mode, quota, no matchMedia). The default
 * config produces output behaviourally identical to the original rhombus-only
 * script.
 */
function buildInitBody(config: RhombusThemeConfig): string {
  const { light, dark, default: def } = config;
  return `(function(){try{var L='${light}',D='${dark}',d='${def}';var s=localStorage.getItem('${STORAGE_KEY}');var p=(s===L||s===D||s==='system')?s:d;var r=p==='system'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?D:L):p;document.documentElement.setAttribute('${THEME_ATTRIBUTE}',r);}catch(e){}})();`;
}

/**
 * Inline script content that resolves and applies the theme BEFORE Angular
 * bootstraps. Prevents flash-of-wrong-theme on first paint and hydration.
 *
 * This is the bare rhombus-default build (rhombus-light / rhombus-dark /
 * 'system'). For configured theme names, use getThemeInitScript(config).
 *
 * Usage in an Angular app's index.html:
 *
 * @example
 * <head>
 *   <script>
 *     // Paste THEME_INIT_SCRIPT content here, or use getThemeInitScript()
 *     // to compose it at build time.
 *   </script>
 * </head>
 */
export const THEME_INIT_SCRIPT = buildInitBody(RHOMBUS_THEME_DEFAULT_CONFIG);

/**
 * Returns the init script wrapped in <script> tags, suitable for direct injection.
 * Use this when programmatically composing index.html (e.g. via an Angular
 * builder transform). Pass the same config given to provideRhombusTheme() so the
 * pre-paint theme matches the service; omit it for the rhombus defaults.
 */
export function getThemeInitScript(
  config: RhombusThemeConfig = RHOMBUS_THEME_DEFAULT_CONFIG,
): string {
  return `<script>${buildInitBody(config)}</script>`;
}
