import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';

/** A single segment: `value` plus a `label` (and optional `icon` / `disabled` / `ariaLabel`). */
export interface SegmentOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** A `provideRhombusIcons()` registry name rendered before the label. */
  icon?: string;
  /** Accessible name for an icon-only segment (required when `label` is empty). */
  ariaLabel?: string;
}

/** Segmented control density. */
export type SegmentedSize = 'sm' | 'md' | 'lg';

let nextId = 0;

/**
 * `<rhombus-segmented>` — a connected group of mutually-exclusive toggle buttons
 * for switching a view, unit, or mode inline (List / Grid / Board, °C / °F).
 * Wraps `<mat-button-toggle-group>`, driven by an `options` array like Select and
 * Radio Group, with the same `[control]` / `[(value)]` control model. Opt into
 * `multiple` for a small toggle-button toolbar. No ControlValueAccessor.
 *
 * The active segment uses the `--nav-active-*` contract pair, so it re-skins with
 * the theme. Unlike a Radio Group it is a compact inline switcher; unlike a Chip
 * group it is not a set of removable filters.
 *
 * ```html
 * <rhombus-segmented [options]="views" [(value)]="view" ariaLabel="Layout" />
 * ```
 */
@Component({
  selector: 'rhombus-segmented',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonToggleModule, RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-segmented.component.scss',
  template: `
    @if (label()) {
      <label class="rhombus-segmented__label" [id]="labelId">{{ label() }}</label>
    }
    @if (control(); as ctrl) {
      <mat-button-toggle-group
        [class]="hostClasses()"
        [formControl]="ctrl"
        [multiple]="multiple()"
        [vertical]="vertical()"
        [hideSingleSelectionIndicator]="true"
        [hideMultipleSelectionIndicator]="true"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
      >
        @for (opt of options(); track opt.value) {
          <mat-button-toggle
            [value]="opt.value"
            [disabled]="opt.disabled ?? false"
            [attr.aria-label]="opt.ariaLabel ?? null"
          >
            <span class="rhombus-segmented__content">
              @if (opt.icon) {
                <rhombus-icon [name]="opt.icon" size="sm" />
              }
              @if (opt.label) {
                <span>{{ opt.label }}</span>
              }
            </span>
          </mat-button-toggle>
        }
      </mat-button-toggle-group>
    } @else {
      <mat-button-toggle-group
        [class]="hostClasses()"
        [value]="value()"
        [disabled]="disabled()"
        [multiple]="multiple()"
        [vertical]="vertical()"
        [hideSingleSelectionIndicator]="true"
        [hideMultipleSelectionIndicator]="true"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
        (change)="valueChange.emit($event.value)"
      >
        @for (opt of options(); track opt.value) {
          <mat-button-toggle
            [value]="opt.value"
            [disabled]="opt.disabled ?? false"
            [attr.aria-label]="opt.ariaLabel ?? null"
          >
            <span class="rhombus-segmented__content">
              @if (opt.icon) {
                <rhombus-icon [name]="opt.icon" size="sm" />
              }
              @if (opt.label) {
                <span>{{ opt.label }}</span>
              }
            </span>
          </mat-button-toggle>
        }
      </mat-button-toggle-group>
    }
  `,
})
export class RhombusSegmentedComponent<T = string> {
  protected readonly labelId = `rhombus-segmented-${nextId++}`;

  /** Segments to render: `{ value, label, disabled?, icon?, ariaLabel? }`. Defaults to `[]`. */
  readonly options = input<SegmentOption<T>[]>([]);
  /** Selected value (single) or values (multiple) in lightweight mode; ignored when `control` is set. */
  readonly value = input<T | T[] | null>(null);
  /** Reactive-forms control; when set, `value`/`disabled` are ignored. Loosely typed (single carries `T`, multiple `T[]`). */
  readonly control = input<FormControl | null>(null);
  /** Multi-select toolbar mode: `value` becomes an array. Bare attribute (`multiple`). */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Disables the whole group in lightweight mode; ignored when `control` is set. Bare attribute. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Density preset applied via host class. Defaults to `md`. */
  readonly size = input<SegmentedSize>('md');
  /** Stretch segments to equal widths filling the container. Bare attribute (`fullWidth`). */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Stack segments vertically (Material passthrough). Bare attribute (`vertical`). */
  readonly vertical = input(false, { transform: booleanAttribute });
  /** Visible group label, linked via `aria-labelledby`. */
  readonly label = input<string>('');
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string>('');

  /** Emits the newly selected value (single) or values (multiple) on user change (lightweight mode). */
  readonly valueChange = output<T | T[] | null>();

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-segmented',
      `rhombus-segmented--${this.size()}`,
      this.fullWidth() ? 'rhombus-segmented--full-width' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );
}
