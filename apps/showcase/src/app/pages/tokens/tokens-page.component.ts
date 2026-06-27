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
        <h2>Geometry &amp; motion primitives</h2>
        <p class="tokens-lead">
          Radius, border-width, and motion are
          <strong>theme-invariant primitives</strong> — identical in light and
          dark — so they form one geometry/motion layer shared by RhombusKit's
          components and your own surfaces. They're part of the published token
          API (the MCP <code>list_tokens</code> returns them), and RhombusKit's
          components consume them internally, so overriding one re-themes the
          matching components too. There's no need to define a parallel
          <code>--r-*</code> / <code>--motion-*</code> scale.
        </p>

        <h3>Corner radius</h3>
        <rhombus-code-block language="css" [code]="radiusScale" />

        <h3>Border width</h3>
        <rhombus-code-block language="css" [code]="borderWidthScale" />

        <h3>Motion — duration &amp; easing</h3>
        <p class="tokens-lead">
          See the <a routerLink="/motion">Motion</a> page for interactive demos
          of every duration and easing curve.
        </p>
        <rhombus-code-block language="css" [code]="motionScale" />
      </section>

      <section class="showcase-section">
        <h2>Ink — a theme-invariant inverse surface</h2>
        <p class="tokens-lead">
          <code>--ink-surface</code> and <code>--ink-on-surface</code> are a
          small <strong>theme-invariant</strong> pair — the same constant
          near-black surface and light text in <em>both</em> light and dark
          themes (mirroring Material's inverse roles). Reach for them when a
          decorative surface must stay dark regardless of theme: code-editor
          mockups, inverted callouts, tooltips, or screenshots. The card below
          keeps its colours when you toggle the theme above.
        </p>
        <div class="ink-demo" aria-hidden="true">
          <div class="ink-demo__dots">
            <span></span><span></span><span></span>
          </div>
          <pre class="ink-demo__code"><span class="ink-demo__muted">// stays dark in both themes</span>
const theme = <span class="ink-demo__accent">'rhombuskit'</span>;</pre>
        </div>
        <rhombus-code-block language="css" [code]="inkScale" />
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

    /* Ink demo — a tiny code-editor mockup on the theme-invariant ink surface.
       It uses --ink-surface / --ink-on-surface, so it stays dark in both themes. */
    .ink-demo {
      max-width: 28rem;
      margin: 0 0 1rem;
      border-radius: var(--radius-xl);
      background: var(--ink-surface);
      color: var(--ink-on-surface);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }
    .ink-demo__dots {
      display: flex;
      gap: 0.375rem;
      padding: 0.75rem 1rem;
      span {
        width: 0.625rem;
        height: 0.625rem;
        border-radius: var(--radius-full);
        background: color-mix(in srgb, var(--ink-on-surface) 30%, transparent);
      }
    }
    .ink-demo__code {
      margin: 0;
      padding: 0 1rem 1rem;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      line-height: 1.6;
    }
    .ink-demo__muted {
      color: color-mix(in srgb, var(--ink-on-surface) 55%, transparent);
    }
    .ink-demo__accent {
      color: var(--code-string);
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

  protected readonly radiusScale = `/* Theme-invariant — listed smallest → largest by value. */
:root {
  --radius-none: 0;
  --radius-sm:   0.125rem; /* 2px */
  --radius-xs:   0.25rem;  /* 4px — form-control corner */
  --radius-md:   0.375rem; /* 6px — nav rows, small surfaces */
  --radius-lg:   0.5rem;   /* 8px — buttons, inputs, popovers */
  --radius-xl:   0.75rem;  /* 12px — cards, dialogs, tables */
  --radius-full: 9999px;   /* pills, avatars, badges */
}`;

  protected readonly borderWidthScale = `:root {
  --border-width:        1px; /* hairlines, dividers, control outlines */
  --border-width-strong: 2px; /* focused field outline */
}`;

  protected readonly inkScale = `/* Theme-invariant — identical in light AND dark. */
.code-mockup {
  background: var(--ink-surface);     /* constant near-black surface */
  color:      var(--ink-on-surface);  /* constant light text (~17:1, AAA) */
}`;

  protected readonly motionScale = `:root {
  --motion-duration-instant: 0ms;
  --motion-duration-fast:    120ms;
  --motion-duration-base:    150ms;
  --motion-duration-slow:    240ms;

  --motion-ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);
  --motion-ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --motion-ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --motion-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
}`;
}
