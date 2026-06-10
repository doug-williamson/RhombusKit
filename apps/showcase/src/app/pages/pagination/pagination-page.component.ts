import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  PageState,
  RhombusPaginationComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-pagination-page',
  standalone: true,
  imports: [
    RhombusPaginationComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Pagination" apiKey="RhombusPaginationComponent">
      <div overview class="overview">
        <p class="overview__lead">
          Pagination splits a long collection into pages and gives users the
          controls to move between them. <code>&lt;rhombus-pagination&gt;</code>
          wraps Material's <code>&lt;mat-paginator&gt;</code> with the token
          contract and emits the same stable <code>PageState</code>
          (<code>{{ '{' }} pageIndex, pageSize, length {{ '}' }}</code>) the data
          table does, so you never import Material's <code>PageEvent</code>.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a paginator to page <strong>any collection</strong> — a list,
              a grid, search results — not just the data table. It is a standalone
              control, so reach for it wherever the source already lives in your
              own state.
            </li>
            <li>
              Drive it as a <strong>controlled component</strong>: feed
              <code>pageIndex</code> / <code>pageSize</code> in and update them
              from <code>(pageChange)</code>. <code>pageSizeOptions</code> sets the
              selectable sizes.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-pagination
              [length]="total"
              [pageIndex]="page().pageIndex"
              [pageSize]="page().pageSize"
              [pageSizeOptions]="[5, 10, 25]"
              (pageChange)="page.set($event)"
            />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Inherits Material's paginator semantics: the range label and each
            navigation button (first / previous / next / last) carry accessible
            labels, and the buttons are reachable with <kbd>Tab</kbd> and
            activate on <kbd>Enter</kbd> / <kbd>Space</kbd>. Unavailable
            directions are disabled (and so skipped by the keyboard) at the
            collection's bounds.
          </p>
        </section>
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
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { PageState, RhombusPaginationComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-results',
  imports: [RhombusPaginationComponent],
  template: \`
    <rhombus-pagination
      [length]="total"
      [pageIndex]="page().pageIndex"
      [pageSize]="page().pageSize"
      [pageSizeOptions]="[5, 10, 25]"
      (pageChange)="page.set($event)"
    />
  \`,
})
export class ResultsComponent {
  readonly total = 95;
  readonly page = signal<PageState>({ pageIndex: 0, pageSize: 10, length: this.total });
}`;

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
