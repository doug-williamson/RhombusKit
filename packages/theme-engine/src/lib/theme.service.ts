import {
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { RegisteredTheme, ThemeName, ThemePreference } from './theme.types';
import {
  RHOMBUS_THEME_CONFIG,
  RHOMBUS_THEME_REGISTRY,
  STORAGE_KEY,
  THEME_ATTRIBUTE,
} from './theme.tokens';

/** Strip a trailing `-light`/`-dark` from a theme name to get its palette id. */
function paletteOf(name: string): string {
  return name.replace(/-(light|dark)$/, '');
}

/** Strip a trailing "light"/"dark" word from a label (`'Teal Light'` → `'Teal'`). */
function paletteLabel(label: string): string {
  return label.replace(/\s*(light|dark)\s*$/i, '').trim();
}

/** Merge themes, deduping by name (last value wins; first position kept). */
function dedupeByName(
  themes: readonly RegisteredTheme[],
): readonly RegisteredTheme[] {
  const byName = new Map<string, RegisteredTheme>();
  for (const theme of themes) byName.set(theme.name, theme);
  return [...byName.values()];
}

/** A palette family with its light/dark members, for a palette picker. */
interface ThemePalette {
  palette: string;
  label: string;
  light?: ThemeName;
  dark?: ThemeName;
}

/** Group registered themes by palette family, preserving first-seen order. */
function groupByPalette(
  themes: readonly RegisteredTheme[],
): readonly ThemePalette[] {
  const groups = new Map<string, ThemePalette>();
  for (const theme of themes) {
    const id = theme.palette ?? paletteOf(theme.name);
    const group = groups.get(id) ?? { palette: id, label: id };
    if (theme.mode === 'light') group.light = theme.name;
    else group.dark = theme.name;
    const derived = paletteLabel(theme.label);
    if (derived) group.label = derived;
    groups.set(id, group);
  }
  return [...groups.values()];
}

/**
 * Theme management service.
 *
 * Tracks two pieces of state:
 *   - preference: what the user explicitly chose (config.light | config.dark | 'system')
 *   - current:    the resolved theme actually applied to the DOM (never 'system')
 *
 * The concrete light/dark theme names come from RHOMBUS_THEME_CONFIG (see
 * provideRhombusTheme). Unconfigured, they are 'rhombus-light'/'rhombus-dark'.
 *
 * When preference is 'system', current resolves via prefers-color-scheme and
 * updates reactively if the OS theme changes mid-session.
 *
 * SSR-safe. On the server, all operations are no-ops; the service resolves to
 * the configured light theme and never touches localStorage or matchMedia.
 *
 * Persistence: the LITERAL preference is stored (including 'system'), not the
 * resolved theme. This preserves the user's "follow system" intent across
 * sessions.
 *
 * Flash prevention: use THEME_INIT_SCRIPT in <head> BEFORE Angular bootstraps.
 * This service alone cannot prevent the flash because it runs after hydration.
 */
@Injectable({ providedIn: 'root' })
export class RhombusThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Resolved theme names this service uses. Defaults to rhombus-* unless the
   * consumer registered provideRhombusTheme(). Declared before _preference so
   * its field initializer can read config.default.
   */
  private readonly config = inject(RHOMBUS_THEME_CONFIG);

  /**
   * Themes registered declaratively via provideRhombusThemes() — injected at
   * construction, so they are known before hydrate (and therefore persist).
   */
  private readonly providedThemes =
    inject(RHOMBUS_THEME_REGISTRY, { optional: true }) ?? [];

  /** Themes registered imperatively at runtime via registerThemes(). */
  private readonly _registered = signal<readonly RegisteredTheme[]>([]);

  /**
   * The two built-in entries, derived from the resolved config names so a
   * configured app (provideRhombusTheme) reflects its own names, not rhombus-*.
   */
  private readonly builtinThemes: readonly RegisteredTheme[] = [
    { name: this.config.light, label: 'Light', mode: 'light', palette: paletteOf(this.config.light) },
    { name: this.config.dark, label: 'Dark', mode: 'dark', palette: paletteOf(this.config.dark) },
  ];

  // --- Reactive state ---

  /** Internal signal wrapping the matchMedia query state. */
  private readonly systemPrefersDark = signal<boolean>(false);

  /** The user's chosen preference. Backed by localStorage. */
  private readonly _preference = signal<ThemePreference>(this.config.default);

  /**
   * The user's preference. Read-only externally; use setTheme()/toggle() to change.
   */
  readonly preference = this._preference.asReadonly();

  /**
   * The resolved theme currently applied to the DOM. Always a concrete ThemeName,
   * never 'system'. Updates reactively when preference changes OR when the OS
   * theme changes while preference is 'system'.
   */
  readonly current = computed<ThemeName>(() => {
    const pref = this._preference();
    if (pref === 'system') {
      return this.systemPrefersDark() ? this.config.dark : this.config.light;
    }
    return pref;
  });

  /**
   * All registered themes — config-derived built-ins first, then declarative
   * (provideRhombusThemes), then imperative (registerThemes); deduped by name
   * (last registration wins). An unconfigured app sees just the two built-ins.
   */
  readonly themes = computed<readonly RegisteredTheme[]>(() =>
    dedupeByName([
      ...this.builtinThemes,
      ...this.providedThemes,
      ...this._registered(),
    ]),
  );

  /** Registered themes grouped by palette family (built-ins are one palette). */
  readonly palettes = computed<
    readonly { palette: string; label: string; light?: ThemeName; dark?: ThemeName }[]
  >(() => groupByPalette(this.themes()));

  /** The resolved light/dark mode of the active theme. */
  readonly mode = computed<'light' | 'dark'>(() => {
    const name = this.current();
    const entry = this.themes().find((t) => t.name === name);
    return entry?.mode ?? (/-dark$/.test(name) ? 'dark' : 'light');
  });

  /** The palette family of the active theme. */
  readonly palette = computed<string>(() => {
    const name = this.current();
    const entry = this.themes().find((t) => t.name === name);
    return entry?.palette ?? paletteOf(name);
  });

  constructor() {
    if (!this.isBrowser) {
      // Server: do nothing. current() resolves to config.light because
      // systemPrefersDark stays false and preference stays the default
      // (typically 'system').
      return;
    }

    // Hydrate preference from localStorage before any effect fires.
    this.hydrateFromStorage();

    // Wire matchMedia listener for OS theme changes.
    this.subscribeToSystemTheme();

    // Apply the resolved theme to the DOM whenever it changes. This is the ONLY
    // place that writes THEME_ATTRIBUTE; consumers must not set it manually.
    effect(() => {
      const theme = this.current();
      document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
    });

    // Persist preference changes to localStorage.
    effect(() => {
      const pref = this._preference();
      try {
        localStorage.setItem(STORAGE_KEY, pref);
      } catch {
        // localStorage may be unavailable (private mode, quota). Fail silent.
      }
    });
  }

  /**
   * Set the user's theme preference.
   *
   * Cross-session persistence covers `'system'`, the configured light/dark names,
   * and any theme registered DECLARATIVELY via provideRhombusThemes(). A name
   * that is only registered imperatively (registerThemes()) — or not registered
   * at all — applies for the session but falls back to the default on next load.
   */
  setTheme(preference: ThemePreference): void {
    this._preference.set(preference);
  }

  /**
   * Cycle the active palette's mode: light → dark → system → light.
   *
   * For the built-in palette this is the historical light → dark → system cycle.
   * When a non-built-in palette is active, the light/dark legs stay WITHIN that
   * palette (e.g. teal-light → teal-dark); the system leg returns to the
   * OS-following built-in ('system' is a built-in-palette concept). Byte-identical
   * for a single-palette (unconfigured) app.
   */
  toggle(): void {
    if (this._preference() === 'system') {
      this.setMode('light');
    } else {
      this.setMode(this.mode() === 'light' ? 'dark' : 'system');
    }
  }

  /**
   * Set the light/dark mode WITHIN the active palette, without changing palette.
   * `'system'` returns to the OS-following built-in. If the active palette has no
   * member for the requested mode, falls back to the built-in of that mode.
   */
  setMode(mode: 'light' | 'dark' | 'system'): void {
    if (mode === 'system') {
      this._preference.set('system');
      return;
    }
    const active = this.palette();
    const match = this.themes().find(
      (t) => (t.palette ?? paletteOf(t.name)) === active && t.mode === mode,
    );
    const target = match?.name ?? (mode === 'light' ? this.config.light : this.config.dark);
    this._preference.set(target);
  }

  /**
   * Switch to another palette family, preserving the current resolved mode
   * (light/dark). Falls back to the palette's available member if it has no
   * theme for the current mode; a no-op for an unknown palette.
   */
  setPalette(palette: string): void {
    const mode = this.mode();
    const members = this.themes().filter(
      (t) => (t.palette ?? paletteOf(t.name)) === palette,
    );
    const target = members.find((t) => t.mode === mode)?.name ?? members[0]?.name;
    if (target) {
      this._preference.set(target);
    }
  }

  /**
   * Register themes at runtime (appends; dedupes by name, last wins). Use for
   * themes discovered after bootstrap. Note: imperatively-registered themes are
   * NOT re-hydrated across reload — for persistence use provideRhombusThemes().
   */
  registerThemes(themes: readonly RegisteredTheme[]): void {
    this._registered.update((current) => [...current, ...themes]);
  }

  // --- Private ---

  private hydrateFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && this.isAcceptablePreference(stored)) {
        this._preference.set(stored as ThemePreference);
      }
      // Null, or an unrecognized string (a removed augmentation, or a theme only
      // registered imperatively): leave preference at the default.
    } catch {
      // localStorage unavailable. Leave default.
    }
  }

  /**
   * Whether a stored value may be restored on load. `'system'` and any theme in
   * the CONSTRUCTION-time registry (built-ins + declaratively-provided themes)
   * round-trip. Imperatively-registered themes are unknown at hydrate time, so
   * they are session-only by design (use provideRhombusThemes() for persistence).
   */
  private isAcceptablePreference(value: string): boolean {
    if (value === 'system') return true;
    return (
      this.builtinThemes.some((t) => t.name === value) ||
      this.providedThemes.some((t) => t.name === value)
    );
  }

  private subscribeToSystemTheme(): void {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPrefersDark.set(mql.matches);

    const handler = (e: MediaQueryListEvent) => {
      this.systemPrefersDark.set(e.matches);
    };

    mql.addEventListener('change', handler);

    this.destroyRef.onDestroy(() => {
      mql.removeEventListener('change', handler);
    });
  }
}
