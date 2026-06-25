export { RhombusThemeService } from './lib/theme.service';
export {
  THEME_INIT_SCRIPT,
  getThemeInitScript,
} from './lib/theme-init-script';
export {
  STORAGE_KEY as THEME_STORAGE_KEY,
  THEME_ATTRIBUTE,
  RHOMBUS_THEME_CONFIG,
  RHOMBUS_THEME_DEFAULT_CONFIG,
  RHOMBUS_THEME_REGISTRY,
  provideRhombusTheme,
  provideRhombusThemes,
} from './lib/theme.tokens';
export type { RhombusThemeConfig } from './lib/theme.tokens';
export type {
  ThemeName,
  ThemePreference,
  ThemeRegistry,
  RegisteredTheme,
} from './lib/theme.types';
