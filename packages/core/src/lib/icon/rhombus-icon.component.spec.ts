import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import { RhombusIconComponent, type RhombusIconSize } from './rhombus-icon.component';
import { provideRhombusIcons } from './rhombus-icon.providers';

@Component({
  standalone: true,
  imports: [RhombusIconComponent],
  template: `<rhombus-icon [name]="name" [size]="size" [ariaLabel]="ariaLabel" />`,
})
class HostComponent {
  name = 'more_vert';
  size: RhombusIconSize = 'md';
  ariaLabel: string | null = null;
}

function setup(providers: unknown[] = []): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({
    providers: [provideNoopAnimations(), ...(providers as never[])],
  });
  const fixture = TestBed.createComponent(HostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

/** The `<rhombus-icon>` host element. */
function iconHost(el: HTMLElement): HTMLElement {
  return el.querySelector('rhombus-icon') as HTMLElement;
}

const BUILT_IN_GLYPHS = ['more_vert', 'light_mode', 'dark_mode', 'contrast'];

// A trusted, self-contained SVG literal used to exercise the registry path.
const TEST_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" /></svg>';

describe('rhombus-icon', () => {
  it('renders a pre-seeded built-in glyph as an inline SVG (no font)', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    const svg = el.querySelector('.rhombus-icon svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(
      svg?.querySelector('path')?.getAttribute('d')?.length
    ).toBeGreaterThan(0);
    expect(el.querySelector('mat-icon')).toBeNull();
  });

  it('renders every built-in default glyph inline', () => {
    const { fixture, host, el } = setup();
    for (const glyph of BUILT_IN_GLYPHS) {
      host.name = glyph;
      fixture.detectChanges();
      expect(el.querySelector('.rhombus-icon svg')).toBeTruthy();
      expect(el.querySelector('mat-icon')).toBeNull();
    }
  });

  it('renders an icon registered via provideRhombusIcons() inline', () => {
    const { fixture, host, el } = setup([
      provideRhombusIcons({ rk_test: TEST_SVG }),
    ]);
    host.name = 'rk_test';
    fixture.detectChanges();
    const svg = el.querySelector('.rhombus-icon svg');
    expect(svg).toBeTruthy();
    expect(svg?.querySelector('circle')).toBeTruthy();
    expect(el.querySelector('mat-icon')).toBeNull();
  });

  it('falls back to mat-icon for a name without a registered SVG', () => {
    const { fixture, host, el } = setup();
    host.name = 'home';
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-icon svg')).toBeNull();
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('home');
  });

  it('swaps from inline SVG to mat-icon when the name changes', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-icon svg')).toBeTruthy();
    host.name = 'settings';
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-icon svg')).toBeNull();
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('settings');
  });

  it('maps size presets to the --rhombus-icon-size box length', () => {
    const { fixture, host, el } = setup();
    const cases: [RhombusIconSize, string][] = [
      ['sm', '20px'],
      ['md', '24px'],
      ['lg', '32px'],
      [40, '40px'],
    ];
    for (const [size, expected] of cases) {
      host.size = size;
      fixture.detectChanges();
      expect(
        iconHost(el).style.getPropertyValue('--rhombus-icon-size')
      ).toBe(expected);
    }
  });

  it('is decorative by default (aria-hidden, no role/label)', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    const host = iconHost(el);
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
    expect(host.getAttribute('aria-label')).toBeNull();
  });

  it('exposes role="img" + aria-label when ariaLabel is set', () => {
    const { fixture, host, el } = setup();
    host.ariaLabel = 'Delete';
    fixture.detectChanges();
    const hostEl = iconHost(el);
    expect(hostEl.getAttribute('role')).toBe('img');
    expect(hostEl.getAttribute('aria-label')).toBe('Delete');
    expect(hostEl.getAttribute('aria-hidden')).toBeNull();
  });

  it('has no accessibility violations (decorative)', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('has no accessibility violations (labelled)', async () => {
    const { fixture, host, el } = setup();
    host.ariaLabel = 'Settings';
    host.name = 'settings';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('ships valid plain CSS in its inline styles (no Sass `//` comments)', () => {
    // Inline `styles:` are emitted as raw CSS — never Sass-preprocessed — so a
    // `//` comment leaks into the bundle and the browser swallows everything up
    // to the next `}`, killing the declarations after it (vertical-align).
    // jest-preset-angular strips styles from the compiled component def, so
    // assert on the authored source instead.
    const source = readFileSync(
      join(__dirname, 'rhombus-icon.component.ts'),
      'utf8'
    );
    const styles = /styles: `([^`]*)`/.exec(source)?.[1] ?? '';
    expect(styles).toContain('vertical-align: middle');
    expect(styles).not.toContain('//');
  });
});
