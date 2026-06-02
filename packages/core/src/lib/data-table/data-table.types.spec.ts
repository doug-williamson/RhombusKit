import type { TemplateRef } from '@angular/core';
import type { ColumnDef, DataColumn, DisplayColumn } from './data-table.types';

/**
 * Compile-only contract for the `ColumnDef` discriminated union.
 *
 * Enforced by `tsc --noEmit -p packages/core/tsconfig.spec.json` (TS `strict`),
 * NOT by jest: this project compiles specs with `isolatedModules` (ts-jest
 * transpile-only, no type-check), so the runtime `it` below is a placeholder.
 * The real assertions are the type annotations and `@ts-expect-error`
 * directives — a contract regression fails the tsc type-check.
 */

interface Row {
  id: string;
  name: string;
  updatedAt: number;
}

const cell = {} as TemplateRef<{ $implicit: Row; index: number }>;

// 1. Data column keyed on a real field — compiles (plain, sortable, or templated).
const plain: DataColumn<Row> = { key: 'name', header: 'Name' };
const sortable: DataColumn<Row> = { key: 'updatedAt', header: 'Date', sortable: true };
const templated: DataColumn<Row> = { key: 'id', header: '', cellTemplate: cell };

// 2. Display column: arbitrary key + required template — compiles, not row-backed.
const display: DisplayColumn<Row> = { key: 'actions', header: '', cellTemplate: cell };

// 3. Display column missing the required cellTemplate — must NOT compile.
// @ts-expect-error DisplayColumn.cellTemplate is required
const displayNoTemplate: DisplayColumn<Row> = { key: 'actions', header: '' };

// 4. Display column declared sortable — must NOT compile (sortable?: never).
const displaySortable: DisplayColumn<Row> = {
  key: 'actions',
  header: '',
  cellTemplate: cell,
  // @ts-expect-error a DisplayColumn can never be sortable
  sortable: true,
};

// 5. FolioKit-shaped column ({ key:'id', cellTemplate }, id a real field) stays
//    assignable to the public union — mirrors the row-click spec's actions cell.
const folioShaped: ColumnDef<Row> = { key: 'id', header: '', cellTemplate: cell };

// Reference every binding so a stricter `noUnusedLocals` profile stays quiet.
void [plain, sortable, templated, display, displayNoTemplate, displaySortable, folioShaped];

describe('ColumnDef discriminated-union type contract', () => {
  it('is enforced at type-check time (see tsc --noEmit on tsconfig.spec.json)', () => {
    expect(true).toBe(true);
  });
});
