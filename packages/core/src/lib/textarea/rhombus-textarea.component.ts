import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';

/**
 * `<rhombus-textarea>` — wrapper over `<mat-form-field>` +
 * `<textarea matInput>` with optional CDK autosize. Same ownership model
 * as `<rhombus-input>`: the component owns the control; reactive-forms
 * consumers pass a FormControl via `control`. No ControlValueAccessor.
 */
@Component({
  selector: 'rhombus-textarea',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>{{ label() }}</mat-label>

      @if (control(); as ctrl) {
        <textarea
          matInput
          [formControl]="ctrl"
          [placeholder]="placeholder()"
          [required]="required()"
          [rows]="rows()"
          [cdkTextareaAutosize]="autosize()"
          [cdkAutosizeMinRows]="minRows()"
          [cdkAutosizeMaxRows]="maxRows()"
        ></textarea>
      } @else {
        <textarea
          matInput
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [rows]="rows()"
          [cdkTextareaAutosize]="autosize()"
          [cdkAutosizeMinRows]="minRows()"
          [cdkAutosizeMaxRows]="maxRows()"
        ></textarea>
      }

      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      <mat-error>
        <ng-content select="[rhombusError]" />
      </mat-error>
    </mat-form-field>
  `,
})
export class RhombusTextareaComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly appearance = input<FormFieldAppearance>('outline');
  readonly size = input<FormFieldSize>('md');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly hint = input<string | null>(null);
  readonly rows = input<number>(3);
  readonly autosize = input<boolean>(false);
  readonly minRows = input<number>(2);
  readonly maxRows = input<number>(10);
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  readonly control = input<FormControl | null>(null);

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );
}
