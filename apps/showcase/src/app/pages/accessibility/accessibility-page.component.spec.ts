import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import AccessibilityPageComponent from './accessibility-page.component';
import { CONTRAST_VERIFIED } from './a11y-coverage';
import { NAV_COMMANDS } from '../../shared/navigation';

describe('AccessibilityPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessibilityPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('lists the contrast-verified components and a report CTA', () => {
    const fixture = TestBed.createComponent(AccessibilityPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.a11y__grid li').length).toBe(CONTRAST_VERIFIED.length);
    const report = Array.from(el.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Report an accessibility issue'),
    ) as HTMLAnchorElement;
    expect(report.getAttribute('href')).toContain('template=4-accessibility.yml');
  });
});

describe('CONTRAST_VERIFIED coverage list', () => {
  // This list is the single source of truth for the contrast gate: the e2e
  // (apps/showcase-e2e/tests/contrast.spec.ts) derives its scanned component set
  // from it, so the /accessibility coverage table and the axe scan can never
  // drift apart. This test enforces the other axis — that the list stays EXACTLY
  // the set of real /components/* routes — so a newly-added component can't
  // silently escape the contrast scan (the audit that hardened this found the
  // list had quietly fallen three components behind).
  const routeSlugs = NAV_COMMANDS.filter((c) => c.path.startsWith('/components/'))
    .map((c) => c.path.replace('/components/', ''))
    .sort();
  const verifiedSlugs = CONTRAST_VERIFIED.map((c) => c.slug).sort();

  it('covers every component route exactly (no stale slugs, no missing components)', () => {
    expect(verifiedSlugs).toEqual(routeSlugs);
  });
});
