import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import {
  columnText,
  DataTableHostComponent,
  FakeDataSource,
  loaderFor,
  makePeople,
  PEOPLE,
  Person,
} from './rhombus-data-table.spec-helpers';

/**
 * Server (DataSource) mode contract.
 *
 * A `DataSource` runs server-side: the table renders exactly what the source
 * emits and never sorts or slices it. The consumer reacts to
 * `sortChange`/`pageChange` (here captured by the host) and refetches.
 * `totalCount` — not the emitted row count — drives the paginator.
 */
describe('rhombus-data-table server (DataSource) mode', () => {
  let fixture: ComponentFixture<DataTableHostComponent>;
  let host: DataTableHostComponent;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(DataTableHostComponent);
    host = fixture.componentInstance;
    loader = loaderFor(fixture);
  });

  it('does not reorder rows on sort; it emits the sort state for the consumer', async () => {
    host.data.set(new FakeDataSource<Person>(PEOPLE));
    host.sortMode.set('controlled');
    host.paginated.set(false);
    fixture.detectChanges();

    expect(await columnText(loader, 'name')).toEqual(['Charlie', 'Alice', 'Bob']);

    const sort = await loader.getHarness(MatSortHarness);
    const [nameHeader] = await sort.getSortHeaders({ label: 'Name' });
    await nameHeader.click();

    // Library-side order is untouched — the consumer owns the new order.
    expect(await columnText(loader, 'name')).toEqual(['Charlie', 'Alice', 'Bob']);
    expect(host.sortChanges).toEqual([{ active: 'name', direction: 'asc' }]);
  });

  it('drives the paginator length from totalCount, not the emitted row count', async () => {
    host.data.set(new FakeDataSource<Person>(makePeople(10)));
    host.sortMode.set('controlled');
    host.totalCount.set(100);
    host.pageSize.set(10);
    host.paginated.set(true);
    fixture.detectChanges();

    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.getRangeLabel()).toContain('of 100');
  });

  it('emits PageState on page change without slicing the rendered rows', async () => {
    host.data.set(new FakeDataSource<Person>(makePeople(10)));
    host.sortMode.set('controlled');
    host.totalCount.set(100);
    host.pageSize.set(10);
    host.paginated.set(true);
    fixture.detectChanges();

    const before = await columnText(loader, 'name');
    expect(before).toHaveLength(10);
    expect(before[0]).toBe('Person 01');

    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    // No client slicing: the same emitted page is still shown until the
    // consumer refetches. The output carries enough to drive that refetch.
    expect(await columnText(loader, 'name')).toEqual(before);
    expect(host.pageChanges).toEqual([
      { pageIndex: 1, pageSize: 10, length: 100 },
    ]);
  });

  it('connects to the DataSource and disconnects on destroy', () => {
    const ds = new FakeDataSource<Person>(PEOPLE);
    host.data.set(ds);
    host.sortMode.set('controlled');
    host.totalCount.set(PEOPLE.length);
    fixture.detectChanges();

    expect(ds.connectCount).toBeGreaterThanOrEqual(1);

    fixture.destroy();
    expect(ds.disconnectCount).toBeGreaterThanOrEqual(1);
  });
});
