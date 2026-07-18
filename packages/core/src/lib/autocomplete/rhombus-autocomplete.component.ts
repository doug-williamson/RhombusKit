import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounce, timer } from 'rxjs';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { mirrorControl } from '../forms/mirror-control';

/** A single autocomplete option: the committed `value` plus its visible `label`. */
export interface AutocompleteOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** Predicate deciding whether an option matches the current query text. */
export type AutocompleteFilterFn<T = string> = (
  option: AutocompleteOption<T>,
  query: string
) => boolean;

/** Maps the control value (a picked `T` or free-text `string`) to the input's display text. */
export type AutocompleteDisplayFn<T = string> = (
  value: T | string | null
) => string;

/** Default filter: case-insensitive substring match against the option label. */
const defaultLabelFilter: AutocompleteFilterFn<unknown> = (option, query) =>
  option.label.toLowerCase().includes(query.toLowerCase());

/**
 * `<rhombus-autocomplete>` — wrapper over `<mat-form-field>` + `<input matInput>`
 * + `<mat-autocomplete>`, consistent with `<rhombus-input>` / `<rhombus-select>`.
 *
 * Generic over the option value type `T`. Feed it an `options` array; it filters
 * client-side with the built-in label-substring `filterWith` (override it, or set
 * `filterWith` to `null` and drive the panel from `queryChange` for server-side
 * search). With `requireSelection=false` (the default, **D4**) it is a free-text
 * combobox — the bound control holds either a picked `T` or the typed `string`, so
 * its type is `FormControl<T | string | null>`. No ControlValueAccessor: pass a
 * `FormControl` via `control`, like the other form primitives.
 *
 * The component owns an internal control bound to the input; the public `control`
 * is mirrored to it via the shared {@link mirrorControl} helper (identity mapping —
 * the public and Material-bound value types are the same), which supplies the
 * sync guard, disabled mirroring, and re-subscribe-on-swap machinery.
 *
 *   <rhombus-autocomplete label="Fruit" [options]="fruits" [control]="fruitCtrl" />
 *
 * Projected slots (found by Material's descendants:true queries):
 *   <mat-icon matIconPrefix>…</mat-icon>   leading affordance
 *   <button matIconSuffix>…</button>       trailing affordance
 *   <span rhombusError>…</span>            error subscript text
 */
@Component({
  selector: 'rhombus-autocomplete',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-autocomplete.component.scss',
  template: `
    <mat-form-field
      [appearance]="appearance() === 'outline' ? 'outline' : 'fill'"
      [class]="hostClasses()"
      [subscriptSizing]="subscriptSizing()"
    >
      <mat-label>{{ label() }}</mat-label>

      <ng-content select="[matPrefix]" />
      <ng-content select="[matIconPrefix]" />
      <ng-content select="[matTextPrefix]" />

      <input
        matInput
        [formControl]="internal"
        [matAutocomplete]="auto"
        [placeholder]="placeholder()"
        [required]="required()"
        (input)="onInput($event)"
      />

      <ng-content select="[matSuffix]" />
      <ng-content select="[matIconSuffix]" />
      <ng-content select="[matTextSuffix]" />

      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      <mat-error>
        <ng-content select="[rhombusError]" />
      </mat-error>
    </mat-form-field>

    <mat-autocomplete
      #auto
      [displayWith]="displayWith()"
      [autoActiveFirstOption]="autoActiveFirstOption()"
      [requireSelection]="requireSelection()"
      panelClass="rhombus-autocomplete-panel"
      (optionSelected)="onOptionSelected($event)"
    >
      @if (loading()) {
        <mat-option disabled class="rhombus-autocomplete__status">
          Loading…
        </mat-option>
      } @else if (filteredOptions().length === 0) {
        <mat-option disabled class="rhombus-autocomplete__status">
          {{ noResultsText() }}
        </mat-option>
      } @else {
        @for (opt of filteredOptions(); track opt.value) {
          <mat-option [value]="opt.value" [disabled]="opt.disabled ?? false">
            {{ opt.label }}
          </mat-option>
        }
      }
    </mat-autocomplete>

    <span class="rhombus-autocomplete__live" aria-live="polite">{{
      liveMessage()
    }}</span>
  `,
})
export class RhombusAutocompleteComponent<T = string> {
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
  /** Options to render; filtered by `filterWith`. Defaults to `[]`. */
  readonly options = input<AutocompleteOption<T>[]>([]);
  /**
   * Predicate used to filter `options` against the typed query. Defaults to a
   * case-insensitive label-substring match. Set to `null` to disable local
   * filtering and treat `options` as already filtered (server-side search via
   * `queryChange`).
   */
  readonly filterWith = input<AutocompleteFilterFn<T> | null>(
    defaultLabelFilter as AutocompleteFilterFn<T>
  );
  /** Maps the control value to the input's display text; required for object-valued `T`. */
  readonly displayWith = input<AutocompleteDisplayFn<T> | null>(null);
  /** Highlight the first option so Enter selects it. Defaults to `true`. */
  readonly autoActiveFirstOption = input(true, { transform: booleanAttribute });
  /** Force a selection from the list (clears free text on blur). Defaults to `false` (**D4**). */
  readonly requireSelection = input(false, { transform: booleanAttribute });
  /** Minimum query length before the panel filters / `queryChange` fires. Defaults to `0`. */
  readonly minChars = input<number>(0);
  /** Debounce applied to `queryChange`, in ms. Defaults to `0`. */
  readonly debounceMs = input<number>(0);
  /** Shows a themed loading option in the panel. Defaults to `false`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Text of the empty-state option shown when nothing matches. Defaults to `'No results'`. */
  readonly noResultsText = input<string>('No results');
  /** Reactive-forms control (a picked `T` or free-text `string`); disables the standalone `disabled`. */
  readonly control = input<FormControl<T | string | null> | null>(null);

  /** Emits the picked option's value when the user selects from the list. */
  readonly optionSelected = output<T>();
  /** Emits the debounced query text as the user types — the server-search hook. */
  readonly queryChange = output<string>();

  /** The control bound to the inner input; the public `control` mirrors onto it. */
  protected readonly internal = new FormControl<T | string | null>(null);

  /** Current query text, updated on every keystroke; drives local filtering. */
  private readonly query = signal('');
  private readonly typed = new Subject<string>();

  protected readonly filteredOptions = computed(() => {
    const options = this.options();
    const filterFn = this.filterWith();
    if (filterFn === null) return options;
    const query = this.query();
    if (query.length < this.minChars()) return [];
    if (query === '') return options;
    return options.filter((option) => filterFn(option, query));
  });

  /** Announced in the visually-hidden live region (disabled options aren't reliably read). */
  protected readonly liveMessage = computed(() => {
    if (this.loading()) return 'Loading results';
    const count = this.filteredOptions().length;
    if (count === 0) return this.query() ? this.noResultsText() : '';
    return `${count} result${count === 1 ? '' : 's'} available`;
  });

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );

  constructor() {
    mirrorControl<T | string, T | string>({
      external: this.control,
      internal: this.internal,
      toInternal: (value) => value,
      toExternal: (value) => value,
      disabled: this.disabled,
    });

    // Debounced, min-length-gated query emission for server-side search. Driven
    // by the native input event so a programmatic selection never looks typed.
    this.typed
      .pipe(
        debounce(() => timer(this.debounceMs())),
        takeUntilDestroyed()
      )
      .subscribe((text) => {
        if (text.length >= this.minChars()) {
          this.queryChange.emit(text);
        }
      });
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    this.typed.next(text);
  }

  protected onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.optionSelected.emit(event.option.value as T);
  }
}
