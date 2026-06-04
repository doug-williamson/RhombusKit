import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { axe } from '../../testing/axe';
import { InputType, RhombusInputComponent } from './rhombus-input.component';

@Component({
  standalone: true,
  imports: [RhombusInputComponent, ReactiveFormsModule, MatFormFieldModule],
  template: `
    <rhombus-input
      [label]="label"
      [type]="type"
      [placeholder]="placeholder"
      [appearance]="appearance"
      [size]="size"
      [disabled]="disabled"
      [required]="required"
      [hint]="hint"
      [autocomplete]="autocomplete"
      [control]="control"
    >
      <span matTextPrefix>$</span>
      <span matTextSuffix>USD</span>
    </rhombus-input>
  `,
})
class HostComponent {
  label = 'Email';
  type: InputType = 'text';
  placeholder = '';
  appearance: FormFieldAppearance = 'outline';
  size: FormFieldSize = 'md';
  disabled = false;
  required = false;
  hint: string | null = null;
  autocomplete = 'off';
  control: FormControl | null = null;
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

function input(el: HTMLElement): HTMLInputElement {
  return el.querySelector('input') as HTMLInputElement;
}

function formField(el: HTMLElement): HTMLElement {
  return el.querySelector('mat-form-field') as HTMLElement;
}

describe('rhombus-input', () => {
  it('renders the label', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe('Email');
  });

  it('forwards type, placeholder, required, and autocomplete to the input', () => {
    const { fixture, host, el } = setup();
    host.type = 'email';
    host.placeholder = 'you@example.com';
    host.required = true;
    host.autocomplete = 'email';
    fixture.detectChanges();
    const native = input(el);
    expect(native.type).toBe('email');
    expect(native.placeholder).toBe('you@example.com');
    expect(native.required).toBe(true);
    expect(native.getAttribute('autocomplete')).toBe('email');
  });

  it('applies the default appearance and size host classes', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
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

  it('renders a hint only when one is provided', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-hint')).toBeNull();
    host.hint = 'We never share it.';
    fixture.detectChanges();
    expect(el.querySelector('mat-hint')?.textContent?.trim()).toBe(
      'We never share it.'
    );
  });

  it('round-trips a bound FormControl value into the input', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl('typed value');
    fixture.detectChanges();
    expect(input(el).value).toBe('typed value');
    host.control.setValue('updated');
    fixture.detectChanges();
    expect(input(el).value).toBe('updated');
  });

  it('disables the standalone input when disabled is set', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(input(el).disabled).toBe(false);
    host.disabled = true;
    fixture.detectChanges();
    expect(input(el).disabled).toBe(true);
  });

  it('projects text prefix and suffix into the form field', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(
      el.querySelector('mat-form-field [matTextPrefix]')?.textContent?.trim()
    ).toBe('$');
    expect(
      el.querySelector('mat-form-field [matTextSuffix]')?.textContent?.trim()
    ).toBe('USD');
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
