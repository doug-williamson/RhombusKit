import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { axe } from '../../testing/axe';
import { RhombusTextareaComponent } from './rhombus-textarea.component';

@Component({
  standalone: true,
  imports: [RhombusTextareaComponent, ReactiveFormsModule],
  template: `
    <rhombus-textarea
      [label]="label"
      [placeholder]="placeholder"
      [appearance]="appearance"
      [size]="size"
      [disabled]="disabled"
      [required]="required"
      [hint]="hint"
      [rows]="rows"
      [autosize]="autosize"
      [minRows]="minRows"
      [maxRows]="maxRows"
      [control]="control"
    />
  `,
})
class HostComponent {
  label = 'Bio';
  placeholder = '';
  appearance: FormFieldAppearance = 'outline';
  size: FormFieldSize = 'md';
  disabled = false;
  required = false;
  hint: string | null = null;
  rows = 3;
  autosize = false;
  minRows = 2;
  maxRows = 10;
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

function textarea(el: HTMLElement): HTMLTextAreaElement {
  return el.querySelector('textarea') as HTMLTextAreaElement;
}

function formField(el: HTMLElement): HTMLElement {
  return el.querySelector('mat-form-field') as HTMLElement;
}

describe('rhombus-textarea', () => {
  it('renders the label and a textarea control', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe('Bio');
    expect(textarea(el)).toBeTruthy();
  });

  it('forwards placeholder, required, and rows to the textarea', () => {
    const { fixture, host, el } = setup();
    host.placeholder = 'Tell us about yourself';
    host.required = true;
    host.rows = 5;
    fixture.detectChanges();
    const native = textarea(el);
    expect(native.placeholder).toBe('Tell us about yourself');
    expect(native.required).toBe(true);
    expect(native.rows).toBe(5);
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
    host.size = 'sm';
    fixture.detectChanges();
    const cls = formField(el).classList;
    expect(cls).toContain('rhombus-form-field--fill');
    expect(cls).toContain('rhombus-form-field--sm');
    expect(cls).not.toContain('rhombus-form-field--outline');
  });

  it('renders a hint only when one is provided', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-hint')).toBeNull();
    host.hint = 'Max 280 characters.';
    fixture.detectChanges();
    expect(el.querySelector('mat-hint')?.textContent?.trim()).toBe(
      'Max 280 characters.'
    );
  });

  it('round-trips a bound FormControl value into the textarea', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl('first draft');
    fixture.detectChanges();
    expect(textarea(el).value).toBe('first draft');
    host.control.setValue('revised');
    fixture.detectChanges();
    expect(textarea(el).value).toBe('revised');
  });

  it('disables the standalone textarea when disabled is set', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(textarea(el).disabled).toBe(false);
    host.disabled = true;
    fixture.detectChanges();
    expect(textarea(el).disabled).toBe(true);
  });

  it('leaves CDK autosize disabled by default', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    const autosize = fixture.debugElement
      .query(By.directive(CdkTextareaAutosize))
      .injector.get(CdkTextareaAutosize);
    expect(autosize.enabled).toBe(false);
  });

  it('enables CDK autosize with the configured row bounds', () => {
    const { fixture, host } = setup();
    host.autosize = true;
    host.minRows = 4;
    host.maxRows = 8;
    fixture.detectChanges();
    const autosize = fixture.debugElement
      .query(By.directive(CdkTextareaAutosize))
      .injector.get(CdkTextareaAutosize);
    expect(autosize.enabled).toBe(true);
    expect(autosize.minRows).toBe(4);
    expect(autosize.maxRows).toBe(8);
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
