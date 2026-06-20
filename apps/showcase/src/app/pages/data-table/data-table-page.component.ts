import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, type Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/collections';
import { RouterLink } from '@angular/router';
import {
  ColumnDef,
  OverflowMenuItem,
  PageState,
  RhombusBadgeDirective,
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusConfirmService,
  RhombusDataTableComponent,
  RhombusEmptyStateDirective,
  RhombusOverflowMenuComponent,
  SortState,
  type BadgeVariant,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

interface Post {
  id: number;
  title: string;
  status: PostStatus;
  author: string;
  date: string;
  viewCount: number;
}

type PostCellContext = { $implicit: Post; index: number };

const POSTS: Post[] = [
  { id: 1,  title: 'Designing a token-first component library', status: 'published', author: 'Ada Lovelace',   date: 'May 2, 2026',  viewCount: 12840 },
  { id: 2,  title: 'Signals vs. observables in practice',       status: 'published', author: 'Grace Hopper',   date: 'Apr 28, 2026', viewCount: 9532 },
  { id: 3,  title: 'A field guide to Material 3 theming',       status: 'draft',     author: 'Alan Turing',    date: 'May 6, 2026',  viewCount: 0 },
  { id: 4,  title: 'Server-driven tables without the pain',     status: 'scheduled', author: 'Katherine Johnson', date: 'May 12, 2026', viewCount: 0 },
  { id: 5,  title: 'Why we deleted our NgModules',              status: 'published', author: 'Margaret Hamilton', date: 'Apr 19, 2026', viewCount: 21104 },
  { id: 6,  title: 'Accessible empty states',                   status: 'published', author: 'Barbara Liskov', date: 'Apr 11, 2026', viewCount: 4310 },
  { id: 7,  title: 'The case against premature abstraction',    status: 'archived',  author: 'Edsger Dijkstra', date: 'Feb 3, 2026',  viewCount: 18790 },
  { id: 8,  title: 'OnPush everywhere: a retrospective',        status: 'draft',     author: 'Donald Knuth',   date: 'May 5, 2026',  viewCount: 0 },
  { id: 9,  title: 'Theming with CSS custom properties',        status: 'published', author: 'Radia Perlman',  date: 'Mar 22, 2026', viewCount: 7621 },
  { id: 10, title: 'Pagination patterns that scale',           status: 'scheduled', author: 'Frances Allen',  date: 'May 18, 2026', viewCount: 0 },
  { id: 11, title: 'Content projection deep dive',             status: 'published', author: 'Shafi Goldwasser', date: 'Apr 2, 2026',  viewCount: 5544 },
  { id: 12, title: 'Migrating to standalone components',       status: 'archived',  author: 'Leslie Lamport', date: 'Jan 30, 2026', viewCount: 14982 },
  { id: 13, title: 'A pragmatic guide to view queries',        status: 'draft',     author: 'Adele Goldberg', date: 'May 7, 2026',  viewCount: 0 },
  { id: 14, title: 'Stop fighting the change detector',        status: 'published', author: 'Sophie Wilson',  date: 'Mar 9, 2026',  viewCount: 8210 },
];

/**
 * A minimal CDK `DataSource` backed by a `BehaviorSubject` — the shape a real
 * server-side table uses. The page pushes each freshly-fetched page of rows into
 * it; the table just renders whatever `connect()` emits.
 */
class PostDataSource extends DataSource<Post> {
  constructor(private readonly rows$: Observable<Post[]>) {
    super();
  }
  override connect(): Observable<Post[]> {
    return this.rows$;
  }
  override disconnect(): void {
    /* the page owns the subject's lifecycle */
  }
}

@Component({
  selector: 'app-data-table-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusDataTableComponent,
    RhombusEmptyStateDirective,
    RhombusBadgeDirective,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    RhombusOverflowMenuComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Shared cell templates. Fed into the column config via view queries. -->
    <ng-template #statusTpl let-row>
      <span
        class="status-pill"
        [rhombusBadge]="statusLabel(row.status)"
        [rhombusBadgeVariant]="statusVariant(row.status)"
        [rhombusBadgeOverlap]="false"
        rhombusBadgePosition="above after"
        >&nbsp;</span
      >
    </ng-template>

    <ng-template #actionsTpl let-row>
      <div class="actions-cell">
        <rhombus-overflow-menu [items]="rowMenuItems(row)" />
      </div>
    </ng-template>

    <app-component-page
      title="Data Table"
      apiKey="RhombusDataTableComponent"
      [hasUsage]="true"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A data table renders records from a <code>columns</code> config with
          sensible defaults for sorting and pagination, plus a
          <code>cellTemplate</code> escape hatch for custom cells. It auto-detects
          its mode from <code>data</code>: a plain array runs client-side; a
          <code>DataSource</code> runs server-side.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-data-table
              [data]="heroPosts()"
              [columns]="controlledColumns"
              [paginated]="false"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Present a set of <strong>records with column headers</strong> —
              sortable, paginated, with custom cell rendering.
            </li>
            <li>
              When you need both client-side convenience and a server-driven path
              behind <strong>one API</strong> — start with an array, graduate to a
              <code>DataSource</code> without changing the template shape.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a short, non-tabular list, prefer plain list markup or
              <a routerLink="/components/card">Cards</a> — a table's chrome is
              overkill.
            </li>
            <li>
              For the key/value detail of a single record, use a description list,
              not a one-row table.
            </li>
            <li>
              For choosing one option, use a
              <a routerLink="/components/select">Select</a> or
              <a routerLink="/components/radio">Radio Group</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/pagination">Pagination</a> — the
              standalone paginator for non-table lists.
            </li>
            <li>
              <a routerLink="/components/empty-state">Empty State</a> — the empty
              block this table projects.
            </li>
            <li>
              <a routerLink="/components/overflow-menu">Overflow Menu</a> — per-row
              actions, as in the examples below.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Describe columns with a <code>ColumnDef&lt;T&gt;[]</code>, pass
          <code>data</code>, and the table handles sort + pagination. The same
          template serves a client-side array and a server-side
          <code>DataSource</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Columns &amp; modes</h2>
          <ul>
            <li>
              <strong>DataColumn</strong> — backed by a row field via
              <code>key</code> (<code>keyof T</code>); renders <code>row[key]</code>
              unless you supply a <code>cellTemplate</code>. Can be
              <code>sortable</code>.
            </li>
            <li>
              <strong>DisplayColumn</strong> — not backed by a field (e.g. an
              actions column); <code>key</code> is an arbitrary id and a
              <code>cellTemplate</code> is required. Never sortable.
            </li>
            <li>
              <strong>Client mode</strong> — pass a plain array; Material sorts and
              paginates in place.
            </li>
            <li>
              <strong>Server mode</strong> — pass a <code>DataSource</code>, set
              <code>sortMode="controlled"</code> + <code>totalCount</code>, and
              react to <code>(sortChange)</code> / <code>(pageChange)</code> to
              refetch. Internal sort with a <code>DataSource</code> throws in dev —
              the table can't sort data it doesn't own.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Slots &amp; theming</h2>
          <ul>
            <li>
              <code>[slot=empty-action]</code> projects a button into the default
              empty block; <code>[rhombusEmptyState]</code> replaces the empty block
              entirely.
            </li>
            <li>
              Surfaces and borders follow the Material table bridge; the loading
              spinner uses <code>--text-accent</code>. Re-theme via the contract
              tokens, not the table internals.
            </li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Built on Angular Material's table + sort: sortable headers are
            keyboard-operable and expose <code>aria-sort</code>. Loading and empty
            are distinct rendering paths, so assistive tech never sees a misleading
            empty table mid-fetch. Note that
            <strong>row click is a pointer convenience, not a keyboard control</strong>
            — if a row's primary action matters, also expose it as a focusable
            control in the row (a link or the actions menu); don't rely on
            <code>rowClick</code> alone.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Client-side table</h2>
        <p class="showcase-section__lead">
          Array data. Sortable headers (Title, Author, Published, Views) sort in
          place; Status and Actions show no sort affordance. Status uses a
          <code>cellTemplate</code> composing <code>rhombusBadge</code>; Views is
          right-aligned; Status is centered; Title has a <code>minWidth</code>.
          Click a row to select it.
        </p>

        <rhombus-data-table
          [data]="posts()"
          [columns]="columns()"
          [loading]="loading()"
          [pageSize]="5"
          [pageSizeOptions]="[5, 10, 25]"
          (sortChange)="onSort($event)"
          (pageChange)="onPage($event)"
          (rowClick)="onRowClick($event)"
        />

        <div class="event-log">
          <p>
            Selected row:
            <strong>{{ selectedRow()?.title ?? '—' }}</strong>
          </p>
          <p>Last sort: <strong>{{ lastSort() }}</strong></p>
          <p>Last page event: <strong>{{ lastPage() }}</strong></p>
          <p>Last action: <strong>{{ lastAction() }}</strong></p>
        </div>

        <div class="toolbar">
          <rhombus-button variant="secondary" size="sm" (click)="toggleLoading()">
            {{ loading() ? 'Stop loading' : 'Simulate loading' }}
          </rhombus-button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Controlled sort</h2>
        <p class="showcase-section__lead">
          <code>sortMode="controlled"</code>. The page owns both the data array
          and the <code>sortState</code> signal. Clicking a header emits
          <code>sortChange</code> — the table does NOT reorder; the page's handler
          re-sorts the array and updates <code>sortState</code>, which flows back
          into the header arrow.
        </p>
        <rhombus-data-table
          [data]="controlledPosts()"
          [columns]="controlledColumns"
          sortMode="controlled"
          [sortState]="controlledSort()"
          [paginated]="false"
          (sortChange)="onControlledSort($event)"
        />
        <div class="event-log">
          <p>
            Page-owned sortState:
            <strong>{{ controlledSortLabel() }}</strong>
          </p>
          <p>First row title: <strong>{{ controlledPosts()[0]?.title }}</strong></p>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Server-side data (DataSource)</h2>
        <p class="showcase-section__lead">
          The headline server mode. <code>[data]</code> is a CDK
          <code>DataSource</code> (not an array), <code>sortMode="controlled"</code>,
          and <code>[totalCount]</code> drives the paginator. Sorting or paging
          emits an event; the page simulates a ~400ms fetch, then pushes the new
          page of rows — the table never sorts or slices itself.
        </p>
        <rhombus-data-table
          [data]="serverDataSource"
          [columns]="controlledColumns"
          sortMode="controlled"
          [sortState]="serverSort()"
          [totalCount]="totalCount"
          [pageSize]="5"
          [pageSizeOptions]="[5, 10]"
          (sortChange)="onServerSort($event)"
          (pageChange)="onServerPage($event)"
        />
        <div class="event-log">
          <p>
            Last fetch:
            <strong>{{
              serverLoading() ? 'Fetching…' : serverFetchLabel()
            }}</strong>
          </p>
          <p>Server total rows: <strong>{{ totalCount }}</strong></p>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Desc-first sort</h2>
        <p class="showcase-section__lead">
          <code>sortStart="desc"</code> (internal mode). Clicking a fresh sortable
          column sorts descending on the first click instead of ascending.
        </p>
        <rhombus-data-table
          [data]="posts()"
          [columns]="controlledColumns"
          sortStart="desc"
          [pageSize]="5"
          [pageSizeOptions]="[5, 10]"
        />
      </section>

      <section class="showcase-section">
        <h2>Responsive columns</h2>
        <p class="showcase-section__lead">
          <code>hideBelow</code> hides low-priority columns on narrow viewports.
          Author is <code>hideBelow: 'md'</code> (hidden &lt; 768px); Views is
          <code>hideBelow: 'sm'</code> (hidden &lt; 640px). Resize the window or use
          device mode — remaining columns stay aligned.
        </p>
        <rhombus-data-table
          [data]="posts()"
          [columns]="responsiveColumns"
          [pageSize]="5"
          [pageSizeOptions]="[5, 10]"
        />
      </section>

      <!--
        Dev-mode assertion (not a live demo — it throws): passing a MatTableDataSource
        / CDK DataSource as [data] together with the default sortMode="internal"
        throws under isDevMode(). A DataSource owns its own data, so the table cannot
        sort it; use sortMode="controlled" and react to (sortChange) instead.
      -->

      <section class="showcase-section">
        <h2>Empty state — default</h2>
        <p class="showcase-section__lead">
          <code>[data]="[]"</code> with custom <code>emptyTitle</code> /
          <code>emptyMessage</code>. The built-in empty block renders only when
          not loading.
        </p>
        <rhombus-data-table
          [data]="[]"
          [columns]="columns()"
          emptyTitle="No posts yet"
          emptyMessage="Posts you create will show up here."
        >
          <rhombus-button slot="empty-action" variant="primary" size="sm">
            New post
          </rhombus-button>
        </rhombus-data-table>
      </section>

      <section class="showcase-section">
        <h2>Empty state — projected</h2>
        <p class="showcase-section__lead">
          A fully custom empty state via <code>[rhombusEmptyState]</code>. When
          present, it replaces the default block entirely.
        </p>
        <rhombus-data-table [data]="[]" [columns]="columns()">
          <div rhombusEmptyState class="custom-empty">
            <h3>Your inbox is clear</h3>
            <p>Every draft has been published. Nice work.</p>
            <rhombus-button variant="primary" size="sm">
              Write something new
            </rhombus-button>
          </div>
        </rhombus-data-table>
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
    .status-pill {
      display: inline-block;
      min-width: 1px;
    }
    .actions-cell {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
    }
    .event-log {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background-color: var(--surface-1);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }
    .event-log p {
      margin: 0.2rem 0;
    }
    .event-log strong {
      color: var(--text-primary);
    }
    .toolbar {
      margin-top: 1rem;
    }
    .custom-empty {
      color: var(--text-secondary);
    }
    .custom-empty h3 {
      margin: 0 0 0.5rem;
      color: var(--text-primary);
      font-size: 1rem;
    }
    .custom-empty p {
      margin: 0 0 1rem;
      font-size: 0.875rem;
    }
  `,
})
export default class DataTablePageComponent {
  private readonly confirm = inject(RhombusConfirmService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly posts = signal<Post[]>(POSTS);
  protected readonly loading = signal(false);

  // --- Overview hero: a compact, sortable client-side table. ---
  protected readonly heroPosts = signal<Post[]>(POSTS.slice(0, 4));

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { Component } from '@angular/core';
import { ColumnDef, RhombusDataTableComponent } from '@rhombuskit/core';

interface Post {
  title: string;
  author: string;
  viewCount: number;
}

@Component({
  selector: 'app-posts-table',
  imports: [RhombusDataTableComponent],
  template: \`<rhombus-data-table [data]="posts" [columns]="columns" />\`,
})
export class PostsTableComponent {
  readonly columns: ColumnDef<Post>[] = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'author', header: 'Author', sortable: true },
    { key: 'viewCount', header: 'Views', align: 'end', sortable: true },
  ];
  readonly posts: Post[] = [
    { title: 'Designing a token-first library', author: 'Ada Lovelace', viewCount: 12840 },
    { title: 'Signals vs. observables', author: 'Grace Hopper', viewCount: 9532 },
  ];
}`;

  // --- Controlled-sort demo: the PAGE owns order + sort state. ---
  protected readonly controlledPosts = signal<Post[]>(POSTS.slice(0, 6));
  protected readonly controlledSort = signal<SortState | null>(null);
  protected readonly controlledSortLabel = computed(() => {
    const s = this.controlledSort();
    return s?.direction ? `${s.active} ${s.direction}` : '—';
  });

  // Plain-text columns reused by the controlled-sort and desc-first demos.
  protected readonly controlledColumns: ColumnDef<Post>[] = [
    { key: 'title', header: 'Title', minWidth: '240px', sortable: true },
    { key: 'author', header: 'Author', minWidth: '160px', sortable: true },
    {
      key: 'viewCount',
      header: 'Views',
      width: '110px',
      align: 'end',
      sortable: true,
    },
  ];

  // Responsive demo: hide Author below md, Views below sm.
  protected readonly responsiveColumns: ColumnDef<Post>[] = [
    { key: 'title', header: 'Title', minWidth: '200px', sortable: true },
    {
      key: 'author',
      header: 'Author',
      minWidth: '160px',
      hideBelow: 'md',
      sortable: true,
    },
    {
      key: 'viewCount',
      header: 'Views',
      width: '110px',
      align: 'end',
      hideBelow: 'sm',
      sortable: true,
    },
  ];

  protected readonly selectedRow = signal<Post | null>(null);
  protected readonly lastSort = signal('—');
  protected readonly lastPage = signal('—');
  protected readonly lastAction = signal('—');

  private readonly statusTpl =
    viewChild<TemplateRef<PostCellContext>>('statusTpl');
  private readonly actionsTpl =
    viewChild<TemplateRef<PostCellContext>>('actionsTpl');

  protected readonly columns = computed<ColumnDef<Post>[]>(() => [
    { key: 'title', header: 'Title', minWidth: '240px', sortable: true },
    {
      key: 'status',
      header: 'Status',
      width: '150px',
      align: 'center',
      cellTemplate: this.statusTpl(),
    },
    { key: 'author', header: 'Author', minWidth: '160px', sortable: true },
    {
      key: 'date',
      header: 'Published',
      width: '140px',
      align: 'end',
      sortable: true,
    },
    {
      key: 'viewCount',
      header: 'Views',
      width: '110px',
      align: 'end',
      sortable: true,
    },
    // Action column has no backing field; `key` must satisfy keyof Post, so it
    // reuses `id` (whose value the cellTemplate overrides).
    {
      key: 'id',
      header: 'Actions',
      width: '140px',
      align: 'center',
      cellTemplate: this.actionsTpl(),
    },
  ]);

  // --- Server-side demo: a DataSource fed by simulated fetches. ---
  protected readonly totalCount = POSTS.length;
  private readonly serverRows$ = new BehaviorSubject<Post[]>([]);
  protected readonly serverDataSource = new PostDataSource(this.serverRows$);
  protected readonly serverSort = signal<SortState | null>(null);
  protected readonly serverLoading = signal(false);
  protected readonly serverFetchLabel = signal('—');
  private serverPageIndex = 0;
  private serverPageSize = 5;

  constructor() {
    // Seed the first server page.
    this.fetchServerPage();
  }

  protected onServerSort(sort: SortState): void {
    this.serverSort.set(sort);
    this.serverPageIndex = 0; // a new sort resets to the first page
    this.fetchServerPage();
  }

  protected onServerPage(page: PageState): void {
    this.serverPageIndex = page.pageIndex;
    this.serverPageSize = page.pageSize;
    this.fetchServerPage();
  }

  /** Simulate a server round-trip: sort + slice POSTS after a short delay. */
  private fetchServerPage(): void {
    this.serverLoading.set(true);
    const sort = this.serverSort();
    const page = this.serverPageIndex;
    const size = this.serverPageSize;
    setTimeout(() => {
      const rows = [...POSTS];
      if (sort?.direction) {
        const key = sort.active as keyof Post;
        const dir = sort.direction === 'asc' ? 1 : -1;
        rows.sort((a, b) => (a[key] < b[key] ? -dir : a[key] > b[key] ? dir : 0));
      }
      const start = page * size;
      this.serverRows$.next(rows.slice(start, start + size));
      this.serverFetchLabel.set(
        `page ${page} · size ${size}` +
          (sort?.direction ? ` · ${sort.active} ${sort.direction}` : '')
      );
      this.serverLoading.set(false);
    }, 400);
  }

  protected statusLabel(status: PostStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  protected statusVariant(status: PostStatus): BadgeVariant {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'scheduled':
        return 'primary';
      case 'archived':
        return 'default';
    }
  }

  protected toggleLoading(): void {
    this.loading.update((v) => !v);
  }

  protected onRowClick(row: Post): void {
    this.selectedRow.set(row);
  }

  protected onSort(sort: SortState): void {
    this.lastSort.set(
      sort.direction ? `${sort.active} ${sort.direction}` : 'cleared'
    );
  }

  // The table emits but never reorders in controlled mode — the PAGE owns order.
  protected onControlledSort(sort: SortState): void {
    this.controlledSort.set(sort);
    if (!sort.direction) {
      this.controlledPosts.set(POSTS.slice(0, 6));
      return;
    }
    const key = sort.active as keyof Post;
    const dir = sort.direction === 'asc' ? 1 : -1;
    this.controlledPosts.update((list) =>
      [...list].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      })
    );
  }

  protected onPage(page: PageState): void {
    this.lastPage.set(`index ${page.pageIndex} · size ${page.pageSize}`);
  }

  protected rowMenuItems(row: Post): OverflowMenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'edit',
        action: () => this.lastAction.set(`Edit → ${row.title}`),
      },
      {
        label: 'Archive',
        icon: 'archive',
        action: () => this.lastAction.set(`Archive → ${row.title}`),
      },
      {
        label: 'Delete…',
        icon: 'delete',
        variant: 'danger',
        dividerBefore: true,
        action: () => this.confirmDelete(row),
      },
    ];
  }

  private confirmDelete(row: Post): void {
    this.confirm
      .confirm({
        title: 'Delete post?',
        message: `"${row.title}" will be permanently removed.`,
        variant: 'danger',
        confirmLabel: 'Delete',
      })
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.posts.update((list) => list.filter((p) => p.id !== row.id));
        this.lastAction.set(`Deleted → ${row.title}`);
      });
  }
}
