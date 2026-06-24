import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RhombusButtonComponent, RhombusCheckboxComponent } from '@rhombuskit/core';
import { COMPARISON, MATERIAL_MAP, type MigrationRow } from './material-map';

const REPO = 'https://github.com/doug-williamson/RhombusKit';

/**
 * `/migrate` — the "Migrating from Angular Material?" gap-finder.
 *
 * A migrator checks off the Material/CDK features their app uses; the page maps
 * each to its RhombusKit equivalent and surfaces the gaps as one-click
 * "request this component" deep links (prefilled, tagged `migration-blocker`).
 * The framing is honest: because RhombusKit is built over Material, a gap never
 * blocks migration — keep importing the Material/CDK piece while you adopt the
 * rest. Dogfoods rhombus-checkbox + rhombus-button.
 */
@Component({
  selector: 'app-migrate-page',
  standalone: true,
  imports: [RhombusCheckboxComponent, RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page migrate">
      <header class="showcase-page__header">
        <h1>Migrating from Angular Material?</h1>
        <p class="migrate__lead">
          RhombusKit is built <em>over</em> Angular Material, so you migrate
          incrementally — adopt RhombusKit components where they fit and keep
          importing Material/CDK for anything not covered yet. Tick the features
          your app uses to see your path, and request the gaps in one click.
        </p>
      </header>

      <section class="finder" aria-label="Migration gap-finder">
        <div class="finder__picker">
          <div class="finder__controls">
            <rhombus-button variant="secondary" (click)="selectAll()">Select all</rhombus-button>
            <rhombus-button variant="ghost" (click)="clear()">Clear</rhombus-button>
          </div>

          <fieldset class="finder__group">
            <legend>Angular Material</legend>
            @for (row of materialRows; track row.api) {
              <rhombus-checkbox
                [label]="row.material"
                [checked]="isSelected(row.api)"
                (checkedChange)="toggle(row.api, $event)"
              />
            }
          </fieldset>

          <fieldset class="finder__group">
            <legend>Angular CDK</legend>
            @for (row of cdkRows; track row.api) {
              <rhombus-checkbox
                [label]="row.material"
                [checked]="isSelected(row.api)"
                (checkedChange)="toggle(row.api, $event)"
              />
            }
          </fieldset>
        </div>

        <div class="finder__result" aria-live="polite">
          @if (counts().total === 0) {
            <p class="finder__empty">
              Select the Angular Material or CDK features your app uses, and your
              migration path appears here.
            </p>
          } @else {
            <p class="finder__headline">
              <strong>{{ ready() }} of {{ counts().total }}</strong> selected
              features have a RhombusKit equivalent today.
            </p>
            <p class="finder__sub">
              <span class="badge badge--full">{{ counts().full }} direct</span>
              <span class="badge badge--partial">{{ counts().partial }} partial</span>
              <span class="badge badge--gap">{{ counts().gap }} no equivalent yet</span>
            </p>
            @if (counts().gap > 0) {
              <p class="finder__note">
                Gaps don't block you — keep using Angular Material/CDK for those
                while you migrate the rest. Requesting them helps prioritise
                what gets built next.
              </p>
            }

            <ul class="finder__list">
              @for (row of selected(); track row.api) {
                <li class="result" [attr.data-match]="row.match">
                  <div class="result__head">
                    <span class="result__name">{{ row.material }}</span>
                    <span class="badge badge--{{ row.match }}">{{ matchLabel(row.match) }}</span>
                  </div>
                  @if (row.match !== 'gap') {
                    <p class="result__detail">→ RhombusKit {{ row.rk }} — {{ row.note }}</p>
                  } @else {
                    <p class="result__detail">{{ row.note }}</p>
                    @if (row.pkg === 'material') {
                      <a class="result__cta" [href]="requestUrl(row)" target="_blank" rel="noopener">
                        Request a RhombusKit {{ row.material }}
                      </a>
                      <span class="result__hint">Keep using Angular Material's <code>{{ row.api }}</code> meanwhile.</span>
                    } @else {
                      <span class="result__hint">Import <code>{{ row.api }}</code> from <code>&#64;angular/cdk</code> directly.</span>
                    }
                  }
                </li>
              }
            </ul>
          }
        </div>
      </section>

      <section class="showcase-section compare">
        <h2>How RhombusKit compares</h2>
        <p class="showcase-section__lead">
          An honest read of where RhombusKit leads and where it's behind.
        </p>
        <div class="compare__scroll">
          <table class="compare__table">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th scope="col" class="compare__rk">RhombusKit</th>
                <th scope="col">Angular Material</th>
                <th scope="col">PrimeNG</th>
                <th scope="col">Taiga UI</th>
                <th scope="col">Spartan/ng</th>
              </tr>
            </thead>
            <tbody>
              @for (row of comparison; track row.feature) {
                <tr>
                  <th scope="row">{{ row.feature }}</th>
                  <td class="compare__rk">{{ row.rhombuskit }}</td>
                  <td>{{ row.material }}</td>
                  <td>{{ row.primeng }}</td>
                  <td>{{ row.taiga }}</td>
                  <td>{{ row.spartan }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="compare__caveat">
          RhombusKit ships fewer components than the larger kits and is newer and
          independently maintained — see something missing?
          <a [href]="featureRequestUrl" target="_blank" rel="noopener">Request it</a>.
        </p>
      </section>
    </div>
  `,
  styles: `
    .migrate__lead {
      color: var(--text-secondary);
      max-width: 70ch;
      margin: 0.5rem 0 0;
    }
    .finder {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
      gap: 2rem;
      margin: 2rem 0 3rem;
    }
    @media (max-width: 768px) {
      .finder { grid-template-columns: 1fr; }
    }
    .finder__controls {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .finder__group {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.25rem 1.25rem;
      margin: 0 0 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .finder__group legend {
      font-weight: 600;
      color: var(--text-primary);
      padding: 0 0.5rem;
    }
    .finder__result {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.5rem;
      background-color: var(--surface-1);
      align-self: start;
      position: sticky;
      top: 1rem;
    }
    .finder__empty {
      color: var(--text-secondary);
      margin: 0;
    }
    .finder__headline {
      margin: 0 0 0.75rem;
      font-size: 1.1rem;
      color: var(--text-primary);
    }
    .finder__sub {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0 0 1rem;
    }
    .finder__note {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0 0 1rem;
      max-width: 60ch;
    }
    .finder__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .result {
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;
    }
    .result__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .result__name { font-weight: 600; color: var(--text-primary); }
    .result__detail {
      margin: 0.35rem 0 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .result__cta {
      display: inline-block;
      margin: 0.5rem 0.75rem 0 0;
      color: var(--text-primary);
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 2px;
      font-size: 0.875rem;
    }
    .result__hint {
      color: var(--text-muted);
      font-size: 0.8125rem;
    }
    .badge {
      display: inline-block;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge--full { background-color: var(--toast-success-bg); color: var(--toast-success-text); }
    .badge--partial { background-color: var(--toast-warning-bg); color: var(--toast-warning-text); }
    .badge--gap { background-color: var(--toast-error-bg); color: var(--toast-error-text); }
    .compare__scroll { overflow-x: auto; }
    .compare__table {
      border-collapse: collapse;
      width: 100%;
      min-width: 720px;
      font-size: 0.875rem;
    }
    .compare__table th,
    .compare__table td {
      border: 1px solid var(--border);
      padding: 0.6rem 0.75rem;
      text-align: left;
      vertical-align: top;
      color: var(--text-secondary);
    }
    .compare__table thead th { color: var(--text-primary); background-color: var(--surface-2); }
    .compare__table th[scope='row'] { color: var(--text-primary); font-weight: 600; }
    .compare__table .compare__rk { color: var(--text-primary); background-color: var(--surface-1); font-weight: 600; }
    .compare__caveat { color: var(--text-secondary); font-size: 0.875rem; margin-top: 1rem; }
    .compare__caveat a { color: var(--text-primary); text-decoration: underline; text-underline-offset: 2px; }
  `,
})
export default class MigratePageComponent {
  protected readonly comparison = COMPARISON;
  protected readonly materialRows = MATERIAL_MAP.filter((r) => r.pkg === 'material');
  protected readonly cdkRows = MATERIAL_MAP.filter((r) => r.pkg === 'cdk');

  protected readonly featureRequestUrl = `${REPO}/issues/new/choose`;

  private readonly selectedKeys = signal<ReadonlySet<string>>(new Set());

  protected readonly selected = computed<MigrationRow[]>(() => {
    const keys = this.selectedKeys();
    return MATERIAL_MAP.filter((r) => keys.has(r.api));
  });

  protected readonly counts = computed(() => {
    const sel = this.selected();
    return {
      total: sel.length,
      full: sel.filter((r) => r.match === 'full').length,
      partial: sel.filter((r) => r.match === 'partial').length,
      gap: sel.filter((r) => r.match === 'gap').length,
    };
  });

  /** Features you can adopt today (direct + partial). */
  protected readonly ready = computed(() => this.counts().full + this.counts().partial);

  protected isSelected(api: string): boolean {
    return this.selectedKeys().has(api);
  }

  protected toggle(api: string, checked: boolean): void {
    const next = new Set(this.selectedKeys());
    if (checked) {
      next.add(api);
    } else {
      next.delete(api);
    }
    this.selectedKeys.set(next);
  }

  protected selectAll(): void {
    this.selectedKeys.set(new Set(MATERIAL_MAP.map((r) => r.api)));
  }

  protected clear(): void {
    this.selectedKeys.set(new Set());
  }

  protected matchLabel(match: MigrationRow['match']): string {
    return match === 'full'
      ? 'Direct equivalent'
      : match === 'partial'
        ? 'Partial'
        : 'No equivalent yet';
  }

  protected requestUrl(row: MigrationRow): string {
    const params = new URLSearchParams({
      template: '3-new-component-proposal.yml',
      title: `[Component]: ${row.material}`,
      labels: 'new-component,needs-triage,migration-blocker',
      name: `${row.material} (Angular Material parity)`,
    });
    return `${REPO}/issues/new?${params.toString()}`;
  }
}
