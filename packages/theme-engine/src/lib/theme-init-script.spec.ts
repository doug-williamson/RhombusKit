import { getThemeInitScript, THEME_INIT_SCRIPT } from './theme-init-script';
import { STORAGE_KEY, type RhombusThemeConfig } from './theme.tokens';
import type { ThemeName } from './theme.types';

describe('getThemeInitScript', () => {
  it('THEME_INIT_SCRIPT bakes the rhombus defaults plus the storage key', () => {
    expect(THEME_INIT_SCRIPT).toContain("'rhombus-light'");
    expect(THEME_INIT_SCRIPT).toContain("'rhombus-dark'");
    expect(THEME_INIT_SCRIPT).toContain(STORAGE_KEY);
    expect(THEME_INIT_SCRIPT).toContain('data-theme');
  });

  it('default call wraps THEME_INIT_SCRIPT in <script> tags', () => {
    const out = getThemeInitScript();
    expect(out).toBe(`<script>${THEME_INIT_SCRIPT}</script>`);
    expect(out).toContain("'rhombus-light'");
    expect(out).toContain("'rhombus-dark'");
  });

  it('bakes the configured names and omits the rhombus defaults', () => {
    const config: RhombusThemeConfig = {
      light: 'aurora-day' as ThemeName,
      dark: 'aurora-night' as ThemeName,
      default: 'system',
    };
    const out = getThemeInitScript(config);
    expect(out).toContain("'aurora-day'");
    expect(out).toContain("'aurora-night'");
    expect(out).not.toContain("'rhombus-light'");
    expect(out).not.toContain("'rhombus-dark'");
  });
});
