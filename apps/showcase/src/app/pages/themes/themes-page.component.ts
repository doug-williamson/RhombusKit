import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RhombusButtonComponent } from '@rhombuskit/core';
import { RhombusThemeService, type ThemePreference } from '@rhombuskit/theme-engine';
import { tokens } from '@rhombuskit/tokens';
import { COMMUNITY_THEMES } from './community-themes';

interface GalleryTheme {
  themeName: string;
  label: string;
  author: string;
  mode: string;
  builtin: boolean;
  values: Record<string, string>;
}

// Representative swatches shown per card.
const SWATCH_KEYS = ['--bg', '--surface-2', '--text-primary', '--text-accent', '--btn-primary-bg', '--border-strong'];

/**
 * `/themes` — a gallery of selectable themes (built-in light/dark + community
 * presets). Community presets are registered as first-class engine themes (see
 * app.config `provideRhombusThemes`), so applying one is reflected in the theme
 * menu and persists across reload — same as the built-ins. The "Add a theme"
 * path is a token-only contribution, CI-validated for CONTRACT completeness + AA
 * contrast.
 */
@Component({
  selector: 'app-themes-page',
  standalone: true,
  imports: [RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page themes">
      <header class="showcase-page__header">
        <h1>Themes</h1>
        <p class="themes__lead">
          Every theme is just a map over the design-token contract — no
          component changes. Apply one: your choice persists across reload, and
          the theme menu in the header reflects it.
        </p>
      </header>

      <div class="gallery">
        @for (t of themes; track t.themeName) {
          <article
            class="theme-card"
            [class.theme-card--active]="t.themeName === theme.current()"
            [attr.aria-current]="t.themeName === theme.current() ? 'true' : null"
          >
            <div class="theme-card__swatches" aria-hidden="true">
              @for (key of swatchKeys; track key) {
                <span class="theme-card__sw" [style.background]="t.values[key]"></span>
              }
            </div>
            <div class="theme-card__meta">
              <h2 class="theme-card__name">{{ t.label }}</h2>
              <p class="theme-card__by">
                {{ t.builtin ? 'Built-in' : 'Community' }} · {{ t.mode }} · {{ t.author }}
              </p>
            </div>
            @if (t.themeName === theme.current()) {
              <span class="theme-card__active">● Active</span>
            }
            <rhombus-button variant="secondary" (click)="apply(t.themeName)">Apply</rhombus-button>
          </article>
        }
      </div>

      <section class="showcase-section submit">
        <h2>Add a theme</h2>
        <p class="submit__lead">
          A community theme is a token-only file — no code, no selectors. Open a
          PR adding your token map; CI checks it sets every contract token
          <strong>and</strong> clears WCAG AA contrast, so an inaccessible or
          incomplete theme can't merge.
        </p>
        <p>
          <a [href]="contributeUrl" target="_blank" rel="noopener">See the theme format &amp; submit one →</a>
        </p>
      </section>
    </div>
  `,
  styles: `
    .themes__lead { color: var(--text-secondary); max-width: 70ch; margin: 0.5rem 0 0; }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin: 2rem 0 3rem;
    }
    .theme-card {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      background-color: var(--surface-1);
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .theme-card--active {
      border-color: var(--border-accent);
      box-shadow: 0 0 0 1px var(--border-accent);
    }
    .theme-card__swatches {
      display: flex;
      height: 2.5rem;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .theme-card__sw { flex: 1; }
    .theme-card__meta { flex: 1; }
    .theme-card__name { font-size: 1rem; margin: 0; color: var(--text-primary); }
    .theme-card__by { font-size: 0.8125rem; color: var(--text-muted); margin: 0.2rem 0 0; text-transform: capitalize; }
    .theme-card__active { font-size: 0.75rem; font-weight: 600; color: var(--text-accent); }
    .submit__lead { color: var(--text-secondary); max-width: 70ch; }
    .submit a { color: var(--text-primary); text-decoration: underline; text-underline-offset: 2px; font-weight: 600; }
  `,
})
export default class ThemesPageComponent {
  protected readonly theme = inject(RhombusThemeService);

  protected readonly swatchKeys = SWATCH_KEYS;
  protected readonly contributeUrl =
    'https://github.com/doug-williamson/RhombusKit/blob/main/apps/showcase/src/app/pages/themes/community-themes.ts';

  protected readonly themes: GalleryTheme[] = [
    { themeName: 'rhombus-light', label: 'Light', author: 'RhombusKit', mode: 'light', builtin: true, values: tokens.themes['rhombus-light'] as Record<string, string> },
    { themeName: 'rhombus-dark', label: 'Dark', author: 'RhombusKit', mode: 'dark', builtin: true, values: tokens.themes['rhombus-dark'] as Record<string, string> },
    ...COMMUNITY_THEMES.map((t) => ({
      themeName: `community-${t.slug}`,
      label: t.label,
      author: t.author,
      mode: t.mode,
      builtin: false,
      values: t.values,
    })),
  ];

  protected apply(themeName: string): void {
    // Community names are registered (app.config) but are data-driven strings,
    // so cast through to the ThemePreference union. The engine + the app-level
    // CSS injection (AppComponent) make this persist and reflect in the menu.
    this.theme.setTheme(themeName as ThemePreference);
  }
}
