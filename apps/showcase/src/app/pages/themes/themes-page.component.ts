import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
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

const STYLE_ID = 'rk-community-themes';

/**
 * `/themes` — a gallery of selectable themes (built-in light/dark + community
 * presets). Applying a community preset injects its `[data-theme]` CSS once and
 * calls RhombusThemeService.setTheme(); built-in light/dark persist via the
 * engine, community presets apply for the session. The "Add a theme" path is a
 * token-only contribution, CI-validated for CONTRACT completeness + AA contrast.
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
          component changes. Apply one to preview it live. Built-in light and
          dark persist; community presets apply for this session.
        </p>
      </header>

      <div class="gallery">
        @for (t of themes; track t.themeName) {
          <article class="theme-card">
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
    .submit__lead { color: var(--text-secondary); max-width: 70ch; }
    .submit a { color: var(--text-primary); text-decoration: underline; text-underline-offset: 2px; font-weight: 600; }
  `,
})
export default class ThemesPageComponent {
  private readonly theme = inject(RhombusThemeService);
  private readonly doc = inject(DOCUMENT);

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

  constructor() {
    // Browser-only: register community presets as [data-theme] CSS so setTheme()
    // can switch to them. Runs after render, never during SSG prerender.
    afterNextRender(() => this.registerCommunityThemes());
  }

  protected apply(themeName: string): void {
    // The theme service does no runtime validation; community names are not in
    // the ThemeRegistry type, so cast the string through.
    this.theme.setTheme(themeName as ThemePreference);
  }

  private registerCommunityThemes(): void {
    if (this.doc.getElementById(STYLE_ID)) return;
    const css = COMMUNITY_THEMES.map(
      (t) =>
        `[data-theme="community-${t.slug}"]{` +
        Object.entries(t.values)
          .map(([k, v]) => `${k}:${v};`)
          .join('') +
        `}`,
    ).join('\n');
    const style = this.doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    this.doc.head.appendChild(style);
  }
}
