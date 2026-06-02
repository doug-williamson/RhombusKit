import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RhombusDataTableComponent } from './rhombus-data-table.component';
import type { ColumnDef, SortState } from './data-table.types';

/**
 * Controlled-mode contract test.
 *
 * In `sortMode="controlled"` the table must be a PURE VIEW of the consumer's
 * `sortState`: it owns no sort cycle of its own. A consumer with a two-state
 * model (active column flips asc<->desc; never an "unsorted" state) must see the
 * header indicator track `sortState` on every click. If Material's native
 * tri-state header (asc->desc->none) leaks a `none` despite `sortState` carrying
 * a direction, that is a controlled-mode contract violation.
 *
 * aria-sort is the assertion target: it is the spec'd, host-bound accessibility
 * indicator and reflects MatSort's live state each change-detection pass.
 */

interface Row {
  id: string;
  updatedAt: number;
}

@Component({
  standalone: true,
  imports: [RhombusDataTableComponent],
  template: `
    <rhombus-data-table
      [data]="data"
      [columns]="columns"
      sortMode="controlled"
      [sortState]="sortState()"
      (sortChange)="onSort($event)"
    />
  `,
})
class HostComponent {
  readonly data: Row[] = [
    { id: 'a', updatedAt: 1 },
    { id: 'b', updatedAt: 2 },
  ];
  readonly columns: ColumnDef<Row>[] = [
    { key: 'updatedAt', header: 'Date', sortable: true },
  ];

  // Mirrors FolioKit's PostsListStore.toggleSort: two-state, no "none".
  readonly sortState = signal<SortState>({ active: 'updatedAt', direction: 'desc' });
  readonly emitted: SortState[] = [];

  onSort(s: SortState): void {
    this.emitted.push(s);
    this.sortState.update((cur) =>
      cur.active === s.active
        ? { active: cur.active, direction: cur.direction === 'asc' ? 'desc' : 'asc' }
        : { active: s.active, direction: 'desc' },
    );
  }
}

function ariaSort(fixture: ComponentFixture<HostComponent>): string | null {
  const th = fixture.nativeElement.querySelector('th.mat-sort-header') as HTMLElement;
  return th.getAttribute('aria-sort');
}

function clickHeader(fixture: ComponentFixture<HostComponent>): void {
  const th = fixture.nativeElement.querySelector('th.mat-sort-header') as HTMLElement;
  th.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  fixture.detectChanges();
}

describe('rhombus-data-table controlled sort — indicator tracks sortState', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('reflects the initial controlled sortState (descending)', () => {
    expect(ariaSort(fixture)).toBe('descending');
  });

  it('pins the indicator to the two-state sortState across repeated clicks on the active column (no tri-state "none" leak)', () => {
    // desc -> click -> store flips to asc
    clickHeader(fixture);
    expect(ariaSort(fixture)).toBe('ascending');

    // asc -> click -> store flips to desc
    clickHeader(fixture);
    expect(ariaSort(fixture)).toBe('descending');

    // desc -> click -> store flips to asc
    clickHeader(fixture);
    expect(ariaSort(fixture)).toBe('ascending');

    // The indicator must NEVER have shown the unsorted state.
    expect(ariaSort(fixture)).not.toBe('none');
  });
});
