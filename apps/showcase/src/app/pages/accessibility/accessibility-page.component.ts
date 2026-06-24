import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTRAST_VERIFIED } from './a11y-coverage';

const REPO = 'https://github.com/doug-williamson/RhombusKit';

/**
 * `/accessibility` — an honest accessibility report. It surfaces ONLY what is
 * mechanically verified in CI (axe color-contrast in both themes + the
 * structural jest-axe pass) and clearly separates that from manually-verified,
 * documented behavior (keyboard, focus, screen-reader UX). It does NOT claim
 * per-criterion WCAG conformance — automated tooling covers a fraction of WCAG.
 * The page doubles as an invitation for accessibility experts to find and file
 * gaps (the highest-quality suggester pool for a WCAG-focused library).
 */
@Component({
  selector: 'app-accessibility-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page a11y">
      <header class="showcase-page__header">
        <h1>Accessibility</h1>
        <p class="a11y__lead">
          RhombusKit targets <strong>WCAG 2.1 AA</strong>. Here's exactly what
          that means in practice — what machines verify on every change, and
          what we verify and document by hand. We don't claim blanket
          conformance; automated tools catch only part of WCAG.
        </p>
      </header>

      <section class="showcase-section">
        <h2>Verified by automated tests in CI</h2>
        <p class="a11y__sub">These run on every pull request — a regression fails the build.</p>
        <div class="a11y__checks">
          <div class="a11y__check">
            <h3>Colour contrast · WCAG 1.4.3</h3>
            <p>
              axe scans every covered component page in <strong>both light and
              dark</strong> themes and requires zero contrast violations, against
              the real rendered output.
              <a [href]="contrastSpecUrl" target="_blank" rel="noopener">contrast.spec.ts</a>
            </p>
          </div>
          <div class="a11y__check">
            <h3>Structural axe</h3>
            <p>
              Core components carry jest-axe tests asserting no structural
              violations (roles, names, required ARIA) on every build.
              <a [href]="axeHelperUrl" target="_blank" rel="noopener">testing/axe.ts</a>
            </p>
          </div>
        </div>

        <h3 class="a11y__coverage-title">Colour-contrast coverage ({{ verified.length }} components, both themes)</h3>
        <ul class="a11y__grid">
          @for (c of verified; track c.slug) {
            <li><a [routerLink]="['/components', c.slug]">{{ c.label }}</a></li>
          }
        </ul>
      </section>

      <section class="showcase-section">
        <h2>Verified by hand &amp; documented</h2>
        <p>
          Automated tooling (axe) covers roughly a third of WCAG — it cannot
          judge keyboard operability, focus order, or screen-reader announcement
          quality. Those are verified manually and documented on each component's
          page, under its <strong>Accessibility</strong> notes (keyboard
          interaction, ARIA pattern, and known limitations).
        </p>
      </section>

      <section class="showcase-section a11y__cta">
        <h2>Found a gap? You're exactly who we need.</h2>
        <p>
          Accessibility is a headline goal, and the best audits come from people
          who rely on assistive tech. If something doesn't work with your
          keyboard, screen reader, or at your contrast needs, please tell us —
          it's the most valuable contribution you can make.
        </p>
        <p>
          <a [href]="reportUrl" target="_blank" rel="noopener">Report an accessibility issue →</a>
        </p>
      </section>
    </div>
  `,
  styles: `
    .a11y__lead, .a11y__sub { color: var(--text-secondary); max-width: 70ch; }
    .a11y__lead { margin: 0.5rem 0 0; }
    .a11y__sub { margin: 0 0 1rem; font-size: 0.9rem; }
    .a11y__checks {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .a11y__check {
      border: 1px solid var(--border);
      border-left: 3px solid var(--toast-success-text);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      background-color: var(--surface-1);
    }
    .a11y__check h3 { margin: 0 0 0.4rem; font-size: 0.95rem; color: var(--text-primary); }
    .a11y__check p { margin: 0; color: var(--text-secondary); font-size: 0.875rem; }
    .a11y__check a, .a11y__cta a { color: var(--text-primary); text-decoration: underline; text-underline-offset: 2px; }
    .a11y__coverage-title { font-size: 0.95rem; margin: 0 0 0.75rem; }
    .a11y__grid {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.4rem 1rem;
      font-size: 0.875rem;
    }
    .a11y__grid a { color: var(--text-secondary); text-decoration: none; }
    .a11y__grid a:hover { color: var(--text-primary); text-decoration: underline; }
    .a11y__cta { border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; background-color: var(--surface-1); }
    .a11y__cta h2 { margin-top: 0; }
    .a11y__cta a { font-weight: 600; }
  `,
})
export default class AccessibilityPageComponent {
  protected readonly verified = CONTRAST_VERIFIED;
  protected readonly contrastSpecUrl = `${REPO}/blob/main/apps/showcase-e2e/tests/contrast.spec.ts`;
  protected readonly axeHelperUrl = `${REPO}/blob/main/packages/core/src/testing/axe.ts`;
  protected readonly reportUrl = `${REPO}/issues/new?template=4-accessibility.yml`;
}
