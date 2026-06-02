import type { TemplateRef } from '@angular/core';

/**
 * Fields shared by every `<rhombus-data-table>` column, independent of whether
 * the column is backed by a row field. Not exported — consumers use
 * {@link ColumnDef} (or its {@link DataColumn} / {@link DisplayColumn} members).
 */
interface BaseColumn<T> {
  header: string;
  width?: string;
  minWidth?: string;
  align?: 'start' | 'center' | 'end';
  /** Hide this column below the named breakpoint (sm=640px, md=768px). */
  hideBelow?: 'sm' | 'md';
  /**
   * Custom cell renderer; receives the row as `$implicit` and the row `index`.
   * Optional on a {@link DataColumn} (falls back to `row[key]`); required on a
   * {@link DisplayColumn}, which has no row field to render by default.
   */
  cellTemplate?: TemplateRef<{ $implicit: T; index: number }>;
}

/**
 * A column backed by a field of the row. `key` indexes into the row for the
 * default cell renderer (`row[key]`); supply `cellTemplate` to take over
 * rendering (status badges, action buttons, etc.). May be sortable.
 */
export interface DataColumn<T> extends BaseColumn<T> {
  /** Indexes into the row for the default renderer (`row[key]`). */
  key: keyof T & string;
  sortable?: boolean;
}

/**
 * A column not backed by a row field — e.g. an actions column (row selection
 * later). `key` is an arbitrary but stable column id; it never indexes the row,
 * so the cell MUST be templated. A display column cannot be sortable.
 */
export interface DisplayColumn<T> extends BaseColumn<T> {
  /** Arbitrary, stable column id; never indexes the row. */
  key: string;
  cellTemplate: TemplateRef<{ $implicit: T; index: number }>;
  sortable?: never;
}

/**
 * Column configuration for `<rhombus-data-table>`: either a {@link DataColumn}
 * (backed by a row field, with a default `row[key]` renderer) or a
 * {@link DisplayColumn} (no row field — its cell must be templated).
 */
export type ColumnDef<T> = DataColumn<T> | DisplayColumn<T>;

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
