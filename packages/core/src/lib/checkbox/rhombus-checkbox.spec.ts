import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { axe } from '../../testing/axe';
import { RhombusCheckboxComponent } from './rhombus-checkbox.component';

@Component({
  standalone: true,
  imports: [RhombusCheckboxComponent, ReactiveFormsModule],
  template: `
    <rhombus-checkbox
      [label]="label"
      [control]="control"
      [checked]="checked"
      [disabled]="disabled"
      (checkedChange)="lastEmitted = $event"
    />
  `,
})
class HostComponent {
  label = 'Accept the terms';
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

function nativeCheckbox(el: HTMLElement): HTMLInputElement {
  const input = el.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!input) throw new Error('native checkbox input not rendered');
  return input;
}

describe('rhombus-checkbox', () => {
  it('renders the label', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.textContent).toContain('Accept the terms');
  });

  it('reflects a bound FormControl value', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl(true, { nonNullable: true });
    fixture.detectChanges();
    expect(nativeCheckbox(el).checked).toBe(true);
  });

  it('emits checkedChange when toggled (uncontrolled)', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    nativeCheckbox(el).click();
    fixture.detectChanges();
    expect(host.lastEmitted).toBe(true);
  });

  it('reflects the disabled input to the native control', () => {
    const { fixture, host, el } = setup();
    host.disabled = true;
    fixture.detectChanges();
    expect(nativeCheckbox(el).disabled).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
