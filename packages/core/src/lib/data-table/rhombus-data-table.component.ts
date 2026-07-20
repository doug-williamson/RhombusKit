import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChild,
  effect,
  input,
  isDevMode,
  output,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataSource } from '@angular/cdk/collections';
import type { RhombusDensity } from '../density/density.types';
import type { ColumnDef, SortState, PageState } from './data-table.types';
import { RhombusEmptyStateDirective } from './rhombus-empty-state.directive';

/**
 * Elements whose click is their own action, not a row selection. A row click
 * that bubbles up from one of these (or a descendant) is ignored, so an
 * actions/overflow button or link inside a cell doesn't also "open the row".
 */
const INTERACTIVE_ELEMENT_SELECTOR =
  'a[href], button, input, select, textarea, label, ' +
  '[role="button"], [role="link"], [role="menuitem"], ' +
  '[role="checkbox"], [role="switch"], [contenteditable="true"]';

/**
 * `<rhombus-data-table>` — config-driven table with a `cellTemplate` escape
 * hatch. Auto-detects its mode from the `data` input type: a plain array runs
 * client-side (Material handles sort + pagination); a `DataSource` runs
 * server-side (the consumer reacts to `sortChange`/`pageChange` and refetches).
 *
 * Loading and empty are distinct rendering paths: the empty block renders only
 * when `!loading() && isEmpty()`, so an in-flight fetch never flashes "No data".
 */
@Component({
  selector: 'rhombus-data-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-data-table.component.scss',
  template: `
    <div class="rhombus-data-table" [attr.data-density]="density() ?? null">
      <div class="rhombus-data-table__scroll">
        <table
          mat-table
          [dataSource]="resolvedDataSource()"
          matSort
          [matSortActive]="activeSortColumn()"
          [matSortDirection]="activeSortDirection()"
          [matSortStart]="sortStart()"
          (matSortChange)="onSortChange($event)"
          class="rhombus-data-table__table"
        >
          @for (col of columns(); track col.key) {
            <ng-container [matColumnDef]="col.key">
              <th
                mat-header-cell
                *matHeaderCellDef
                [mat-sort-header]="col.key"
                [disabled]="!col.sortable"
                [style.width]="col.width"
                [style.min-width]="col.minWidth"
                [class]="
                  'rhombus-data-table__header rhombus-data-table__header--' +
                  (col.align ?? 'start')
                "
                [class.rhombus-data-table__col--hide-sm]="col.hideBelow === 'sm'"
                [class.rhombus-data-table__col--hide-md]="col.hideBelow === 'md'"
              >
                {{ col.header }}
              </th>
              <td
                mat-cell
                *matCellDef="let row; let i = index"
                [style.width]="col.width"
                [style.min-width]="col.minWidth"
                [class]="
                  'rhombus-data-table__cell rhombus-data-table__cell--' +
                  (col.align ?? 'start')
                "
                [class.rhombus-data-table__col--hide-sm]="col.hideBelow === 'sm'"
                [class.rhombus-data-table__col--hide-md]="col.hideBelow === 'md'"
                (click)="onRowClick(row, $event)"
              >
                @if (col.cellTemplate) {
                  <ng-container
                    [ngTemplateOutlet]="col.cellTemplate"
                    [ngTemplateOutletContext]="{ $implicit: row, index: i }"
                  />
                } @else {
                  {{ row[col.key] }}
                }
              </td>
            </ng-container>
          }

          <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns()"
            class="rhombus-data-table__row rhombus-data-table__row--clickable"
          ></tr>
        </table>
      </div>

      @if (loading()) {
        <div class="rhombus-data-table__loading">
          <mat-spinner [diameter]="32" />
        </div>
      }

      @if (!loading() && isEmpty()) {
        <div class="rhombus-data-table__empty">
          @if (hasEmptyState()) {
            <ng-content select="[rhombusEmptyState]" />
          } @else {
            <div class="rhombus-data-table__empty-default">
              <h3>{{ emptyTitle() }}</h3>
              <p>{{ emptyMessage() }}</p>
              <ng-content select="[slot=empty-action]" />
            </div>
          }
        </div>
      }

      @if (showPaginator()) {
        <mat-paginator
          [length]="paginatorLength()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="pageSizeOptions()"
          (page)="onPageChange($event)"
          class="rhombus-data-table__paginator"
        />
      }
    </div>
  `,
})
export class RhombusDataTableComponent<T> {
  // --- Data ---
  /** Row data: a plain array runs client-side; a `DataSource` runs server-side. */
  readonly data = input<T[] | DataSource<T>>([]);
  /** Column definitions describing key, header, and per-column behaviour (required). */
  readonly columns = input.required<ColumnDef<T>[]>();
  /** When true, shows a spinner and suppresses the empty-state block. */
  readonly loading = input<boolean>(false);

  // --- Sort ---
  /** `'internal'` (default): the table owns client-side sort order via
   * `MatTableDataSource.sort`. `'controlled'`: the consumer owns order; the table
   * uses `MatSort` for the header affordance only and never reorders the data. */
  readonly sortMode = input<'internal' | 'controlled'>('internal');
  /** Consumer-owned sort state, reflected into `MatSort`. Read only in controlled mode. */
  readonly sortState = input<SortState | null>(null);
  /** Direction a column sorts to when first activated. */
  readonly sortStart = input<'asc' | 'desc'>('asc');

  // --- Pagination ---
  /** Whether to render the paginator. Defaults to `true`. */
  readonly paginated = input<boolean>(true);
  /** Rows per page. Defaults to `10`. */
  readonly pageSize = input<number>(10);
  /** Selectable page-size options. Defaults to `[5, 10, 25, 50]`. */
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  /** Server-side total row count. Supplied by the consumer in server mode. */
  readonly totalCount = input<number | null>(null);

  // --- Empty state ---
  /** Heading for the default empty state. Defaults to `'No data'`. */
  readonly emptyTitle = input<string>('No data');
  /** Body text for the default empty state. */
  readonly emptyMessage = input<string>('There are no items to display.');

  // --- Density ---
  /**
   * Table-local density. Overrides the app-wide `provideRhombusDensity()` level
   * for this table only — including `'default'`, which restores default geometry
   * inside a globally-compact app. `'dense'` is table-only (36px rows): it has no
   * global equivalent because it drops below every other component's floor.
   *
   * Leave unset to inherit the app-wide level.
   */
  readonly density = input<RhombusDensity | 'dense' | undefined>(undefined);

  // --- Outputs ---
  /** Emits the new sort state whenever the active column or direction changes. */
  readonly sortChange = output<SortState>();
  /** Emits the new page state whenever the page index or size changes. */
  readonly pageChange = output<PageState>();
  /** Emits the row whose non-interactive area was clicked. */
  readonly rowClick = output<T>();

  // --- Queries ---
  private readonly matSort = viewChild(MatSort);
  private readonly matPaginator = viewChild(MatPaginator);
  private readonly emptyState = contentChild(RhombusEmptyStateDirective);

  /** Persistent client-side data source; reused so the table keeps its
   * MatSort/MatPaginator wiring across data updates. */
  private readonly clientDataSource = new MatTableDataSource<T>([]);

  protected readonly isServerMode = computed(() => !Array.isArray(this.data()));

  protected readonly resolvedDataSource = computed<
    MatTableDataSource<T> | DataSource<T>
  >(() => {
    const d = this.data();
    return Array.isArray(d) ? this.clientDataSource : d;
  });

  protected readonly displayedColumns = computed(() =>
    this.columns().map((c) => c.key)
  );

  // Reflect consumer sort state into MatSort only in controlled mode. In internal
  // mode these resolve empty so MatSort manages its own state as before.
  protected readonly activeSortColumn = computed(() =>
    this.sortMode() === 'controlled' ? this.sortState()?.active ?? '' : ''
  );
  protected readonly activeSortDirection = computed<'asc' | 'desc' | ''>(() =>
    this.sortMode() === 'controlled' ? this.sortState()?.direction ?? '' : ''
  );

  protected readonly isEmpty = computed(() => {
    const d = this.data();
    if (Array.isArray(d)) return d.length === 0;
    return this.totalCount() === 0;
  });

  protected readonly hasEmptyState = computed(() => !!this.emptyState());

  protected readonly showPaginator = computed(
    () => this.paginated() && !this.loading() && !this.isEmpty()
  );

  protected readonly paginatorLength = computed(() => {
    if (this.isServerMode()) return this.totalCount() ?? 0;
    const d = this.data();
    return Array.isArray(d) ? d.length : 0;
  });

  constructor() {
    // Keep client data assignment out of the (pure) resolvedDataSource computed.
    effect(() => {
      const d = this.data();
      if (Array.isArray(d)) {
        this.clientDataSource.data = d;
      }
    });

    // Wire client-side sort/paginator once their view queries resolve. In
    // server mode these are no-ops — the consumer drives sort/page via outputs.
    // The paginator renders conditionally, so an effect (not ngAfterViewInit)
    // is required to catch it when it appears. Sort is wired ONLY in internal
    // mode; controlled mode uses MatSort for the affordance but never binds it
    // to the data source. Pagination is independent of sort mode.
    effect(() => {
      if (this.isServerMode()) return;
      this.clientDataSource.sort =
        this.sortMode() === 'internal' ? this.matSort() ?? null : null;
      this.clientDataSource.paginator = this.paginated()
        ? this.matPaginator() ?? null
        : null;
    });

    // A DataSource owns its own data; the table cannot sort it. internal mode
    // with a DataSource is a silent-coercion trap, so fail loudly in dev.
    effect(() => {
      if (isDevMode() && this.isServerMode() && this.sortMode() === 'internal') {
        throw new Error(
          '[rhombus-data-table] sortMode="internal" is invalid with a DataSource. ' +
            'A DataSource owns its own data; the table cannot sort it. ' +
            'Use sortMode="controlled" and handle (sortChange) to re-fetch sorted data.'
        );
      }
    });
  }

  protected onSortChange(sort: Sort): void {
    this.sortChange.emit({ active: sort.active, direction: sort.direction });
    // Internal mode: clientDataSource.sort has already reordered the data.
    // Controlled / server mode: we do NOTHING to the data — the consumer reacts
    // to this event and supplies the new order (or refetches).
  }

  protected onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      length: event.length,
    });
  }

  protected onRowClick(row: T, event: Event): void {
    // Every body cell carries this handler, so a click that bubbles up from an
    // interactive element a consumer renders in a cell (an actions/overflow
    // button, a link, a form control) would otherwise fire rowClick too — e.g.
    // opening the row when the user only meant to open its menu. Treat such a
    // click as the element's own action, not a row selection. Consumers can
    // still stopPropagation for bespoke interactive content.
    if (
      (event.target as HTMLElement | null)?.closest(INTERACTIVE_ELEMENT_SELECTOR)
    ) {
      return;
    }
    this.rowClick.emit(row);
  }
}
