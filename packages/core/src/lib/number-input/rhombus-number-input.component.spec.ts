import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { axe } from '../../testing/axe';
import { RhombusNumberInputComponent } from './rhombus-number-input.component';

@Component({
  standalone: true,
  imports: [RhombusNumberInputComponent, ReactiveFormsModule],
  template: `
    <rhombus-number-input
      [label]="label"
      [appearance]="appearance"
      [size]="size"
      [required]="required"
      [hint]="hint"
      [min]="min"
      [max]="max"
      [step]="step"
      [largeStep]="largeStep"
      [showButtons]="showButtons"
      [disabled]="disabled"
      [control]="control"
      [(value)]="value"
      (valueChange)="lastValue = $event"
    />
  `,
})
class HostComponent {
  label = 'Quantity';
  appearance: FormFieldAppearance = 'outline';
  size: FormFieldSize = 'md';
  required = false;
  hint: string | null = null;
  min: number | null = 0;
  max: number | null = 10;
  step = 1;
  largeStep: number | null = null;
  showButtons = true;
  disabled = false;
  control: FormControl<number | null> | null = null;
  value: number | null = 5;
  lastValue: number | null | undefined = undefined;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function input(el: HTMLElement): HTMLInputElement {
  return el.querySelector('input') as HTMLInputElement;
}
function incBtn(el: HTMLElement): HTMLButtonElement {
  return el.querySelector('.rhombus-number-input__btn--inc') as HTMLButtonElement;
}
function decBtn(el: HTMLElement): HTMLButtonElement {
  return el.querySelector('.rhombus-number-input__btn--dec') as HTMLButtonElement;
}
function type(el: HTMLElement, text: string): void {
  const field = input(el);
  field.value = text;
  field.dispatchEvent(new Event('input'));
}
function key(el: HTMLElement, k: string): KeyboardEvent {
  const ev = new KeyboardEvent('keydown', { key: k, cancelable: true });
  input(el).dispatchEvent(ev);
  return ev;
}

describe('rhombus-number-input', () => {
  it('renders the label', () => {
    const { el } = setup();
    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe('Quantity');
  });

  it('applies and reflects appearance and size host classes', () => {
    const { fixture, host, el } = setup();
    const field = el.querySelector('mat-form-field') as HTMLElement;
    expect(field.classList).toContain('rhombus-form-field--outline');
    expect(field.classList).toContain('rhombus-form-field--md');
    host.appearance = 'fill';
    host.size = 'lg';
    fixture.detectChanges();
    expect(field.classList).toContain('rhombus-form-field--fill');
    expect(field.classList).toContain('rhombus-form-field--lg');
  });

  it('renders a native number input carrying min/max/step', () => {
    const { el } = setup();
    const field = input(el);
    expect(field.type).toBe('number');
    expect(field.getAttribute('min')).toBe('0');
    expect(field.getAttribute('max')).toBe('10');
    expect(field.getAttribute('step')).toBe('1');
  });

  it('seeds the input from the value model', () => {
    const { el } = setup();
    expect(input(el).value).toBe('5');
  });

  it('increments by step and updates value + emits (lightweight)', () => {
    const { host, el } = setup();
    incBtn(el).click();
    expect(host.value).toBe(6);
    expect(host.lastValue).toBe(6);
  });

  it('decrements by step', () => {
    const { host, el } = setup();
    decBtn(el).click();
    expect(host.value).toBe(4);
  });

  it('clamps to max when incrementing past the maximum', () => {
    const { fixture, host, el } = setup();
    host.value = 10;
    fixture.detectChanges();
    incBtn(el).click();
    expect(host.value).toBe(10);
  });

  it('clamps to min when decrementing below the minimum', () => {
    const { fixture, host, el } = setup();
    host.value = 0;
    fixture.detectChanges();
    decBtn(el).click();
    expect(host.value).toBe(0);
  });

  it('does not clamp per keystroke but clamps on blur', () => {
    const { host, el } = setup();
    type(el, '999');
    expect(host.value).toBe(999); // unclamped while typing
    input(el).dispatchEvent(new Event('blur'));
    expect(host.value).toBe(10); // clamped to max on blur
  });

  it('leaves an empty field null on blur (no forced min)', () => {
    const { host, el } = setup();
    type(el, '');
    input(el).dispatchEvent(new Event('blur'));
    expect(host.value).toBeNull();
  });

  it('steps with ArrowUp / ArrowDown and prevents the native default', () => {
    const { host, el } = setup();
    const up = key(el, 'ArrowUp');
    expect(host.value).toBe(6);
    expect(up.defaultPrevented).toBe(true);
    key(el, 'ArrowDown');
    expect(host.value).toBe(5);
  });

  it('uses largeStep for PageUp / PageDown', () => {
    const { fixture, host, el } = setup();
    host.max = 100;
    host.largeStep = 10;
    fixture.detectChanges();
    key(el, 'PageUp');
    expect(host.value).toBe(15);
    key(el, 'PageDown');
    expect(host.value).toBe(5);
  });

  it('defaults largeStep to step * 10', () => {
    const { fixture, host, el } = setup();
    host.max = 100;
    host.value = 20;
    fixture.detectChanges();
    key(el, 'PageUp');
    expect(host.value).toBe(30);
  });

  it('jumps to min on Home and max on End', () => {
    const { host, el } = setup();
    key(el, 'Home');
    expect(host.value).toBe(0);
    key(el, 'End');
    expect(host.value).toBe(10);
  });

  it('increments from an empty field to the minimum', () => {
    const { host, el } = setup();
    type(el, '');
    expect(host.value).toBeNull();
    incBtn(el).click();
    expect(host.value).toBe(0);
  });

  it('treats Home/End as no-ops and skips clamping when a bound is null', () => {
    const { fixture, host, el } = setup();
    host.min = null;
    host.max = null;
    fixture.detectChanges();
    key(el, 'Home'); // no min → no-op
    expect(host.value).toBe(5);
    incBtn(el).click(); // clamp with null bounds → free increment
    expect(host.value).toBe(6);
  });

  it('drives a bound control (control mode)', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl<number | null>(3);
    fixture.detectChanges();
    expect(input(el).value).toBe('3');
    incBtn(el).click();
    expect(host.control.value).toBe(4);
  });

  it('disables the field and buttons via the lightweight disabled input', () => {
    const { fixture, host, el } = setup();
    host.disabled = true;
    fixture.detectChanges();
    expect(input(el).disabled).toBe(true);
    expect(incBtn(el).disabled).toBe(true);
    expect(decBtn(el).disabled).toBe(true);
  });

  it('ignores the lightweight disabled input once a control is bound', () => {
    const { fixture, host, el } = setup();
    host.disabled = true;
    host.control = new FormControl<number | null>(2);
    fixture.detectChanges();
    expect(input(el).disabled).toBe(false);
    expect(incBtn(el).disabled).toBe(false);
    host.control.disable();
    fixture.detectChanges();
    expect(input(el).disabled).toBe(true);
    expect(incBtn(el).disabled).toBe(true);
  });

  it('does not change value when a disabled button is clicked', () => {
    const { fixture, host, el } = setup();
    host.disabled = true;
    fixture.detectChanges();
    incBtn(el).click();
    expect(host.value).toBe(5);
  });

  it('hides the spinner buttons when showButtons is false', () => {
    const { fixture, host, el } = setup();
    host.showButtons = false;
    fixture.detectChanges();
    expect(incBtn(el)).toBeNull();
    expect(decBtn(el)).toBeNull();
  });

  it('gives the ± buttons aria-labels and takes them out of the tab order', () => {
    const { el } = setup();
    expect(incBtn(el).getAttribute('aria-label')).toBe('Increment');
    expect(decBtn(el).getAttribute('aria-label')).toBe('Decrement');
    expect(incBtn(el).getAttribute('tabindex')).toBe('-1');
  });

  it('renders a hint only when provided', () => {
    const { fixture, host, el } = setup();
    expect(el.querySelector('mat-hint')).toBeNull();
    host.hint = 'How many?';
    fixture.detectChanges();
    expect(el.querySelector('mat-hint')?.textContent?.trim()).toBe('How many?');
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
