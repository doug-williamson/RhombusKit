import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RhombusCodeBlockComponent } from '@rhombuskit/core';
import { OpenInStackblitzComponent } from '../../shared/open-in-stackblitz.component';
import { TOKENS_STACKBLITZ_STARTER } from '../../shared/tokens-stackblitz-starter';

/**
 * "Design tokens" — the standalone-product story for `@rhombuskit/tokens`.
 *
 * Distinct from /theming (which is about the RhombusKit/Angular runtime: the
 * theme-engine, providers, and the Material bridge). This page is for people on
 * *any* stack — React, Vue, Svelte, Tailwind, or plain HTML — who want the token
 * foundation without Angular. Every recipe here is framework-agnostic.
 */
@Component({
  selector: 'app-tokens-page',
  standalone: true,
  imports: [RouterLink, RhombusCodeBlockComponent, OpenInStackblitzComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page tokens">
      <header class="showcase-page__header">
        <h1>Design tokens</h1>
        <p>
          <code>&#64;rhombuskit/tokens</code> is a standalone, framework-agnostic
          design-token foundation — palette <strong>primitives</strong> →
          semantic <strong>CONTRACT</strong> names → light / dark
          <strong>theme packs</strong>, shipped as CSS custom properties, SCSS,
          and TypeScript. <strong>No Angular, no peer dependencies, no build step
          required.</strong> Use it in React, Vue, Svelte, Tailwind, or a plain
          HTML file.
        </p>
      </header>

      <section class="showcase-section">
        <h2>Install</h2>
        <rhombus-code-block language="bash" [code]="install" />
        <p class="tokens-lead">The package ships four ways to consume it:</p>
        <ul class="tokens-list">
          <li>
            <code>&#64;rhombuskit/tokens/css</code> — the light + dark theme
            packs as CSS custom properties (also <code>/css/primitives</code> and
            <code>/css/contract</code>).
          </li>
          <li><code>&#64;rhombuskit/tokens/scss</code> — the same, as SCSS.</li>
          <li>
            <code>&#64;rhombuskit/tokens</code> — the raw
            <code>tokens</code> object (primitives + theme packs) for TS tooling.
          </li>
        </ul>
        <p class="tokens-lead tokens-note">
          One rule for the CSS/SCSS paths: the CONTRACT values live on a
          <code>[data-theme]</code> selector, so set
          <code>data-theme="rhombus-light"</code> (or
          <code>"rhombus-dark"</code>) on your <code>&lt;html&gt;</code> element.
          That attribute is also your dark-mode switch.
        </p>
      </section>

      <section class="showcase-section">
        <h2>Use it in any stack</h2>

        <h3>Plain CSS — no build</h3>
        <p class="tokens-lead">
          Pull the stylesheet from a CDN (or your bundler) and reference the
          custom properties. That's the whole integration.
        </p>
        <rhombus-code-block language="html" [code]="plainCssHtml" />
        <rhombus-code-block language="css" [code]="plainCss" />

        <h3>SCSS</h3>
        <rhombus-code-block language="scss" [code]="scss" />

        <h3>Tailwind CSS (v4)</h3>
        <p class="tokens-lead">
          Map the contract onto Tailwind's color scale with
          <code>&#64;theme inline</code> — the <code>inline</code> keyword keeps
          the <code>var()</code> reference live, so utilities like
          <code>bg-surface</code> re-theme with <code>data-theme</code>
          automatically (no <code>dark:</code> variants needed).
        </p>
        <rhombus-code-block language="css" [code]="tailwind" />

        <h3>React (or any component framework)</h3>
        <p class="tokens-lead">
          Import the CSS once at your entry point, then read the tokens through
          <code>var()</code> — in <code>style</code>, CSS Modules, or any
          CSS-in-JS library.
        </p>
        <rhombus-code-block language="tsx" [code]="react" />

        <h3>TypeScript — the raw token map</h3>
        <p class="tokens-lead">
          For tooling that needs the values themselves (a charting library, a
          canvas, a theme generator), import the typed <code>tokens</code>
          object.
        </p>
        <rhombus-code-block language="typescript" [code]="ts" />
      </section>

      <section class="showcase-section">
        <h2>Dark mode, no framework</h2>
        <p class="tokens-lead">
          Both theme packs ship in the one stylesheet, keyed off
          <code>data-theme</code>. Switching is a single attribute flip — three
          lines of vanilla JS, no library:
        </p>
        <rhombus-code-block language="javascript" [code]="darkMode" />
      </section>

      <section class="showcase-section">
        <h2>Try it</h2>
        <p class="tokens-lead">
          A live, no-build example: a plain HTML page that pulls the tokens from
          a CDN and flips dark mode with one attribute. No framework, no
          <code>npm install</code>.
        </p>
        <app-open-in-stackblitz
          [project]="tokensStarter"
          openFile="styles.css"
          label="Open the plain-CSS demo in StackBlitz"
        />
      </section>

      <section class="showcase-section">
        <h2>Using RhombusKit with Angular?</h2>
        <p class="tokens-lead">
          The <a routerLink="/theming">Theming guide</a> covers the Angular
          runtime — the <code>provideRhombusTheme</code> providers, switching
          themes with <code>RhombusThemeService</code>, registering custom theme
          packs, and the Material bridge. The
          <a routerLink="/themes">Themes gallery</a> shows community packs built
          on this same contract.
        </p>
      </section>
    </div>
  `,
  styles: `
    .tokens-lead {
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
      a {
        color: var(--text-accent);
      }
    }

    .tokens-note {
      padding: 0.75rem 1rem;
      border-left: 3px solid var(--border-accent);
      background: var(--surface-1);
      border-radius: var(--radius-sm);
    }

    .tokens-list {
      color: var(--text-secondary);
      line-height: 1.7;
      max-width: 70ch;
      margin: 0 0 1rem;
      padding-left: 1.25rem;
      code {
        font-family: var(--font-mono);
        font-size: 0.85em;
        background: var(--surface-1);
        padding: 0.1em 0.35em;
        border-radius: 0.25em;
        color: var(--text-accent);
      }
    }

    .tokens h3 {
      margin: 1.5rem 0 0.5rem;
      font-size: 1.05rem;
      color: var(--text-primary);
    }

    .tokens rhombus-code-block {
      display: block;
      margin-bottom: 1rem;
    }
  `,
})
export default class TokensPageComponent {
  protected readonly tokensStarter = TOKENS_STACKBLITZ_STARTER;

  protected readonly install = `npm install @rhombuskit/tokens
# or: pnpm add @rhombuskit/tokens · yarn add @rhombuskit/tokens`;

  protected readonly plainCssHtml = `<!-- Set the theme pack on <html>. This is also your dark-mode switch. -->
<html data-theme="rhombus-light">`;

  protected readonly plainCss = `/* From a CDN — no build, no install: */
@import 'https://cdn.jsdelivr.net/npm/@rhombuskit/tokens/dist/css/theme-rhombus.css';

/* ...or, with a bundler (Vite, webpack, Parcel): */
/* @import '@rhombuskit/tokens/css'; */

.card {
  background: var(--surface-1);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}`;

  protected readonly scss = `@use '@rhombuskit/tokens/scss' as tokens;

.card {
  background: var(--surface-1);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}`;

  protected readonly tailwind = `/* app.css */
@import 'tailwindcss';
@import '@rhombuskit/tokens/css';

/* Expose the contract as Tailwind colours. \`inline\` keeps the var() live, so
   bg-surface / text-body re-theme with data-theme — dark mode is automatic. */
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface-0);
  --color-surface-1: var(--surface-1);
  --color-body: var(--text-primary);
  --color-muted: var(--text-secondary);
  --color-border: var(--border);
  --color-accent: var(--text-accent);
}

/* Then: <div class="bg-surface-1 text-body border border-border rounded-md"> */`;

  protected readonly react = `// main.tsx — import once at the entry point.
import '@rhombuskit/tokens/css';

// Remember to set data-theme on <html> (in index.html or via JS).
export function Card() {
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      Themed with RhombusKit tokens
    </div>
  );
}`;

  protected readonly ts = `import { tokens } from '@rhombuskit/tokens';

tokens.primitives['violet-600'];               // '#7c3aed'
tokens.themes['rhombus-dark']['--surface-0'];  // the dark surface value

// e.g. hand the active palette to a non-CSS consumer:
const palette = tokens.themes['rhombus-light'];
chart.setSeriesColor(palette['--text-accent']);`;

  protected readonly darkMode = `// Both packs ship in the one stylesheet; flip one attribute.
const html = document.documentElement;
html.dataset.theme =
  html.dataset.theme === 'rhombus-dark' ? 'rhombus-light' : 'rhombus-dark';`;
}
