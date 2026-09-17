import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { createSpinbox } from '../forms/spinbox';

/**
 * `<rhombus-number-input>` — a numeric spinbox: Material's `<mat-form-field>` +
 * `<input matInput type="number">` for the field chrome, plus a bespoke ± / step
 * / clamp / keyboard layer Material doesn't ship (**D7**).
 *
 * The native `type="number"` input is an implicit ARIA `spinbutton`;
 * `aria-valuemin`/`aria-valuemax` derive from `min`/`max` and `aria-valuenow`
 * from the value, so no manual `role`/`aria-*` is added. The public `[control]` /
 * `[(value)]`, the ± / step / clamp logic and the keyboard
 * map all come from the shared {@link createSpinbox} core (one owner for every
 * RhombusKit spinbox, so this and `rhombus-quantity-input` cannot drift). Clamping
 * runs on blur and on a step, never per keystroke.
 *
 *   <rhombus-number-input label="Seats" [min]="0" [max]="99" [(value)]="seats" />
 *
 * Projected slots: `[rhombusError]` (error subscript), `[matTextPrefix]` /
 * `[matIconPrefix]` (unit / currency — the ± live in the trailing region).
 */
@Component({
  selector: 'rhombus-number-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-number-input.component.scss',
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>{{ label() }}</mat-label>

      <ng-content select="[matTextPrefix]" />
      <ng-content select="[matIconPrefix]" />

      <input
        matInput
        type="number"
        class="rhombus-number-input__field"
        [formControl]="internal"
        [placeholder]="placeholder()"
        [required]="required()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        inputmode="decimal"
        (keydown)="onKeydown($event)"
        (blur)="onBlur()"
      />

      @if (showButtons()) {
        <div matSuffix class="rhombus-number-input__spinner">
          <button
            type="button"
            class="rhombus-number-input__btn rhombus-number-input__btn--dec"
            tabindex="-1"
            [attr.aria-label]="decrementLabel()"
            [disabled]="fieldDisabled()"
            (click)="decrement()"
          >
            <svg
              class="rhombus-number-input__glyph"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            class="rhombus-number-input__btn rhombus-number-input__btn--inc"
            tabindex="-1"
            [attr.aria-label]="incrementLabel()"
            [disabled]="fieldDisabled()"
            (click)="increment()"
          >
            <svg
              class="rhombus-number-input__glyph"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
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
export class RhombusNumberInputComponent {
  /** Floating `<mat-label>` text; empty (default) for no label. */
  readonly label = input<string>('');
  /** Placeholder shown when the field is empty. */
  readonly placeholder = input<string>('');
  /** Form-field appearance, mapped to Material's `outline` (default) or `fill`. */
  readonly appearance = input<FormFieldAppearance>('outline');
  /** Type scale (font size only), applied via host classes; defaults to `md`. Box geometry — heights, padding, gaps — is set app-wide by `provideRhombusDensity()`. */
  readonly size = input<FormFieldSize>('md');
  /** Disables the field in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Marks the field required for validation/ARIA. Defaults to `false`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Subscript hint text shown below the field; `null` (default) hides the hint. */
  readonly hint = input<string | null>(null);
  /** Whether subscript space is reserved (`fixed`) or collapses (`dynamic`, default). */
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  /** Minimum value; `null` (default) for no lower bound. */
  readonly min = input<number | null>(null);
  /** Maximum value; `null` (default) for no upper bound. */
  readonly max = input<number | null>(null);
  /** Increment for the ± buttons and arrow keys. Defaults to `1`. */
  readonly step = input<number>(1);
  /** Increment for PageUp / PageDown; `null` (default) uses `step * 10`. */
  readonly largeStep = input<number | null>(null);
  /** Value in lightweight (`[(value)]`) mode; ignored when `control` is set. */
  readonly value = model<number | null>(null);
  /** Reactive-forms `FormControl<number | null>`; when set, `value`/`disabled` are ignored. */
  readonly control = input<FormControl<number | null> | null>(null);
  /** Show the ± spinner buttons. Defaults to `true`. */
  readonly showButtons = input(true, { transform: booleanAttribute });
  /** Accessible name for the increment button. Defaults to `'Increment'`. */
  readonly incrementLabel = input<string>('Increment');
  /** Accessible name for the decrement button. Defaults to `'Decrement'`. */
  readonly decrementLabel = input<string>('Decrement');

  /** Emits on each user change in lightweight mode (completes `[(value)]`). */
  readonly valueChange = output<number | null>();

  /** The shared numeric core: control mirror, value seed, disabled tracking, step/clamp/keys. */
  private readonly spin = createSpinbox({
    control: this.control,
    value: this.value,
    disabled: this.disabled,
    min: this.min,
    max: this.max,
    step: this.step,
    largeStep: this.largeStep,
    valueChange: this.valueChange,
  });

  /** The control bound to the inner input; the public `control` / `value` mirror onto it. */
  protected readonly internal = this.spin.internal;

  /** Disabled state surfaced to the ± buttons (the mirror disables the input silently). */
  protected readonly fieldDisabled = this.spin.fieldDisabled;

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );

  protected increment(): void {
    this.spin.increment();
  }

  protected decrement(): void {
    this.spin.decrement();
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.spin.onKeydown(event);
  }

  protected onBlur(): void {
    this.spin.onBlur();
  }
}
