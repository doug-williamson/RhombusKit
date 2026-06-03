import { Component, TemplateRef, computed, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import type { ColumnDef } from './data-table.types';
import { RhombusDataTableComponent } from './rhombus-data-table.component';
import { columnText, loaderFor, PEOPLE, Person } from './rhombus-data-table.spec-helpers';

/**
 * Host wiring a `cellTemplate` for both a DataColumn (template optional, keyed
 * on a real field) and a DisplayColumn (template required, arbitrary key). Each
 * template renders its `$implicit` row and the `index` so the spec can prove the
 * context the table hands the template.
 */
@Component({
  selector: 'rk-cell-template-host',
  standalone: true,
  imports: [RhombusDataTableComponent],
  template: `
    <rhombus-data-table [data]="data" [columns]="columns()" [paginated]="false" />
    <ng-template #nameCell let-row let-i="index"
      ><span>{{ row.name }}#{{ i }}</span></ng-template
    >
    <ng-template #actionsCell let-row let-i="index"
      ><button type="button">act {{ row.id }} @ {{ i }}</button></ng-template
    >
  `,
})
class CellTemplateHostComponent {
  readonly data: Person[] = PEOPLE;

  private readonly nameCell =
    viewChild<TemplateRef<{ $implicit: Person; index: number }>>('nameCell');
  private readonly actionsCell =
    viewChild<TemplateRef<{ $implicit: Person; index: number }>>('actionsCell');

  readonly columns = computed<ColumnDef<Person>[]>(() => {
    const name = this.nameCell();
    const actions = this.actionsCell();
    const cols: ColumnDef<Person>[] = [];
    // DataColumn: cellTemplate is optional; here it overrides the default render.
    if (name) cols.push({ key: 'name', header: 'Name', cellTemplate: name });
    // DisplayColumn: arbitrary key, cellTemplate required (no row field to show).
    if (actions) cols.push({ key: 'actions', header: '', cellTemplate: actions });
    return cols;
  });
}

describe('rhombus-data-table cellTemplate context', () => {
  let fixture: ComponentFixture<CellTemplateHostComponent>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(CellTemplateHostComponent);
    loader = loaderFor(fixture);
    fixture.detectChanges();
  });

  it('passes $implicit=row and index to a DataColumn template', async () => {
    // PEOPLE render order is Charlie(0), Alice(1), Bob(2).
    expect(await columnText(loader, 'name')).toEqual([
      'Charlie#0',
      'Alice#1',
      'Bob#2',
    ]);
  });

  it('passes $implicit=row and index to a DisplayColumn template', async () => {
    // Same rows; ids 1,2,3 with indices 0,1,2.
    expect(await columnText(loader, 'actions')).toEqual([
      'act 1 @ 0',
      'act 2 @ 1',
      'act 3 @ 2',
    ]);
  });
});
