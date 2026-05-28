import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import {
  FormFieldAppearance,
  FormFieldSize,
  RhombusFormFieldComponent,
} from '../form-field/rhombus-form-field.component';

/**
 * `<rhombus-textarea>` — presentational wrapper over `<mat-form-field>` +
 * `<textarea matInput>` with optional CDK autosize. Same constraints as
 * `<rhombus-input>`: no ControlValueAccessor, no internal FormControl.
 */
@Component({
  selector: 'rhombus-textarea',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    TextFieldModule,
    RhombusFormFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <rhombus-form-field
      [appearance]="appearance()"
      [size]="size()"
      [subscriptSizing]="subscriptSizing()"
    >
      <span slot="label">{{ label() }}</span>

      @if (autosize()) {
        <textarea
          matInput
          cdkTextareaAutosize
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
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
        ></textarea>
      }

      @if (hint()) {
        <span slot="hint">{{ hint() }}</span>
      }

      <ng-content select="[slot=error]" ngProjectAs="[slot=error]" />
    </rhombus-form-field>
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
}
