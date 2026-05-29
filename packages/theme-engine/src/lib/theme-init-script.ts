import { STORAGE_KEY, THEME_ATTRIBUTE } from './theme.tokens';

/**
 * Inline script content that resolves and applies the theme BEFORE Angular
 * bootstraps. Prevents flash-of-wrong-theme on first paint and hydration.
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
 *
 * The script:
 *   1. Reads 'rhombuskit:theme-preference' from localStorage.
 *   2. If 'system' or absent, queries prefers-color-scheme.
 *   3. Sets data-theme on <html> synchronously, before paint.
 *
 * Fails silently on any error (private mode, quota, no matchMedia).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${STORAGE_KEY}');var r;if(s==='rhombus-light'||s==='rhombus-dark'){r=s;}else{r=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'rhombus-dark':'rhombus-light';}document.documentElement.setAttribute('${THEME_ATTRIBUTE}',r);}catch(e){}})();`;

/**
 * Returns the init script wrapped in <script> tags, suitable for direct injection.
 * Use this when programmatically composing index.html (e.g. via an Angular
 * builder transform).
 */
export function getThemeInitScript(): string {
  return `<script>${THEME_INIT_SCRIPT}</script>`;
}
