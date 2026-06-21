import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusProgressBarComponent,
  RhombusSpinnerComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-progress-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusSpinnerComponent,
    RhombusProgressBarComponent,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Progress"
      [hasUsage]="true"
      [apiKey]="['RhombusProgressBarComponent', 'RhombusSpinnerComponent']"
    >
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-progress-bar&gt;</code> and
          <code>&lt;rhombus-spinner&gt;</code> are activity indicators wrapping
          Material's <code>&lt;mat-progress-bar&gt;</code> /
          <code>&lt;mat-progress-spinner&gt;</code>, routing the indicator
          through the token contract so the arc and bar re-skin with the theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <div style="width: 100%; max-width: 420px; display: grid;">
              <rhombus-progress-bar [value]="percent()" ariaLabel="Upload progress" />
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use the <strong>bar</strong> for a long page-level or upload task,
              and the <strong>spinner</strong> for a compact, inline wait (a
              button or a card placeholder).
            </li>
            <li>
              Reach for a progress indicator whenever an operation takes long
              enough that the UI would otherwise feel frozen, so the user knows
              work is in flight.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              To report a completed outcome — success, warning, or error — use an
              <a routerLink="/components/alert">Alert</a> or a transient
              <a routerLink="/components/toast">Toast</a>, not a progress
              indicator.
            </li>
            <li>
              To render an avatar or icon with a busy state on a button, prefer a
              disabled <a routerLink="/components/button">Button</a> with an inline
              spinner over a standalone bar.
            </li>
            <li>
              When there is genuinely no data yet (rather than a load in
              progress), show an
              <a routerLink="/components/empty-state">Empty State</a> instead.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/button">Button</a> — pair a spinner with a disabled button for inline waits.</li>
            <li><a routerLink="/components/empty-state">Empty State</a> — for the no-data placeholder after loading resolves.</li>
            <li><a routerLink="/components/alert">Alert</a> — to surface the result of the operation.</li>
            <li><a routerLink="/components/toast">Toast</a> — transient confirmation when work finishes.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Both indicators are driven entirely by inputs: <code>[mode]</code>
          chooses determinate vs. indeterminate, <code>[value]</code> (0&ndash;100)
          sets the percentage in determinate mode, and <code>ariaLabel</code>
          names the task. There are no outputs and no content to project.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>&lt;rhombus-progress-bar&gt;</code> / <code>&lt;rhombus-spinner&gt;</code>
              are self-closing elements — they render the indicator only and expose
              <strong>no content-projection slots</strong> (no default slot, no named
              slots). Compose surrounding labels or layout in your own template.
            </li>
            <li>
              <code>[mode]</code> — <code>"determinate"</code> (bar default),
              <code>"indeterminate"</code> (spinner default), plus
              <code>"buffer"</code> / <code>"query"</code> on the bar.
            </li>
            <li>
              <code>[value]</code> — 0&ndash;100, read in determinate (and buffer) mode;
              the bar also accepts <code>[bufferValue]</code>.
            </li>
            <li>
              <code>[diameter]</code> / <code>[strokeWidth]</code> — spinner-only size
              controls (default 40 / 4 px).
            </li>
            <li>
              <code>ariaLabel</code> — required-in-practice accessible name; defaults to
              <code>"Progress"</code> (bar) / <code>"Loading"</code> (spinner).
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Colours are bridged through <code>@rhombuskit/material-preset</code>'s
            <code>mat.progress-bar-overrides</code> / <code>progress-spinner-overrides</code>,
            so they re-skin with the theme from the contract tokens:
          </p>
          <ul>
            <li><code>--text-accent</code> — the bar indicator and the spinner arc.</li>
            <li><code>--surface-2</code> — the progress bar's track.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Each indicator renders the underlying Material element, which exposes the
            native <code>progressbar</code> role; in determinate mode it reports
            <code>aria-valuenow</code> from <code>[value]</code> (with
            <code>aria-valuemin="0"</code> / <code>aria-valuemax="100"</code>) so
            assistive tech can announce the percentage. Indeterminate mode advertises an
            ongoing activity with no fixed value. Give every indicator a meaningful
            <code>ariaLabel</code> describing the task it tracks (e.g.
            <code>"Upload progress"</code>); the defaults
            (<code>"Progress"</code> / <code>"Loading"</code>) are only a fallback.
            These wrappers do not add an <code>aria-live</code> region, so if you need a
            running percentage spoken as it changes, manage that announcement yourself.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Spinner</h2>
        <p class="showcase-section__lead">Indeterminate and determinate.</p>
        <div class="showcase-row" style="align-items: center; gap: 2rem;">
          <rhombus-spinner ariaLabel="Loading" />
          <rhombus-spinner mode="determinate" [value]="percent()" [diameter]="48" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Progress bar</h2>
        <p class="showcase-section__lead">
          Determinate (driven by the buttons below) and indeterminate.
        </p>
        <div style="max-width: 420px; display: grid; gap: 1.25rem;">
          <rhombus-progress-bar [value]="percent()" ariaLabel="Upload progress" />
          <rhombus-progress-bar mode="indeterminate" ariaLabel="Saving" />
        </div>
        <div class="showcase-row" style="margin-top: 1rem;">
          <rhombus-button variant="secondary" (click)="step(-10)">−10%</rhombus-button>
          <rhombus-button variant="primary" (click)="step(10)">+10%</rhombus-button>
        </div>
      </section>

      <div class="event-log">
        <p>Value: <strong>{{ percent() }}%</strong></p>
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
export default class ProgressPageComponent {
  protected readonly percent = signal(40);

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusProgressBarComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-upload-status',
  imports: [RhombusProgressBarComponent],
  template: \`
    <rhombus-progress-bar
      [value]="uploadPercent()"
      ariaLabel="Upload progress"
    />
  \`,
})
export class UploadStatusComponent {
  readonly uploadPercent = signal(40);
}`;

  protected step(delta: number): void {
    this.percent.update((v) => Math.max(0, Math.min(100, v + delta)));
  }
}
