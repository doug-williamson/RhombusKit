import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  RhombusCodeBlockComponent,
  RhombusThemeMenuComponent,
  RhombusThemeToggleComponent,
} from '@rhombuskit/core';
import { RhombusThemeService } from '@rhombuskit/theme-engine';
import { tokens } from '@rhombuskit/tokens';

interface Swatch {
  name: string;
  light: string;
  dark: string;
}

const LIGHT = tokens.themes['rhombus-light'];
const DARK = tokens.themes['rhombus-dark'];

// Derive the colour tokens straight from the contract so this reference can't
// drift: every CONTRACT name except the font / shadow / radius families.
const COLOR_TOKENS: Swatch[] = Object.keys(LIGHT)
  .filter((k) => !/^--(font|shadow|radius)/.test(k))
  .map((name) => ({
    name,
    light: LIGHT[name as keyof typeof LIGHT],
    dark: DARK[name as keyof typeof DARK],
  }));

@Component({
  selector: 'app-theming-page',
  standalone: true,
  imports: [
    RhombusCodeBlockComponent,
    RhombusThemeToggleComponent,
    RhombusThemeMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page theming">
      <header class="showcase-page__header">
        <h1>Theming</h1>
        <p>
          RhombusKit themes through a three-tier token system — palette
          <strong>primitives</strong> → semantic <strong>CONTRACT</strong> names
          → light / dark <strong>theme packs</strong>. Flip the theme and the
          whole app re-themes from one contract; the swatches below are live.
        </p>
      </header>

      <section class="showcase-section theming-controls">
        <div class="theming-controls__row">
          <rhombus-theme-toggle />
          <rhombus-theme-menu />
        </div>
        <p class="theming-controls__state">
          Preference: <code>{{ theme.preference() }}</code> · Applied:
          <code>{{ theme.current() }}</code>
        </p>
      </section>

      <section class="showcase-section">
        <h2>Token reference</h2>
        <p class="theming-lead">
          The token <em>names</em> are the public, semver-covered contract; the
          <em>values</em> are a theme. Each swatch renders <code>var(--name)</code>,
          so it tracks the active theme in real time.
        </p>
        <div class="theming-swatches">
          @for (t of colorTokens; track t.name) {
            <div class="theming-swatch">
              <span
                class="theming-swatch__chip"
                [style.background]="'var(' + t.name + ')'"
              ></span>
              <code class="theming-swatch__name">{{ t.name }}</code>
              <span class="theming-swatch__values">
                <span>{{ t.light }}</span>
                <span>{{ t.dark }}</span>
              </span>
            </div>
          }
        </div>
      </section>

      <section class="showcase-section">
        <h2>Setup</h2>
        <p class="theming-lead">
          Load the tokens first so later layers can reference the custom
          properties they declare, then register the theme runtime.
        </p>
        <rhombus-code-block language="scss" [code]="setupStyles" />
        <rhombus-code-block language="typescript" [code]="setupProviders" />
        <p class="theming-lead">
          To avoid a flash of the wrong theme, inject the pre-paint init script
          (<code>THEME_INIT_SCRIPT</code> / <code>getThemeInitScript()</code>)
          into <code>&lt;head&gt;</code>. It uses the same storage key and
          resolution as the service, so the first paint always matches.
        </p>
      </section>

      <section class="showcase-section">
        <h2>Switch at runtime</h2>
        <p class="theming-lead">
          Inject <code>RhombusThemeService</code> — signals for state, methods to
          change the preference. The choice persists under
          <code>rhombuskit:theme-preference</code>; <code>'system'</code> follows
          the OS and re-resolves live.
        </p>
        <rhombus-code-block language="typescript" [code]="runtimeSnippet" />
      </section>

      <section class="showcase-section">
        <h2>Custom themes</h2>
        <p class="theming-lead">
          Add your own theme without touching the contract: augment
          <code>ThemeRegistry</code> so <code>setTheme()</code> type-checks, ship
          CSS for its <code>[data-theme]</code> selector, then register it.
        </p>
        <rhombus-code-block language="typescript" [code]="customSnippet" />
        <rhombus-code-block language="scss" [code]="customCss" />
      </section>

      <section class="showcase-section">
        <h2>The Material bridge</h2>
        <p class="theming-lead">
          <code>&#64;rhombuskit/material-preset</code> maps Angular Material's M3
          system tokens (<code>--mat-sys-*</code>) onto the CONTRACT, so Material
          components inherit the active theme automatically — no
          <code>.mat-mdc-*</code> overrides. It tracks Angular Material 21.x.
        </p>
        <p class="theming-lead">
          The full guide lives in
          <a
            href="https://github.com/doug-williamson/RhombusKit/blob/main/docs/theming.md"
            target="_blank"
            rel="noopener"
            >docs/theming.md</a
          >.
        </p>
      </section>
    </div>
  `,
  styles: `
    .theming-controls__row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .theming-controls__state {
      margin: 1rem 0 0;
      color: var(--text-secondary);
      code {
        font-family: var(--font-mono);
        font-size: 0.85em;
        background: var(--surface-1);
        padding: 0.1em 0.4em;
        border-radius: 0.25em;
        color: var(--text-accent);
      }
    }

    .theming-lead {
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 70ch;
      margin: 0 0 1rem;
      code {
        font-family: var(--font-mono);
        font-size: 0.85em;
        background: var(--surface-1);
        padding: 0.1em 0.35em;
        border-radius: 0.25em;
      }
      a { color: var(--text-accent); }
    }

    .theming-swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.5rem;
    }
    .theming-swatch {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface-0);
    }
    .theming-swatch__chip {
      flex: none;
      width: 2rem;
      height: 2rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.03);
    }
    .theming-swatch__name {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-primary);
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .theming-swatch__values {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      font-family: var(--font-mono);
      font-size: 0.62rem;
      color: var(--text-muted);
      text-align: right;
    }

    .theming rhombus-code-block { display: block; margin-bottom: 1rem; }
  `,
})
export default class ThemingPageComponent {
  protected readonly theme = inject(RhombusThemeService);
  protected readonly colorTokens = COLOR_TOKENS;

  protected readonly setupStyles = `// styles.scss — order matters
@use '@rhombuskit/tokens/scss' as tokens;
@use '@rhombuskit/material-preset/scss' as preset;
@use '@rhombuskit/core/scss' as core;`;

  protected readonly setupProviders = `// app.config.ts
import { provideRhombusTheme } from '@rhombuskit/theme-engine';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRhombusTheme({ light: 'rhombus-light', dark: 'rhombus-dark' }),
  ],
};`;

  protected readonly runtimeSnippet = `import { RhombusThemeService } from '@rhombuskit/theme-engine';

private readonly theme = inject(RhombusThemeService);

this.theme.preference();          // 'rhombus-light' | 'rhombus-dark' | 'system'
this.theme.current();             // always concrete: 'rhombus-light' | 'rhombus-dark'
this.theme.setTheme('rhombus-dark');
this.theme.toggle();              // light -> dark -> system -> light`;

  protected readonly customSnippet = `// 1. Tell TypeScript the theme exists.
declare module '@rhombuskit/theme-engine' {
  interface ThemeRegistry {
    'midnight-light': true;
    'midnight-dark': true;
  }
}

// 2. Register it.
provideRhombusTheme({ light: 'midnight-light', dark: 'midnight-dark' });`;

  protected readonly customCss = `// 3. Ship the CONTRACT values for the theme.
[data-theme='midnight-dark'] {
  --bg: #0b1020;
  --surface-0: #131a2e;
  --text-primary: #e6e9f2;
  --btn-primary-bg: #6366f1;
  // ...every CONTRACT name...
}`;
}
