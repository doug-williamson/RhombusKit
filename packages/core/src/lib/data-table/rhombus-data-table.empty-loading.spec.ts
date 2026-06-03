import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import type { ColumnDef } from './data-table.types';
import { RhombusDataTableComponent } from './rhombus-data-table.component';
import { RhombusEmptyStateDirective } from './rhombus-empty-state.directive';
import {
  BASE_COLUMNS,
  DataTableHostComponent,
  loaderFor,
  Person,
} from './rhombus-data-table.spec-helpers';

/** Host that projects a custom `[rhombusEmptyState]`, overriding the default. */
@Component({
  selector: 'rk-projected-empty-host',
  standalone: true,
  imports: [RhombusDataTableComponent, RhombusEmptyStateDirective],
  template: `
    <rhombus-data-table [data]="empty" [columns]="columns" [loading]="false">
      <div rhombusEmptyState class="custom-empty">Nothing here — add the first item.</div>
    </rhombus-data-table>
  `,
})
class ProjectedEmptyHostComponent {
  readonly empty: Person[] = [];
  readonly columns: ColumnDef<Person>[] = BASE_COLUMNS;
}

/**
 * Empty and loading are distinct rendering paths.
 *
 * The empty block renders only when `!loading && isEmpty`, so an in-flight
 * fetch never flashes "No data". A projected `[rhombusEmptyState]` replaces the
 * built-in default block entirely. Structural assertions read the library's own
 * `rhombus-data-table__*` markers; the spinner is asserted via its harness.
 */
describe('rhombus-data-table empty / loading paths', () => {
  const empty = (el: HTMLElement) => el.querySelector('.rhombus-data-table__empty');
  const emptyDefault = (el: HTMLElement) =>
    el.querySelector('.rhombus-data-table__empty-default');
  const loadingBlock = (el: HTMLElement) =>
    el.querySelector('.rhombus-data-table__loading');

  describe('default host', () => {
    let fixture: ComponentFixture<DataTableHostComponent>;
    let host: DataTableHostComponent;
    let el: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
      fixture = TestBed.createComponent(DataTableHostComponent);
      host = fixture.componentInstance;
      el = fixture.nativeElement as HTMLElement;
    });

    it('shows the loading path and suppresses empty while loading, even with no data', async () => {
      host.data.set([]);
      host.loading.set(true);
      fixture.detectChanges();

      expect(loadingBlock(el)).not.toBeNull();
      expect(empty(el)).toBeNull();

      const spinners = await loaderFor(fixture).getAllHarnesses(
        MatProgressSpinnerHarness,
      );
      expect(spinners).toHaveLength(1);
    });

    it('shows the default empty block with the default title and message', () => {
      host.data.set([]);
      host.loading.set(false);
      fixture.detectChanges();

      expect(loadingBlock(el)).toBeNull();
      expect(emptyDefault(el)).not.toBeNull();
      expect(emptyDefault(el)?.querySelector('h3')?.textContent?.trim()).toBe(
        'No data',
      );
      expect(emptyDefault(el)?.querySelector('p')?.textContent?.trim()).toBe(
        'There are no items to display.',
      );
    });

    it('reflects custom emptyTitle / emptyMessage in the default block', () => {
      host.data.set([]);
      host.emptyTitle.set('No results');
      host.emptyMessage.set('Try a different filter.');
      fixture.detectChanges();

      expect(emptyDefault(el)?.querySelector('h3')?.textContent?.trim()).toBe(
        'No results',
      );
      expect(emptyDefault(el)?.querySelector('p')?.textContent?.trim()).toBe(
        'Try a different filter.',
      );
    });
  });

  describe('projected [rhombusEmptyState] override', () => {
    it('renders the projected content and not the default block', () => {
      TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
      const fixture = TestBed.createComponent(ProjectedEmptyHostComponent);
      const el = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();

      expect(empty(el)).not.toBeNull();
      expect(emptyDefault(el)).toBeNull();
      expect(el.querySelector('.custom-empty')?.textContent?.trim()).toBe(
        'Nothing here — add the first item.',
      );
    });
  });
});
