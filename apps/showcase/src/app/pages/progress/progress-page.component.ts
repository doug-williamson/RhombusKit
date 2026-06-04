import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RhombusButtonComponent,
  RhombusProgressBarComponent,
  RhombusSpinnerComponent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-progress-page',
  standalone: true,
  imports: [
    RhombusSpinnerComponent,
    RhombusProgressBarComponent,
    RhombusButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Progress</h1>
        <p>
          <code>&lt;rhombus-spinner&gt;</code> and
          <code>&lt;rhombus-progress-bar&gt;</code> wrap Material's
          <code>MatProgressSpinner</code> / <code>MatProgressBar</code>. The
          active arc and bar are themed via <code>--text-accent</code> (toggle
          the theme to see it). Both default to an accessible label.
        </p>
      </header>

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

  protected step(delta: number): void {
    this.percent.update((v) => Math.max(0, Math.min(100, v + delta)));
  }
}
