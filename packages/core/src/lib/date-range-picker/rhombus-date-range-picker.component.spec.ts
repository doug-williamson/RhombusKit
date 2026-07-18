import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import {
  DateRange,
  DateRangeControl,
  RhombusDateRangePickerComponent,
} from './rhombus-date-range-picker.component';
import { RhombusErrorDirective } from '../form-field/rhombus-error.directive';

@Component({
  standalone: true,
  imports: [RhombusDateRangePickerComponent, RhombusErrorDirective, ReactiveFormsModule],
  template: `
    <rhombus-date-range-picker
      [label]="label"
      [startPlaceholder]="startPlaceholder"
      [endPlaceholder]="endPlaceholder"
      [separator]="separator"
      [required]="required"
      [disabled]="disabled"
      [min]="min"
      [max]="max"
      [control]="control"
      (rangeChange)="lastEmitted = $event"
    >
      @if (showError) {
        <span rhombusError>Pick a range</span>
      }
    </rhombus-date-range-picker>
  `,
})
class HostComponent {
  label = 'Reporting window';
  startPlaceholder = 'Start date';
  endPlaceholder = 'End date';
  separator = '–';
  required = false;
  disabled = false;
  min: string | null = null;
  max: string | null = null;
  control: DateRangeControl | null = null;
  showError = false;
  lastEmitted: DateRange | undefined = undefined;
}

function makeControl(start: string | null, end: string | null): DateRangeControl {
  return new FormGroup({
    start: new FormControl<string | null>(start),
    end: new FormControl<string | null>(end),
  });
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  return { fixture, host: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
}

const startInput = (el: HTMLElement) => el.querySelector('input[matStartDate]') as HTMLInputElement;
const endInput = (el: HTMLElement) => el.querySelector('input[matEndDate]') as HTMLInputElement;

describe('rhombus-date-range-picker', () => {
  it('renders a range input with start and end date fields', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-date-range-input')).not.toBeNull();
    expect(startInput(el)).not.toBeNull();
    expect(endInput(el)).not.toBeNull();
  });

  it('applies the start and end placeholders', () => {
    const { fixture, host, el } = setup();
    host.startPlaceholder = 'Check-in';
    host.endPlaceholder = 'Check-out';
    fixture.detectChanges();
    expect(startInput(el).getAttribute('placeholder')).toBe('Check-in');
    expect(endInput(el).getAttribute('placeholder')).toBe('Check-out');
  });

  it('renders the configured separator between the two inputs', () => {
    const { fixture, host, el } = setup();
    host.separator = 'to';
    fixture.detectChanges();
    expect(el.querySelector('mat-date-range-input')?.textContent).toContain('to');
  });

  it('seeds both inputs from a bound ISO control', () => {
    const { fixture, host, el } = setup();
    host.control = makeControl('2026-01-05', '2026-01-20');
    fixture.detectChanges();
    expect(startInput(el).value).not.toBe('');
    expect(endInput(el).value).not.toBe('');
  });

  it('clears the inputs when the control is reset to nulls', () => {
    const { fixture, host, el } = setup();
    host.control = makeControl('2026-01-05', '2026-01-20');
    fixture.detectChanges();
    host.control.setValue({ start: null, end: null });
    fixture.detectChanges();
    expect(startInput(el).value).toBe('');
    expect(endInput(el).value).toBe('');
  });

  it('disables both inputs when the bound group is disabled', () => {
    const { fixture, host, el } = setup();
    host.control = makeControl('2026-01-05', '2026-01-20');
    fixture.detectChanges();
    host.control.disable();
    fixture.detectChanges();
    expect(startInput(el).disabled).toBe(true);
    expect(endInput(el).disabled).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { fixture, host, el } = setup();
    host.control = makeControl('2026-02-01', '2026-02-14');
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
