import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  PageState,
  RhombusPaginationComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-pagination-page',
  standalone: true,
  imports: [RhombusPaginationComponent, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Pagination" apiKey="RhombusPaginationComponent">
      <div overview>
        <p>
          <code>&lt;rhombus-pagination&gt;</code> wraps Material's
          <code>&lt;mat-paginator&gt;</code> for paginating any collection — not
          just the data table. It emits the same stable <code>PageState</code>
          (<code>{{ '{' }} pageIndex, pageSize, length {{ '}' }}</code>) the table
          does, so you never import Material's <code>PageEvent</code>. Drive it as
          a controlled component: update <code>pageIndex</code> from
          <code>(pageChange)</code>.
        </p>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Controlled paginator</h2>
        <p class="showcase-section__lead">
          The list below is sliced from <code>{{ total }}</code> items by the
          current page state.
        </p>
        <ul class="page-items">
          @for (item of visibleItems(); track item) {
            <li>{{ item }}</li>
          }
        </ul>
        <rhombus-pagination
          [length]="total"
          [pageIndex]="page().pageIndex"
          [pageSize]="page().pageSize"
          [pageSizeOptions]="[5, 10, 25]"
          (pageChange)="page.set($event)"
        />
      </section>

      <div class="event-log">
        <p>
          Page <strong>{{ page().pageIndex + 1 }}</strong> · size
          <strong>{{ page().pageSize }}</strong> · {{ total }} total
        </p>
      </div>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
    .page-items {
      margin: 0 0 0.5rem;
      padding-left: 1.25rem;
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    .page-items li {
      padding: 0.15rem 0;
    }
    .event-log {
      margin-top: 1.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background-color: var(--surface-1);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }
    .event-log strong {
      color: var(--text-primary);
    }
  `,
})
export default class PaginationPageComponent {
  protected readonly total = 95;
  private readonly allItems = Array.from(
    { length: this.total },
    (_, i) => `Item ${i + 1}`
  );

  protected readonly page = signal<PageState>({
    pageIndex: 0,
    pageSize: 10,
    length: this.total,
  });

  protected readonly visibleItems = computed(() => {
    const { pageIndex, pageSize } = this.page();
    const start = pageIndex * pageSize;
    return this.allItems.slice(start, start + pageSize);
  });
}
