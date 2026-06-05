import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

export interface RadioOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

let nextId = 0;

/**
 * `<rhombus-radio-group>` — wrapper over `<mat-radio-group>` driven by an
 * `options` array (same shape as `<rhombus-select>`). Reactive forms via
 * `[control]`, or `[(value)]` for lightweight use. No ControlValueAccessor.
 *
 * The group always exposes an accessible name: a visible `label` is linked via
 * `aria-labelledby`, otherwise pass `ariaLabel`.
 *
 * ```html
 * <rhombus-radio-group label="Priority" [options]="opts" [control]="ctrl" />
 * ```
 */
@Component({
  selector: 'rhombus-radio-group',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-radio-group.component.scss',
  template: `
    @if (label()) {
      <label class="rhombus-radio-group__label" [id]="labelId">{{ label() }}</label>
    }
    @if (control(); as ctrl) {
      <mat-radio-group
        class="rhombus-radio-group"
        [formControl]="ctrl"
        [required]="required()"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
      >
        @for (opt of options(); track opt.value) {
          <mat-radio-button [value]="opt.value" [disabled]="opt.disabled ?? false">
            {{ opt.label }}
          </mat-radio-button>
        }
      </mat-radio-group>
    } @else {
      <mat-radio-group
        class="rhombus-radio-group"
        [value]="value()"
        [disabled]="disabled()"
        [required]="required()"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
        (change)="valueChange.emit($event.value)"
      >
        @for (opt of options(); track opt.value) {
          <mat-radio-button [value]="opt.value" [disabled]="opt.disabled ?? false">
            {{ opt.label }}
          </mat-radio-button>
        }
      </mat-radio-group>
    }
  `,
})
export class RhombusRadioGroupComponent<T = string> {
  protected readonly labelId = `rhombus-radio-group-${nextId++}`;

  /** Visible group label, linked via `aria-labelledby`; empty (default) for no visible label. */
  readonly label = input<string>('');
  /** Accessible name used when no visible `label` is provided. */
  readonly ariaLabel = input<string>('');
  /** Radio options to render: `{ value, label, disabled? }`. Defaults to `[]`. */
  readonly options = input<RadioOption<T>[]>([]);
  /** Selected value in lightweight (`[(value)]`) mode; ignored when `control` is set. Defaults to `null`. */
  readonly value = input<T | null>(null);
  /** Disables the whole group in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Marks the group required for validation/ARIA. Defaults to `false`. */
  readonly required = input<boolean>(false);
  /** Reactive-forms `FormControl<T | null>`; when set, the standalone `value`/`disabled` inputs are ignored. */
  readonly control = input<FormControl<T | null> | null>(null);

  /** Emits the newly selected option value when the user picks a radio (lightweight mode only). */
  readonly valueChange = output<T>();
}
