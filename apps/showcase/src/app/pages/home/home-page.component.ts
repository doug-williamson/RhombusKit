import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  RhombusButtonComponent,
  RhombusCardComponent,
  RhombusCodeBlockComponent,
  RhombusThemeToggleComponent,
} from '@rhombuskit/core';
import { OpenInStackblitzComponent } from '../../shared/open-in-stackblitz.component';

interface Feature {
  icon: string;
  title: string;
  body: string;
}

interface Category {
  label: string;
  blurb: string;
  to: string;
  items: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    RhombusButtonComponent,
    RhombusCardComponent,
    RhombusCodeBlockComponent,
    RhombusThemeToggleComponent,
    OpenInStackblitzComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home">
      <!-- Hero -->
      <section class="home-hero">
        <div class="home-hero__motif" aria-hidden="true">
          <span class="home-rhombus home-rhombus--a"></span>
          <span class="home-rhombus home-rhombus--b"></span>
          <span class="home-rhombus home-rhombus--c"></span>
        </div>

        <div class="home-hero__inner">
          <p class="home-eyebrow">
            <span class="home-eyebrow__dot"></span>
            Angular 21 · WCAG 2.1 AA
          </p>

          <h1 class="home-hero__title">
            Accessible components,
            <span class="home-accent">themed by tokens.</span>
          </h1>

          <p class="home-hero__lead">
            RhombusKit is a standalone, signal-based component library over
            Angular Material — styled through a frozen design-token contract.
            Light, dark, and your own themes, with contrast checked in CI.
          </p>

          <div class="home-hero__actions">
            <rhombus-button variant="primary" size="lg" routerLink="/components/button">
              Browse components
            </rhombus-button>
            <rhombus-button variant="secondary" size="lg" routerLink="/theming">
              Theming guide
            </rhombus-button>
          </div>

          <div class="home-hero__theme">
            <rhombus-theme-toggle />
            <span class="home-hero__theme-hint">
              Flip the theme — the whole page re-themes from one token contract.
            </span>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="home-section">
        <header class="home-section__head">
          <h2 class="home-section__title">Built for a credible 1.0</h2>
          <p class="home-section__sub">
            Not just components — a promise: a frozen public surface, a token
            contract, and accessibility you can verify.
          </p>
        </header>

        <div class="home-features">
          @for (f of features; track f.title) {
            <rhombus-card variant="outlined" padding="lg">
              <div class="home-feature">
                <mat-icon class="home-feature__icon" aria-hidden="true">{{ f.icon }}</mat-icon>
                <h3 class="home-feature__title">{{ f.title }}</h3>
                <p class="home-feature__body">{{ f.body }}</p>
              </div>
            </rhombus-card>
          }
        </div>
      </section>

      <!-- Quick start -->
      <section class="home-section home-section--split">
        <header class="home-section__head">
          <h2 class="home-section__title">Up and running in minutes</h2>
          <p class="home-section__sub">
            Install the packages, load the tokens + Material bridge, and import
            the standalone components you need.
          </p>
          <div class="home-section__cta">
            <rhombus-button appearance="text" trailingIcon="arrow_forward" routerLink="/theming">
              Read the theming guide
            </rhombus-button>
            <p style="margin:1.25rem 0 0.5rem;color:var(--text-muted);font-size:0.9rem">
              …or skip setup entirely:
            </p>
            <app-open-in-stackblitz />
          </div>
        </header>

        <div class="home-quickstart">
          <rhombus-code-block language="bash" [code]="installSnippet" />
          <rhombus-code-block language="scss" [code]="stylesSnippet" />
        </div>
      </section>

      <!-- Browse by category -->
      <section class="home-section">
        <header class="home-section__head">
          <h2 class="home-section__title">Explore the kit</h2>
          <p class="home-section__sub">
            Every component has a live page with Overview, an auto-generated API
            reference, and copy-ready examples.
          </p>
        </header>

        <div class="home-browse">
          @for (c of categories; track c.label) {
            <a class="home-browse__card" [routerLink]="c.to">
              <h3 class="home-browse__title">{{ c.label }}</h3>
              <p class="home-browse__items">{{ c.items }}</p>
              <span class="home-browse__go">{{ c.blurb }} →</span>
            </a>
          }
        </div>
      </section>

      <footer class="home-footer">
        <span>RhombusKit · MIT</span>
        <nav class="home-footer__links">
          <a href="https://www.npmjs.com/package/@rhombuskit/core" target="_blank" rel="noopener">npm</a>
          <a href="https://github.com/doug-williamson/RhombusKit" target="_blank" rel="noopener">GitHub</a>
          <a routerLink="/theming">Theming</a>
          <a routerLink="/components/button">Components</a>
        </nav>
      </footer>
    </div>
  `,
  styles: `
    .home {
      --home-max: 1100px;
      color: var(--text-primary);
    }

    /* --- Hero ------------------------------------------------------------ */
    .home-hero {
      position: relative;
      overflow: hidden;
      padding: 5rem 1.5rem 4rem;
      background:
        radial-gradient(120% 80% at 80% -10%, var(--surface-1), transparent 60%),
        var(--bg);
      border-bottom: 1px solid var(--border);
    }
    @media (min-width: 960px) {
      .home-hero { padding: 7rem 2rem 5.5rem; }
    }

    .home-hero__inner {
      position: relative;
      max-width: var(--home-max);
      margin: 0 auto;
      z-index: 1;
    }

    .home-hero__title {
      font-family: var(--font-prose);
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.05;
      font-size: clamp(2.5rem, 6vw, 4.25rem);
      margin: 0 0 1.25rem;
      max-width: 18ch;
    }

    .home-accent { color: var(--text-accent); }

    .home-hero__lead {
      font-size: clamp(1.05rem, 2vw, 1.25rem);
      line-height: 1.6;
      color: var(--text-secondary);
      max-width: 56ch;
      margin: 0 0 2rem;
    }

    .home-hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }

    .home-hero__theme {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .home-hero__theme-hint {
      font-size: 0.9rem;
      color: var(--text-muted);
      max-width: 32ch;
    }

    .home-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text-secondary);
      margin: 0 0 1.5rem;
      padding: 0.35rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      background: var(--surface-0);
    }
    .home-eyebrow__dot {
      width: 0.5rem;
      height: 0.5rem;
      background: var(--text-accent);
      transform: rotate(45deg);
    }

    /* Rhombus motif — decorative rotated squares, theme-aware, behind content. */
    .home-hero__motif {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      -webkit-mask-image: radial-gradient(80% 70% at 75% 0%, #000 30%, transparent 75%);
      mask-image: radial-gradient(80% 70% at 75% 0%, #000 30%, transparent 75%);
    }
    .home-rhombus {
      position: absolute;
      border: 1.5px solid var(--border-accent);
      transform: rotate(45deg);
      border-radius: var(--radius-sm);
    }
    .home-rhombus--a { width: 320px; height: 320px; top: -80px; right: 8%; opacity: 0.7; }
    .home-rhombus--b { width: 180px; height: 180px; top: 120px; right: 28%; opacity: 0.5; }
    .home-rhombus--c { width: 90px;  height: 90px;  top: 40px;  right: 4%;  opacity: 0.9; background: color-mix(in srgb, var(--text-accent) 8%, transparent); }

    /* --- Sections -------------------------------------------------------- */
    .home-section {
      max-width: var(--home-max);
      margin: 0 auto;
      padding: 4rem 1.5rem;
    }
    @media (min-width: 960px) {
      .home-section { padding: 5rem 2rem; }
      .home-section--split {
        display: grid;
        grid-template-columns: 0.85fr 1.15fr;
        gap: 3rem;
        align-items: start;
      }
    }

    .home-section__head { margin-bottom: 2rem; max-width: 52ch; }
    .home-section__title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      letter-spacing: -0.01em;
      margin: 0 0 0.75rem;
    }
    .home-section__sub {
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }
    .home-section__cta { margin-top: 1.25rem; }

    /* --- Feature cards --------------------------------------------------- */
    .home-features {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
    .home-feature__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.25rem;
      border-radius: var(--radius-md);
      background: var(--nav-active-bg);
      margin-bottom: 0.85rem;
    }
    .home-feature__title { font-size: 1.05rem; font-weight: 600; margin: 0 0 0.4rem; }
    .home-feature__body { color: var(--text-secondary); line-height: 1.55; margin: 0; font-size: 0.92rem; }

    /* --- Quick start ----------------------------------------------------- */
    .home-quickstart { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }

    /* --- Browse ---------------------------------------------------------- */
    .home-browse {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .home-browse__card {
      display: block;
      text-decoration: none;
      color: inherit;
      padding: 1.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface-0);
      transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
    }
    .home-browse__card:hover {
      border-color: var(--border-accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .home-browse__title { font-size: 1.05rem; font-weight: 600; margin: 0 0 0.35rem; }
    .home-browse__items { color: var(--text-muted); font-size: 0.85rem; margin: 0 0 1rem; }
    .home-browse__go { color: var(--text-accent); font-size: 0.9rem; font-weight: 600; }

    /* --- Footer ---------------------------------------------------------- */
    .home-footer {
      max-width: var(--home-max);
      margin: 0 auto;
      padding: 2rem 1.5rem 3rem;
      border-top: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .home-footer__links { display: flex; gap: 1.25rem; flex-wrap: wrap; }
    .home-footer__links a { color: var(--text-secondary); text-decoration: none; }
    .home-footer__links a:hover { color: var(--text-accent); }
  `,
})
export default class HomePageComponent {
  protected readonly features: Feature[] = [
    {
      icon: 'palette',
      title: 'Token-driven theming',
      body: 'One semantic token contract drives every component. Switch data-theme — light, dark, or your own — and the whole UI follows.',
    },
    {
      icon: 'accessibility_new',
      title: 'WCAG 2.1 AA, verified',
      body: 'Every component is scanned by axe in CI, and colour contrast is verified in both light and dark themes against the real rendered output.',
    },
    {
      icon: 'bolt',
      title: 'Angular-native',
      body: '100% standalone, signal inputs, OnPush. Thin wrappers over Angular Material — no NgModules, no ceremony.',
    },
    {
      icon: 'verified_user',
      title: 'A 1.0 promise',
      body: 'The public exports, token names, and theming contract are snapshot-guarded in CI. Semver means something here.',
    },
  ];

  protected readonly categories: Category[] = [
    { label: 'Primitives', blurb: 'Button, Badge, Card', to: '/components/button', items: 'Button · Badge · Card · Chip · Tag' },
    { label: 'Forms', blurb: 'Inputs & controls', to: '/components/input', items: 'Input · Select · Checkbox · Radio · Switch · Textarea' },
    { label: 'Data & overlays', blurb: 'Tables & dialogs', to: '/components/data-table', items: 'Data Table · Dialog · Tooltip · Toast · Menu' },
    { label: 'Navigation', blurb: 'Move around', to: '/components/tabs', items: 'Tabs · Nav List · Breadcrumbs · Pagination · Menu' },
    { label: 'Status & layout', blurb: 'Feedback & frame', to: '/components/alert', items: 'Alert · Avatar · Progress · App Shell' },
    { label: 'Content', blurb: 'Page composition', to: '/components/page-header', items: 'Page Header · Empty State · Code Block' },
  ];

  protected readonly installSnippet = `pnpm add @rhombuskit/core @rhombuskit/material-preset`;

  protected readonly stylesSnippet = `// styles.scss — order matters
@use '@rhombuskit/tokens/scss' as tokens;
@use '@rhombuskit/material-preset/scss' as preset;
@use '@rhombuskit/core/scss' as core;`;
}
