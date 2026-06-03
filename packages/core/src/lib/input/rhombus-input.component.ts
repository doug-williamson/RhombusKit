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
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';

/**
 * HTML input types we surface. `password` triggers no special behaviour
 * here — the show/hide affordance is the consumer's responsibility
 * (typically a matIconSuffix toggle button, projected).
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'search'
  | 'tel'
  | 'url'
  | 'date'
  | 'time';

/**
 * `<rhombus-input>` — wrapper over `<mat-form-field>` + `<input matInput>`.
 *
 * The component OWNS the native input (Material's MatFormField finds its
 * control via a content query that does not pierce ng-content, so the
 * control cannot be projected). For reactive forms, pass a FormControl
 * via the `control` input — no ControlValueAccessor is implemented.
 *
 *   <rhombus-input label="Email" [control]="emailCtrl" />
 *
 * Projected slots (found by Material's descendants:true queries):
 *   <mat-icon matIconPrefix>…</mat-icon>   leading affordance
 *   <button matIconSuffix>…</button>       trailing affordance
 *   <span rhombusError>…</span>            error subscript text
 */
@Component({
  selector: 'rhombus-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>{{ label() }}</mat-label>

      <ng-content select="[matPrefix]" />
      <ng-content select="[matIconPrefix]" />
      <ng-content select="[matTextPrefix]" />

      @if (control(); as ctrl) {
        <input
          matInput
          [formControl]="ctrl"
          [type]="type()"
          [placeholder]="placeholder()"
          [required]="required()"
          [attr.autocomplete]="autocomplete()"
        />
      } @else {
        <input
          matInput
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [attr.autocomplete]="autocomplete()"
        />
      }

      <ng-content select="[matSuffix]" />
      <ng-content select="[matIconSuffix]" />
      <ng-content select="[matTextSuffix]" />

      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      <mat-error>
        <ng-content select="[rhombusError]" />
      </mat-error>
    </mat-form-field>
  `,
})
export class RhombusInputComponent {
  readonly label = input<string>('');
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly appearance = input<FormFieldAppearance>('outline');
  readonly size = input<FormFieldSize>('md');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly hint = input<string | null>(null);
  readonly autocomplete = input<string>('off');
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
