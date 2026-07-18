import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import { RhombusSliderComponent, SliderRange } from './rhombus-slider.component';

type InternalRange = FormGroup<{ start: FormControl<number>; end: FormControl<number> }>;

@Component({
  standalone: true,
  imports: [RhombusSliderComponent],
  template: `
    <rhombus-slider
      [mode]="mode"
      [min]="min"
      [max]="max"
      [step]="step"
      [discrete]="discrete"
      [showTickMarks]="showTickMarks"
      [disabled]="disabled"
      [value]="value"
      [control]="control"
      [ariaLabel]="ariaLabel"
      [rangeValue]="rangeValue"
      [rangeControl]="rangeControl"
      (valueChange)="onValue($event)"
      (rangeValueChange)="onRange($event)"
    />
  `,
})
class HostComponent {
  mode: 'single' | 'range' = 'single';
  min = 0;
  max = 100;
  step = 1;
  discrete = false;
  showTickMarks = false;
  disabled = false;
  value = 0;
  control: FormControl<number | null> | null = null;
  ariaLabel = '';
  rangeValue: SliderRange = { start: 0, end: 100 };
  rangeControl: FormControl<SliderRange> | null = null;
  lastValue: number | null = null;
  lastRange: SliderRange | null = null;
  onValue(v: number) {
    this.lastValue = v;
  }
  onRange(r: SliderRange) {
    this.lastRange = r;
  }
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

const thumbs = (el: HTMLElement): HTMLInputElement[] =>
  Array.from(el.querySelectorAll('input[matSliderThumb], input[matSliderStartThumb], input[matSliderEndThumb]'));

describe('rhombus-slider', () => {
  it('renders a single-thumb slider by default', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-slider')).not.toBeNull();
    expect(thumbs(el).length).toBe(1);
  });

  it('renders two thumbs in range mode', () => {
    const { fixture, host, el } = setup();
    host.mode = 'range';
    fixture.detectChanges();
    expect(thumbs(el).length).toBe(2);
  });

  it('passes min / max / step to the thumb input', () => {
    const { fixture, host, el } = setup();
    host.min = 10;
    host.max = 50;
    host.step = 5;
    fixture.detectChanges();
    const t = thumbs(el)[0];
    expect(t.min).toBe('10');
    expect(t.max).toBe('50');
    expect(t.step).toBe('5');
  });

  it('seeds the single thumb from a reactive control', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl<number | null>(30);
    fixture.detectChanges();
    expect(thumbs(el)[0].value).toBe('30');
  });

  it('follows external control updates', () => {
    const { fixture, host, el } = setup();
    const ctrl = new FormControl<number | null>(20);
    host.control = ctrl;
    fixture.detectChanges();
    ctrl.setValue(70);
    fixture.detectChanges();
    expect(thumbs(el)[0].value).toBe('70');
  });

  it('disables the thumb when the control is disabled', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl<number | null>({ value: 10, disabled: true });
    fixture.detectChanges();
    expect(thumbs(el)[0].disabled).toBe(true);
  });

  it('seeds the single thumb from the lightweight value input', () => {
    const { fixture, host, el } = setup();
    host.value = 42;
    fixture.detectChanges();
    expect(thumbs(el)[0].value).toBe('42');
  });

  it('emits valueChange when the user moves the single thumb', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    const t = thumbs(el)[0];
    t.value = '55';
    t.dispatchEvent(new Event('input'));
    t.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.lastValue).toBe(55);
  });

  it('seeds both thumbs from a reactive range control', () => {
    const { fixture, host, el } = setup();
    host.mode = 'range';
    host.rangeControl = new FormControl<SliderRange>(
      { start: 25, end: 75 },
      { nonNullable: true },
    );
    fixture.detectChanges();
    const [start, end] = thumbs(el);
    expect(start.value).toBe('25');
    expect(end.value).toBe('75');
  });

  it('seeds both thumbs from the lightweight rangeValue input', () => {
    const { fixture, host, el } = setup();
    host.mode = 'range';
    host.rangeValue = { start: 30, end: 60 };
    fixture.detectChanges();
    const [start, end] = thumbs(el);
    expect(start.value).toBe('30');
    expect(end.value).toBe('60');
  });

  it('pushes range-thumb changes back to the reactive control and emits', () => {
    const { fixture, host } = setup();
    host.mode = 'range';
    const rc = new FormControl<SliderRange>({ start: 25, end: 75 }, { nonNullable: true });
    host.rangeControl = rc;
    fixture.detectChanges();
    const cmp = fixture.debugElement.query(By.directive(RhombusSliderComponent))
      .componentInstance as unknown as { internalRange: InternalRange };
    cmp.internalRange.controls.start.setValue(40); // simulate a thumb drag
    fixture.detectChanges();
    expect(rc.value).toEqual({ start: 40, end: 75 });
    expect(host.lastRange).toEqual({ start: 40, end: 75 });
  });

  it('emits rangeValueChange when a thumb moves in lightweight range mode', () => {
    const { fixture, host, el } = setup();
    host.mode = 'range';
    host.rangeValue = { start: 20, end: 80 };
    fixture.detectChanges();
    const start = thumbs(el)[0];
    start.value = '35';
    start.dispatchEvent(new Event('input'));
    start.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.lastRange).toEqual({ start: 35, end: 80 });
  });

  it('labels the thumbs for assistive tech', () => {
    const { fixture, host, el } = setup();
    host.ariaLabel = 'Volume';
    fixture.detectChanges();
    expect(thumbs(el)[0].getAttribute('aria-label')).toBe('Volume');
  });

  it('falls back to the min/max range when the range control is reset to null', () => {
    const { fixture, host } = setup();
    host.mode = 'range';
    const rc = new FormControl<SliderRange>({ start: 25, end: 75 });
    host.rangeControl = rc as FormControl<SliderRange>;
    fixture.detectChanges();
    rc.reset(); // value → null, exercises the toInternal fallback
    fixture.detectChanges();
    const cmp = fixture.debugElement.query(By.directive(RhombusSliderComponent))
      .componentInstance as unknown as { internalRange: InternalRange };
    expect(cmp.internalRange.value).toEqual({ start: 0, end: 100 });
  });

  it('has no accessibility violations (single)', async () => {
    const { fixture, host, el } = setup();
    host.ariaLabel = 'Volume';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('has no accessibility violations (range)', async () => {
    const { fixture, host, el } = setup();
    host.mode = 'range';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
