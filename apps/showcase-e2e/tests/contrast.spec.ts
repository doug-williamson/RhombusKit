import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Colour-contrast pass. For every showcase page, in BOTH themes, run axe's
 * `color-contrast` rule and require zero violations — i.e. every token
 * foreground/background pair clears WCAG 2.1 AA (4.5:1 for normal text,
 * 3:1 for large text). This is the render-dependent check jsdom can't do, so
 * it complements (not duplicates) the structural jest-axe pass in core.
 */

// Public, semver-covered preference key (see the tokens/theme-engine contract).
const STORAGE_KEY = 'rhombuskit:theme-preference';

const THEMES = [
  { name: 'light', preference: 'rhombus-light' },
  { name: 'dark', preference: 'rhombus-dark' },
] as const;

// One entry per component route in apps/showcase/src/app/app.routes.ts. Keep in
// sync when a component page is added — a missing entry means it is never scanned.
const COMPONENTS = [
  '/components/button',
  '/components/badge',
  '/components/card',
  '/components/chip',
  '/components/tag',
  '/components/divider',
  '/components/checkbox',
  '/components/radio',
  '/components/segmented',
  '/components/switch',
  '/components/slider',
  '/components/input',
  '/components/textarea',
  '/components/select',
  '/components/autocomplete',
  '/components/selection-list',
  '/components/number-input',
  '/components/date-picker',
  '/components/date-range-picker',
  '/components/tag-input',
  '/components/data-table',
  '/components/overflow-menu',
  '/components/tooltip',
  '/components/toast',
  '/components/dialog',
  '/components/confirm-dialog',
  '/components/tabs',
  '/components/menu',
  '/components/nav-list',
  '/components/breadcrumbs',
  '/components/pagination',
  '/components/progress',
  '/components/skeleton',
  '/components/avatar',
  '/components/alert',
  '/components/theme-toggle',
  '/components/app-shell',
  '/components/page-header',
  '/components/empty-state',
  '/components/code-block',
  '/components/accordion',
] as const;

// Each component page splits content across Overview / Examples / API tabs; the
// inactive tabs are hidden (so a single scan misses them). Scan all three via the
// deep-linkable ?tab= param, plus the standalone homepage and theming guide.
const TABS = ['overview', 'examples', 'api'] as const;
const ROUTES = [
  '/',
  '/theming',
  ...COMPONENTS.flatMap((c) => TABS.map((t) => `${c}?tab=${t}`)),
];

for (const theme of THEMES) {
  test.describe(`color-contrast — ${theme.name} theme`, () => {
    test.beforeEach(async ({ page }) => {
      // Seed the preference before any navigation so the pre-paint init script
      // applies `data-theme` synchronously and no flash/wrong-theme render leaks.
      await page.addInitScript(
        ([key, value]) => window.localStorage.setItem(key, value),
        [STORAGE_KEY, theme.preference] as [string, string]
      );
    });

    for (const route of ROUTES) {
      test(`${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'networkidle' });

        // Confirm the intended theme actually took effect before scanning.
        await expect(page.locator('html')).toHaveAttribute(
          'data-theme',
          theme.preference
        );
        // Component/theming pages use .showcase-page; the homepage uses .home.
        await page
          .locator('.showcase-page, .home')
          .first()
          .waitFor({ state: 'visible' });

        const { violations } = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze();

        const report = violations.flatMap((v) =>
          v.nodes.map(
            (n) =>
              `  ${n.target.join(' ')}\n    ${(n.failureSummary ?? '')
                .split('\n')
                .filter(Boolean)
                .join('\n    ')}`
          )
        );

        expect(
          violations,
          `Contrast violations on ${route} (${theme.name}):\n${report.join(
            '\n'
          )}`
        ).toEqual([]);
      });
    }
  });
}
