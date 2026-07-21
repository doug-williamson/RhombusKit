import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRhombusTheme, RhombusThemeService } from '@rhombuskit/theme-engine';
import ThemeBuilderPageComponent from './theme-builder-page.component';

const PREVIEW_STYLE_ID = 'rk-theme-builder-preview';

/** Pull `--btn-primary-bg` out of the light `[data-theme="tb-preview"]` block. */
function lightBtnPrimary(): string | null {
  const css = document.getElementById(PREVIEW_STYLE_ID)?.textContent ?? '';
  const block = css.match(/\[data-theme="tb-preview"\]\s*\{([^}]*)\}/);
  const decl = block?.[1].match(/--btn-primary-bg:\s*([^;]+);/);
  return decl ? decl[1].trim() : null;
}

describe('ThemeBuilderPageComponent', () => {
  beforeEach(async () => {
    // Start every case from a clean DOM: the page injects an id-guarded <style>
    // into <head> and (via the service) may write html[data-theme]. Reset both so
    // assertions about the global attribute are honest.
    document.getElementById(PREVIEW_STYLE_ID)?.remove();
    document.getElementById('rk-theme-builder-applied')?.remove();
    document.documentElement.removeAttribute('data-theme');

    await TestBed.configureTestingModule({
      imports: [ThemeBuilderPageComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideRhombusTheme(),
      ],
    }).compileComponents();
  });

  it('renders inside a .showcase-page wrapper', () => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.showcase-page'),
    ).toBeTruthy();
  });

  it('renders the two local data-theme preview subtrees', () => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[data-theme="tb-preview"]')).toBeTruthy();
    expect(host.querySelector('[data-theme="tb-preview-dark"]')).toBeTruthy();
  });

  it('injects one id-guarded <style> into <head> defining both preview selectors', () => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    const style = document.getElementById(PREVIEW_STYLE_ID);
    expect(style).toBeTruthy();
    expect(style?.tagName.toLowerCase()).toBe('style');
    const css = style?.textContent ?? '';
    expect(css).toContain('[data-theme="tb-preview"]');
    expect(css).toContain('[data-theme="tb-preview-dark"]');
    // A real generated theme, not an empty shell.
    expect(css).toContain('--bg:');
    expect(css).toContain('--btn-primary-bg:');
  });

  it('does NOT touch the global html[data-theme] on init (preview is local)', () => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    // The service (provided but never asked to switch) leaves the DOM at its
    // pre-existing state; the page itself must never write the global attribute.
    // With no stored preference the service resolves to the default light theme,
    // so the only writer is the service — the page adds nothing of its own.
    const attr = document.documentElement.getAttribute('data-theme');
    expect(attr === null || attr === 'rhombus-light').toBe(true);
  });

  it('reports the default seed as AA-clean', () => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const status = host.querySelector('.tb-status');
    expect(status?.textContent?.toLowerCase()).toContain('aa');
    expect(host.querySelector('.tb-status--pass')).toBeTruthy();
    expect(host.querySelector('.tb-status--error')).toBeNull();
  });

  it('offers the sanctioned exports (copy-paste CSS + registration + augmentation)', () => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    // Reactive <pre> panels (not <rhombus-code-block>, which paints once).
    const panels = Array.from(host.querySelectorAll('.tb-export__pre'));
    expect(panels.length).toBeGreaterThanOrEqual(3);
    const exported = panels.map((p) => p.textContent ?? '').join('\n');
    // The default theme name is 'rhombus'; the CSS block carries its data-theme
    // selector, and all three sanctioned forms are present.
    expect(exported).toContain('[data-theme=');
    expect(exported).toContain('provideRhombusThemes');
    expect(exported).toContain("declare module '@rhombuskit/theme-engine'");
  });

  it('regenerates a DIFFERENT AA-clean theme when the accent changes to a green seed', fakeAsync(() => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    // Capture the default (violet) preview fill so the assertion can prove the
    // seed actually propagated — not just that the token key still exists.
    const before = lightBtnPrimary();
    expect(before).toBeTruthy();

    const component = fixture.componentInstance as unknown as {
      setAccentHex(hex: string): void;
    };
    // #16a34a is the spec's load-bearing case: green lands --text-accent ≈4.49
    // pre-nudge; the shipped generator nudges 600→700 to clear AA.
    component.setAccentHex('#16a34a');
    fixture.detectChanges(); // flush toObservable's effect → emit the new seed
    tick(300); // fire the debounce timer
    fixture.detectChanges(); // regenerate + rewrite the preview <style>

    const after = lightBtnPrimary();
    // The debounce→regenerate→writePreview pipeline ran: the primary fill MOVED
    // off the violet default. If that wiring regressed, after === before → RED.
    expect(after).toBeTruthy();
    expect(after).not.toBe(before);
    // ...and the nudged green theme is still AA-clean.
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.tb-status--error')).toBeNull();
    expect(host.querySelector('.tb-status--pass')).toBeTruthy();
  }));

  it('shows the error state (and does not crash) when generation throws', fakeAsync(() => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    // No in-schema seed makes generateTheme throw — the neutral ramp is AA-safe by
    // construction (verified across the whole colour cube). Drive the defensive
    // catch via an invalid hex reaching the seed directly: this proves safeGenerate
    // swallows the throw and the error banner renders. Removing the try/catch (or
    // the @if(error()) branch) turns this red.
    const component = fixture.componentInstance as unknown as {
      accent: { set(value: string): void };
    };
    component.accent.set('#zzzzzz');
    fixture.detectChanges(); // flush toObservable's effect → emit the new seed
    tick(300); // fire the debounce timer
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.tb-status--error')).toBeTruthy();
    expect(host.querySelector('.tb-status--pass')).toBeNull();
  }));

  it('"Apply to whole app" registers and applies a dedicated theme through the service', () => {
    const fixture = TestBed.createComponent(ThemeBuilderPageComponent);
    fixture.detectChanges();
    const service = TestBed.inject(RhombusThemeService);
    const host = fixture.nativeElement as HTMLElement;
    const applyBtn = Array.from(host.querySelectorAll('button')).find((b) =>
      /apply to whole app/i.test(b.textContent ?? ''),
    );
    if (!applyBtn) throw new Error('Apply to whole app button not found');
    applyBtn.click();
    fixture.detectChanges();
    // Applied under a name kept SEPARATE from the live preview (tb-preview), so a
    // later remount of the page can't revert it. The service is the sole writer of
    // the global attribute; going through it keeps that invariant.
    expect(service.current()).toBe('tb-applied');
    expect(document.documentElement.getAttribute('data-theme')).toBe('tb-applied');
    // And a dedicated <style> carries its CSS (not the mutable preview <style>).
    const appliedCss = document.getElementById('rk-theme-builder-applied')?.textContent ?? '';
    expect(appliedCss).toContain('[data-theme="tb-applied"]');
  });
});
