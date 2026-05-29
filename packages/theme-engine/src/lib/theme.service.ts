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
import type { ThemeName, ThemePreference } from './theme.types';
import { STORAGE_KEY, THEME_ATTRIBUTE } from './theme.tokens';

/**
 * Theme management service.
 *
 * Tracks two pieces of state:
 *   - preference: what the user explicitly chose ('rhombus-light' | 'rhombus-dark' | 'system')
 *   - current:    the resolved theme actually applied to the DOM (never 'system')
 *
 * When preference is 'system', current resolves via prefers-color-scheme and
 * updates reactively if the OS theme changes mid-session.
 *
 * SSR-safe. On the server, all operations are no-ops; the service resolves to
 * 'rhombus-light' and never touches localStorage or matchMedia.
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

  // --- Reactive state ---

  /** Internal signal wrapping the matchMedia query state. */
  private readonly systemPrefersDark = signal<boolean>(false);

  /** The user's chosen preference. Backed by localStorage. */
  private readonly _preference = signal<ThemePreference>('system');

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
      return this.systemPrefersDark() ? 'rhombus-dark' : 'rhombus-light';
    }
    return pref;
  });

  constructor() {
    if (!this.isBrowser) {
      // Server: do nothing. current() resolves to 'rhombus-light' because
      // systemPrefersDark stays false and preference stays 'system'.
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
   * Note: consumers who augment ThemeRegistry with custom theme names can pass
   * those names here and they apply within the session. However, the cross-session
   * hydration in this release only recognizes 'rhombus-light', 'rhombus-dark', and
   * 'system' — an augmented theme persisted to localStorage will be ignored on the
   * next session (preference falls back to 'system'). This is a known limitation.
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
      pref === 'rhombus-light' ? 'rhombus-dark' :
      pref === 'rhombus-dark'  ? 'system' :
      'rhombus-light';
    this._preference.set(next);
  }

  // --- Private ---

  private hydrateFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'rhombus-light' || stored === 'rhombus-dark' || stored === 'system') {
        this._preference.set(stored as ThemePreference);
      }
      // If stored value is null or an unrecognized string (e.g. a custom theme
      // from a removed augmentation), leave preference at the default 'system'.
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
