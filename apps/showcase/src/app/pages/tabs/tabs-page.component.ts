import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RhombusTabGroupDirective } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-tabs-page',
  standalone: true,
  imports: [MatTabsModule, RhombusTabGroupDirective, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Tabs" apiKey="RhombusTabGroupDirective">
      <div overview>
        <p>
          <code>[rhombusTabGroup]</code> decorates Material's
          <code>&lt;mat-tab-group&gt;</code> (the same directive approach as
          chip-group, so Material's <code>@ContentChildren</code> query keeps
          working). The active label and ink bar are themed via
          <code>--text-accent</code> — toggle the theme to see it — and the
          group re-emits selection as <code>(tabChange)</code> with the index.
        </p>
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
}
