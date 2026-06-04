import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import type { PageState } from '../data-table/data-table.types';

/**
 * `<rhombus-pagination>` — a standalone MatPaginator wrapper for paginating any
 * collection (not just the data table). It emits the same stable
 * {@link PageState} the data table does, so consumers never import Material's
 * `PageEvent`. Drive it as a controlled component: update `pageIndex` from the
 * emitted `pageChange`.
 *
 * ```html
 * <rhombus-pagination
 *   [length]="total()"
 *   [pageIndex]="page().pageIndex"
 *   [pageSize]="page().pageSize"
 *   (pageChange)="page.set($event)"
 * />
 * ```
 */
@Component({
  selector: 'rhombus-pagination',
  standalone: true,
  imports: [MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-pagination.component.scss',
  template: `
    <mat-paginator
      class="rhombus-pagination"
      [length]="length()"
      [pageIndex]="pageIndex()"
      [pageSize]="pageSize()"
      [pageSizeOptions]="pageSizeOptions()"
      [hidePageSize]="hidePageSize()"
      [showFirstLastButtons]="showFirstLastButtons()"
      [disabled]="disabled()"
      (page)="onPage($event)"
    />
  `,
})
export class RhombusPaginationComponent {
  /** Total number of items across all pages. */
  readonly length = input<number>(0);
  /** Zero-based index of the current page. */
  readonly pageIndex = input<number>(0);
  /** Items per page. */
  readonly pageSize = input<number>(10);
  /** Selectable page sizes. */
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  /** Hide the page-size selector. */
  readonly hidePageSize = input<boolean>(false);
  /** Show the first/last-page buttons. Defaults to `true`. */
  readonly showFirstLastButtons = input<boolean>(true);
  /** Disable all controls. */
  readonly disabled = input<boolean>(false);

  /** Emits on page-index or page-size change. */
  readonly pageChange = output<PageState>();

  protected onPage(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      length: event.length,
    });
  }
}
