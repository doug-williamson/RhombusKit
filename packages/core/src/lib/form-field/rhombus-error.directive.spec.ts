import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { axe } from '../../testing/axe';
import {
  RhombusSelectComponent,
  SelectOption,
} from '../select/rhombus-select.component';
import { RhombusTextareaComponent } from '../textarea/rhombus-textarea.component';
import { RhombusErrorDirective } from './rhombus-error.directive';

@Component({
  standalone: true,
  imports: [RhombusErrorDirective],
  template: `<span rhombusError>Required.</span>`,
})
class MarkerHost {}

@Component({
  standalone: true,
  imports: [RhombusTextareaComponent, ReactiveFormsModule],
  template: `
    <rhombus-textarea label="Bio" [control]="ctrl">
      <span rhombusError>A short bio is required.</span>
    </rhombus-textarea>
  `,
})
class TextareaHost {
  readonly ctrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
}

@Component({
  standalone: true,
  imports: [RhombusSelectComponent, ReactiveFormsModule],
  template: `
    <rhombus-select label="Priority" [control]="ctrl" [options]="options">
      <span rhombusError>Pick a priority before submitting.</span>
    </rhombus-select>
  `,
})
class SelectHost {
  readonly options: SelectOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'high', label: 'High' },
  ];
  readonly ctrl = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });
}

function touchedFixture<T extends { ctrl: FormControl }>(
  type: new () => T
): ComponentFixture<T> {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(type);
  fixture.componentInstance.ctrl.markAsTouched();
  fixture.detectChanges();
  return fixture;
}

/** Resolve the text the control points assistive tech at via aria-describedby. */
function announced(el: HTMLElement): string[] {
  const described = el.querySelector('[aria-describedby]');
  const ids = (described?.getAttribute('aria-describedby') ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return ids
    .map((id) => el.querySelector(`[id="${id}"]`)?.textContent?.trim())
    .filter((t): t is string => !!t);
}

describe('rhombusError directive', () => {
  it('is a standalone marker that applies to a projected element', () => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(MarkerHost);
    fixture.detectChanges();
    const marked = fixture.debugElement.query(
      By.directive(RhombusErrorDirective)
    );
    expect(marked).toBeTruthy();
    expect((marked.nativeElement as HTMLElement).textContent?.trim()).toBe(
      'Required.'
    );
  });

  it('surfaces the textarea error and announces it via aria-describedby', () => {
    const fixture = touchedFixture(TextareaHost);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-error')?.textContent?.trim()).toBe(
      'A short bio is required.'
    );
    expect(announced(el)).toContain('A short bio is required.');
  });

  it('surfaces the select error and announces it via aria-describedby', () => {
    const fixture = touchedFixture(SelectHost);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-error')?.textContent?.trim()).toBe(
      'Pick a priority before submitting.'
    );
    expect(announced(el)).toContain('Pick a priority before submitting.');
  });

  it('has no accessibility violations', async () => {
    const fixture = touchedFixture(TextareaHost);
    expect(
      await axe(fixture.nativeElement as HTMLElement)
    ).toHaveNoViolations();
  });
});
