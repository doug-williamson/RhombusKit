import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { axe } from '../../testing/axe';
import { RhombusSwitchComponent } from './rhombus-switch.component';

@Component({
  standalone: true,
  imports: [RhombusSwitchComponent, ReactiveFormsModule],
  template: `
    <rhombus-switch
      [label]="label"
      [control]="control"
      [checked]="checked"
      [disabled]="disabled"
      (checkedChange)="lastEmitted = $event"
    />
  `,
})
class HostComponent {
  label = 'Email notifications';
  control: FormControl<boolean> | null = null;
  checked = false;
  disabled = false;
  lastEmitted: boolean | null = null;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function switchButton(el: HTMLElement): HTMLButtonElement {
  const btn = el.querySelector<HTMLButtonElement>('button[role="switch"]');
  if (!btn) throw new Error('switch button not rendered');
  return btn;
}

describe('rhombus-switch', () => {
  it('renders the label', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.textContent).toContain('Email notifications');
  });

  it('reflects a bound FormControl value as aria-checked', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl(true, { nonNullable: true });
    fixture.detectChanges();
    expect(switchButton(el).getAttribute('aria-checked')).toBe('true');
  });

  it('emits checkedChange when toggled (uncontrolled)', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    switchButton(el).click();
    fixture.detectChanges();
    expect(host.lastEmitted).toBe(true);
  });

  it('reflects the disabled input to the switch control', () => {
    const { fixture, host, el } = setup();
    host.disabled = true;
    fixture.detectChanges();
    expect(switchButton(el).disabled).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
