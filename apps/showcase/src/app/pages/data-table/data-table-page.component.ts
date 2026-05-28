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
import { filter } from 'rxjs/operators';
import {
  ColumnDef,
  OverflowMenuItem,
  PageState,
  RhombusBadgeDirective,
  RhombusButtonComponent,
  RhombusConfirmService,
  RhombusDataTableComponent,
  RhombusEmptyStateDirective,
  RhombusOverflowMenuComponent,
  SortState,
  type BadgeVariant,
} from '@rhombuskit/core';

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

@Component({
  selector: 'app-data-table-page',
  standalone: true,
  imports: [
    RhombusDataTableComponent,
    RhombusEmptyStateDirective,
    RhombusBadgeDirective,
    RhombusButtonComponent,
    RhombusOverflowMenuComponent,
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

    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Data Table</h1>
        <p>
          <code>&lt;rhombus-data-table&gt;</code> is config-driven via a
          <code>columns</code> array with a <code>cellTemplate</code> escape
          hatch. It auto-detects its mode from the <code>data</code> input: a
          plain array runs client-side (Material handles sort + pagination); a
          <code>DataSource</code> runs server-side (you react to
          <code>sortChange</code>/<code>pageChange</code> and refetch). Loading
          and empty are distinct rendering paths.
        </p>
      </header>

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
