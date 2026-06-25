import { TestBed } from '@angular/core/testing';

import { RhombusThemeService } from './theme.service';
import { provideRhombusTheme, provideRhombusThemes } from './theme.tokens';
import type { ThemeName } from './theme.types';
import type { RegisteredTheme } from './theme.types';

/** jsdom has no matchMedia; stub it so the browser branch can run. */
function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

interface SetupOptions {
  dark?: boolean;
  stored?: string | null;
  providers?: unknown[];
}

function setup(opts: SetupOptions = {}): RhombusThemeService {
  TestBed.resetTestingModule();
  localStorage.clear();
  if (opts.stored != null) {
    localStorage.setItem('rhombuskit:theme-preference', opts.stored);
  }
  mockMatchMedia(opts.dark ?? false);
  TestBed.configureTestingModule({ providers: opts.providers ?? [] });
  return TestBed.inject(RhombusThemeService);
}

const teal = (mode: 'light' | 'dark'): RegisteredTheme => ({
  name: `community-teal-${mode}` as ThemeName,
  label: mode === 'light' ? 'Teal Light' : 'Teal Dark',
  mode,
  palette: 'teal',
});

describe('RhombusThemeService — theme registry (Phase 1, no behaviour change)', () => {
  describe('default app (no registration)', () => {
    it('exposes exactly the two built-in themes, built-ins first', () => {
      const themes = setup().themes();
      expect(themes.map((t) => t.name)).toEqual(['rhombus-light', 'rhombus-dark']);
      const byName = Object.fromEntries(themes.map((t) => [t.name, t]));
      expect(byName['rhombus-light'].mode).toBe('light');
      expect(byName['rhombus-dark'].mode).toBe('dark');
    });

    it('groups the built-ins into a single "rhombus" palette', () => {
      const palettes = setup().palettes();
      expect(palettes).toHaveLength(1);
      expect(palettes[0].palette).toBe('rhombus');
      expect(palettes[0].light).toBe('rhombus-light');
      expect(palettes[0].dark).toBe('rhombus-dark');
    });

    it('derives mode() and palette() from the active theme', () => {
      expect(setup({ dark: false }).mode()).toBe('light');
      const dark = setup({ dark: true });
      expect(dark.mode()).toBe('dark');
      expect(dark.palette()).toBe('rhombus');
    });
  });

  describe('provideRhombusThemes (declarative registration)', () => {
    const providers = [provideRhombusThemes(teal('light'), teal('dark'))];

    it('appends registered themes after the built-ins', () => {
      const names = setup({ providers }).themes().map((t) => t.name);
      expect(names).toEqual([
        'rhombus-light',
        'rhombus-dark',
        'community-teal-light',
        'community-teal-dark',
      ]);
    });

    it('exposes the registered palette alongside the built-in one', () => {
      const palettes = setup({ providers }).palettes();
      expect(palettes.map((p) => p.palette)).toEqual(['rhombus', 'teal']);
      const tealPalette = palettes.find((p) => p.palette === 'teal');
      expect(tealPalette?.light).toBe('community-teal-light');
      expect(tealPalette?.dark).toBe('community-teal-dark');
    });
  });

  describe('registerThemes (imperative registration)', () => {
    it('appends a theme at runtime', () => {
      const service = setup();
      service.registerThemes([teal('light'), teal('dark')]);
      expect(service.themes().map((t) => t.name)).toContain('community-teal-dark');
    });

    it('dedupes by name — last registration wins', () => {
      const service = setup();
      service.registerThemes([
        { name: 'x-light' as ThemeName, label: 'First', mode: 'light', palette: 'x' },
      ]);
      service.registerThemes([
        { name: 'x-light' as ThemeName, label: 'Second', mode: 'light', palette: 'x' },
      ]);
      const matches = service.themes().filter((t) => t.name === 'x-light');
      expect(matches).toHaveLength(1);
      expect(matches[0].label).toBe('Second');
    });
  });

  describe('configured names (provideRhombusTheme)', () => {
    const providers = [
      provideRhombusTheme({
        light: 'aurora-day' as ThemeName,
        dark: 'aurora-night' as ThemeName,
      }),
    ];

    it('built-in registry entries reflect the configured names', () => {
      const service = setup({ providers, dark: true });
      expect(service.themes().map((t) => t.name)).toEqual(['aurora-day', 'aurora-night']);
      expect(service.current()).toBe('aurora-night');
      expect(service.mode()).toBe('dark');
    });
  });
});
