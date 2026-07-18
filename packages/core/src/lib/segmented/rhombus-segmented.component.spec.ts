import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRhombusIcons } from '../icon/rhombus-icon.providers';
import { axe } from '../../testing/axe';
import { RhombusSegmentedComponent, SegmentOption } from './rhombus-segmented.component';

@Component({
  standalone: true,
  imports: [RhombusSegmentedComponent],
  template: `
    <rhombus-segmented
      [options]="options"
      [value]="value"
      [control]="control"
      [multiple]="multiple"
      [disabled]="disabled"
      [fullWidth]="fullWidth"
      [label]="label"
      [ariaLabel]="ariaLabel"
      (valueChange)="lastValue = $event"
    />
  `,
})
class HostComponent {
  options: SegmentOption<string>[] = [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
    { value: 'board', label: 'Board' },
  ];
  value: string | string[] | null = null;
  control: FormControl | null = null;
  multiple = false;
  disabled = false;
  fullWidth = false;
  label = '';
  ariaLabel = 'View';
  lastValue: string | string[] | null = null;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({
    providers: [provideNoopAnimations(), provideRhombusIcons({})],
  });
  const fixture = TestBed.createComponent(HostComponent);
  return { fixture, host: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
}

function groupValue(fixture: ComponentFixture<HostComponent>): unknown {
  const g = fixture.debugElement.query(By.directive(MatButtonToggleGroup))
    .componentInstance as { value: unknown | (() => unknown) };
  // Material 21 exposes `value` as a signal input; older shapes as a getter.
  return typeof g.value === 'function' ? (g.value as () => unknown)() : g.value;
}

const toggles = (el: HTMLElement) => Array.from(el.querySelectorAll('mat-button-toggle'));
const buttons = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('mat-button-toggle button')) as HTMLButtonElement[];

describe('rhombus-segmented', () => {
  it('renders one toggle per option with its label', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    const t = toggles(el);
    expect(t.length).toBe(3);
    expect(el.textContent).toContain('List');
    expect(el.textContent).toContain('Grid');
    expect(el.textContent).toContain('Board');
  });

  it('reflects the lightweight value onto the group', () => {
    const { fixture, host } = setup();
    host.value = 'grid';
    fixture.detectChanges();
    expect(groupValue(fixture)).toBe('grid');
  });

  it('emits valueChange when a segment is clicked', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    buttons(el)[2].click();
    fixture.detectChanges();
    expect(host.lastValue).toBe('board');
  });

  it('seeds the selection from a reactive control', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl('list');
    fixture.detectChanges();
    const checked = el.querySelector('mat-button-toggle.mat-button-toggle-checked');
    expect(checked?.textContent?.trim()).toBe('List');
  });

  it('carries an array value in multiple mode', () => {
    const { fixture, host } = setup();
    host.multiple = true;
    host.value = ['list', 'board'];
    fixture.detectChanges();
    expect(groupValue(fixture)).toEqual(['list', 'board']);
  });

  it('links a visible label via aria-labelledby', () => {
    const { fixture, host, el } = setup();
    host.label = 'Layout';
    fixture.detectChanges();
    const g = el.querySelector('mat-button-toggle-group') as HTMLElement;
    const labelledby = g.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(el.querySelector(`#${labelledby}`)?.textContent?.trim()).toBe('Layout');
  });

  it('uses ariaLabel as the accessible name when there is no visible label', () => {
    const { fixture, host, el } = setup();
    host.label = '';
    host.ariaLabel = 'View mode';
    fixture.detectChanges();
    const g = el.querySelector('mat-button-toggle-group') as HTMLElement;
    expect(g.getAttribute('aria-label')).toBe('View mode');
  });

  it('disables an individual option', () => {
    const { fixture, host, el } = setup();
    host.options = [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid', disabled: true },
    ];
    fixture.detectChanges();
    expect(buttons(el)[1].disabled).toBe(true);
  });

  it('applies the full-width modifier class', () => {
    const { fixture, host, el } = setup();
    host.fullWidth = true;
    fixture.detectChanges();
    const g = el.querySelector('mat-button-toggle-group') as HTMLElement;
    expect(g.classList).toContain('rhombus-segmented--full-width');
  });

  it('renders a per-option icon', () => {
    const { fixture, host, el } = setup();
    host.options = [{ value: 'list', label: 'List', icon: 'more_vert' }];
    fixture.detectChanges();
    expect(el.querySelector('rhombus-icon')).not.toBeNull();
  });

  it('has no accessibility violations (single)', async () => {
    const { fixture, host } = setup();
    host.label = 'Layout';
    fixture.detectChanges();
    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });

  it('has no accessibility violations (multiple)', async () => {
    const { fixture, host } = setup();
    host.multiple = true;
    host.value = ['list'];
    host.label = 'Format';
    fixture.detectChanges();
    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
