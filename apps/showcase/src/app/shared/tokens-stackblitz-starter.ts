import type { Project } from '@stackblitz/sdk';

// A zero-build, zero-framework proof that @rhombuskit/tokens stands on its own:
// a plain HTML/CSS/JS page that pulls the published token CSS straight from the
// jsDelivr CDN (no npm install, no bundler) and styles itself with `var(--token)`.
// Dark mode is one attribute flip — both theme packs ship in the one stylesheet.
// Uses StackBlitz's static `html` template, so it boots instantly. The CDN URL
// is the package's own `./css` export (dist/css/theme-rhombus.css).

const INDEX_HTML = `<!doctype html>
<html lang="en" data-theme="rhombus-light">
  <head>
    <meta charset="utf-8" />
    <title>RhombusKit tokens — no framework</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- The design tokens, straight from public npm via CDN. No build step. -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@rhombuskit/tokens/dist/css/theme-rhombus.css"
    />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="card">
      <h1>Styled with RhombusKit tokens</h1>
      <p>
        No Angular, no framework, no build — just
        <code>var(--token)</code> from one CSS file.
      </p>
      <button id="toggle" class="btn">Toggle dark mode</button>
    </main>
    <script src="script.js"></script>
  </body>
</html>
`;

const STYLES_CSS = `/* Every colour, radius, shadow, and font here is a RhombusKit token.
   The values come from the [data-theme] pack on <html>; change nothing else
   and the whole page re-themes. */
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
  font-family: var(--font-sans);
}

.card {
  max-width: 30rem;
  padding: 2rem;
  background: var(--surface-1);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.card h1 {
  margin-top: 0;
  color: var(--text-primary);
}

.card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.card code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--surface-2);
  padding: 0.1em 0.35em;
  border-radius: var(--radius-sm);
}

.btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font: inherit;
  cursor: pointer;
  color: var(--btn-primary-text);
  background: var(--btn-primary-bg);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-btn-primary);
}
`;

const SCRIPT_JS = `// Both the light and dark packs ship in the one stylesheet, keyed off the
// data-theme attribute. Dark mode is a single attribute flip — no framework,
// no extra CSS.
document.getElementById('toggle').addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme =
    html.dataset.theme === 'rhombus-dark' ? 'rhombus-light' : 'rhombus-dark';
});
`;

/** A no-build, no-framework "tokens in plain CSS" StackBlitz starter. */
export const TOKENS_STACKBLITZ_STARTER: Project = {
  title: 'RhombusKit tokens — plain CSS',
  description:
    'Use @rhombuskit/tokens in a plain HTML/CSS page — no framework, no build. Dark mode is one attribute.',
  template: 'html',
  files: {
    'index.html': INDEX_HTML,
    'styles.css': STYLES_CSS,
    'script.js': SCRIPT_JS,
  },
};
