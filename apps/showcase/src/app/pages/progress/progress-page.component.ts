import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RhombusButtonComponent,
  RhombusProgressBarComponent,
  RhombusSpinnerComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-progress-page',
  standalone: true,
  imports: [
    RhombusSpinnerComponent,
    RhombusProgressBarComponent,
    RhombusButtonComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Progress" apiKey="RhombusProgressBarComponent">
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-progress-bar&gt;</code> and
          <code>&lt;rhombus-spinner&gt;</code> are activity indicators wrapping
          Material's <code>&lt;mat-progress-bar&gt;</code> /
          <code>&lt;mat-progress-spinner&gt;</code>, routing the indicator
          through the token contract so the arc and bar re-skin with the theme.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use the <strong>bar</strong> for a long page-level or upload task,
              and the <strong>spinner</strong> for a compact, inline wait (a
              button or a card placeholder).
            </li>
            <li>
              Pass <code>mode="determinate"</code> with a <code>[value]</code>
              (0&ndash;100) when you know the percentage; leave the default
              <code>indeterminate</code> mode when you don't.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <div style="width: 100%; max-width: 420px; display: grid;">
              <rhombus-progress-bar [value]="percent()" ariaLabel="Upload progress" />
            </div>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Each indicator exposes the native <code>progressbar</code> role, and
            in determinate mode reports <code>aria-valuenow</code> from
            <code>[value]</code> so assistive tech announces the percentage. Give
            it a meaningful <code>ariaLabel</code> describing the task (it
            defaults to <code>"Progress"</code> / <code>"Loading"</code>).
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
