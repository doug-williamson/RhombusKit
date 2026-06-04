import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { axe } from '../../testing/axe';
import { RhombusPaginationComponent } from './rhombus-pagination.component';
import type { PageState } from '../data-table/data-table.types';

@Component({
  standalone: true,
  imports: [RhombusPaginationComponent],
  template: `
    <rhombus-pagination
      [length]="length"
      [pageSize]="pageSize"
      [pageSizeOptions]="pageSizeOptions"
      (pageChange)="last = $event"
    />
  `,
})
class HostComponent {
  length = 95;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25];
  last: PageState | null = null;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  loader: HarnessLoader;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  const loader = TestbedHarnessEnvironment.loader(fixture);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    loader,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('rhombus-pagination', () => {
  it('reflects the total length in the range label', async () => {
    const { loader } = setup();
    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.getRangeLabel()).toContain('of 95');
  });

  it('emits a PageState when advancing a page', async () => {
    const { loader, host } = setup();
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();
    expect(host.last).toEqual({ pageIndex: 1, pageSize: 10, length: 95 });
  });

  it('emits a PageState when the page size changes', async () => {
    const { loader, host } = setup();
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.setPageSize(25);
    expect(host.last?.pageSize).toBe(25);
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
