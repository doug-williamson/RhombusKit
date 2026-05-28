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
import type { ColumnDef, SortState, PageState } from './data-table.types';
import { RhombusEmptyStateDirective } from './rhombus-empty-state.directive';

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
    <div class="rhombus-data-table">
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
                (click)="onRowClick(row)"
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
  readonly data = input<T[] | DataSource<T>>([]);
  readonly columns = input.required<ColumnDef<T>[]>();
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
  readonly paginated = input<boolean>(true);
  readonly pageSize = input<number>(10);
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  /** Server-side total row count. Supplied by the consumer in server mode. */
  readonly totalCount = input<number | null>(null);

  // --- Empty state ---
  readonly emptyTitle = input<string>('No data');
  readonly emptyMessage = input<string>('There are no items to display.');

  // --- Outputs ---
  readonly sortChange = output<SortState>();
  readonly pageChange = output<PageState>();
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

  protected onRowClick(row: T): void {
    this.rowClick.emit(row);
  }
}
