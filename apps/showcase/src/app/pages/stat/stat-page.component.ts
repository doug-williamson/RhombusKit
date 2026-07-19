import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCardComponent,
  RhombusCodeBlockComponent,
  RhombusIconComponent,
  RhombusStatComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-stat-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusButtonComponent,
    RhombusCardComponent,
    RhombusCodeBlockComponent,
    RhombusIconComponent,
    RhombusStatComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Stat"
      [hasUsage]="true"
      apiKey="RhombusStatComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A stat is a compact KPI tile — a labelled metric with an optional change
          indicator — designed to sit inside a
          <a routerLink="/components/card">Card</a> on a dashboard. RhombusKit's
          <code>&lt;rhombus-stat&gt;</code> is bespoke and display-only: no
          Material, no new tokens, and it never leans on colour alone to signal
          direction.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="basicUsage">
            <rhombus-card>
              <rhombus-stat
                label="Revenue"
                [value]="'$42,800'"
                delta="+12%"
                caption="vs. last month"
              />
            </rhombus-card>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>Trend vs. sentiment</h2>
          <p class="showcase-section__lead">
            Two independent knobs. <code>trend</code> points the arrow;
            <code>sentiment</code> picks the colour. They default to
            <code>auto</code> (from the delta's sign) but decouple for inverted
            metrics — a falling <strong>churn</strong> rate keeps its true
            <em>down</em> arrow while reading as a <em>positive</em>.
          </p>
          <div class="stat-grid">
            <rhombus-card>
              <rhombus-stat label="Active users" [value]="'18,204'" delta="+8.1%" caption="7-day" />
            </rhombus-card>
            <rhombus-card>
              <rhombus-stat label="Error rate" value="0.42%" delta="-0.1pt" caption="7-day" />
            </rhombus-card>
            <rhombus-card>
              <rhombus-stat
                label="Churn"
                value="2.1%"
                delta="-0.4pt"
                sentiment="positive"
                caption="down is good"
              />
            </rhombus-card>
          </div>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>For a <strong>headline metric</strong> on a dashboard or summary card — a number, its label, and how it changed.</li>
            <li>When the <strong>direction of change</strong> matters and must be accessible (colour-blind safe, screen-reader announced).</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>For <strong>tabular figures</strong> across many rows/columns, use a <a routerLink="/components/data-table">Data Table</a>.</li>
            <li>For a <strong>status label</strong> (draft, published) rather than a metric, use a <a routerLink="/components/tag">Tag</a>.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Place a <code>&lt;rhombus-stat&gt;</code> inside a card. Set
          <code>label</code> and <code>value</code>; add a <code>delta</code> for
          the change pill; project <code>[slot=icon]</code> and a sparkline as
          default content.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; inputs</h2>
          <ul>
            <li><code>label</code> / <code>value</code> — the metric name and figure; <code>value</code> renders verbatim and <code>0</code> shows (guarded on <code>!= null</code>).</li>
            <li><code>delta</code> — the change pill's text (<code>null</code> hides it); numeric or a string like <code>+12%</code>.</li>
            <li><code>trend</code> (<code>up</code>/<code>down</code>/<code>neutral</code>/<code>auto</code>) — the arrow; <code>sentiment</code> (<code>positive</code>/<code>negative</code>/<code>neutral</code>/<code>auto</code>) — the colour. Both default to <code>auto</code> off the delta's sign.</li>
            <li><code>deltaLabel</code> — the visually-hidden direction phrase (default <code>Increased</code>/<code>Decreased</code>/<code>No change</code>); override to translate.</li>
            <li><code>caption</code> — a secondary line (comparison period); <code>size</code> — <code>sm</code>/<code>md</code>/<code>lg</code>; <code>live</code> — announce value changes.</li>
            <li><strong>Slots</strong> — <code>[slot=icon]</code> for leading media, default content for a sparkline / secondary line.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <ul>
            <li><code>--text-primary</code> / <code>--text-secondary</code> / <code>--text-muted</code> — value, label, caption.</li>
            <li><code>--toast-success-*</code> / <code>--toast-error-*</code> — the positive / negative delta pill.</li>
            <li><code>--surface-2</code> — the neutral delta pill.</li>
            <li><code>--radius-full</code> — the pill radius.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The tile is a semantic definition list —
            <code>&lt;dl&gt;&lt;dt&gt;label&lt;/dt&gt;&lt;dd&gt;value…&lt;/dd&gt;&lt;/dl&gt;</code>
            — so the label and value are programmatically associated. Change
            direction is conveyed <strong>three ways</strong>: the sentiment
            colour, a labelled trend arrow, and a visually-hidden phrase
            (<em>“Increased”</em>), so it is never colour-only. The value uses
            <code>tabular-nums</code>. Set <code>live</code> to wrap the value in a
            polite <code>aria-live</code> region for streaming metrics.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Sizes</h2>
          <div class="stat-grid">
            <rhombus-card>
              <rhombus-stat size="sm" label="Sessions" [value]="'1,204'" delta="+3%" />
            </rhombus-card>
            <rhombus-card>
              <rhombus-stat size="md" label="Sessions" [value]="'1,204'" delta="+3%" />
            </rhombus-card>
            <rhombus-card>
              <rhombus-stat size="lg" label="Sessions" [value]="'1,204'" delta="+3%" />
            </rhombus-card>
          </div>
        </section>

        <section class="showcase-section">
          <h2>With a leading icon</h2>
          <div class="stat-grid">
            <rhombus-card>
              <rhombus-stat label="Revenue" [value]="'$42,800'" delta="+12%" caption="vs. last month">
                <rhombus-icon slot="icon" name="trending_up" size="lg" />
              </rhombus-stat>
            </rhombus-card>
          </div>
        </section>

        <section class="showcase-section">
          <h2>With a sparkline (default slot)</h2>
          <div class="stat-grid">
            <rhombus-card>
              <rhombus-stat label="Traffic" [value]="'92.3k'" delta="+5.4%">
                <svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
                  <polyline
                    points="0,22 14,18 28,20 42,10 56,13 70,6 84,9 100,2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
              </rhombus-stat>
            </rhombus-card>
          </div>
        </section>

        <section class="showcase-section">
          <h2>No change &amp; no delta</h2>
          <div class="stat-grid">
            <rhombus-card>
              <rhombus-stat label="Uptime" value="100%" delta="0.0%" caption="30-day" />
            </rhombus-card>
            <rhombus-card>
              <rhombus-stat label="Open tickets" [value]="42" caption="no change indicator" />
            </rhombus-card>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Live value</h2>
          <p class="showcase-section__lead">
            <code>live</code> wraps the value in a polite <code>aria-live</code>
            region so updates are announced.
          </p>
          <div class="stat-grid">
            <rhombus-card>
              <rhombus-stat label="Requests / sec" [value]="rps()" [delta]="rpsDelta()" live />
            </rhombus-card>
          </div>
          <rhombus-button appearance="outlined" (click)="tick()">Simulate update</rhombus-button>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      max-width: 760px;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .spark {
      display: block;
      width: 100%;
      height: 28px;
      color: var(--text-accent);
    }
    rhombus-button {
      margin-top: 1rem;
    }
  `,
})
export default class StatPageComponent {
  protected readonly rps = signal(1280);
  protected readonly rpsDelta = signal('+2.1%');

  protected tick(): void {
    const next = this.rps() + Math.round((this.rps() % 37) - 12);
    this.rps.set(next);
    this.rpsDelta.set(next >= 1280 ? '+2.1%' : '-1.4%');
  }

  protected readonly basicUsage = `<rhombus-card>
  <rhombus-stat
    label="Revenue"
    [value]="'$42,800'"
    delta="+12%"
    caption="vs. last month"
  />
</rhombus-card>`;

  protected readonly usage = `import { RhombusStatComponent, RhombusCardComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-kpis',
  imports: [RhombusStatComponent, RhombusCardComponent],
  template: \`
    <rhombus-card>
      <rhombus-stat
        label="Churn"
        value="2.1%"
        delta="-0.4pt"
        sentiment="positive"
        caption="down is good"
      />
    </rhombus-card>
  \`,
})
export class KpisComponent {}`;
}
