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
  /** Floating `<mat-label>` text; empty (default) for no label. */
  readonly label = input<string>('');
  /** Placeholder shown when the field is empty. */
  readonly placeholder = input<string>('');
  /** Form-field appearance, mapped to Material's `outline` (default) or `fill`. */
  readonly appearance = input<FormFieldAppearance>('outline');
  /** Type scale (font size only), applied via host classes; defaults to `md`. Box geometry — heights, padding, gaps — is set app-wide by `provideRhombusDensity()`. */
  readonly size = input<FormFieldSize>('md');
  /** Disables the textarea in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Marks the textarea required for validation/ARIA. Defaults to `false`. */
  readonly required = input<boolean>(false);
  /** Subscript hint text shown below the field; `null` (default) hides the hint. */
  readonly hint = input<string | null>(null);
  /** Initial visible row count for the textarea; defaults to `3`. */
  readonly rows = input<number>(3);
  /** Enables CDK autosize so the textarea grows/shrinks with content. Defaults to `false`. */
  readonly autosize = input<boolean>(false);
  /** Minimum rows when `autosize` is on; defaults to `2`. */
  readonly minRows = input<number>(2);
  /** Maximum rows when `autosize` is on before scrolling; defaults to `10`. */
  readonly maxRows = input<number>(10);
  /** Whether subscript space is reserved (`fixed`) or collapses (`dynamic`, default). */
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  /** Reactive-forms `FormControl`; when set, the standalone `disabled` input is ignored. */
  readonly control = input<FormControl | null>(null);

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );
}
