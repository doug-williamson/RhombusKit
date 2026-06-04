import { defineConfig, devices } from '@playwright/test';

/**
 * Phase 4 (secondary a11y scan): the only reliable colour-contrast check.
 *
 * jsdom has no layout engine, so the jest-axe pass in `@rhombuskit/core`
 * deliberately skips `color-contrast`. This suite renders the showcase for
 * real in a browser and runs axe's `color-contrast` rule over every page in
 * BOTH themes, verifying the token contrast pairs clear WCAG 2.1 AA (4.5:1).
 *
 * The showcase is served from its PRODUCTION build (`serve-static` runs the
 * build target first) so we measure the optimised, bundled CSS — the same
 * styles a consumer ships, not dev-server output.
 */
const PORT = 4300;
const baseURL = `http://localhost:${PORT}`;
const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // serve-static's buildTarget builds the showcase (and its workspace deps)
    // before serving dist/apps/showcase/browser with SPA fallback. Run from the
    // workspace root so @nx/web:file-server resolves its relative staticFilePath
    // (cwd defaults to this config's dir, which would break that resolution).
    command: `pnpm exec nx run showcase:serve-static --port=${PORT}`,
    cwd: '../..',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
