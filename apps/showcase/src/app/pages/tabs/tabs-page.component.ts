import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import {
  RhombusTabGroupDirective,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-tabs-page',
  standalone: true,
  imports: [
    RouterLink,
    MatTabsModule,
    RhombusTabGroupDirective,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Tabs" apiKey="RhombusTabGroupDirective" [hasUsage]="true">
      <div overview class="overview">
        <p class="overview__lead">
          Tabs organise related content into peer panels that share one region,
          surfacing one at a time. RhombusKit applies the
          <code>[rhombusTabGroup]</code> directive to Material's
          <code>&lt;mat-tab-group&gt;</code> so colour flows through the token
          contract — the active label and ink bar track <code>--text-accent</code>,
          re-skinning when you toggle the theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <mat-tab-group rhombusTabGroup (tabChange)="activeIndex.set($event)">
              <mat-tab label="Overview">
                <div class="tab-body">
                  <p>A summary of the project and its current status.</p>
                </div>
              </mat-tab>
              <mat-tab label="Activity">
                <div class="tab-body">
                  <p>Recent edits, comments, and status changes.</p>
                </div>
              </mat-tab>
              <mat-tab label="Settings">
                <div class="tab-body">
                  <p>Configuration for visibility and members.</p>
                </div>
              </mat-tab>
            </mat-tab-group>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use tabs to switch between <strong>peer views of one subject</strong>
              within a page (Overview / Activity / Settings) where all sections are
              equally important and you want to avoid a long scroll.
            </li>
            <li>
              When the panels share a single context and the user is likely to move
              between them — tabs keep that context in place rather than navigating away.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>To move between distinct destinations or pages, use <a routerLink="/components/breadcrumbs">Breadcrumbs</a> or a navigation surface like the <a routerLink="/components/bottom-nav">Bottom Nav</a> — tabs are for peer views, not site navigation.</li>
            <li>For a flat list of one-off actions off a trigger, use a <a routerLink="/components/menu">Menu</a> (or an <a routerLink="/components/overflow-menu">Overflow Menu</a> for row actions).</li>
            <li>For a linear, must-complete-in-order flow, prefer a dedicated stepper pattern rather than free-roaming tabs.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/breadcrumbs">Breadcrumbs</a> — locate the current page within a hierarchy.</li>
            <li><a routerLink="/components/menu">Menu</a> — action lists off a trigger.</li>
            <li><a routerLink="/components/card">Card</a> — group the content that lives inside each panel.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Tabs are driven by the <code>[rhombusTabGroup]</code> directive on a
          <code>&lt;mat-tab-group&gt;</code>; each view is a child
          <code>&lt;mat-tab&gt;</code>, and the active index is reported through
          <code>(tabChange)</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>rhombusTabGroup</code> — apply to <code>&lt;mat-tab-group&gt;</code>. It adds the <code>.rhombus-tab-group</code> host class (themed in <code>@rhombuskit/material-preset</code>) and re-emits the selection as <code>(tabChange)</code>, a <code>number</code> of the new index.</li>
            <li><code>&lt;mat-tab label="…"&gt;</code> — one per view. Its <strong>default content slot</strong> projects the panel body. It is a directive (not a wrapper) precisely so Material's <code>@ContentChildren(MatTab)</code> query still finds these children.</li>
            <li><code>label</code> / <code>[disabled]</code> on a <code>&lt;mat-tab&gt;</code> set the tab's text and disable it; richer label markup uses Material's <code>&lt;ng-template mat-tab-label&gt;</code>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Tabs render inline (no CDK overlay), and their colours are bridged
            globally in <code>@rhombuskit/material-preset</code> via
            <code>mat.tabs-overrides</code>, which read these contract tokens:
          </p>
          <ul>
            <li><code>--text-accent</code> — active label text and the ink-bar / active indicator</li>
            <li><code>--text-secondary</code> — inactive label text</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Inherits Material's tab semantics: the labels form a
            <code>role="tablist"</code> and each panel is a
            <code>role="tabpanel"</code>, wired together with
            <code>aria-controls</code> / <code>aria-labelledby</code> and reflecting
            <code>aria-selected</code> on the active label. The tab strip is a single
            <kbd>Tab</kbd> stop, and the <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> arrow
            keys move the selection between tabs. A tab marked
            <code>[disabled]</code> is skipped by keyboard navigation. The directive
            adds no extra ARIA of its own — give each <code>&lt;mat-tab&gt;</code> a
            clear <code>label</code> so the relationship is announced.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Tabbed panels</h2>
        <p class="showcase-section__lead">
          Each <code>&lt;mat-tab&gt;</code> projects its own panel content.
        </p>
        <mat-tab-group rhombusTabGroup (tabChange)="activeIndex.set($event)">
          <mat-tab label="Overview">
            <div class="tab-body">
              <h3>Overview</h3>
              <p>A summary of the project, its goals, and current status.</p>
            </div>
          </mat-tab>
          <mat-tab label="Activity">
            <div class="tab-body">
              <h3>Activity</h3>
              <p>Recent edits, comments, and status changes.</p>
            </div>
          </mat-tab>
          <mat-tab label="Settings">
            <div class="tab-body">
              <h3>Settings</h3>
              <p>Configuration for visibility, members, and integrations.</p>
            </div>
          </mat-tab>
          <mat-tab label="Archived" [disabled]="true">
            <div class="tab-body">Archived</div>
          </mat-tab>
        </mat-tab-group>
      </section>

      <div class="event-log">
        <p>Active tab index: <strong>{{ activeIndex() }}</strong></p>
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
    .tab-body {
      padding: 1.25rem 0.25rem;
      color: var(--text-secondary);
    }
    .tab-body h3 {
      margin: 0 0 0.5rem;
      color: var(--text-primary);
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
export default class TabsPageComponent {
  protected readonly activeIndex = signal(0);

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusTabGroupDirective } from '@rhombuskit/core';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-project',
  imports: [MatTabsModule, RhombusTabGroupDirective],
  template: \`
    <mat-tab-group rhombusTabGroup (tabChange)="activeIndex.set($event)">
      <mat-tab label="Overview">…</mat-tab>
      <mat-tab label="Activity">…</mat-tab>
      <mat-tab label="Settings">…</mat-tab>
    </mat-tab-group>
  \`,
})
export class ProjectComponent {
  readonly activeIndex = signal(0);
}`;
}
