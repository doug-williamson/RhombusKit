import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  DataTableHostComponent,
  FakeDataSource,
  PEOPLE,
  Person,
} from './rhombus-data-table.spec-helpers';

/**
 * Dev-mode misconfiguration guard.
 *
 * A `DataSource` owns its own data, so the table cannot sort it client-side —
 * `sortMode="internal"` (the default) with a `DataSource` is a silent-coercion
 * trap. The component throws in dev mode (the test default) rather than quietly
 * ignoring the sort. The check lives in an `effect`, so it surfaces on the
 * first change detection.
 */
describe('rhombus-data-table sortMode guard (DataSource + internal)', () => {
  let fixture: ComponentFixture<DataTableHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(DataTableHostComponent);
  });

  it('throws when a DataSource is combined with the default sortMode="internal"', () => {
    fixture.componentInstance.data.set(new FakeDataSource<Person>(PEOPLE));
    // sortMode defaults to 'internal'.

    expect(() => fixture.detectChanges()).toThrow(
      'sortMode="internal" is invalid with a DataSource',
    );
  });

  it('does NOT throw when a DataSource is paired with sortMode="controlled"', () => {
    const host = fixture.componentInstance;
    host.data.set(new FakeDataSource<Person>(PEOPLE));
    host.sortMode.set('controlled');
    host.totalCount.set(PEOPLE.length);

    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('does NOT throw for the array + internal default (client mode)', () => {
    // data defaults to a PEOPLE array; sortMode defaults to internal.
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
