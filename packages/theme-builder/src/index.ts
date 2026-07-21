// @rhombuskit/theme-builder — generate WCAG-AA-validated RhombusKit themes from a few seed colours.
export { build as generateTheme, buildRamp, deepTint } from './generate';
export { validateThemeAA } from './validate';
export type { ThemeAAResult, ThemeAAFailure } from './validate';
export { serializeThemeCss, toRegisteredThemes, toAugmentation } from './serialize';
export {
  parseColor,
  normalizeHex,
  relativeLuminance,
  contrastRatio,
  alphaComposite,
  toOKLCH,
  fromOKLCH,
  gamutClampToSrgb,
} from './color-math';
export type { Oklch, Rgba } from './color-math';
export { ThemeAAError } from './errors';
export type { ThemeSeed, GeneratedTheme, BuildOptions, RegisteredThemeMeta } from './types';
