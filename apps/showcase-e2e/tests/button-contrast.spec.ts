import { test, expect, type Page } from '@playwright/test';
import {
  alphaComposite,
  contrastRatio,
} from '../../../packages/theme-builder/src/color-math';

/**
 * Rendered label contrast for every public `ButtonVariant × ButtonAppearance`
 * cell, in BOTH themes, plus the kit's own confirm-dialog Cancel.
 *
 * Why a computed-style check and not axe: Material paints the outlined/text
 * label from `--mat-button-outlined-label-text-color` /
 * `--mat-button-text-label-text-color`, each defaulting to `--mat-sys-primary`.
 * A variant that rebinds `--mat-sys-primary` to carry its FILL (surface-2,
 * transparent) therefore paints its label in the fill colour — 1.23:1 for
 * secondary, 1.00:1 for ghost — with the accessible name fully intact. axe
 * files a `transparent` label colour under "incomplete", not "violations", so
 * the page-level `color-contrast` scan in contrast.spec.ts stays green while
 * the label is invisible. This spec reads the pixels' inputs instead: the
 * label's computed colour composited over the first opaque ancestor.
 *
 * jsdom cannot cascade Material's runtime-injected CSS, so the component spec
 * only asserts the authored SCSS; this is the gate that proves the rendering.
 */

// Public, semver-covered preference key (see the tokens/theme-engine contract).
const STORAGE_KEY = 'rhombuskit:theme-preference';

const THEMES = [
  { name: 'light', preference: 'rhombus-light' },
  { name: 'dark', preference: 'rhombus-dark' },
] as const;

/** WCAG 2.1 AA for normal text. */
const AA = 4.5;

interface Sample {
  cell: string;
  color: string;
  background: string;
}

/**
 * Sample every element matching `selector`: the inner `.mdc-button`'s computed
 * `color` and the `background-color` of the first ancestor (the button itself
 * for the filled appearance) that is not fully transparent.
 */
function sample(page: Page, selector: string): Promise<Sample[]> {
  return page.evaluate((sel) => {
    const isTransparent = (bg: string): boolean =>
      bg === 'transparent' || /^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/.test(bg);
    return Array.from(document.querySelectorAll<HTMLElement>(sel)).map((el) => {
      const button = el.matches('.mdc-button')
        ? el
        : (el.querySelector<HTMLElement>('.mdc-button') ?? el);
      let node: HTMLElement | null = button;
      let background = 'rgba(0, 0, 0, 0)';
      while (node) {
        background = getComputedStyle(node).backgroundColor;
        if (!isTransparent(background)) break;
        node = node.parentElement;
      }
      return {
        cell: el.getAttribute('data-cell') ?? sel,
        color: getComputedStyle(button).color,
        background,
      };
    });
  }, selector);
}

function failures(samples: Sample[]): string[] {
  return samples
    .map((s) => {
      const fg = alphaComposite(s.color, s.background);
      const ratio = contrastRatio(fg, s.background);
      return { ...s, ratio };
    })
    .filter((s) => s.ratio === null || s.ratio < AA)
    .map(
      (s) =>
        `  ${s.cell}: ${s.ratio?.toFixed(2) ?? 'unmeasurable'}:1 (${s.color} on ${s.background})`
    );
}

for (const theme of THEMES) {
  test.describe(`button label contrast — ${theme.name} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => window.localStorage.setItem(key, value),
        [STORAGE_KEY, theme.preference] as [string, string]
      );
    });

    test('every variant × appearance cell clears AA on --surface-0', async ({
      page,
    }) => {
      await page.goto('/components/button?tab=examples', {
        waitUntil: 'networkidle',
      });
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        theme.preference
      );
      await page.locator('[data-cell]').first().waitFor({ state: 'visible' });

      const samples = await sample(page, '[data-cell]');
      // 4 variants × 3 appearances; the disabled row carries no data-cell.
      expect(samples.map((s) => s.cell).sort()).toHaveLength(12);

      const failed = failures(samples);
      expect(
        failed,
        `Button labels under ${AA}:1 (${theme.name}):\n${failed.join('\n')}`
      ).toEqual([]);
    });

    test("the confirm dialog's Cancel (secondary + text) clears AA", async ({
      page,
    }) => {
      await page.goto('/components/confirm-dialog?tab=overview', {
        waitUntil: 'networkidle',
      });
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        theme.preference
      );
      await page.getByRole('button', { name: 'Publish post' }).first().click();

      const cancel = page.locator(
        '.cdk-overlay-container .rhombus-button--secondary.rhombus-button--text'
      );
      await cancel.first().waitFor({ state: 'visible' });

      const samples = await sample(
        page,
        '.cdk-overlay-container .rhombus-button--secondary.rhombus-button--text'
      );
      expect(samples).toHaveLength(1);

      const failed = failures(
        samples.map((s) => ({ ...s, cell: 'confirm-dialog Cancel' }))
      );
      expect(
        failed,
        `Confirm-dialog Cancel under ${AA}:1 (${theme.name}):\n${failed.join('\n')}`
      ).toEqual([]);
    });
  });
}
