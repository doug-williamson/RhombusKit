import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import { RhombusIconComponent } from './rhombus-icon.component';

@Component({
  standalone: true,
  imports: [RhombusIconComponent],
  template: `<rhombus-icon [name]="name" />`,
})
class HostComponent {
  name = 'more_vert';
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

const BUILT_IN_GLYPHS = ['more_vert', 'light_mode', 'dark_mode', 'contrast'];

describe('rhombus-icon', () => {
  it('renders a built-in glyph as a decorative inline SVG', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    const svg = el.querySelector('svg.rhombus-icon');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg?.querySelector('path')?.getAttribute('d')?.length).toBeGreaterThan(
      0
    );
    expect(el.querySelector('mat-icon')).toBeNull();
  });

  it('renders every built-in default glyph inline (no font dependency)', () => {
    const { fixture, host, el } = setup();
    for (const glyph of BUILT_IN_GLYPHS) {
      host.name = glyph;
      fixture.detectChanges();
      expect(el.querySelector('svg.rhombus-icon')).toBeTruthy();
      expect(el.querySelector('mat-icon')).toBeNull();
    }
  });

  it('falls back to mat-icon for a name without a built-in glyph', () => {
    const { fixture, host, el } = setup();
    host.name = 'home';
    fixture.detectChanges();
    expect(el.querySelector('svg.rhombus-icon')).toBeNull();
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('home');
  });

  it('swaps from inline SVG to mat-icon when the name changes', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('svg.rhombus-icon')).toBeTruthy();
    host.name = 'settings';
    fixture.detectChanges();
    expect(el.querySelector('svg.rhombus-icon')).toBeNull();
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('settings');
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
