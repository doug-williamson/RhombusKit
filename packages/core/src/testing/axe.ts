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
  },
});
