import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {
  FormFieldAppearance,
  FormFieldSize,
  RhombusFormFieldComponent,
} from '../form-field/rhombus-form-field.component';

/**
 * HTML input types we surface. `password` triggers no special behaviour
 * here — the show/hide affordance is the consumer's responsibility
 * (typically a matIconSuffix toggle button).
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
 * `<rhombus-input>` — presentational wrapper over `<mat-form-field>` +
 * `<input matInput>`. The component does NOT implement
 * ControlValueAccessor and does NOT own a FormControl. Consumers attach
 * `[formControl]` / `[(ngModel)]` to the projected `<input>` from outside
 * (see input-page showcase for the reactive forms example).
 *
 * Slot usage:
 *   <span slot="label">…</span>                     → label text
 *   <span slot="hint">…</span>                      → hint subscript
 *   <span slot="error">…</span>                     → mat-error subscript
 *   <mat-icon matIconPrefix>…</mat-icon>            → leading affordance
 *   <button matIconSuffix>…</button>                → trailing affordance
 */
@Component({
  selector: 'rhombus-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, RhombusFormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <rhombus-form-field
      [appearance]="appearance()"
      [size]="size()"
      [subscriptSizing]="subscriptSizing()"
    >
      <span slot="label">{{ label() }}</span>

      <ng-content select="[matIconPrefix]" ngProjectAs="[matIconPrefix]" />
      <ng-content select="[matTextPrefix]" ngProjectAs="[matTextPrefix]" />
      <ng-content select="[matPrefix]" ngProjectAs="[matPrefix]" />

      <input
        matInput
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [required]="required()"
        [attr.autocomplete]="autocomplete()"
      />

      <ng-content select="[matIconSuffix]" ngProjectAs="[matIconSuffix]" />
      <ng-content select="[matTextSuffix]" ngProjectAs="[matTextSuffix]" />
      <ng-content select="[matSuffix]" ngProjectAs="[matSuffix]" />

      @if (hint()) {
        <span slot="hint">{{ hint() }}</span>
      }

      <ng-content select="[slot=error]" ngProjectAs="[slot=error]" />
    </rhombus-form-field>
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
}
