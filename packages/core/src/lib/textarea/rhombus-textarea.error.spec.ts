import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RhombusTextareaComponent } from './rhombus-textarea.component';

@Component({
  standalone: true,
  imports: [RhombusTextareaComponent, ReactiveFormsModule],
  template: `
    <rhombus-textarea label="Bio" [control]="ctrl">
      <span rhombusError>A short bio is required.</span>
    </rhombus-textarea>
  `,
})
class TextareaErrorHostComponent {
  readonly ctrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
}

describe('rhombus-textarea error projection', () => {
  it('projects [rhombusError] content into the form-field error subscript', () => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(TextareaErrorHostComponent);
    fixture.componentInstance.ctrl.markAsTouched();
    fixture.detectChanges();

    const error = (fixture.nativeElement as HTMLElement).querySelector('mat-error');
    expect(error?.textContent?.trim()).toBe('A short bio is required.');
  });
});
