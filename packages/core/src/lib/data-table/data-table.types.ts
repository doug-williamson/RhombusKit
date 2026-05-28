import type { TemplateRef } from '@angular/core';

/**
 * Column configuration for `<rhombus-data-table>`. `key` indexes into the row
 * object for the default cell renderer; supply `cellTemplate` to take over
 * rendering for a column (status badges, action buttons, etc.).
 */
export interface ColumnDef<T> {
  key: keyof T & string;
  header: string;
  width?: string;
  minWidth?: string;
  align?: 'start' | 'center' | 'end';
  /** Hide this column below the named breakpoint (sm=640px, md=768px). */
  hideBelow?: 'sm' | 'md';
  cellTemplate?: TemplateRef<{ $implicit: T; index: number }>;
  sortable?: boolean;
}

/** Emitted on header sort. Mirrors Material's `Sort` so consumers need not
 * import from `@angular/material`. */
export interface SortState {
  active: string;
  direction: 'asc' | 'desc' | '';
}

/** Emitted on paginator change. */
export interface PageState {
  pageIndex: number;
  pageSize: number;
  length: number;
}
