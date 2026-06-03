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

  it('projects one nav link per component page, including App Shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = Array.from(
      el.querySelectorAll('.showcase-shell__nav a'),
    ).map((a) => a.textContent?.trim());

    expect(links).toContain('Button');
    expect(links).toContain('App Shell');
  });
});
