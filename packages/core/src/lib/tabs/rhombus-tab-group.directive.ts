import { Directive, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabGroup } from '@angular/material/tabs';

/**
 * `[rhombusTabGroup]` — RhombusKit decoration directive applied to
 * `<mat-tab-group>`. Adds a stable host class (the active label + ink-bar are
 * themed through `--text-accent` in `@rhombuskit/material-preset`) and re-emits
 * the group's selection under `tabChange`.
 *
 * Applied as a directive (rather than wrapping `<mat-tab-group>` in a component)
 * because Material discovers its tabs via `@ContentChildren(MatTab)` — wrapping
 * them in another component's `<ng-content>` makes that query come up empty (the
 * same reason chip-group is a directive).
 *
 * ```html
 * <mat-tab-group rhombusTabGroup (tabChange)="onTab($event)">
 *   <mat-tab label="Overview">…</mat-tab>
 *   <mat-tab label="Details">…</mat-tab>
 * </mat-tab-group>
 * ```
 */
@Directive({
  selector: 'mat-tab-group[rhombusTabGroup]',
  standalone: true,
  host: {
    class: 'rhombus-tab-group',
  },
})
export class RhombusTabGroupDirective {
  private readonly host = inject(MatTabGroup, { self: true });

  /** Emits the newly selected tab index. */
  readonly tabChange = output<number>();

  constructor() {
    this.host.selectedIndexChange
      .pipe(takeUntilDestroyed())
      .subscribe((index) => this.tabChange.emit(index));
  }
}
