import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideNoopAnimations(), provideRouter([])],
    }).compileComponents();
  });

  it('renders the dogfooded rhombus-app-shell chrome', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('rhombus-app-shell')).toBeTruthy();
    expect(el.querySelector('.showcase-shell__brand')?.textContent).toContain(
      'RhombusKit',
    );
  });

  it('lists each component page in the sidebar nav-list, including App Shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = Array.from(
      el.querySelectorAll('rhombus-nav-list a'),
    ).map((a) => a.textContent?.trim());

    expect(links).toContain('Button');
    expect(links).toContain('App Shell');
    // The "Get started" guides moved out of the sidebar into the header menu.
    expect(links).not.toContain('Theming');
  });

  it('moves the guides into a header Guides menu', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.showcase-shell__guides')?.textContent).toContain(
      'Guides',
    );
  });
});
