import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { RhombusThemeService } from './theme.service';
import { provideRhombusThemes } from './theme.tokens';
import type { RegisteredTheme, ThemeName } from './theme.types';

const STORAGE_KEY = 'rhombuskit:theme-preference';

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
    localStorage.setItem(STORAGE_KEY, opts.stored);
  }
  mockMatchMedia(opts.dark ?? false);
  TestBed.configureTestingModule({ providers: opts.providers ?? [] });
  return TestBed.inject(RhombusThemeService);
}

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

const teal = (mode: 'light' | 'dark'): RegisteredTheme => ({
  name: `community-teal-${mode}` as ThemeName,
  label: mode === 'light' ? 'Teal Light' : 'Teal Dark',
  mode,
  palette: 'teal',
});

const tealProviders = [provideRhombusThemes(teal('light'), teal('dark'))];

describe('RhombusThemeService — setMode/setPalette/toggle (Phase 2)', () => {
  describe('setMode in the built-in palette (the menu Light/Dark/System)', () => {
    it('selects the built-in light/dark theme', () => {
      const service = setup();
      service.setMode('dark');
      expect(service.current()).toBe('rhombus-dark');
      service.setMode('light');
      expect(service.current()).toBe('rhombus-light');
    });

    it('setMode("system") returns to OS-following', () => {
      const service = setup();
      service.setMode('dark');
      service.setMode('system');
      expect(service.preference()).toBe('system');
    });
  });

  describe('setMode preserves the active palette (fixes the menu revert)', () => {
    it('keeps the teal palette when toggling mode', () => {
      const service = setup({ providers: tealProviders });
      service.setTheme('community-teal-dark' as ThemeName);
      expect(service.palette()).toBe('teal');

      service.setMode('light');
      expect(service.current()).toBe('community-teal-light');
      expect(service.palette()).toBe('teal');
    });
  });

  describe('setPalette preserves the current mode', () => {
    it('switches palette keeping light/dark', () => {
      const service = setup({ providers: tealProviders });

      service.setMode('light');
      service.setPalette('teal');
      expect(service.current()).toBe('community-teal-light');

      service.setMode('dark');
      expect(service.current()).toBe('community-teal-dark');
      service.setPalette('rhombus');
      expect(service.current()).toBe('rhombus-dark');
    });

    it('is a no-op for an unknown palette', () => {
      const service = setup();
      service.setTheme('rhombus-dark');
      service.setPalette('does-not-exist');
      expect(service.current()).toBe('rhombus-dark');
    });
  });

  describe('persistence — declarative registered themes round-trip', () => {
    it('hydrates a declaratively-registered theme across reload', () => {
      const service = setup({ stored: 'community-teal-dark', providers: tealProviders });
      expect(service.preference()).toBe('community-teal-dark');
    });

    it('rejects an unregistered stored name (falls back to default)', () => {
      const service = setup({ stored: 'community-teal-dark' });
      expect(service.preference()).toBe('system');
    });

    it('persists a registered theme selection to localStorage', () => {
      const service = setup({ providers: tealProviders });
      service.setPalette('teal');
      flush();
      expect(localStorage.getItem(STORAGE_KEY)).toMatch(/^community-teal-(light|dark)$/);
    });
  });

  describe('toggle — palette-aware mode cycle', () => {
    it('cycles the built-in palette identically to before', () => {
      const service = setup();
      service.setTheme('rhombus-light');
      service.toggle();
      expect(service.preference()).toBe('rhombus-dark');
      service.toggle();
      expect(service.preference()).toBe('system');
      service.toggle();
      expect(service.preference()).toBe('rhombus-light');
    });

    it('cycles within an active community palette', () => {
      const service = setup({ providers: tealProviders });
      service.setTheme('community-teal-light' as ThemeName);
      service.toggle();
      expect(service.preference()).toBe('community-teal-dark');
    });
  });
});
