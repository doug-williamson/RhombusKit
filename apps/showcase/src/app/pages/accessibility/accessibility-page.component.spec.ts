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
  it('only references real component routes (no typos / stale slugs)', () => {
    const routes = new Set(
      NAV_COMMANDS.filter((c) => c.path.startsWith('/components/')).map((c) =>
        c.path.replace('/components/', ''),
      ),
    );
    const unknown = CONTRAST_VERIFIED.filter((c) => !routes.has(c.slug)).map((c) => c.slug);
    expect(unknown).toEqual([]);
  });
});
