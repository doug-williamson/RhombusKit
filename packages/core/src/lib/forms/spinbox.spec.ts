import { Component, model, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { createSpinbox, Spinbox } from './spinbox';

/**
 * Host that wires createSpinbox() exactly the way a component does: signal
 * inputs for the bounds, a model for the lightweight value, an explicit output
 * for valueChange, and an optional bound control. No template — the numeric
 * semantics are what is under test, not any DOM.
 */
@Component({ standalone: true, template: '' })
class HostComponent {
  readonly control = signal<FormControl<number | null> | null>(null);
  readonly value = model<number | null>(5);
  readonly disabled = signal(false);
  readonly min = signal<number | null>(0);
  readonly max = signal<number | null>(10);
  readonly step = signal(1);
  readonly largeStep = signal<number | null>(null);
  readonly valueChange = output<number | null>();
  readonly emitted: (number | null)[] = [];

  readonly spin: Spinbox = createSpinbox({
    control: this.control,
    value: this.value,
    disabled: this.disabled,
    min: this.min,
    max: this.max,
    step: this.step,
    largeStep: this.largeStep,
    valueChange: this.valueChange,
  });

  constructor() {
    this.valueChange.subscribe((v) => this.emitted.push(v));
  }
}

function setup(): { fixture: ComponentFixture<HostComponent>; host: HostComponent } {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return { fixture, host: fixture.componentInstance };
}

function keydown(host: HostComponent, key: string): KeyboardEvent {
  const ev = new KeyboardEvent('keydown', { key, cancelable: true });
  host.spin.onKeydown(ev);
  return ev;
}

describe('createSpinbox', () => {
  it('seeds the internal control from the value model (lightweight)', () => {
    const { host } = setup();
    expect(host.spin.internal.value).toBe(5);
  });

  it('follows later value-model writes without emitting', () => {
    const { fixture, host } = setup();
    host.value.set(7);
    fixture.detectChanges();
    expect(host.spin.internal.value).toBe(7);
    expect(host.emitted).toEqual([]);
  });

  it('increment / decrement step by `step`, update the model and emit', () => {
    const { host } = setup();
    host.spin.increment();
    expect(host.value()).toBe(6);
    expect(host.emitted).toEqual([6]);
    host.spin.decrement();
    expect(host.value()).toBe(5);
    expect(host.emitted).toEqual([6, 5]);
  });

  it('clamps steps to max and min', () => {
    const { fixture, host } = setup();
    host.value.set(10);
    fixture.detectChanges();
    host.spin.increment();
    expect(host.value()).toBe(10);
    host.value.set(0);
    fixture.detectChanges();
    host.spin.decrement();
    expect(host.value()).toBe(0);
  });

  it('increments from an empty value to the minimum (or 0 without a min)', () => {
    const { fixture, host } = setup();
    host.value.set(null);
    fixture.detectChanges();
    host.spin.increment();
    expect(host.value()).toBe(0);
    host.min.set(null);
    host.value.set(null);
    fixture.detectChanges();
    host.spin.increment();
    expect(host.value()).toBe(0);
  });

  it('does not clamp a typed value until blur, and leaves empty null on blur', () => {
    const { host } = setup();
    host.spin.internal.setValue(999);
    expect(host.value()).toBe(999);
    host.spin.onBlur();
    expect(host.value()).toBe(10);
    host.spin.internal.setValue(null);
    host.spin.onBlur();
    expect(host.value()).toBeNull();
  });

  it('maps ArrowUp / ArrowDown to ±step and prevents the native default', () => {
    const { host } = setup();
    const up = keydown(host, 'ArrowUp');
    expect(host.value()).toBe(6);
    expect(up.defaultPrevented).toBe(true);
    keydown(host, 'ArrowDown');
    expect(host.value()).toBe(5);
  });

  it('maps PageUp / PageDown to ±largeStep, defaulting to step * 10', () => {
    const { fixture, host } = setup();
    host.max.set(100);
    host.value.set(20);
    fixture.detectChanges();
    keydown(host, 'PageUp');
    expect(host.value()).toBe(30);
    host.largeStep.set(25);
    fixture.detectChanges();
    keydown(host, 'PageDown');
    expect(host.value()).toBe(5);
  });

  it('maps Home / End to min / max and ignores them when the bound is null', () => {
    const { fixture, host } = setup();
    keydown(host, 'Home');
    expect(host.value()).toBe(0);
    keydown(host, 'End');
    expect(host.value()).toBe(10);
    host.min.set(null);
    fixture.detectChanges();
    const home = keydown(host, 'Home');
    expect(host.value()).toBe(10);
    expect(home.defaultPrevented).toBe(true);
  });

  it('ignores unrelated keys', () => {
    const { host } = setup();
    const ev = keydown(host, 'a');
    expect(host.value()).toBe(5);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('drives a bound control instead of the model, and does not emit (control mode)', () => {
    const { fixture, host } = setup();
    const ctrl = new FormControl<number | null>(3);
    host.control.set(ctrl);
    fixture.detectChanges();
    expect(host.spin.internal.value).toBe(3);
    host.spin.increment();
    expect(ctrl.value).toBe(4);
    expect(host.value()).toBe(5); // untouched in control mode
    expect(host.emitted).toEqual([]);
  });

  it('reports fieldDisabled from the lightweight input, and disables the internal control', () => {
    const { fixture, host } = setup();
    expect(host.spin.fieldDisabled()).toBe(false);
    host.disabled.set(true);
    fixture.detectChanges();
    expect(host.spin.fieldDisabled()).toBe(true);
    expect(host.spin.internal.disabled).toBe(true);
  });

  it('reports fieldDisabled from the bound control, following status changes and swaps', () => {
    const { fixture, host } = setup();
    host.disabled.set(true); // ignored once a control is bound
    const a = new FormControl<number | null>(1);
    host.control.set(a);
    fixture.detectChanges();
    expect(host.spin.fieldDisabled()).toBe(false);
    a.disable();
    expect(host.spin.fieldDisabled()).toBe(true);
    const b = new FormControl<number | null>(2);
    host.control.set(b);
    fixture.detectChanges();
    expect(host.spin.fieldDisabled()).toBe(false);
    b.disable();
    expect(host.spin.fieldDisabled()).toBe(true);
    // Order matters: a leaked subscription to the OLD control would now write
    // `false` over the `true` we just observed — that is what proves the cleanup.
    a.enable();
    expect(host.spin.fieldDisabled()).toBe(true);
  });
});
