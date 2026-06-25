import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRhombusTheme } from '@rhombuskit/theme-engine';
import ThemesPageComponent from './themes-page.component';

describe('ThemesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemesPageComponent],
      providers: [provideNoopAnimations(), provideRhombusTheme()],
    }).compileComponents();
  });

  it('renders the built-in themes plus the community presets', () => {
    const fixture = TestBed.createComponent(ThemesPageComponent);
    fixture.detectChanges();
    const names = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.theme-card__name'),
    ).map((n) => n.textContent?.trim());

    expect(names).toContain('Light');
    expect(names).toContain('Dark');
    expect(names).toContain('Teal Light');
    expect(names).toContain('Teal Dark');
    // Each card has an Apply button.
    expect(fixture.nativeElement.querySelectorAll('rhombus-button').length).toBe(names.length);
  });
});
