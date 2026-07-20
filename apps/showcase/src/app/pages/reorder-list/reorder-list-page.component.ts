import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusCardComponent,
  RhombusCodeBlockComponent,
  RhombusReorderEmptyDirective,
  RhombusReorderItemDirective,
  RhombusReorderListComponent,
  ReorderEvent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

interface Track {
  id: number;
  title: string;
  artist: string;
}

@Component({
  selector: 'app-reorder-list-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCardComponent,
    RhombusCodeBlockComponent,
    RhombusReorderListComponent,
    RhombusReorderItemDirective,
    RhombusReorderEmptyDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Reorder List"
      [hasUsage]="true"
      [apiKey]="apiKeys"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A reorder list lets a user change the order of items — by dragging, by
          the up/down buttons, or entirely from the keyboard. RhombusKit's
          <code>&lt;rhombus-reorder-list&gt;</code> layers a full keyboard
          grab-mode and live-region announcements over
          <code>&#64;angular/cdk/drag-drop</code>, because <code>cdkDrag</code>
          alone is invisible to assistive tech.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <p class="showcase-section__lead">
            Tab to a drag handle, press <kbd>Space</kbd> to pick an item up, use
            the arrow keys to move it, and <kbd>Space</kbd> again to drop.
          </p>
          <app-example [code]="basicUsage">
            <rhombus-card>
              <rhombus-reorder-list [(items)]="fruit">
                <ng-template rhombusReorderItem let-item let-i="index">
                  <span class="row">{{ i + 1 }}. {{ item }}</span>
                </ng-template>
              </rhombus-reorder-list>
            </rhombus-card>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>When the <strong>order itself is the data</strong> — a playlist, a priority queue, dashboard widgets, form steps.</li>
            <li>When users need a <strong>keyboard-accessible</strong> alternative to drag-and-drop.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>To <strong>navigate</strong> between destinations, use a <a routerLink="/components/nav-list">Nav List</a>.</li>
            <li>To <strong>sort a grid</strong> by a column, use the <a routerLink="/components/data-table">Data Table</a> sort headers.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Bind <code>[(items)]</code>, provide the required
          <code>[rhombusReorderItem]</code> template, and (optionally) an
          <code>itemLabel</code> so announcements name each row.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; inputs</h2>
          <ul>
            <li><code>[(items)]</code> — the ordered list (a two-way model); it updates live as items move.</li>
            <li><code>itemLabel</code> — <code>(item, index) =&gt; string</code> used for the handle label and announcements (defaults to <code>String(item)</code>).</li>
            <li><code>showHandle</code> / <code>showButtons</code> — toggle the drag handle and the up/down buttons; <code>disabled</code> freezes the list.</li>
            <li><code>trackBy</code> — defaults to tracking each item by reference so DOM nodes move (and focus is preserved) instead of being recreated.</li>
            <li><code>announce</code> — a formatter for localising the live-region messages.</li>
            <li><code>(reordered)</code> — emits a <code>ReorderEvent</code> once per committed reorder (never on an intermediate arrow move or an escape-cancel).</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The list is a <code>&lt;ul role="list"&gt;</code> with
            visually-hidden instructions wired via
            <code>aria-describedby</code>. Each row has a labelled drag handle
            and up/down buttons. The keyboard grab-mode
            (<kbd>Space</kbd>/<kbd>Enter</kbd> to pick up,
            <kbd>↑</kbd>/<kbd>↓</kbd> and <kbd>Home</kbd>/<kbd>End</kbd> to move,
            <kbd>Esc</kbd> to cancel, moving focus away to commit) is independent
            of pointer dragging, and every change is announced assertively via
            the CDK <code>LiveAnnouncer</code> — no deprecated
            <code>aria-grabbed</code>.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Objects with a custom label &amp; a live log</h2>
          <app-example [code]="objectUsage">
            <rhombus-card>
              <rhombus-reorder-list
                [(items)]="tracks"
                [itemLabel]="trackLabel"
                (reordered)="log($event)"
              >
                <ng-template rhombusReorderItem let-track>
                  <span class="track">
                    <strong>{{ track.title }}</strong>
                    <span class="track__artist">{{ track.artist }}</span>
                  </span>
                </ng-template>
                <ng-template rhombusReorderEmpty>
                  <span class="empty">Your queue is empty.</span>
                </ng-template>
              </rhombus-reorder-list>
              @if (lastMove()) {
                <p class="log">{{ lastMove() }}</p>
              }
            </rhombus-card>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>Buttons only (no handle)</h2>
          <app-example [code]="buttonsUsage">
            <rhombus-card>
              <rhombus-reorder-list [(items)]="steps" [showHandle]="false">
                <ng-template rhombusReorderItem let-item>{{ item }}</ng-template>
              </rhombus-reorder-list>
            </rhombus-card>
          </app-example>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    rhombus-card {
      display: block;
      max-width: 460px;
    }
    .row,
    .track {
      display: flex;
      flex-direction: column;
    }
    .track__artist {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }
    .empty {
      color: var(--text-secondary);
    }
    .log {
      margin: 0.75rem 0 0;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
  `,
})
export default class ReorderListPageComponent {
  protected readonly apiKeys = [
    'RhombusReorderListComponent',
    'RhombusReorderItemDirective',
    'RhombusReorderEmptyDirective',
    'ReorderEvent',
  ];

  protected readonly fruit = signal(['Apples', 'Bananas', 'Cherries', 'Dates']);

  protected readonly tracks = signal<Track[]>([
    { id: 1, title: 'Signal Flow', artist: 'Nova' },
    { id: 2, title: 'Token Ring', artist: 'Meridian' },
    { id: 3, title: 'Overlay', artist: 'The Portals' },
  ]);

  protected readonly steps = signal(['Draft', 'Review', 'Approve', 'Publish']);

  protected readonly lastMove = signal<string | null>(null);

  protected readonly trackLabel = (track: Track) => track.title;

  protected log(event: ReorderEvent<Track>): void {
    this.lastMove.set(
      `Moved “${event.item.title}” from position ${event.previousIndex + 1} to ${
        event.currentIndex + 1
      }.`
    );
  }

  protected readonly basicUsage = `<rhombus-reorder-list [(items)]="fruit">
  <ng-template rhombusReorderItem let-item let-i="index">
    {{ i + 1 }}. {{ item }}
  </ng-template>
</rhombus-reorder-list>`;

  protected readonly usage = `import {
  RhombusReorderListComponent,
  RhombusReorderItemDirective,
  ReorderEvent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-queue',
  imports: [RhombusReorderListComponent, RhombusReorderItemDirective],
  template: \`
    <rhombus-reorder-list
      [(items)]="tracks"
      [itemLabel]="labelOf"
      (reordered)="save($event)"
    >
      <ng-template rhombusReorderItem let-track>{{ track.title }}</ng-template>
    </rhombus-reorder-list>
  \`,
})
export class QueueComponent {
  tracks = signal<Track[]>([/* … */]);
  labelOf = (t: Track) => t.title;
  save(e: ReorderEvent<Track>) { /* persist e.items */ }
}`;

  protected readonly objectUsage = `<rhombus-reorder-list
  [(items)]="tracks"
  [itemLabel]="trackLabel"
  (reordered)="log($event)"
>
  <ng-template rhombusReorderItem let-track>
    <strong>{{ track.title }}</strong> — {{ track.artist }}
  </ng-template>
  <ng-template rhombusReorderEmpty>Your queue is empty.</ng-template>
</rhombus-reorder-list>`;

  protected readonly buttonsUsage = `<rhombus-reorder-list [(items)]="steps" [showHandle]="false">
  <ng-template rhombusReorderItem let-item>{{ item }}</ng-template>
</rhombus-reorder-list>`;
}
