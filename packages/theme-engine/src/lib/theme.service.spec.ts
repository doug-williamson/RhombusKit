import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { RhombusThemeService } from './theme.service';
import { provideRhombusTheme, STORAGE_KEY } from './theme.tokens';
import type { ThemeName } from './theme.types';

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

/**
 * Configure matchMedia + localStorage, then construct the service. Resets the
 * module first so a test can call setup() more than once to simulate separate
 * sessions (e.g. a different stored value or OS preference).
 */
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

/** Flush root effects (the localStorage-persistence effect). */
function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

describe('RhombusThemeService — default config (no provider)', () => {
  it('resolves the system branch to rhombus-light when OS prefers light', () => {
    const service = setup({ dark: false });
    expect(service.preference()).toBe('system');
    expect(service.current()).toBe('rhombus-light');
  });

  it('resolves the system branch to rhombus-dark when OS prefers dark', () => {
    const service = setup({ dark: true });
    expect(service.current()).toBe('rhombus-dark');
  });

  it('toggles rhombus-light -> rhombus-dark -> system -> rhombus-light', () => {
    const service = setup();
    service.setTheme('rhombus-light');

    service.toggle();
    expect(service.preference()).toBe('rhombus-dark');
    service.toggle();
    expect(service.preference()).toBe('system');
    service.toggle();
    expect(service.preference()).toBe('rhombus-light');
  });

  it('hydrates rhombus-light / rhombus-dark / system, and ignores anything else', () => {
    expect(setup({ stored: 'rhombus-dark' }).preference()).toBe('rhombus-dark');
    expect(setup({ stored: 'rhombus-light' }).preference()).toBe('rhombus-light');
    expect(setup({ stored: 'system' }).preference()).toBe('system');
    // Unrecognized value -> falls back to the default preference.
    expect(setup({ stored: 'foliokit-dark' }).preference()).toBe('system');
  });
});

describe('RhombusThemeService — configured names (provideRhombusTheme)', () => {
  // Caller-trusted names; cast since they are not in the default ThemeRegistry.
  const light = 'aurora-day' as ThemeName;
  const dark = 'aurora-night' as ThemeName;
  const providers = [provideRhombusTheme({ light, dark })];

  it('resolves the system branch to the configured light/dark', () => {
    expect(setup({ dark: false, providers }).current()).toBe('aurora-day');
    expect(setup({ dark: true, providers }).current()).toBe('aurora-night');
  });

  it('toggles aurora-day -> aurora-night -> system -> aurora-day', () => {
    const service = setup({ providers });
    service.setTheme(light);

    service.toggle();
    expect(service.preference()).toBe('aurora-night');
    service.toggle();
    expect(service.preference()).toBe('system');
    service.toggle();
    expect(service.preference()).toBe('aurora-day');
  });

  it('hydrates the configured names across sessions', () => {
    expect(setup({ stored: 'aurora-night', providers }).preference()).toBe('aurora-night');
    // A rhombus name is NOT in this app's allowlist -> ignored.
    expect(setup({ stored: 'rhombus-dark', providers }).preference()).toBe('system');
  });

  it('persists the configured preference to localStorage', () => {
    const service = setup({ providers });
    service.setTheme(dark);
    flush();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('aurora-night');
  });
});
