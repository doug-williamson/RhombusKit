import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import SupportPageComponent from './support-page.component';

describe('SupportPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(SupportPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the heading and lead', () => {
    const el = render();
    expect(el.querySelector('h1')?.textContent).toContain('Support RhombusKit');
  });

  it('links the primary CTA to GitHub Sponsors', () => {
    const el = render();
    const cta = el.querySelector('.support__sponsor') as HTMLAnchorElement;
    expect(cta.href).toContain('github.com/sponsors/');
  });

  it('also surfaces no-cost ways to help', () => {
    const el = render();
    expect(el.textContent).toContain('Not in a position to sponsor');
  });
});
