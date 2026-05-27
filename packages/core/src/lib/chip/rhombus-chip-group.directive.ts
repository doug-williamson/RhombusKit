import { Directive, computed, effect, inject, input, output } from '@angular/core';
import { MatChipListbox, MatChipListboxChange } from '@angular/material/chips';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Selection semantics:
 *   none     — chips are decorative; selection is disabled at the container level.
 *   single   — single-select listbox (radio semantics).
 *   multiple — multi-select listbox (checkbox semantics).
 */
export type ChipGroupSelection = 'none' | 'single' | 'multiple';

/**
 * `[rhombusChipGroup]` — RhombusKit decoration directive applied to
 * `<mat-chip-listbox>`. Drives Material's `multiple` / `selectable`
 * inputs from a single `selection` enum, and re-emits the listbox's
 * `change` event under `selectionChange`.
 *
 * Applied as a directive (rather than wrapping `<mat-chip-listbox>` in
 * a component) because Material's listbox queries its chip-options via
 * `@ContentChildren`. Wrapping it in another component re-projects the
 * chips through an extra layer of `<ng-content>`, which causes the
 * content query to come up empty -- listbox stays in "decorative" mode,
 * `role="listbox"` never lands, and selection events never fire.
 *
 * Usage:
 *   <mat-chip-listbox rhombusChipGroup selection="single"
 *                     (selectionChange)="onPick($event)">
 *     <mat-chip-option rhombusChip variant="primary" value="draft">
 *       Draft
 *     </mat-chip-option>
 *   </mat-chip-listbox>
 */
@Directive({
  selector: 'mat-chip-listbox[rhombusChipGroup]',
  standalone: true,
  host: {
    class: 'rhombus-chip-group',
  },
})
export class RhombusChipGroupDirective {
  private readonly host = inject(MatChipListbox, { self: true });

  readonly selection = input<ChipGroupSelection>('none');

  readonly selectionChange = output<unknown>();

  private readonly isMultiple = computed(() => this.selection() === 'multiple');
  private readonly isSelectable = computed(() => this.selection() !== 'none');

  constructor() {
    // Sync our selection enum onto the listbox's two boolean inputs whenever
    // it changes. `effect` runs in injection context; binding happens after
    // the host is initialized.
    effect(() => {
      this.host.multiple = this.isMultiple();
      this.host.selectable = this.isSelectable();
    });

    // Forward the listbox's change event under our public name. Tear down
    // on directive destroy; the subscription is bound to the injection
    // context lifetime via takeUntilDestroyed.
    this.host.change
      .pipe(takeUntilDestroyed())
      .subscribe((event: MatChipListboxChange) => {
        if (this.selection() === 'none') return;
        this.selectionChange.emit(event.value);
      });
  }
}
