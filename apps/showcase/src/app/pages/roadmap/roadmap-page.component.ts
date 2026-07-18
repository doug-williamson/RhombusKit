import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROADMAP, type RoadmapItem, type RoadmapTrack } from './roadmap-data';

interface Column {
  id: 'now' | 'next' | 'considering';
  label: string;
  blurb: string;
  items: RoadmapItem[];
}

interface Track {
  id: 'components' | 'foundations';
  label: string;
  blurb: string;
  columns: Column[];
}

/**
 * `/roadmap` — a public Now / Next / Considering board across two parallel
 * tracks: the component library (shipped in themed release-train "packs") and
 * the non-component Foundations work (system depth, theming, DX). The
 * "Considering" columns are explicitly community-shaped: requests and upvotes
 * move items up, and each component gap links to a prefilled proposal. Tied to
 * release trains, not dates. Data is committed in roadmap-data.ts (a launch-time
 * Action can regenerate it from a Projects board + top-voted Discussions).
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
          You help build this roadmap. It runs on two tracks —
          <strong>Components</strong> (shipped in themed release-train packs) and
          <strong>Foundations</strong> (density, theming, RTL, and tooling). The
          <strong>Considering</strong> columns are shaped by what the community
          requests and upvotes. Items track release trains, not calendar dates.
        </p>
        <p class="roadmap__shipped">
          Recently shipped the <strong>Date Picker</strong>,
          <strong>Accordion</strong>, and an opt-in Material bridge (v1.9), plus a
          nested Nav List tree and Tag input.
        </p>
        <p class="roadmap__cta">
          <a [href]="suggestUrl" target="_blank" rel="noopener">Suggest a feature →</a>
        </p>
      </header>

      @for (track of tracks; track track.id) {
        <section class="track" [attr.data-track]="track.id" aria-labelledby="track-{{ track.id }}">
          <header class="track__head">
            <h2 id="track-{{ track.id }}" class="track__title">{{ track.label }}</h2>
            <p class="track__blurb">{{ track.blurb }}</p>
          </header>

          <div class="board">
            @for (col of track.columns; track col.id) {
              <section
                class="board__col"
                [attr.data-col]="col.id"
                aria-labelledby="col-{{ track.id }}-{{ col.id }}"
              >
                <header class="board__head">
                  <h3 id="col-{{ track.id }}-{{ col.id }}" class="board__title">{{ col.label }}</h3>
                  <p class="board__blurb">{{ col.blurb }}</p>
                </header>
                <ul class="board__list">
                  @for (item of col.items; track item.title) {
                    <li class="card">
                      <div class="card__head">
                        <h4 class="card__title">{{ item.title }}</h4>
                        @if (item.tag) {
                          <span class="card__tag">{{ item.tag }}</span>
                        }
                      </div>
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
        </section>
      }
    </div>
  `,
  styles: `
    .roadmap__lead {
      color: var(--text-secondary);
      max-width: 70ch;
      margin: 0.5rem 0 0;
    }
    .roadmap__shipped {
      color: var(--text-muted);
      max-width: 70ch;
      margin: 0.75rem 0 0;
      font-size: 0.85rem;
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
    .track { margin-top: 2.5rem; }
    .track__head { margin-bottom: 0.5rem; }
    .track__title {
      font-size: 1.35rem;
      margin: 0;
    }
    .track__blurb {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0.25rem 0 0;
    }
    .board {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.5rem;
      margin-top: 1.25rem;
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
    .card__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .card__title { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--text-primary); }
    .card__tag {
      flex: none;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-primary);
      background-color: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 0.1rem 0.45rem;
      white-space: nowrap;
    }
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

  protected readonly tracks: Track[] = [
    {
      id: 'components',
      label: 'Components',
      blurb: 'The component library, shipped in themed release-train packs.',
      columns: this.columnsFor(ROADMAP.components, {
        now: 'In the current release train (v1.11).',
        next: 'Accepted; the next train (v1.12).',
        considering: 'Community-shaped — you decide.',
      }),
    },
    {
      id: 'foundations',
      label: 'Foundations',
      blurb: 'System depth, theming, and DX that advance in parallel with the components.',
      columns: this.columnsFor(ROADMAP.foundations, {
        now: 'Active foundation work.',
        next: 'Accepted; scheduled next.',
        considering: 'Under exploration.',
      }),
    },
  ];

  private columnsFor(
    track: RoadmapTrack,
    blurbs: Record<'now' | 'next' | 'considering', string>,
  ): Column[] {
    return [
      { id: 'now', label: 'Shipping now', blurb: blurbs.now, items: track.now },
      { id: 'next', label: 'Up next', blurb: blurbs.next, items: track.next },
      { id: 'considering', label: 'Considering', blurb: blurbs.considering, items: track.considering },
    ];
  }
}
