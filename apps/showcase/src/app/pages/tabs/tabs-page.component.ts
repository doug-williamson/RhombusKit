import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RhombusTabGroupDirective } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-tabs-page',
  standalone: true,
  imports: [
    MatTabsModule,
    RhombusTabGroupDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Tabs" apiKey="RhombusTabGroupDirective">
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
          <h2>When to use</h2>
          <ul>
            <li>
              Use tabs to switch between <strong>peer views of one subject</strong>
              within a page (Overview / Activity / Settings). For navigating to
              different pages, prefer <strong>Breadcrumbs</strong> or a nav menu.
            </li>
            <li>
              It is a <strong>directive</strong>, not a wrapper component, so
              Material's <code>@ContentChildren</code> query keeps finding your
              <code>&lt;mat-tab&gt;</code> children; read the active index from
              <code>(tabChange)</code>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
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

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Inherits Material's tab semantics: the labels form a
            <code>tablist</code> and each panel is a <code>tabpanel</code> wired
            together with <code>aria-controls</code> /
            <code>aria-labelledby</code>. The active label is reachable with
            <kbd>Tab</kbd>, and the <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> arrow
            keys move between tabs.
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
