import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { DataSource } from '@angular/cdk/collections';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableHarness } from '@angular/material/table/testing';
import { BehaviorSubject, Observable } from 'rxjs';
import type { RhombusDensity } from '../density/density.types';
import type { ColumnDef, PageState, SortState } from './data-table.types';
import { RhombusDataTableComponent } from './rhombus-data-table.component';

/**
 * Shared fixtures for the `<rhombus-data-table>` contract specs.
 *
 * The concern-specific spec files (client-mode, server-mode, sort-mode-guard,
 * responsive, …) drive the same {@link DataTableHostComponent} via its signal
 * inputs; cell-template and empty/loading projection need bespoke hosts and
 * define their own. All Material interaction goes through CDK harnesses — only
 * the library's own `rhombus-data-table__*` markers are read from the DOM.
 */

export interface Person {
  id: number;
  name: string;
  age: number;
  email: string;
}

/** Deliberately unsorted: initial, name-asc, and age-asc orders are all
 * distinct, so a sort assertion can't pass by accident. */
export const PEOPLE: Person[] = [
  { id: 1, name: 'Charlie', age: 30, email: 'charlie@example.com' },
  { id: 2, name: 'Alice', age: 35, email: 'alice@example.com' },
  { id: 3, name: 'Bob', age: 25, email: 'bob@example.com' },
];

export const PEOPLE_BY_NAME_ASC = ['Alice', 'Bob', 'Charlie'];
export const PEOPLE_BY_AGE_ASC = ['Bob', 'Charlie', 'Alice'];

/** Sequential rows for pagination specs (sortable, stable order). */
export function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Person ${String(i + 1).padStart(2, '0')}`,
    age: 20 + i,
    email: `person${i + 1}@example.com`,
  }));
}

export const BASE_COLUMNS: ColumnDef<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true },
  { key: 'email', header: 'Email' },
];

/**
 * Minimal server-side `DataSource`: a `BehaviorSubject`-backed `connect()` plus
 * `connect`/`disconnect` counters so specs can assert lifecycle without
 * touching `MatTableDataSource` internals.
 */
export class FakeDataSource<T> extends DataSource<T> {
  readonly rows$: BehaviorSubject<readonly T[]>;
  connectCount = 0;
  disconnectCount = 0;

  constructor(initial: readonly T[]) {
    super();
    this.rows$ = new BehaviorSubject<readonly T[]>(initial);
  }

  override connect(): Observable<readonly T[]> {
    this.connectCount += 1;
    return this.rows$.asObservable();
  }

  override disconnect(): void {
    this.disconnectCount += 1;
  }

  /** Simulate a server refetch pushing a new page of rows. */
  emit(rows: readonly T[]): void {
    this.rows$.next(rows);
  }
}

/**
 * Reusable host whose every `<rhombus-data-table>` input is a writable signal,
 * with all outputs collected into arrays. A spec sets the signals it cares
 * about and asserts against the captured output payloads.
 */
@Component({
  selector: 'rk-data-table-host',
  standalone: true,
  imports: [RhombusDataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-data-table
      [data]="data()"
      [columns]="columns()"
      [loading]="loading()"
      [sortMode]="sortMode()"
      [sortState]="sortState()"
      [sortStart]="sortStart()"
      [paginated]="paginated()"
      [pageSize]="pageSize()"
      [pageSizeOptions]="pageSizeOptions()"
      [totalCount]="totalCount()"
      [emptyTitle]="emptyTitle()"
      [emptyMessage]="emptyMessage()"
      [density]="density()"
      (sortChange)="sortChanges.push($event)"
      (pageChange)="pageChanges.push($event)"
      (rowClick)="rowClicks.push($event)"
    />
  `,
})
export class DataTableHostComponent {
  readonly data = signal<Person[] | DataSource<Person>>(PEOPLE);
  readonly columns = signal<ColumnDef<Person>[]>(BASE_COLUMNS);
  readonly loading = signal(false);
  readonly sortMode = signal<'internal' | 'controlled'>('internal');
  readonly sortState = signal<SortState | null>(null);
  readonly sortStart = signal<'asc' | 'desc'>('asc');
  readonly paginated = signal(true);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = signal<number[]>([5, 10, 25, 50]);
  readonly totalCount = signal<number | null>(null);
  readonly emptyTitle = signal('No data');
  readonly emptyMessage = signal('There are no items to display.');
  readonly density = signal<RhombusDensity | 'dense' | undefined>(undefined);

  readonly sortChanges: SortState[] = [];
  readonly pageChanges: PageState[] = [];
  readonly rowClicks: Person[] = [];
}

/** CDK harness loader rooted at the fixture. */
export function loaderFor(fixture: ComponentFixture<unknown>): HarnessLoader {
  return TestbedHarnessEnvironment.loader(fixture);
}

/** Body-cell text for one column, in render order — the order/slice oracle. */
export async function columnText(
  loader: HarnessLoader,
  columnName: string,
): Promise<string[]> {
  const table = await loader.getHarness(MatTableHarness);
  const byColumn = await table.getCellTextByColumnName();
  return byColumn[columnName]?.text ?? [];
}
