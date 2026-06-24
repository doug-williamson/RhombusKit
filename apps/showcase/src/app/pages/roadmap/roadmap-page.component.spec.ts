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

  it('renders the three Now / Next / Considering columns', () => {
    const el = render();
    const titles = Array.from(el.querySelectorAll('.board__title')).map((t) =>
      t.textContent?.trim(),
    );
    expect(titles).toEqual(['Shipping now', 'Up next', 'Considering']);
  });

  it('renders roadmap cards with content', () => {
    const el = render();
    expect(el.querySelectorAll('.card').length).toBeGreaterThan(5);
  });

  it('links a Considering gap to a prefilled component proposal', () => {
    const el = render();
    const considering = el.querySelector('.board__col[data-col="considering"]') as HTMLElement;
    const link = considering.querySelector('.card__link') as HTMLAnchorElement;
    expect(link.href).toContain('template=3-new-component-proposal.yml');
  });
});
