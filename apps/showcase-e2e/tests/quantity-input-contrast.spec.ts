import { test, expect, type Page } from '@playwright/test';
import {
  alphaComposite,
  contrastRatio,
} from '../../../packages/theme-builder/src/color-math';

/**
 * Rendered contrast of the quantity input's round ± buttons, in BOTH themes.
 *
 * Why a computed-style check and not axe: the page-level `color-contrast` scan
 * (contrast.spec.ts) evaluates TEXT nodes. The ± glyphs are aria-hidden SVG and
 * the ring is a border, so nothing in that sweep measures them. This spec reads
 * the pixels' inputs instead: the button's computed `color` (the glyph, via
 * currentColor) and `border-top-color` (the ring), each composited over the
 * first opaque ancestor.
 *
 * Floors (spec §4): glyph 4.5:1 (AA text — it is what identifies the control,
 * so it carries WCAG 1.4.11); ring 2.25:1 — a documented DESIGN floor, not a
 * conformance one. --border-strong measures 2.34–2.56:1 in light and
 * 3.07–4.24:1 in dark; a stronger ring is a token-value change, not this file's.
 */

// Public, semver-covered preference key (see the tokens/theme-engine contract).
const STORAGE_KEY = 'rhombuskit:theme-preference';

const THEMES = [
  { name: 'light', preference: 'rhombus-light' },
  { name: 'dark', preference: 'rhombus-dark' },
] as const;

const GLYPH_FLOOR = 4.5;
const RING_FLOOR = 2.25;

interface Sample {
  index: number;
  glyph: string;
  ring: string;
  background: string;
}

function sample(page: Page): Promise<Sample[]> {
  return page.evaluate(() => {
    const isTransparent = (bg: string): boolean =>
      bg === 'transparent' || /^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/.test(bg);
    return Array.from(
      document.querySelectorAll<HTMLElement>('.rhombus-quantity-input__btn:not(:disabled)')
    ).map((btn, index) => {
      let node: HTMLElement | null = btn;
      let background = 'rgba(0, 0, 0, 0)';
      while (node) {
        background = getComputedStyle(node).backgroundColor;
        if (!isTransparent(background)) break;
        node = node.parentElement;
      }
      const cs = getComputedStyle(btn);
      return { index, glyph: cs.color, ring: cs.borderTopColor, background };
    });
  });
}

function under(samples: Sample[], pick: (s: Sample) => string, floor: number, what: string): string[] {
  return samples
    .map((s) => {
      const fg = alphaComposite(pick(s), s.background);
      return { s, ratio: contrastRatio(fg, s.background) };
    })
    .filter(({ ratio }) => ratio === null || ratio < floor)
    .map(
      ({ s, ratio }) =>
        `  ${what} #${s.index}: ${ratio?.toFixed(2) ?? 'unmeasurable'}:1 (${pick(s)} on ${s.background})`
    );
}

for (const theme of THEMES) {
  test.describe(`quantity-input ± contrast — ${theme.name} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => window.localStorage.setItem(key, value),
        [STORAGE_KEY, theme.preference] as [string, string]
      );
    });

    test('every enabled ± button clears the glyph and ring floors', async ({ page }) => {
      await page.goto('/components/quantity-input?tab=examples', { waitUntil: 'networkidle' });
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme.preference);
      await page.locator('.rhombus-quantity-input__btn').first().waitFor({ state: 'visible' });

      const samples = await sample(page);
      // Exactly the enabled controls on the Examples tab — Basic, Step & large
      // step, Reactive forms (enabled at load), At a bound, and the 3 cart lines
      // = 7 controls × 2 buttons. The Disabled example is excluded by the
      // selector. Keep this in step with the page: a silent drop here would mean
      // a control stopped being measured.
      expect(samples).toHaveLength(14);

      const glyphFails = under(samples, (s) => s.glyph, GLYPH_FLOOR, 'glyph');
      const ringFails = under(samples, (s) => s.ring, RING_FLOOR, 'ring');
      expect(
        [...glyphFails, ...ringFails],
        `quantity-input ± under floor (${theme.name}):\n${[...glyphFails, ...ringFails].join('\n')}`
      ).toEqual([]);
    });
  });
}
