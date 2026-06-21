import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  PageState,
  RhombusCodeBlockComponent,
  RhombusPaginationComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-pagination-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCodeBlockComponent,
    RhombusPaginationComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Pagination"
      [hasUsage]="true"
      apiKey="RhombusPaginationComponent"
    >
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
          <h2>Example</h2>
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
              When the user benefits from <strong>discrete, addressable pages</strong>
              and a visible total — jumping to first/last and seeing "where am I"
              matters more than continuous scrolling.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              To page the rows of a tabular dataset, prefer the
              <a routerLink="/components/data-table">Data Table</a> — it hosts a
              paginator internally and wires the same <code>PageState</code> for you.
            </li>
            <li>
              For an indeterminate or streaming fetch where there is no stable
              total, show a <a routerLink="/components/progress">Progress</a>
              indicator and load incrementally instead of paging.
            </li>
            <li>
              When there is nothing to page because the collection is empty, render
              an <a routerLink="/components/empty-state">Empty State</a> rather than
              an idle paginator.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/data-table">Data Table</a> — paginated, sortable rows.</li>
            <li><a routerLink="/components/select">Select</a> — the control behind the page-size picker.</li>
            <li><a routerLink="/components/progress">Progress</a> — loading state while a page is fetched.</li>
            <li><a routerLink="/components/empty-state">Empty State</a> — when there is nothing to page.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The paginator is a <strong>controlled component</strong>: feed
          <code>pageIndex</code> / <code>pageSize</code> / <code>length</code> in,
          and update your own state from <code>(pageChange)</code>, which emits a
          stable <code>PageState</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[length]</code> — total item count across all pages; drives the
              range label and disables next/last at the upper bound.
            </li>
            <li>
              <code>[pageIndex]</code> / <code>[pageSize]</code> — the current
              zero-based page and items-per-page; keep them bound to your own state
              for a controlled flow.
            </li>
            <li>
              <code>[pageSizeOptions]</code> — the selectable page sizes shown in the
              size picker (defaults to <code>[5, 10, 25, 50]</code>);
              <code>[hidePageSize]</code> removes the picker entirely.
            </li>
            <li>
              <code>[showFirstLastButtons]</code> — first/last jump buttons; on by
              default. <code>[disabled]</code> disables every control at once.
            </li>
            <li>
              <code>(pageChange)</code> — emits <code>PageState</code>
              (<code>{{ '{' }} pageIndex, pageSize, length {{ '}' }}</code>) on any
              index or size change.
            </li>
            <li>
              The control renders no projected content — it has
              <strong>no content-projection slots</strong>; configure it entirely
              through its inputs.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Colour comes from the global Material paginator-overrides bridge; the
            host reads the contract token:
          </p>
          <ul>
            <li><code>--text-secondary</code> — range label and control text colour</li>
          </ul>
          <p>
            The container background is set transparent so the paginator inherits its
            surroundings. The body of the paginator renders inline, but its
            <strong>page-size dropdown opens in a CDK overlay</strong>, so any
            override of the size menu must target the
            <code>.cdk-overlay-container</code> scope.
          </p>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Inherits Material's paginator semantics: the range label and each
            navigation button (first / previous / next / last) carry accessible
            labels, and the buttons are reachable with <kbd>Tab</kbd> and
            activate on <kbd>Enter</kbd> / <kbd>Space</kbd>. Unavailable
            directions are disabled (and so skipped by the keyboard) at the
            collection's bounds. The page-size selector is a labelled listbox,
            navigable with the arrow keys. Because the buttons rely on Material's
            built-in labels, this wrapper exposes no custom <code>aria-live</code>
            region — if you need page changes announced, manage that in your own
            state alongside <code>(pageChange)</code>.
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

      <section class="showcase-section">
        <h2>Without the page-size picker</h2>
        <p class="showcase-section__lead">
          Set <code>[hidePageSize]="true"</code> for a fixed page size, leaving only
          the range label and navigation buttons.
        </p>
        <rhombus-pagination
          [length]="total"
          [pageIndex]="0"
          [pageSize]="10"
          [hidePageSize]="true"
        />
      </section>

      <section class="showcase-section">
        <h2>Disabled</h2>
        <p class="showcase-section__lead">
          <code>[disabled]="true"</code> disables every control at once — useful while
          a page is loading.
        </p>
        <rhombus-pagination
          [length]="total"
          [pageIndex]="0"
          [pageSize]="10"
          [pageSizeOptions]="[5, 10, 25]"
          [disabled]="true"
        />
      </section>
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
