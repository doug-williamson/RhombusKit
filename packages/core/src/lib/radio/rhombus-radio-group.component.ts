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

  readonly label = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly options = input<RadioOption<T>[]>([]);
  readonly value = input<T | null>(null);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly control = input<FormControl<T | null> | null>(null);

  readonly valueChange = output<T>();
}
