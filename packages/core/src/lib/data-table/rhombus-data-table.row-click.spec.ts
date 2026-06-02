import {
  Component,
  TemplateRef,
  computed,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RhombusDataTableComponent } from './rhombus-data-table.component';
import type { ColumnDef } from './data-table.types';

/**
 * Row-click hardening contract.
 *
 * Every body cell carries the row `(click)`. Without help, a click on an
 * interactive element a consumer renders in a cell (an action button, a link)
 * bubbles to the cell and fires `rowClick` too — so e.g. an overflow/actions
 * menu would also "open the row". The table must NOT emit `rowClick` when the
 * click originates inside an interactive element; a plain cell click still must.
 */

interface Row {
  id: string;
  name: string;
}

@Component({
  standalone: true,
  imports: [RhombusDataTableComponent],
  template: `
    <rhombus-data-table
      [data]="data"
      [columns]="columns()"
      [paginated]="false"
      (rowClick)="clicked.push($event)"
    />
    <ng-template #actionsCell>
      <button class="act" type="button">Act</button>
    </ng-template>
  `,
})
class HostComponent {
  readonly data: Row[] = [{ id: 'a', name: 'Alpha' }];
  readonly clicked: Row[] = [];

  private readonly actionsCell = viewChild<TemplateRef<{ $implicit: Row; index: number }>>(
    'actionsCell',
  );

  readonly columns = computed<ColumnDef<Row>[]>(() => [
    { key: 'name', header: 'Name' },
    { key: 'id', header: '', cellTemplate: this.actionsCell() },
  ]);
}

describe('rhombus-data-table row click — interactive-cell hardening', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does NOT emit rowClick when a button inside a cell is clicked', () => {
    const btn = fixture.nativeElement.querySelector('button.act') as HTMLElement;
    btn.click();
    fixture.detectChanges();
    expect(host.clicked).toEqual([]);
  });

  it('still emits rowClick for a plain (non-interactive) cell click', () => {
    const nameCell = fixture.nativeElement.querySelector(
      'td.rhombus-data-table__cell',
    ) as HTMLElement;
    nameCell.click();
    fixture.detectChanges();
    expect(host.clicked).toEqual([{ id: 'a', name: 'Alpha' }]);
  });
});
