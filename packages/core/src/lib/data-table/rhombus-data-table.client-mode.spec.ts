import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import {
  columnText,
  DataTableHostComponent,
  loaderFor,
  makePeople,
  PEOPLE,
  PEOPLE_BY_NAME_ASC,
} from './rhombus-data-table.spec-helpers';

/**
 * Client (array) mode contract.
 *
 * A plain `T[]` runs client-side: the table wires a `MatTableDataSource`, so
 * `sortMode="internal"` actually reorders the rendered rows and pagination
 * slices them — all without the consumer doing anything. Order is read back
 * through `MatTableHarness`; sort/page are driven through their harnesses.
 */
describe('rhombus-data-table client (array) mode', () => {
  let fixture: ComponentFixture<DataTableHostComponent>;
  let host: DataTableHostComponent;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(DataTableHostComponent);
    host = fixture.componentInstance;
    loader = loaderFor(fixture);
  });

  it('internal sort reorders the rendered rows and emits the sort state', async () => {
    host.paginated.set(false); // render every row so order is fully observable
    fixture.detectChanges();

    expect(await columnText(loader, 'name')).toEqual(['Charlie', 'Alice', 'Bob']);

    const sort = await loader.getHarness(MatSortHarness);
    const [nameHeader] = await sort.getSortHeaders({ label: 'Name' });
    await nameHeader.click();

    expect(await columnText(loader, 'name')).toEqual(PEOPLE_BY_NAME_ASC);
    expect(host.sortChanges).toEqual([{ active: 'name', direction: 'asc' }]);
  });

  it('client pagination slices the rendered page', async () => {
    host.data.set(makePeople(12));
    host.pageSize.set(5);
    host.paginated.set(true);
    fixture.detectChanges();

    let names = await columnText(loader, 'name');
    expect(names).toHaveLength(5);
    expect(names[0]).toBe('Person 01');

    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    names = await columnText(loader, 'name');
    expect(names).toHaveLength(5);
    expect(names[0]).toBe('Person 06');
  });

  it('sortStart sets the direction a column sorts to on first activation', async () => {
    host.data.set(PEOPLE);
    host.sortStart.set('desc');
    host.paginated.set(false);
    fixture.detectChanges();

    const sort = await loader.getHarness(MatSortHarness);
    const [ageHeader] = await sort.getSortHeaders({ label: 'Age' });
    await ageHeader.click();

    expect(await ageHeader.getSortDirection()).toBe('desc');
    expect(host.sortChanges).toEqual([{ active: 'age', direction: 'desc' }]);
  });
});
