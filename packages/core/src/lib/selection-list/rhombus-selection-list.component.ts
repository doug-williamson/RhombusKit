import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import {
  SelectionListMode,
  SelectionListOption,
} from './selection-list.types';

/** Per-instance id seed for the listbox's accessible-name wiring. */
let nextId = 0;

/** Default value-equality; overridden by `compareWith` for object values. */
const defaultCompareWith = (a: unknown, b: unknown): boolean => a === b;

/**
 * `<rhombus-selection-list>` — a data-driven list over Angular Material's list
 * package, in two modes (**D5**):
 *
 * - `mode="selection"` (default) — a **listbox** over `<mat-selection-list>`:
 *   multi-select by default (**D6**, `multiple` = `true`), or single-select. The
 *   value is **always `T[]`** (single-select is a 0/1-length array). Drive it from
 *   reactive forms with `[control]` (binds Material's native CVA directly), or use
 *   the two-way `[(value)]` for lightweight use.
 * - `mode="action"` — a list of buttons over `<mat-action-list>` that fire
 *   `(itemAction)` instead of selecting (menus, navigation-free command rows).
 *
 * Boundary: unlike **Nav List** (navigation — anchors / `routerLink`, one
 * `aria-current` item) this is a *form* control (a listbox of selectable options,
 * or a set of action buttons); Material forbids interactive children inside
 * listbox options, so the two can't be merged. Unlike **Select** (a collapsed
 * dropdown) every option is always visible.
 *
 * ```html
 * <rhombus-selection-list label="Toppings" [options]="opts" [(value)]="picked" />
 * ```
 */
@Component({
  selector: 'rhombus-selection-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatListModule, RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-selection-list.component.scss',
  template: `
    @if (label()) {
      <div class="rhombus-selection-list__label" [id]="labelId">
        {{ label() }}
      </div>
    }

    @if (mode() === 'action') {
      <mat-action-list
        class="rhombus-selection-list rhombus-selection-list--action"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
      >
        @for (opt of options(); track opt.value) {
          <button
            mat-list-item
            type="button"
            [disabled]="opt.disabled ?? false"
            [class.rhombus-selection-list__danger]="opt.danger ?? false"
            (click)="onAction(opt)"
          >
            @if (opt.icon) {
              <rhombus-icon matListItemIcon [name]="opt.icon" />
            }
            <span matListItemTitle>{{ opt.label }}</span>
            @if (opt.description) {
              <span
                matListItemLine
                class="rhombus-selection-list__description"
                >{{ opt.description }}</span
              >
            }
          </button>
        }
      </mat-action-list>
    } @else if (control(); as ctrl) {
      <mat-selection-list
        class="rhombus-selection-list"
        [formControl]="ctrl"
        [multiple]="multiple()"
        [compareWith]="compareWith()"
        [hideSingleSelectionIndicator]="hideSingleSelectionIndicator()"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
        [attr.aria-required]="required() || null"
        (selectionChange)="onSelectionChange($event)"
      >
        @for (opt of options(); track opt.value) {
          <mat-list-option
            [value]="opt.value"
            [disabled]="opt.disabled ?? false"
            [togglePosition]="togglePosition()"
          >
            @if (opt.icon) {
              <rhombus-icon matListItemIcon [name]="opt.icon" />
            }
            <span matListItemTitle>{{ opt.label }}</span>
            @if (opt.description) {
              <span
                matListItemLine
                class="rhombus-selection-list__description"
                >{{ opt.description }}</span
              >
            }
          </mat-list-option>
        }
      </mat-selection-list>
    } @else {
      <mat-selection-list
        class="rhombus-selection-list"
        [multiple]="multiple()"
        [disabled]="disabled()"
        [compareWith]="compareWith()"
        [hideSingleSelectionIndicator]="hideSingleSelectionIndicator()"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-label]="label() ? null : ariaLabel() || null"
        [attr.aria-required]="required() || null"
        (selectionChange)="onLightweightChange($event)"
      >
        @for (opt of options(); track opt.value) {
          <mat-list-option
            [value]="opt.value"
            [selected]="isSelected(opt.value)"
            [disabled]="opt.disabled ?? false"
            [togglePosition]="togglePosition()"
          >
            @if (opt.icon) {
              <rhombus-icon matListItemIcon [name]="opt.icon" />
            }
            <span matListItemTitle>{{ opt.label }}</span>
            @if (opt.description) {
              <span
                matListItemLine
                class="rhombus-selection-list__description"
                >{{ opt.description }}</span
              >
            }
          </mat-list-option>
        }
      </mat-selection-list>
    }
  `,
})
export class RhombusSelectionListComponent<T = string> {
  protected readonly labelId = `rhombus-selection-list-${nextId++}`;

  /** Rows to render: `{ value, label, description?, icon?, disabled?, danger? }`. Defaults to `[]`. */
  readonly options = input<SelectionListOption<T>[]>([]);
  /** `'selection'` (a listbox, default) or `'action'` (a button list). **D5**. */
  readonly mode = input<SelectionListMode>('selection');
  /** Allow multiple selection (selection mode). Defaults to `true` (**D6**). Set once — Material forbids changing it after init. */
  readonly multiple = input(true, { transform: booleanAttribute });
  /** Two-way selected values (lightweight mode); **always `T[]`** (single = 0/1-length). Ignored when `control` is set. */
  readonly value = model<T[]>([]);
  /** Reactive-forms control (selection mode); binds Material's native CVA directly. Disables the standalone `value`/`disabled`. */
  readonly control = input<FormControl<T[] | null> | null>(null);
  /** Disables the whole list in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Reflects `aria-required` on the listbox. Defaults to `false`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Visible list label, linked via `aria-labelledby`; empty (default) for none. */
  readonly label = input<string>('');
  /** Accessible name used when no visible `label` is provided (a listbox must be named). */
  readonly ariaLabel = input<string>('');
  /** Value equality used to match selected values to options. Defaults to `===`. */
  readonly compareWith = input<(a: T, b: T) => boolean>(defaultCompareWith);
  /** Checkbox/radio side within each row. Defaults to `'after'`. */
  readonly togglePosition = input<'before' | 'after'>('after');
  /** Hide the single-select indicator (radio dot). Defaults to `false`. */
  readonly hideSingleSelectionIndicator = input(false, {
    transform: booleanAttribute,
  });

  /** Emits the selected values on every change (both control and lightweight modes). */
  readonly selectionChange = output<T[]>();
  /** Emits the clicked option in `action` mode. */
  readonly itemAction = output<SelectionListOption<T>>();

  protected isSelected(value: T): boolean {
    const compare = this.compareWith();
    return this.value().some((selected) => compare(selected, value));
  }

  protected onSelectionChange(event: MatSelectionListChange): void {
    this.selectionChange.emit(this.selectedValues(event));
  }

  protected onLightweightChange(event: MatSelectionListChange): void {
    const values = this.selectedValues(event);
    this.value.set(values);
    this.selectionChange.emit(values);
  }

  protected onAction(option: SelectionListOption<T>): void {
    this.itemAction.emit(option);
  }

  private selectedValues(event: MatSelectionListChange): T[] {
    return event.source.selectedOptions.selected.map((o) => o.value as T);
  }
}
