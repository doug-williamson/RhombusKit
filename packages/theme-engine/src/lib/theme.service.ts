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
   * Note: cross-session hydration only recognizes the two configured theme
   * names (config.light, config.dark) plus 'system'. A consumer that configures
   * provideRhombusTheme({ light, dark }) gets those two names persisted across
   * sessions. Any OTHER augmented theme name passed here applies within the
   * session but is ignored on the next load (preference falls back to the
   * default). Full multi-theme persistence is deferred to the theme registry.
   */
  setTheme(preference: ThemePreference): void {
    this._preference.set(preference);
  }

  /**
   * Cycle: light → dark → system → light.
   *
   * The 3-state cycle preserves access to the 'system' preference. If you want
   * a 2-state toggle (light ↔ dark, ignoring system), call setTheme() directly.
   */
  toggle(): void {
    const pref = this._preference();
    const next: ThemePreference =
      pref === this.config.light ? this.config.dark :
      pref === this.config.dark  ? 'system' :
      this.config.light;
    this._preference.set(next);
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
      if (
        stored === this.config.light ||
        stored === this.config.dark ||
        stored === 'system'
      ) {
        this._preference.set(stored as ThemePreference);
      }
      // If stored value is null or an unrecognized string (e.g. a custom theme
      // from a removed augmentation), leave preference at the default.
    } catch {
      // localStorage unavailable. Leave default.
    }
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
