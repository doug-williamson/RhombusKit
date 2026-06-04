import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RhombusSelectComponent, SelectOption } from './rhombus-select.component';

@Component({
  standalone: true,
  imports: [RhombusSelectComponent, ReactiveFormsModule],
  template: `
    <rhombus-select label="Priority" [control]="ctrl" [options]="options">
      <span rhombusError>Pick a priority before submitting.</span>
    </rhombus-select>
  `,
})
class SelectErrorHostComponent {
  readonly options: SelectOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'high', label: 'High' },
  ];
  readonly ctrl = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });
}

describe('rhombus-select error projection', () => {
  it('projects [rhombusError] content into the form-field error subscript', () => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(SelectErrorHostComponent);
    fixture.componentInstance.ctrl.markAsTouched();
    fixture.detectChanges();

    const error = (fixture.nativeElement as HTMLElement).querySelector('mat-error');
    expect(error?.textContent?.trim()).toBe('Pick a priority before submitting.');
  });
});
