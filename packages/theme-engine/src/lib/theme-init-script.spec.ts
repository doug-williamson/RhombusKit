import { getThemeInitScript, THEME_INIT_SCRIPT } from './theme-init-script';
import { STORAGE_KEY, type RhombusThemeConfig } from './theme.tokens';
import type { RegisteredTheme, ThemeName } from './theme.types';

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

describe('getThemeInitScript — registered themes (Phase 3 no-flash)', () => {
  const tealDark: RegisteredTheme = {
    name: 'community-teal-dark' as ThemeName,
    label: 'Teal Dark',
    mode: 'dark',
    palette: 'teal',
  };

  /** Strip the <script> wrapper and execute the body in jsdom. */
  function run(out: string): string | null {
    document.documentElement.removeAttribute('data-theme');
    const body = out.replace(/^<script>/, '').replace(/<\/script>$/, '');
    eval(body);
    return document.documentElement.getAttribute('data-theme');
  }

  it('is byte-identical when no themes are registered', () => {
    expect(getThemeInitScript(undefined, [])).toBe(getThemeInitScript());
    const config: RhombusThemeConfig = {
      light: 'aurora-day' as ThemeName,
      dark: 'aurora-night' as ThemeName,
      default: 'system',
    };
    expect(getThemeInitScript(config, [])).toBe(getThemeInitScript(config));
  });

  it('applies a stored registered theme name pre-paint', () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, 'community-teal-dark');
    expect(run(getThemeInitScript(undefined, [tealDark]))).toBe('community-teal-dark');
  });

  it('ignores a stored registered name that was NOT passed (falls back)', () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, 'community-teal-dark');
    // default config, def='system'; no matchMedia in jsdom -> resolves to light.
    expect(run(getThemeInitScript())).toBe('rhombus-light');
  });
});

describe('getThemeInitScript — system:<palette> pre-paint (palette-aware System)', () => {
  const tealLight: RegisteredTheme = {
    name: 'community-teal-light' as ThemeName,
    label: 'Teal Light',
    mode: 'light',
    palette: 'teal',
  };
  const tealDark: RegisteredTheme = {
    name: 'community-teal-dark' as ThemeName,
    label: 'Teal Dark',
    mode: 'dark',
    palette: 'teal',
  };

  function run(out: string): string | null {
    document.documentElement.removeAttribute('data-theme');
    const body = out.replace(/^<script>/, '').replace(/<\/script>$/, '');
    eval(body);
    return document.documentElement.getAttribute('data-theme');
  }

  function mockMatchMedia(matches: boolean): void {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => ({ matches }),
    });
  }

  afterEach(() => {
    // Restore jsdom's default (matchMedia absent) for the other suites.
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('resolves system:<palette> to the palette member matching the OS', () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, 'system:teal');
    const script = getThemeInitScript(undefined, [tealLight, tealDark]);

    mockMatchMedia(false);
    expect(run(script)).toBe('community-teal-light');
    mockMatchMedia(true);
    expect(run(script)).toBe('community-teal-dark');
  });

  it('falls back to the built-in polarity for an unknown palette', () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, 'system:ocean'); // not registered
    mockMatchMedia(true);
    expect(run(getThemeInitScript(undefined, [tealLight, tealDark]))).toBe('rhombus-dark');
  });

  it('falls back to the built-in polarity when the palette lacks the OS mode', () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, 'system:teal');
    mockMatchMedia(false); // OS light, but only the dark teal member is registered
    expect(run(getThemeInitScript(undefined, [tealDark]))).toBe('rhombus-light');
  });
});
