import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { axe } from '../../testing/axe';
import {
  RhombusDatePickerComponent,
  dateToIso,
  isoToDate,
} from './rhombus-date-picker.component';

@Component({
  standalone: true,
  imports: [RhombusDatePickerComponent, ReactiveFormsModule],
  template: `
    <rhombus-date-picker
      [label]="label"
      [appearance]="appearance"
      [size]="size"
      [required]="required"
      [disabled]="disabled"
      [hint]="hint"
      [min]="min"
      [max]="max"
      [control]="control"
      (dateChange)="lastEmitted = $event"
    />
  `,
})
class HostComponent {
  label = 'Publish date';
  appearance: FormFieldAppearance = 'outline';
  size: FormFieldSize = 'md';
  required = false;
  disabled = false;
  hint: string | null = null;
  min: string | null = null;
  max: string | null = null;
  control: FormControl<string | null> | null = null;
  lastEmitted: string | null | undefined = undefined;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  loader: HarnessLoader;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  const loader = TestbedHarnessEnvironment.loader(fixture);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    loader,
  };
}

function formField(el: HTMLElement): HTMLElement {
  return el.querySelector('mat-form-field') as HTMLElement;
}

describe('isoToDate / dateToIso', () => {
  it('round-trips an ISO date with no off-by-one (local midnight)', () => {
    expect(dateToIso(isoToDate('2026-01-01'))).toBe('2026-01-01');
    expect(dateToIso(isoToDate('2026-12-31'))).toBe('2026-12-31');
  });

  it('parses to local-midnight fields, not UTC', () => {
    const d = isoToDate('2026-06-15');
    expect(d).not.toBeNull();
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(5); // June (0-indexed)
    expect(d?.getDate()).toBe(15);
    expect(d?.getHours()).toBe(0);
  });

  it('rejects empty, malformed, and impossible dates', () => {
    expect(isoToDate(null)).toBeNull();
    expect(isoToDate('')).toBeNull();
    expect(isoToDate('not-a-date')).toBeNull();
    expect(isoToDate('2026-13-01')).toBeNull(); // month 13
    expect(isoToDate('2026-02-31')).toBeNull(); // would roll over to March
  });

  it('formats null / invalid dates to null', () => {
    expect(dateToIso(null)).toBeNull();
    expect(dateToIso(new Date(NaN))).toBeNull();
  });
});

describe('rhombus-date-picker', () => {
  it('renders the label', () => {
    const { el } = setup();
    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe(
      'Publish date'
    );
  });

  it('applies the default appearance and size host classes', () => {
    const { el } = setup();
    const cls = formField(el).classList;
    expect(cls).toContain('rhombus-form-field');
    expect(cls).toContain('rhombus-form-field--outline');
    expect(cls).toContain('rhombus-form-field--md');
  });

  it('reflects appearance and size into the host classes', () => {
    const { fixture, host, el } = setup();
    host.appearance = 'fill';
    host.size = 'lg';
    fixture.detectChanges();
    const cls = formField(el).classList;
    expect(cls).toContain('rhombus-form-field--fill');
    expect(cls).toContain('rhombus-form-field--lg');
    expect(cls).not.toContain('rhombus-form-field--outline');
  });

  it('seeds the field from an initial ISO control value', async () => {
    const { fixture, host, loader } = setup();
    host.control = new FormControl<string | null>('2026-03-20');
    fixture.detectChanges();
    const input = await loader.getHarness(MatDatepickerInputHarness);
    const value = await input.getValue();
    expect(value).toContain('2026');
    expect(value).toContain('20');
    expect(value).toContain('3');
  });

  it('writes ISO to the control and emits dateChange when a date is picked', async () => {
    const { fixture, host, loader } = setup();
    host.control = new FormControl<string | null>('2026-06-10');
    fixture.detectChanges();
    const input = await loader.getHarness(MatDatepickerInputHarness);
    await input.openCalendar();
    const calendar = await input.getCalendar();
    await calendar.selectCell({ text: /^15$/ });
    expect(host.control.value).toBe('2026-06-15');
    expect(host.lastEmitted).toBe('2026-06-15');
  });

  it('reflects an external control.setValue without echoing dateChange', async () => {
    const { fixture, host, loader } = setup();
    host.control = new FormControl<string | null>('2026-01-05');
    fixture.detectChanges();

    host.control.setValue('2026-12-25');
    fixture.detectChanges();

    const input = await loader.getHarness(MatDatepickerInputHarness);
    const value = await input.getValue();
    expect(value).toContain('2026');
    expect(value).toContain('12');
    expect(value).toContain('25');
    // A programmatic write must not loop back out as a user change.
    expect(host.lastEmitted).toBeUndefined();
  });

  it('disables the field when the bound control is disabled after init', async () => {
    const { fixture, host, loader } = setup();
    host.control = new FormControl<string | null>('2026-06-10');
    fixture.detectChanges();

    host.control.disable();
    fixture.detectChanges();

    const input = await loader.getHarness(MatDatepickerInputHarness);
    expect(await input.isDisabled()).toBe(true);
  });

  it('disables the field in lightweight mode via the disabled input', async () => {
    const { fixture, host, loader } = setup();
    host.disabled = true;
    fixture.detectChanges();
    const input = await loader.getHarness(MatDatepickerInputHarness);
    expect(await input.isDisabled()).toBe(true);
  });

  it('disables out-of-range calendar cells per min', async () => {
    const { fixture, host, loader } = setup();
    host.control = new FormControl<string | null>('2026-06-15');
    host.min = '2026-06-10';
    fixture.detectChanges();

    const input = await loader.getHarness(MatDatepickerInputHarness);
    await input.openCalendar();
    const calendar = await input.getCalendar();
    const [before] = await calendar.getCells({ text: /^5$/ });
    const [inRange] = await calendar.getCells({ text: /^15$/ });
    expect(await before.isDisabled()).toBe(true);
    expect(await inRange.isDisabled()).toBe(false);
  });

  it('reflects the required state to the field', async () => {
    const { fixture, host, loader } = setup();
    host.required = true;
    fixture.detectChanges();
    const input = await loader.getHarness(MatDatepickerInputHarness);
    expect(await input.isRequired()).toBe(true);
  });

  it('renders a hint only when one is provided', () => {
    const { fixture, host, el } = setup();
    expect(el.querySelector('mat-hint')).toBeNull();
    host.hint = 'When the post goes live.';
    fixture.detectChanges();
    expect(el.querySelector('mat-hint')?.textContent?.trim()).toBe(
      'When the post goes live.'
    );
  });

  it('has no accessibility violations for the field and open calendar', async () => {
    const { el, loader } = setup();
    expect(await axe(el)).toHaveNoViolations();
    const input = await loader.getHarness(MatDatepickerInputHarness);
    await input.openCalendar();
    const overlay = el.ownerDocument.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    expect(await axe(overlay)).toHaveNoViolations();
  });
});
