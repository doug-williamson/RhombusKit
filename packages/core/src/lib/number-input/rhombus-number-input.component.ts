import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { mirrorControl } from '../forms/mirror-control';

/**
 * `<rhombus-number-input>` — a numeric spinbox: Material's `<mat-form-field>` +
 * `<input matInput type="number">` for the field chrome, plus a bespoke ± / step
 * / clamp / keyboard layer Material doesn't ship (**D7**).
 *
 * The native `type="number"` input is an implicit ARIA `spinbutton` and derives
 * `aria-valuemin/max/now` for free from the reflected `min` / `max` / `step`
 * attributes, so no manual `role`/`aria-*` is added. The public `[control]` /
 * `[(value)]` is mirrored to a private `FormControl<number | null>` bound to the
 * input via the shared {@link mirrorControl} helper (identity mapping) — a spinbox
 * must read the current value to clamp and write the stepped one back, so a single
 * internal control is the natural home for that. Clamping runs on blur and on a
 * step, never per keystroke.
 *
 *   <rhombus-number-input label="Quantity" [min]="0" [max]="99" [(value)]="qty" />
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
  /** Density scale applied via host classes; defaults to `md`. */
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

  /** The control bound to the inner input; the public `control` / `value` mirror onto it. */
  protected readonly internal = new FormControl<number | null>(null);

  /** Disabled state surfaced to the ± buttons (the mirror disables the input silently). */
  protected readonly fieldDisabled = signal(false);

  private readonly largeStepValue = computed(
    () => this.largeStep() ?? this.step() * 10
  );

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );

  constructor() {
    mirrorControl<number, number>({
      external: this.control,
      internal: this.internal,
      toInternal: (value) => value,
      toExternal: (value) => value,
      onExternalChange: (value) => this.emitAndSync(value),
      disabled: this.disabled,
    });

    // Seed the internal control from the lightweight value model (the mirror only
    // seeds from a bound control). Silent write — no echo back through emitAndSync.
    effect(() => {
      if (this.control()) return;
      const value = this.value();
      if (this.internal.value !== value) {
        this.internal.setValue(value, { emitEvent: false });
      }
    });

    // Track disabled for the ± buttons: reflect the lightweight input, or the
    // bound control's status (re-subscribing when its instance swaps).
    effect((onCleanup) => {
      const control = this.control();
      if (!control) {
        this.fieldDisabled.set(this.disabled());
        return;
      }
      this.fieldDisabled.set(control.disabled);
      const sub = control.statusChanges.subscribe(() =>
        this.fieldDisabled.set(control.disabled)
      );
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected increment(): void {
    this.stepBy(this.step());
  }

  protected decrement(): void {
    this.stepBy(-this.step());
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.stepBy(this.step());
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.stepBy(-this.step());
        break;
      case 'PageUp':
        event.preventDefault();
        this.stepBy(this.largeStepValue());
        break;
      case 'PageDown':
        event.preventDefault();
        this.stepBy(-this.largeStepValue());
        break;
      case 'Home':
        event.preventDefault();
        this.toBound(this.min());
        break;
      case 'End':
        event.preventDefault();
        this.toBound(this.max());
        break;
    }
  }

  protected onBlur(): void {
    const current = this.internal.value;
    if (current != null) {
      this.commit(this.clamp(current));
    }
  }

  private stepBy(delta: number): void {
    const current = this.internal.value;
    const base = current == null ? (this.min() ?? 0) : current + delta;
    this.commit(this.clamp(base));
  }

  private toBound(bound: number | null): void {
    if (bound != null) {
      this.commit(bound);
    }
  }

  private clamp(value: number): number {
    const min = this.min();
    const max = this.max();
    let result = value;
    if (min != null) result = Math.max(min, result);
    if (max != null) result = Math.min(max, result);
    return result;
  }

  private commit(value: number): void {
    if (this.internal.value !== value) {
      this.internal.setValue(value);
    }
  }

  private emitAndSync(value: number | null): void {
    // In control mode the bound control is the source of truth (the mirror
    // already wrote to it); value / valueChange belong to lightweight mode.
    if (this.control()) return;
    this.value.set(value);
    this.valueChange.emit(value);
  }
}
