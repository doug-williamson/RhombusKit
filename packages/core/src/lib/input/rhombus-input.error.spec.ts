import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RhombusInputComponent } from './rhombus-input.component';

/**
 * The error subscript is projected by attribute. v1.0 standardises that marker
 * on `[rhombusError]` (the bare HTML `slot="error"` carried misleading
 * shadow-DOM connotations). Material's `<mat-error>` owns the a11y wiring, so
 * the projected text must also be what assistive tech is pointed at.
 */
@Component({
  standalone: true,
  imports: [RhombusInputComponent, ReactiveFormsModule],
  template: `
    <rhombus-input label="Email" [control]="ctrl">
      <span rhombusError>Email is required.</span>
    </rhombus-input>
  `,
})
class ErrorHostComponent {
  readonly ctrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
}

function setup(): { el: HTMLElement; fixture: ComponentFixture<ErrorHostComponent> } {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(ErrorHostComponent);
  // The error subscript only renders once the control is invalid AND touched.
  fixture.componentInstance.ctrl.markAsTouched();
  fixture.detectChanges();
  return { el: fixture.nativeElement as HTMLElement, fixture };
}

describe('rhombus-input error projection', () => {
  it('projects [rhombusError] content into the form-field error subscript', () => {
    const { el } = setup();
    const error = el.querySelector('mat-error');
    expect(error?.textContent?.trim()).toBe('Email is required.');
  });

  it('announces the projected error to assistive tech via aria-describedby', () => {
    const { el } = setup();
    const input = el.querySelector('input')!;
    const ids = (input.getAttribute('aria-describedby') ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const announced = ids
      .map((id) => el.querySelector(`[id="${id}"]`)?.textContent?.trim())
      .filter((t): t is string => !!t);
    expect(announced).toContain('Email is required.');
  });
});
