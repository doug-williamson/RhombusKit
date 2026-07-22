import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CONTRAST_VERIFIED } from '../../showcase/src/app/pages/accessibility/a11y-coverage';

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

// The scanned component set is DERIVED from the single source of truth — the
// CONTRAST_VERIFIED list in apps/showcase/src/app/pages/accessibility/a11y-coverage.ts,
// which also drives the /accessibility coverage table. Deriving both from one list
// means the axe scan and the published coverage table can never drift apart, and a
// component is scanned the moment it's added there. accessibility-page.component.spec.ts
// asserts that list stays exactly the set of real /components/* routes, so a new
// component page can't silently escape this scan.
const COMPONENTS = CONTRAST_VERIFIED.map((c) => `/components/${c.slug}`);

// Each component page splits content across Overview / Examples / API tabs; the
// inactive tabs are hidden (so a single scan misses them). Scan all three via the
// deep-linkable ?tab= param, plus the standalone homepage and theming guide.
const TABS = ['overview', 'examples', 'api'] as const;
const ROUTES = [
  '/',
  '/theming',
  '/density',
  // The theme builder renders its default generated theme in local data-theme
  // subtrees; scanning it here is the AA positive control for the generator (its
  // package owns the red-capable negative control via the nudge:false seam).
  '/theme-builder',
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
