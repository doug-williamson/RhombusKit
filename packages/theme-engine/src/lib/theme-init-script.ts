import {
  RHOMBUS_THEME_DEFAULT_CONFIG,
  STORAGE_KEY,
  THEME_ATTRIBUTE,
  type RhombusThemeConfig,
} from './theme.tokens';
import type { RegisteredTheme } from './theme.types';
import { paletteOf } from './theme.util';

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
function buildInitBody(
  config: RhombusThemeConfig,
  registeredThemes: readonly RegisteredTheme[] = [],
): string {
  const { light, dark, default: def } = config;
  // Registered theme names widen the pre-paint accept-set so a stored one
  // resolves to itself instead of falling back to the default. Emitted ONLY when
  // non-empty, so the default (rhombus-only) output stays byte-identical.
  const names = registeredThemes.map((t) => t.name);
  const rDecl = names.length ? `,R=${JSON.stringify(names)}` : '';
  const rCheck = names.length ? '||R.indexOf(s)>=0' : '';
  // Palette -> light/dark member map, so a stored `system:<palette>` resolves to
  // that palette's member by prefers-color-scheme (mirrors resolveSystem). Built
  // here in TS; emitted (with the rewrite that consumes it) ONLY when themes are
  // registered, keeping the default output byte-identical. An unknown palette or
  // a missing member degrades to bare 'system' -> built-in (polarity preserved).
  const paletteMap: Record<string, { l?: string; d?: string }> = {};
  for (const t of registeredThemes) {
    const pid = t.palette ?? paletteOf(t.name);
    const slot = (paletteMap[pid] ??= {});
    if (t.mode === 'light') slot.l = t.name;
    else slot.d = t.name;
  }
  const sysRewrite = names.length
    ? `var P=${JSON.stringify(paletteMap)};if(s&&s.indexOf('system:')===0){var g=P[s.slice(7)],dk=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;s=g?((dk?g.d:g.l)||'system'):'system';}`
    : '';
  return `(function(){try{var L='${light}',D='${dark}',d='${def}'${rDecl};var s=localStorage.getItem('${STORAGE_KEY}');${sysRewrite}var p=(s===L||s===D||s==='system'${rCheck})?s:d;var r=p==='system'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?D:L):p;document.documentElement.setAttribute('${THEME_ATTRIBUTE}',r);}catch(e){}})();`;
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
 *
 * Pass the themes registered via provideRhombusThemes() as the 2nd argument so a
 * stored registered theme name resolves to itself pre-paint (instead of falling
 * back to the default). No-flash for such a theme still requires its
 * `[data-theme="<name>"]` CSS to be present in <head> before first paint — this
 * script only sets the attribute, it does not ship the palette CSS. Omitting the
 * argument produces byte-identical output to before.
 */
export function getThemeInitScript(
  config: RhombusThemeConfig = RHOMBUS_THEME_DEFAULT_CONFIG,
  registeredThemes: readonly RegisteredTheme[] = [],
): string {
  return `<script>${buildInitBody(config, registeredThemes)}</script>`;
}
