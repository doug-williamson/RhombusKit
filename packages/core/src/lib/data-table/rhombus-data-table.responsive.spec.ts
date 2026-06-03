import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  DataTableHostComponent,
  PEOPLE,
} from './rhombus-data-table.spec-helpers';

/**
 * Responsive `hideBelow` markers.
 *
 * `hideBelow: 'sm' | 'md'` toggles a per-column CSS class on every cell of that
 * column (header + body). The ACTUAL hiding is driven by CSS media queries
 * (`sm` = 640px, `md` = 768px) and is verified visually in the showcase / e2e —
 * jsdom has no layout engine, so this spec asserts only that the marker class
 * is applied to the right column and absent elsewhere. Columns are scoped via
 * the CDK-stable `cdk-column-<key>` class (not Material's internal DOM).
 */
describe('rhombus-data-table responsive hideBelow markers', () => {
  let fixture: ComponentFixture<DataTableHostComponent>;
  let host: DataTableHostComponent;
  let el: HTMLElement;

  const HIDE_SM = 'rhombus-data-table__col--hide-sm';
  const HIDE_MD = 'rhombus-data-table__col--hide-md';

  /** Every cell (header + body) belonging to one column. */
  const cellsFor = (key: string): HTMLElement[] =>
    Array.from(el.querySelectorAll<HTMLElement>(`.cdk-column-${key}`));

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(DataTableHostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;

    host.data.set(PEOPLE);
    host.paginated.set(false);
    host.columns.set([
      { key: 'name', header: 'Name' }, // no hideBelow
      { key: 'age', header: 'Age', hideBelow: 'sm' },
      { key: 'email', header: 'Email', hideBelow: 'md' },
    ]);
    fixture.detectChanges();
  });

  it('marks a hideBelow:"sm" column with the hide-sm class only', () => {
    const cells = cellsFor('age');
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.every((c) => c.classList.contains(HIDE_SM))).toBe(true);
    expect(cells.some((c) => c.classList.contains(HIDE_MD))).toBe(false);
  });

  it('marks a hideBelow:"md" column with the hide-md class only', () => {
    const cells = cellsFor('email');
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.every((c) => c.classList.contains(HIDE_MD))).toBe(true);
    expect(cells.some((c) => c.classList.contains(HIDE_SM))).toBe(false);
  });

  it('leaves a column without hideBelow unmarked', () => {
    const cells = cellsFor('name');
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.some((c) => c.classList.contains(HIDE_SM))).toBe(false);
    expect(cells.some((c) => c.classList.contains(HIDE_MD))).toBe(false);
  });
});
