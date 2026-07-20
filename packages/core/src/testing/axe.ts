import { configureAxe } from 'jest-axe';

/**
 * axe configured for component-level specs. RhombusKit components are tested as
 * isolated fixtures, not whole documents, so the page/document-scoped rules
 * (everything in a landmark, exactly one `<main>`, a top-level heading, a `lang`
 * on `<html>`) don't apply and would only produce false positives. Everything
 * else — roles, names, ARIA, required attributes — stays on.
 *
 * Color-contrast is intentionally NOT covered here: jsdom has no layout engine,
 * so contrast is verified by the Playwright + axe pass against the showcase
 * (which renders both themes for real).
 *
 * `target-size` is disabled for the same reason, and disabling it is an
 * IMPROVEMENT over leaving it on. It is enabled by default in the installed
 * axe-core (tags wcag22aa / wcag258), but under jsdom it does not merely skip —
 * it silently REPORTS A PASS regardless of geometry, because
 * getBoundingClientRect returns zeros and axe reaches a pass verdict on them. A
 * 10x10 button yields "violations 0, incomplete 0, passes 1". A rule that always
 * passes is worse than an absent one, because it reads as coverage. Density
 * modes shrink control boxes, so the real gate lives in Playwright:
 * apps/showcase-e2e/tests/density.spec.ts.
 *
 * ```ts
 * import { axe } from '../../testing/axe';
 * expect(await axe(fixture.nativeElement)).toHaveNoViolations();
 * ```
 */
export const axe = configureAxe({
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'html-has-lang': { enabled: false },
    'target-size': { enabled: false },
  },
});
