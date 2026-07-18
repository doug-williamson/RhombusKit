import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { mirrorControl } from './mirror-control';

/**
 * Host that mirrors a public `FormControl<number>` to a private
 * `FormControl<number>` through a doubling converter, so the two directions
 * are distinguishable: external value * 2 === internal value.
 */
@Component({ standalone: true, template: '' })
class HostComponent {
  readonly external = signal<FormControl<number | null> | null>(null);
  readonly internal = new FormControl<number | null>(null);
  readonly disabledInput = signal(false);
  readonly emitted: (number | null)[] = [];

  constructor() {
    mirrorControl<number, number>({
      external: this.external,
      internal: this.internal,
      toInternal: (v) => (v == null ? null : v * 2),
      toExternal: (v) => (v == null ? null : v / 2),
      onExternalChange: (v) => this.emitted.push(v),
      disabled: this.disabledInput,
    });
  }
}

function setup(): { fixture: ComponentFixture<HostComponent>; host: HostComponent } {
  const fixture = TestBed.createComponent(HostComponent);
  return { fixture, host: fixture.componentInstance };
}

describe('mirrorControl', () => {
  it('seeds the internal control from a newly-bound external control', () => {
    const { fixture, host } = setup();
    host.external.set(new FormControl<number | null>(5));
    fixture.detectChanges();
    expect(host.internal.value).toBe(10);
  });

  it('propagates external value changes to the internal control (converted)', () => {
    const { fixture, host } = setup();
    const ctrl = new FormControl<number | null>(1);
    host.external.set(ctrl);
    fixture.detectChanges();
    ctrl.setValue(4);
    expect(host.internal.value).toBe(8);
  });

  it('propagates internal changes back to the external control and emits (converted)', () => {
    const { fixture, host } = setup();
    const ctrl = new FormControl<number | null>(0);
    host.external.set(ctrl);
    fixture.detectChanges();
    host.internal.setValue(20);
    expect(ctrl.value).toBe(10);
    expect(host.emitted).toContain(10);
  });

  it('does not echo a programmatic external write back as a change', () => {
    const { fixture, host } = setup();
    const ctrl = new FormControl<number | null>(0);
    host.external.set(ctrl);
    fixture.detectChanges();
    host.emitted.length = 0;
    ctrl.setValue(6); // programmatic
    expect(host.internal.value).toBe(12);
    expect(host.emitted).toEqual([]); // no echo
  });

  it('mirrors the external control disabled state onto the internal control', () => {
    const { fixture, host } = setup();
    const ctrl = new FormControl<number | null>(0);
    host.external.set(ctrl);
    fixture.detectChanges();
    ctrl.disable();
    expect(host.internal.disabled).toBe(true);
    ctrl.enable();
    expect(host.internal.disabled).toBe(false);
  });

  it('mirrors the lightweight disabled signal when no external control is bound', () => {
    const { fixture, host } = setup();
    host.disabledInput.set(true);
    fixture.detectChanges();
    expect(host.internal.disabled).toBe(true);
  });

  it('re-seeds and re-subscribes when the external control instance is swapped', () => {
    const { fixture, host } = setup();
    const first = new FormControl<number | null>(1);
    host.external.set(first);
    fixture.detectChanges();
    const second = new FormControl<number | null>(3);
    host.external.set(second);
    fixture.detectChanges();
    expect(host.internal.value).toBe(6);
    // the old control is no longer wired
    first.setValue(9);
    expect(host.internal.value).toBe(6);
  });
});
