import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import {
  AlertVariant,
  RhombusAlertComponent,
} from './rhombus-alert.component';

@Component({
  standalone: true,
  imports: [RhombusAlertComponent],
  template: `
    <rhombus-alert
      [variant]="variant"
      [title]="title"
      [dismissible]="dismissible"
      (dismissed)="dismissedCount = dismissedCount + 1"
      >{{ message }}</rhombus-alert
    >
  `,
})
class HostComponent {
  variant: AlertVariant = 'warning';
  title = 'Heads up';
  dismissible = false;
  message = 'Your storage is almost full.';
  dismissedCount = 0;
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

describe('rhombus-alert', () => {
  it('applies the variant modifier class', () => {
    const { el } = setup();
    expect(el.querySelector('.rhombus-alert--warning')).not.toBeNull();
  });

  it('renders the title and the projected message', () => {
    const { el } = setup();
    expect(el.querySelector('.rhombus-alert__title')?.textContent?.trim()).toBe(
      'Heads up'
    );
    expect(
      el.querySelector('.rhombus-alert__message')?.textContent
    ).toContain('storage is almost full');
  });

  it('includes a visually-hidden severity label for screen readers', () => {
    const { el } = setup();
    expect(
      el.querySelector('.rhombus-alert__severity')?.textContent?.trim()
    ).toBe('Warning:');
  });

  it('shows the dismiss button only when dismissible, and emits + hides on click', () => {
    const { fixture, host, el } = setup();
    expect(el.querySelector('.rhombus-alert__dismiss')).toBeNull();

    host.dismissible = true;
    fixture.detectChanges();
    const btn = el.querySelector<HTMLButtonElement>('.rhombus-alert__dismiss');
    expect(btn).not.toBeNull();

    btn?.click();
    fixture.detectChanges();
    expect(host.dismissedCount).toBe(1);
    expect(el.querySelector('.rhombus-alert')).toBeNull();
  });

  it('exposes an ARIA live role: assertive for error/warning, polite otherwise', () => {
    const { fixture, host, el } = setup();
    const roleOf = () =>
      el.querySelector('.rhombus-alert')?.getAttribute('role');

    host.variant = 'warning';
    fixture.detectChanges();
    expect(roleOf()).toBe('alert');

    host.variant = 'error';
    fixture.detectChanges();
    expect(roleOf()).toBe('alert');

    host.variant = 'info';
    fixture.detectChanges();
    expect(roleOf()).toBe('status');

    host.variant = 'success';
    fixture.detectChanges();
    expect(roleOf()).toBe('status');
  });

  it('has no accessibility violations', async () => {
    const { fixture, host, el } = setup();
    host.dismissible = true;
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
