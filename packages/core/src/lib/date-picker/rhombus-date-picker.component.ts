import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';

/**
 * Parse a strict ISO calendar date (`YYYY-MM-DD`) into a **local-midnight** Date.
 *
 * Uses the multi-arg `Date(y, m, d)` constructor (local time), never
 * `new Date(iso)` — the single-string form parses as UTC, so in a negative-offset
 * zone it lands on the previous day's evening and the calendar shows the wrong
 * date. Returns null for empty input, malformed strings, and impossible dates
 * (e.g. `2026-02-31`, which would otherwise roll over to March).
 */
export function isoToDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const date = new Date(year, month - 1, day);
  // Reject rolled-over dates (Date silently normalises out-of-range fields).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Format a Date as a strict ISO calendar date (`YYYY-MM-DD`) using its **local**
 * fields — the mirror of {@link isoToDate}. Never uses `toISOString()` (UTC),
 * which would shift the day in non-UTC zones. Returns null for null/invalid dates.
 */
export function dateToIso(date: Date | null | undefined): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * `<rhombus-date-picker>` — wrapper over `<mat-form-field>` + `<input matInput>`
 * + `<mat-datepicker>`, consistent with `<rhombus-input>` / `<rhombus-select>`.
 *
 * The public value semantics are **`string | null`** (ISO `YYYY-MM-DD`), so it
 * drops into a reactive form beside the other RhombusKit controls. Material's
 * datepicker works in `Date`, so the component mirrors the public
 * `FormControl<string | null>` to a private `FormControl<Date | null>` and
 * converts at the boundary (local-midnight, see {@link isoToDate}). No
 * ControlValueAccessor — pass a FormControl via `control`, like the other
 * controls. `min` / `max` are ISO strings too.
 *
 * The component self-provides `provideNativeDateAdapter()`, so it is drop-in with
 * no app-level setup. The displayed text is locale-formatted by the adapter; the
 * value the form sees is always ISO.
 *
 *   <rhombus-date-picker label="Publish date" [control]="dateCtrl" min="2026-01-01" />
 */
@Component({
  selector: 'rhombus-date-picker',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-date-picker.component.scss',
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>{{ label() }}</mat-label>

      <input
        matInput
        [matDatepicker]="picker"
        [formControl]="internal"
        [min]="minDate()"
        [max]="maxDate()"
        [required]="required()"
        [placeholder]="placeholder()"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker #picker />

      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      <mat-error>
        <ng-content select="[rhombusError]" />
      </mat-error>
    </mat-form-field>
  `,
})
export class RhombusDatePickerComponent {
  /** Floating `<mat-label>` text; empty (default) for no label. */
  readonly label = input<string>('');
  /** Placeholder shown when the field is empty. */
  readonly placeholder = input<string>('');
  /** Form-field appearance, mapped to Material's `outline` (default) or `fill`. */
  readonly appearance = input<FormFieldAppearance>('outline');
  /** Density scale applied via host classes; defaults to `md`. */
  readonly size = input<FormFieldSize>('md');
  /** Disables the field in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Marks the field required for validation/ARIA. Defaults to `false`. */
  readonly required = input<boolean>(false);
  /** Subscript hint text shown below the field; `null` (default) hides the hint. */
  readonly hint = input<string | null>(null);
  /** Whether subscript space is reserved (`fixed`) or collapses (`dynamic`, default). */
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  /** Earliest selectable date as ISO `YYYY-MM-DD`; `null` (default) for no lower bound. */
  readonly min = input<string | null>(null);
  /** Latest selectable date as ISO `YYYY-MM-DD`; `null` (default) for no upper bound. */
  readonly max = input<string | null>(null);
  /** Reactive-forms `FormControl<string | null>` (ISO); when set, the standalone `disabled` input is ignored. */
  readonly control = input<FormControl<string | null> | null>(null);

  /** Emits the selected date as ISO `YYYY-MM-DD` (or `null` when cleared) on user change. */
  readonly dateChange = output<string | null>();

  /** The Date-typed control bound to Material's datepicker; mirrors {@link control}. */
  protected readonly internal = new FormControl<Date | null>(null);

  /** Guards the internal↔public sync so a programmatic write can't echo back. */
  private syncing = false;

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
    // Internal → public: the user picked/typed/cleared a date. Convert to ISO,
    // push it to the bound control (emitEvent so validators + consumers react),
    // and emit dateChange. Skipped while we're seeding the internal control.
    this.internal.valueChanges.pipe(takeUntilDestroyed()).subscribe((date) => {
      if (this.syncing) return;
      const iso = dateToIso(date);
      const ctrl = this.control();
      if (ctrl && ctrl.value !== iso) {
        ctrl.setValue(iso);
      }
      this.dateChange.emit(iso);
    });

    // Public → internal: seed from the bound control and follow its external
    // value / disabled changes. Re-runs when the control instance is swapped.
    effect((onCleanup) => {
      const ctrl = this.control();
      if (!ctrl) return;
      this.writeInternal(isoToDate(ctrl.value), ctrl.disabled);
      const valueSub = ctrl.valueChanges.subscribe((v) =>
        this.writeInternal(isoToDate(v), ctrl.disabled)
      );
      const statusSub = ctrl.statusChanges.subscribe(() =>
        this.setInternalDisabled(ctrl.disabled)
      );
      onCleanup(() => {
        valueSub.unsubscribe();
        statusSub.unsubscribe();
      });
    });

    // Lightweight mode (no control): mirror the `disabled` input.
    effect(() => {
      if (this.control()) return;
      this.setInternalDisabled(this.disabled());
    });
  }

  /** Seed the internal control's value + disabled state without echoing back. */
  private writeInternal(date: Date | null, disabled: boolean): void {
    this.syncing = true;
    this.internal.setValue(date, { emitEvent: false });
    this.setInternalDisabled(disabled);
    this.syncing = false;
  }

  /** Toggle the internal control's disabled state without emitting events. */
  private setInternalDisabled(disabled: boolean): void {
    const wasSyncing = this.syncing;
    this.syncing = true;
    if (disabled && !this.internal.disabled) {
      this.internal.disable({ emitEvent: false });
    } else if (!disabled && this.internal.disabled) {
      this.internal.enable({ emitEvent: false });
    }
    this.syncing = wasSyncing;
  }
}
