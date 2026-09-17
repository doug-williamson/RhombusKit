import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { createSpinbox } from '../forms/spinbox';

/** Per-instance id seed for label ↔ input ↔ group ARIA wiring (SSR-safe, deterministic). */
let nextId = 0;

/**
 * `<rhombus-quantity-input>` — a compact, chrome-less count control:
 * `label · (−) n (+)`. A visible inline label, a round − button, a borderless
 * editable number and a round + button in one row. For quantities that live in
 * rows, cards, lists and toolbars (cart quantity, sets/reps).
 *
 * It is deliberately NOT a form field: no floating label, hint, error subscript,
 * currency prefix or `appearance`. For labelled numeric entry inside a form use
 * `<rhombus-number-input>`; both components share one numeric core
 * ({@link createSpinbox}), so stepping, clamping and the keyboard map are identical.
 *
 * The native `type="number"` input is the single tab stop and an implicit ARIA
 * `spinbutton` (`aria-valuemin`/`aria-valuemax` derive from `min`/`max` and
 * `aria-valuenow` from the value), so no manual `role`/`aria-*` is added to it.
 * The host is a `group` named by the label, so the − and + buttons announce with
 * context. The buttons are `tabindex="-1"` pointer/touch helpers; after every
 * click focus returns to the input so the keyboard set (Arrow ±step ·
 * PageUp/PageDown ±largeStep · Home/End → bounds) is live and a screen reader
 * hears the new value (touch taps announce the value through a polite live
 * region instead of refocusing, so the keypad stays down).
 *
 *   <rhombus-quantity-input label="Quantity" [min]="0" [max]="10" [(value)]="qty" />
 *
 * Clamping runs on blur and on a step, never per keystroke. In RTL the row mirrors
 * with the reading direction: − stays *before* the number, + *after* it.
 */
@Component({
  selector: 'rhombus-quantity-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-quantity-input.component.scss',
  // A host class, not `:host {}` — under ViewEncapsulation.None a `:host` rule is
  // emitted literally and matches nothing in light DOM.
  host: {
    class: 'rhombus-quantity-input',
    role: 'group',
    '[attr.aria-labelledby]': 'labelId',
  },
  template: `
    <label class="rhombus-quantity-input__label" [id]="labelId" [for]="inputId">{{
      label()
    }}</label>

    <button
      type="button"
      class="rhombus-quantity-input__btn rhombus-quantity-input__btn--dec"
      tabindex="-1"
      [attr.aria-label]="decrementLabel()"
      [disabled]="fieldDisabled()"
      (pointerdown)="onPointerDown($event)"
      (mousedown)="$event.preventDefault()"
      (click)="decrement()"
    >
      <svg class="rhombus-quantity-input__glyph" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14" />
      </svg>
    </button>

    <input
      #field
      type="number"
      class="rhombus-quantity-input__field"
      [id]="inputId"
      [formControl]="internal"
      [attr.min]="min()"
      [attr.max]="max()"
      [attr.step]="step()"
      inputmode="decimal"
      (keydown)="onKeydown($event)"
      (blur)="onBlur()"
    />

    <button
      type="button"
      class="rhombus-quantity-input__btn rhombus-quantity-input__btn--inc"
      tabindex="-1"
      [attr.aria-label]="incrementLabel()"
      [disabled]="fieldDisabled()"
      (pointerdown)="onPointerDown($event)"
      (mousedown)="$event.preventDefault()"
      (click)="increment()"
    >
      <svg class="rhombus-quantity-input__glyph" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>

    <span class="rhombus-quantity-input__live" aria-live="polite" aria-atomic="true">{{
      announced()
    }}</span>
  `,
})
export class RhombusQuantityInputComponent {
  /** Visible label rendered before the − button; also the accessible name of the input and of the group. Required. */
  readonly label = input.required<string>();
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
  /** Disables the control in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name for the + button. Defaults to `'Increment'`. */
  readonly incrementLabel = input<string>('Increment');
  /** Accessible name for the − button. Defaults to `'Decrement'`. */
  readonly decrementLabel = input<string>('Decrement');

  /** Emits on each user change in lightweight mode (completes `[(value)]`). */
  readonly valueChange = output<number | null>();

  private readonly base = `rhombus-quantity-input-${nextId++}`;
  protected readonly labelId = `${this.base}-label`;
  protected readonly inputId = `${this.base}-input`;

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

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

  /** The control bound to the `<input>`; the public `control` / `value` mirror onto it. */
  protected readonly internal = this.spin.internal;

  /** Disabled state surfaced to the ± buttons (the mirror disables the input silently). */
  protected readonly fieldDisabled = this.spin.fieldDisabled;

  /** Text of the visually-hidden polite live region (touch-only announcements). */
  protected readonly announced = signal('');

  /** Pointer type of the most recent pointerdown on a ± button, used by afterStep(). */
  private lastPointerType: string | null = null;

  protected increment(): void {
    this.spin.increment();
    this.afterStep();
  }

  protected decrement(): void {
    this.spin.decrement();
    this.afterStep();
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.spin.onKeydown(event);
  }

  protected onBlur(): void {
    this.spin.onBlur();
  }

  protected onPointerDown(event: PointerEvent): void {
    this.lastPointerType = event.pointerType;
  }

  // Pointer helpers never take focus themselves (tabindex=-1 + mousedown default
  // prevented). After a mouse/pen/keyboard-driven click, put focus on the input so
  // the keyboard set is live and assistive tech reads the new value. After a TOUCH
  // tap, do NOT refocus — that would raise the on-screen keypad on every tap — and
  // announce the new value through the polite live region instead.
  private afterStep(): void {
    const touch = this.lastPointerType === 'touch';
    this.lastPointerType = null;
    if (touch) {
      this.announced.set(String(this.internal.value ?? ''));
      return;
    }
    this.field().nativeElement.focus({ preventScroll: true });
  }
}
