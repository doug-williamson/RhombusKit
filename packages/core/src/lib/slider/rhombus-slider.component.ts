import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { mirrorControl } from '../forms/mirror-control';

/** A numeric range value produced/consumed by the range-mode slider. */
export interface SliderRange {
  start: number;
  end: number;
}

/** Stable default value-indicator formatter (module-level so OnPush doesn't thrash). */
const IDENTITY_DISPLAY = (value: number): string => `${value}`;

/**
 * `<rhombus-slider>` — wrapper over `<mat-slider>`. Two modes: `single` (one
 * value) and `range` (a `{start, end}` pair). Same control model as the other
 * form controls — `[control]` / `[rangeControl]` for reactive forms, or
 * `[(value)]` / `[(rangeValue)]` otherwise. No ControlValueAccessor.
 *
 * The active track, handle, and value bubble are driven by the `--text-accent`
 * and `--tooltip-*` contract tokens (see the SCSS), so the slider re-skins with
 * the theme. Because two native range thumbs can't bind a single
 * `FormControl<SliderRange>`, range reactive-forms mode mirrors the public
 * control to a private two-thumb group via the shared `mirrorControl` helper.
 *
 * ```html
 * <rhombus-slider [(value)]="volume" ariaLabel="Volume" />
 * <rhombus-slider mode="range" [(rangeValue)]="price" [min]="0" [max]="500" />
 * ```
 */
@Component({
  selector: 'rhombus-slider',
  standalone: true,
  imports: [ReactiveFormsModule, MatSliderModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-slider.component.scss',
  template: `
    <mat-slider
      class="rhombus-slider"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [discrete]="discrete()"
      [showTickMarks]="showTickMarks()"
      [disabled]="sliderDisabled()"
      [displayWith]="displayWith()"
    >
      @if (mode() === 'range') {
        @if (rangeControl(); as rc) {
          <input
            matSliderStartThumb
            [formControl]="internalRange.controls.start"
            [attr.aria-label]="startAriaLabel() || null"
          />
          <input
            matSliderEndThumb
            [formControl]="internalRange.controls.end"
            [attr.aria-label]="endAriaLabel() || null"
          />
        } @else {
          <input
            matSliderStartThumb
            [value]="rangeValue().start"
            (valueChange)="onRangeStart($event)"
            [attr.aria-label]="startAriaLabel() || null"
          />
          <input
            matSliderEndThumb
            [value]="rangeValue().end"
            (valueChange)="onRangeEnd($event)"
            [attr.aria-label]="endAriaLabel() || null"
          />
        }
      } @else {
        @if (control(); as c) {
          <input matSliderThumb [formControl]="c" [attr.aria-label]="ariaLabel() || null" />
        } @else {
          <input
            matSliderThumb
            [value]="value()"
            (valueChange)="valueChange.emit($event)"
            [attr.aria-label]="ariaLabel() || null"
          />
        }
      }
    </mat-slider>
  `,
})
export class RhombusSliderComponent {
  /** `single` (one value) or `range` (a `{start, end}` pair). Defaults to `single`. */
  readonly mode = input<'single' | 'range'>('single');
  /** Lower bound of the track. Defaults to `0`. */
  readonly min = input<number>(0);
  /** Upper bound of the track. Defaults to `100`. */
  readonly max = input<number>(100);
  /** Increment between selectable values (and arrow-key step). Defaults to `1`. */
  readonly step = input<number>(1);
  /** Show the value-indicator bubble on drag/focus. Bare attribute (`discrete`). */
  readonly discrete = input(false, { transform: booleanAttribute });
  /** Render tick marks at each step. Bare attribute (`showTickMarks`). */
  readonly showTickMarks = input(false, { transform: booleanAttribute });
  /** Disables the slider in lightweight mode; ignored when a control is set. Bare attribute. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Formats the value-indicator label (e.g. currency, percent). */
  readonly displayWith = input<(value: number) => string>(IDENTITY_DISPLAY);

  // --- single mode ---
  /** Value in lightweight (`[(value)]`) mode; ignored when `control` is set. */
  readonly value = input<number>(0);
  /** Reactive-forms `FormControl<number>` for single mode; when set, `value`/`disabled` are ignored. */
  readonly control = input<FormControl<number | null> | null>(null);
  /** Accessible name for the single thumb. */
  readonly ariaLabel = input<string>('');

  // --- range mode ---
  /** Range value in lightweight (`[(rangeValue)]`) mode; ignored when `rangeControl` is set. */
  readonly rangeValue = input<SliderRange>({ start: 0, end: 100 });
  /** Reactive-forms `FormControl<SliderRange>` for range mode; when set, `rangeValue`/`disabled` are ignored. */
  readonly rangeControl = input<FormControl<SliderRange> | null>(null);
  /** Accessible name for the range start thumb. Defaults to `'Start'`. */
  readonly startAriaLabel = input<string>('Start');
  /** Accessible name for the range end thumb. Defaults to `'End'`. */
  readonly endAriaLabel = input<string>('End');

  /** Emits on each user change in single lightweight mode (completes `[(value)]`). */
  readonly valueChange = output<number>();
  /** Emits the composed range on each user change in range mode (completes `[(rangeValue)]`). */
  readonly rangeValueChange = output<SliderRange>();

  /** Two-thumb group Material binds to in range reactive-forms mode. */
  protected readonly internalRange = new FormGroup({
    start: new FormControl<number>(0, { nonNullable: true }),
    end: new FormControl<number>(100, { nonNullable: true }),
  });

  /** In lightweight mode the standalone `disabled` applies; a control owns its own disabled state. */
  protected readonly sliderDisabled = computed(() => {
    const hasControl = this.mode() === 'range' ? !!this.rangeControl() : !!this.control();
    return hasControl ? false : this.disabled();
  });

  constructor() {
    // Range reactive-forms: mirror the public FormControl<SliderRange> onto the
    // two-thumb internal group. (Single mode binds [formControl] directly; the
    // mirror is inert when rangeControl is null.) The internal group's value and
    // the public control are always full ranges in practice; the `?? fullRange()`
    // fallbacks only guard a null reset. The default `===` equality is correct —
    // the mirror's sync guard already suppresses echo.
    mirrorControl<SliderRange, { start: number; end: number }>({
      external: this.rangeControl,
      internal: this.internalRange,
      // `toInternal`'s input is the public FormControl value, which may be null
      // (a reset); the internal group's value is always a full range, so the
      // `as SliderRange` casts document that invariant on the write-back side.
      toInternal: (r) => r ?? this.fullRange(),
      toExternal: (v) => v as SliderRange,
      onExternalChange: (r) => this.rangeValueChange.emit(r as SliderRange),
      disabled: this.disabled,
    });
  }

  /** The full [min, max] range — the fallback used when a range value is absent. */
  private fullRange(): SliderRange {
    return { start: this.min(), end: this.max() };
  }

  protected onRangeStart(start: number): void {
    this.rangeValueChange.emit({ start, end: this.rangeValue().end });
  }

  protected onRangeEnd(end: number): void {
    this.rangeValueChange.emit({ start: this.rangeValue().start, end });
  }
}
