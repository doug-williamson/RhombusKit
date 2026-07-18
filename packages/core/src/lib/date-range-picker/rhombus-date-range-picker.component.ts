import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { mirrorControl } from '../forms/mirror-control';
import { dateToIso, isoToDate } from '../date-picker/rhombus-date-picker.component';

/** The ISO `YYYY-MM-DD` start/end pair the range picker emits and consumes. */
export interface DateRange {
  start: string | null;
  end: string | null;
}

/** Typed reactive-forms group for the range picker's `[control]` input (ISO strings). */
export type DateRangeControl = FormGroup<{
  start: FormControl<string | null>;
  end: FormControl<string | null>;
}>;

/**
 * `<rhombus-date-range-picker>` — a two-field start/end calendar over Material's
 * `<mat-date-range-input>` + `<mat-date-range-picker>`, in the same form-field
 * shell as Input / Select / Date Picker. Its public value is a plain
 * `{ start, end }` pair of ISO `YYYY-MM-DD` strings, so it drops straight into a
 * reactive form. Material works in `Date`, so the public group is mirrored to a
 * private Date-typed group (local-midnight, sharing the Date Picker's
 * `isoToDate` / `dateToIso`) via the shared `mirrorControl` helper. No
 * ControlValueAccessor. Self-provides `provideNativeDateAdapter()`.
 *
 * ```html
 * <rhombus-date-range-picker label="Reporting window" [control]="rangeGroup" />
 * ```
 */
@Component({
  selector: 'rhombus-date-range-picker',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-date-range-picker.component.scss',
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>{{ label() }}</mat-label>

      <mat-date-range-input
        [formGroup]="internal"
        [rangePicker]="picker"
        [min]="minDate()"
        [max]="maxDate()"
        [separator]="separator()"
        [required]="required()"
      >
        <input matStartDate formControlName="start" [placeholder]="startPlaceholder()" />
        <input matEndDate formControlName="end" [placeholder]="endPlaceholder()" />
      </mat-date-range-input>
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-date-range-picker #picker />

      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      <mat-error>
        <ng-content select="[rhombusError]" />
      </mat-error>
    </mat-form-field>
  `,
})
export class RhombusDateRangePickerComponent {
  /** Floating `<mat-label>` text; the field group's accessible name — always supply one. */
  readonly label = input<string>('');
  /** Placeholder for the start input. Defaults to `'Start date'`. */
  readonly startPlaceholder = input<string>('Start date');
  /** Placeholder for the end input. Defaults to `'End date'`. */
  readonly endPlaceholder = input<string>('End date');
  /** Visual separator rendered between the two inputs. Defaults to an en dash. */
  readonly separator = input<string>('–');
  /** Form-field appearance, mapped to Material's `outline` (default) or `fill`. */
  readonly appearance = input<FormFieldAppearance>('outline');
  /** Density scale applied via host classes; defaults to `md`. */
  readonly size = input<FormFieldSize>('md');
  /** Disables both endpoints in lightweight mode; ignored when `control` is set. */
  readonly disabled = input<boolean>(false);
  /** Marks the field required for validation/ARIA. Defaults to `false`. */
  readonly required = input<boolean>(false);
  /** Subscript hint text; `null` (default) hides the hint. */
  readonly hint = input<string | null>(null);
  /** Whether subscript space is reserved (`fixed`) or collapses (`dynamic`, default). */
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  /** Earliest selectable date as ISO `YYYY-MM-DD`; `null` (default) for no lower bound. */
  readonly min = input<string | null>(null);
  /** Latest selectable date as ISO `YYYY-MM-DD`; `null` (default) for no upper bound. */
  readonly max = input<string | null>(null);
  /** Reactive-forms group of ISO start/end strings; when set, `disabled` is ignored. */
  readonly control = input<DateRangeControl | null>(null);

  /** Emits the current `{ start, end }` ISO pair on every user change to either endpoint. */
  readonly rangeChange = output<DateRange>();

  /** Date-typed group Material's range input binds to; mirrors {@link control}. */
  protected readonly internal = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  protected readonly minDate = computed(() => isoToDate(this.min()));
  protected readonly maxDate = computed(() => isoToDate(this.max()));

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );

  constructor() {
    // Mirror the public ISO group to the private Date group, converting each
    // endpoint at the boundary (local-midnight, via the shared helpers). isoToDate
    // / dateToIso already handle null/undefined, so the converters stay branch-lean;
    // the default `===` equality is correct — the mirror's sync guard suppresses echo.
    // Both the external and internal controls are FormGroups, so their `.value`
    // is always an object (never null — only the endpoints are nullable); the
    // `as` casts document that invariant, and isoToDate/dateToIso handle the
    // nullable endpoints.
    mirrorControl<DateRange, { start: Date | null; end: Date | null }>({
      external: this.control,
      internal: this.internal,
      toInternal: (v) => {
        const iso = v as DateRange;
        return { start: isoToDate(iso.start), end: isoToDate(iso.end) };
      },
      toExternal: (v) => {
        const dates = v as { start: Date | null; end: Date | null };
        return { start: dateToIso(dates.start), end: dateToIso(dates.end) };
      },
      onExternalChange: (v) => this.rangeChange.emit(v as DateRange),
      disabled: this.disabled,
    });
  }
}
