import { TestBed } from '@angular/core/testing';
import RoadmapPageComponent from './roadmap-page.component';

describe('RoadmapPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadmapPageComponent],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(RoadmapPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the Components and Foundations tracks', () => {
    const el = render();
    const trackTitles = Array.from(el.querySelectorAll('.track__title')).map((t) =>
      t.textContent?.trim(),
    );
    expect(trackTitles).toEqual(['Components', 'Foundations']);
  });

  it('renders Now / Next / Considering columns in every track', () => {
    const el = render();
    for (const track of Array.from(el.querySelectorAll('.track'))) {
      const titles = Array.from(track.querySelectorAll('.board__title')).map((t) =>
        t.textContent?.trim(),
      );
      expect(titles).toEqual(['Shipping now', 'Up next', 'Considering']);
    }
  });

  it('renders roadmap cards with content', () => {
    const el = render();
    expect(el.querySelectorAll('.card').length).toBeGreaterThan(5);
  });

  it('gives every column header a unique id (no duplicate ids across tracks)', () => {
    const el = render();
    const ids = Array.from(el.querySelectorAll('.board__title')).map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links a community-shaped Composite item to a prefilled component proposal', () => {
    const el = render();
    const components = el.querySelector('.track[data-track="components"]') as HTMLElement;
    // The Composite tier (Command palette, Tree, …) is promoted to "Up next";
    // each links to a prefilled proposal.
    const next = components.querySelector(
      '.board__col[data-col="next"]',
    ) as HTMLElement;
    const link = next.querySelector('.card__link') as HTMLAnchorElement;
    expect(link.href).toContain('template=3-new-component-proposal.yml');
  });
});
