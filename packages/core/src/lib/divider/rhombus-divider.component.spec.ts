import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import { DividerOrientation, RhombusDividerComponent } from './rhombus-divider.component';

@Component({
  standalone: true,
  imports: [RhombusDividerComponent],
  template: `
    <rhombus-divider
      [orientation]="orientation"
      [inset]="inset"
      [accent]="accent"
      [label]="label"
    />
  `,
})
class HostComponent {
  orientation: DividerOrientation = 'horizontal';
  inset = false;
  accent = false;
  label = '';
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  const fixture = TestBed.createComponent(HostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function divider(el: HTMLElement): HTMLElement {
  return el.querySelector('rhombus-divider') as HTMLElement;
}

describe('rhombus-divider', () => {
  it('carries the rhombus-divider class and role=separator', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(divider(el).classList).toContain('rhombus-divider');
    expect(divider(el).getAttribute('role')).toBe('separator');
  });

  it('defaults to a horizontal orientation with no accessible name', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(divider(el).getAttribute('aria-orientation')).toBe('horizontal');
    expect(divider(el).getAttribute('data-orientation')).toBe('horizontal');
    expect(divider(el).getAttribute('aria-label')).toBeNull();
    expect(divider(el).hasAttribute('data-labelled')).toBe(false);
  });

  it('reflects a vertical orientation', () => {
    const { fixture, host, el } = setup();
    host.orientation = 'vertical';
    fixture.detectChanges();
    expect(divider(el).getAttribute('aria-orientation')).toBe('vertical');
    expect(divider(el).getAttribute('data-orientation')).toBe('vertical');
  });

  it('renders a labelled text divider with the label as its accessible name', () => {
    const { fixture, host, el } = setup();
    host.label = 'OR';
    fixture.detectChanges();
    expect(divider(el).hasAttribute('data-labelled')).toBe(true);
    expect(divider(el).getAttribute('aria-label')).toBe('OR');
    expect(divider(el).querySelector('.rhombus-divider__label')?.textContent?.trim()).toBe('OR');
  });

  it('ignores the label on a vertical divider (labelled + vertical unsupported)', () => {
    const { fixture, host, el } = setup();
    host.orientation = 'vertical';
    host.label = 'OR';
    fixture.detectChanges();
    expect(divider(el).hasAttribute('data-labelled')).toBe(false);
    expect(divider(el).getAttribute('aria-label')).toBeNull();
    expect(divider(el).querySelector('.rhombus-divider__label')).toBeNull();
  });

  it('reflects the inset flag to data-inset', () => {
    const { fixture, host, el } = setup();
    host.inset = true;
    fixture.detectChanges();
    expect(divider(el).hasAttribute('data-inset')).toBe(true);
  });

  it('reflects the accent flag to data-accent', () => {
    const { fixture, host, el } = setup();
    host.accent = true;
    fixture.detectChanges();
    expect(divider(el).hasAttribute('data-accent')).toBe(true);
  });

  it('is not focusable', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(divider(el).getAttribute('tabindex')).toBeNull();
  });

  it('has no accessibility violations when plain', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('has no accessibility violations when labelled', async () => {
    const { fixture, host, el } = setup();
    host.label = 'OR';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('has no accessibility violations when vertical', async () => {
    const { fixture, host, el } = setup();
    host.orientation = 'vertical';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
