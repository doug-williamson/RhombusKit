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
      service.setMode('light'); // leave the default OS-following state first
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

describe('RhombusThemeService — palette-aware System (follow OS within a palette)', () => {
  it('setMode("system") keeps the active community palette', () => {
    const service = setup({ providers: tealProviders });
    service.setTheme('community-teal-light' as ThemeName);
    service.setMode('system');
    expect(service.preference()).toBe('system:teal');
  });

  it('resolves system:teal to the teal member matching the OS', () => {
    expect(
      setup({ providers: tealProviders, stored: 'system:teal', dark: false }).current(),
    ).toBe('community-teal-light');
    expect(
      setup({ providers: tealProviders, stored: 'system:teal', dark: true }).current(),
    ).toBe('community-teal-dark');
  });

  it('keeps the built-in System as bare "system"', () => {
    const service = setup();
    service.setMode('dark');
    service.setMode('system');
    expect(service.preference()).toBe('system');
  });

  it('switching palette while following the OS stays in System (new palette)', () => {
    const service = setup({ providers: tealProviders, stored: 'system', dark: true });
    expect(service.followsSystem()).toBe(true);

    service.setPalette('teal');
    expect(service.preference()).toBe('system:teal');
    expect(service.followsSystem()).toBe(true);
    expect(service.current()).toBe('community-teal-dark');
  });

  it('switching back to the built-in palette while following the OS yields bare "system"', () => {
    const service = setup({ providers: tealProviders, stored: 'system:teal', dark: true });
    service.setPalette('rhombus');
    expect(service.preference()).toBe('system');
    expect(service.current()).toBe('rhombus-dark');
  });

  it('followsSystem is true for both system forms, false for a concrete theme', () => {
    expect(setup({ stored: 'system' }).followsSystem()).toBe(true);
    expect(
      setup({ providers: tealProviders, stored: 'system:teal' }).followsSystem(),
    ).toBe(true);
    expect(setup({ stored: 'rhombus-dark' }).followsSystem()).toBe(false);
  });

  it('toggle cycles light -> dark -> system within the teal palette', () => {
    const service = setup({ providers: tealProviders });
    service.setTheme('community-teal-light' as ThemeName);
    service.toggle();
    expect(service.preference()).toBe('community-teal-dark');
    service.toggle();
    expect(service.preference()).toBe('system:teal');
    service.toggle();
    expect(service.preference()).toBe('community-teal-light');
  });

  it('hydrates a stored system:<palette> when the palette is registered', () => {
    expect(
      setup({ providers: tealProviders, stored: 'system:teal' }).preference(),
    ).toBe('system:teal');
  });

  it('rejects a stored system:<palette> for an unregistered palette (falls back)', () => {
    expect(setup({ stored: 'system:teal' }).preference()).toBe('system');
  });

  it('falls back to the built-in polarity when the palette lacks the OS mode', () => {
    // Only the dark teal member is registered; OS prefers light -> built-in light.
    const darkOnly = [provideRhombusThemes(teal('dark'))];
    expect(
      setup({ providers: darkOnly, stored: 'system:teal', dark: false }).current(),
    ).toBe('rhombus-light');
  });
});
