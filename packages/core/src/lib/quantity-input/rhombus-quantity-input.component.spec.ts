import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { axe } from '../../testing/axe';
import { RhombusQuantityInputComponent } from './rhombus-quantity-input.component';

@Component({
  standalone: true,
  imports: [RhombusQuantityInputComponent, ReactiveFormsModule],
  template: `
    <rhombus-quantity-input
      [label]="label"
      [min]="min"
      [max]="max"
      [step]="step"
      [disabled]="disabled"
      [control]="control"
      [incrementLabel]="incrementLabel"
      [decrementLabel]="decrementLabel"
      [(value)]="value"
      (valueChange)="lastValue = $event"
    />
  `,
})
class HostComponent {
  label = 'Quantity';
  min: number | null = 0;
  max: number | null = 10;
  step = 1;
  disabled = false;
  control: FormControl<number | null> | null = null;
  incrementLabel = 'Increment';
  decrementLabel = 'Decrement';
  value: number | null = 5;
  lastValue: number | null | undefined = undefined;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function root(el: HTMLElement): HTMLElement {
  return el.querySelector('rhombus-quantity-input') as HTMLElement;
}
function input(el: HTMLElement): HTMLInputElement {
  return el.querySelector('input') as HTMLInputElement;
}
function label(el: HTMLElement): HTMLLabelElement {
  return el.querySelector('label') as HTMLLabelElement;
}
function incBtn(el: HTMLElement): HTMLButtonElement {
  return el.querySelector('.rhombus-quantity-input__btn--inc') as HTMLButtonElement;
}
function decBtn(el: HTMLElement): HTMLButtonElement {
  return el.querySelector('.rhombus-quantity-input__btn--dec') as HTMLButtonElement;
}

describe('rhombus-quantity-input', () => {
  it('renders a visible label wired to the input by for/id', () => {
    const { el } = setup();
    expect(label(el).textContent?.trim()).toBe('Quantity');
    expect(label(el).getAttribute('for')).toBe(input(el).id);
    expect(input(el).id).toMatch(/^rhombus-quantity-input-\d+-input$/);
  });

  it('names the host group after the label', () => {
    const { el } = setup();
    expect(root(el).getAttribute('role')).toBe('group');
    expect(root(el).getAttribute('aria-labelledby')).toBe(label(el).id);
    expect(label(el).id).toMatch(/^rhombus-quantity-input-\d+-label$/);
  });

  it('gives each instance distinct ids', () => {
    const a = setup();
    const b = setup();
    expect(input(a.el).id).not.toBe(input(b.el).id);
    expect(label(a.el).id).not.toBe(label(b.el).id);
  });

  it('renders a native number input carrying min/max/step with no manual ARIA', () => {
    const { el } = setup();
    const field = input(el);
    expect(field.type).toBe('number');
    expect(field.getAttribute('min')).toBe('0');
    expect(field.getAttribute('max')).toBe('10');
    expect(field.getAttribute('step')).toBe('1');
    expect(field.getAttribute('inputmode')).toBe('decimal');
    expect(field.hasAttribute('role')).toBe(false);
    expect(field.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('seeds the input from the value model', () => {
    const { el } = setup();
    expect(input(el).value).toBe('5');
  });

  it('renders exactly two ± buttons, out of the tab order, with aria-labels and hidden glyphs', () => {
    const { el } = setup();
    expect(el.querySelectorAll('.rhombus-quantity-input__btn')).toHaveLength(2);
    expect(decBtn(el).getAttribute('aria-label')).toBe('Decrement');
    expect(incBtn(el).getAttribute('aria-label')).toBe('Increment');
    expect(decBtn(el).getAttribute('tabindex')).toBe('-1');
    expect(incBtn(el).getAttribute('tabindex')).toBe('-1');
    expect(decBtn(el).getAttribute('type')).toBe('button');
    expect(incBtn(el).querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('orders the DOM label → − → input → + (reading order = visual order)', () => {
    const { el } = setup();
    const kids = Array.from(root(el).children);
    expect(kids.map((c) => c.tagName.toLowerCase())).toEqual(['label', 'button', 'input', 'button']);
    expect(kids[1]).toBe(decBtn(el));
    expect(kids[2]).toBe(input(el));
    expect(kids[3]).toBe(incBtn(el));
  });

  it('uses the custom increment / decrement labels', () => {
    const { fixture, host, el } = setup();
    host.incrementLabel = 'Add one';
    host.decrementLabel = 'Remove one';
    fixture.detectChanges();
    expect(incBtn(el).getAttribute('aria-label')).toBe('Add one');
    expect(decBtn(el).getAttribute('aria-label')).toBe('Remove one');
  });

  it('steps the value and emits when a button is clicked (wiring reaches the core)', () => {
    const { host, el } = setup();
    incBtn(el).click();
    expect(host.value).toBe(6);
    expect(host.lastValue).toBe(6);
    decBtn(el).click();
    expect(host.value).toBe(5);
  });

  it('clamps at the bounds (wiring reaches the core)', () => {
    const { fixture, host, el } = setup();
    host.value = 10;
    fixture.detectChanges();
    incBtn(el).click();
    expect(host.value).toBe(10);
  });

  it('moves focus to the input after a ± click', () => {
    const { el } = setup();
    expect(document.activeElement).not.toBe(input(el));
    incBtn(el).click();
    expect(document.activeElement).toBe(input(el));
    input(el).blur();
    decBtn(el).click();
    expect(document.activeElement).toBe(input(el));
  });

  it('prevents the default of mousedown on the ± buttons so a focused input never blurs', () => {
    const { el } = setup();
    const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    incBtn(el).dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('drives a bound control (control mode)', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl<number | null>(3);
    fixture.detectChanges();
    expect(input(el).value).toBe('3');
    incBtn(el).click();
    expect(host.control.value).toBe(4);
  });

  it('disables the input and buttons via the lightweight disabled input', () => {
    const { fixture, host, el } = setup();
    host.disabled = true;
    fixture.detectChanges();
    expect(input(el).disabled).toBe(true);
    expect(incBtn(el).disabled).toBe(true);
    expect(decBtn(el).disabled).toBe(true);
    incBtn(el).click();
    expect(host.value).toBe(5);
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

  it('follows the NEW control after a swap, not the old one', () => {
    const { fixture, host, el } = setup();
    const a = new FormControl<number | null>({ value: 1, disabled: true });
    host.control = a;
    fixture.detectChanges();
    expect(incBtn(el).disabled).toBe(true);
    const b = new FormControl<number | null>(2);
    host.control = b;
    fixture.detectChanges();
    expect(incBtn(el).disabled).toBe(false);
    expect(input(el).disabled).toBe(false);
    a.enable(); // must not touch the buttons any more
    a.disable();
    fixture.detectChanges();
    expect(incBtn(el).disabled).toBe(false);
    b.disable();
    fixture.detectChanges();
    expect(incBtn(el).disabled).toBe(true);
    expect(input(el).disabled).toBe(true);
  });

  it('wires keydown and blur on the input to the core', () => {
    const { host, el } = setup();
    const up = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    input(el).dispatchEvent(up);
    expect(host.value).toBe(6);
    expect(up.defaultPrevented).toBe(true);
    input(el).value = '999';
    input(el).dispatchEvent(new Event('input'));
    expect(host.value).toBe(999); // unclamped while typing
    input(el).dispatchEvent(new Event('blur'));
    expect(host.value).toBe(10); // clamped on blur
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
