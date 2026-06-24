import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROADMAP, type RoadmapItem } from './roadmap-data';

interface Column {
  id: 'now' | 'next' | 'considering';
  label: string;
  blurb: string;
  items: RoadmapItem[];
}

/**
 * `/roadmap` — a public Now / Next / Considering board. The "Considering"
 * column is explicitly community-shaped: requests and upvotes move items up,
 * and each gap links to a prefilled proposal. Tied to release trains, not
 * dates. Data is committed in roadmap-data.ts (a launch-time Action can
 * regenerate it from a Projects board + top-voted Discussions).
 */
@Component({
  selector: 'app-roadmap-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page roadmap">
      <header class="showcase-page__header">
        <h1>Roadmap</h1>
        <p class="roadmap__lead">
          You help build this roadmap. <strong>Considering</strong> is shaped by
          what the community requests and upvotes — see a gap, request it, and
          watch it move. Items track release trains, not calendar dates.
        </p>
        <p class="roadmap__cta">
          <a [href]="suggestUrl" target="_blank" rel="noopener">Suggest a feature →</a>
        </p>
      </header>

      <div class="board">
        @for (col of columns; track col.id) {
          <section class="board__col" [attr.data-col]="col.id" aria-labelledby="col-{{ col.id }}">
            <header class="board__head">
              <h2 id="col-{{ col.id }}" class="board__title">{{ col.label }}</h2>
              <p class="board__blurb">{{ col.blurb }}</p>
            </header>
            <ul class="board__list">
              @for (item of col.items; track item.title) {
                <li class="card">
                  <h3 class="card__title">{{ item.title }}</h3>
                  <p class="card__detail">{{ item.detail }}</p>
                  @if (item.link) {
                    <a class="card__link" [href]="item.link.url" target="_blank" rel="noopener">
                      {{ item.link.label }}
                    </a>
                  }
                </li>
              }
            </ul>
          </section>
        }
      </div>
    </div>
  `,
  styles: `
    .roadmap__lead {
      color: var(--text-secondary);
      max-width: 70ch;
      margin: 0.5rem 0 0;
    }
    .roadmap__cta { margin: 0.75rem 0 0; }
    .roadmap__cta a,
    .card__link {
      color: var(--text-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .board {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    @media (max-width: 880px) {
      .board { grid-template-columns: 1fr; }
    }
    .board__head { margin-bottom: 1rem; }
    .board__title {
      font-size: 1.1rem;
      margin: 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--border);
    }
    .board__col[data-col='now'] .board__title { border-bottom-color: var(--toast-success-text); }
    .board__col[data-col='next'] .board__title { border-bottom-color: var(--toast-info-text); }
    .board__col[data-col='considering'] .board__title { border-bottom-color: var(--border-accent); }
    .board__blurb {
      color: var(--text-muted);
      font-size: 0.8125rem;
      margin: 0.35rem 0 0;
    }
    .board__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .card {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem;
      background-color: var(--surface-1);
    }
    .card__title { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--text-primary); }
    .card__detail {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0.4rem 0 0;
    }
    .card__link { display: inline-block; margin-top: 0.6rem; }
  `,
})
export default class RoadmapPageComponent {
  protected readonly suggestUrl =
    'https://github.com/doug-williamson/RhombusKit/issues/new/choose';

  protected readonly columns: Column[] = [
    { id: 'now', label: 'Shipping now', blurb: 'In the current release train.', items: ROADMAP.now },
    { id: 'next', label: 'Up next', blurb: 'Accepted; not yet scheduled.', items: ROADMAP.next },
    {
      id: 'considering',
      label: 'Considering',
      blurb: 'Community-shaped — you decide.',
      items: ROADMAP.considering,
    },
  ];
}
