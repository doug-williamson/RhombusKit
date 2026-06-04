import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RhombusAlertComponent,
  RhombusButtonComponent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-alert-page',
  standalone: true,
  imports: [RhombusAlertComponent, RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Alert</h1>
        <p>
          <code>&lt;rhombus-alert&gt;</code> is a persistent, inline severity
          banner — distinct from the transient toast. It reuses the shared
          <code>--toast-&lt;variant&gt;-*</code> tokens, and
          conveys severity by colour <em>and</em> a visually-hidden prefix (so
          it is never colour-only). Project the message as content; pass a
          <code>title</code> and <code>dismissible</code> as needed.
        </p>
      </header>

      <section class="showcase-section">
        <h2>Severities</h2>
        <div style="display: grid; gap: 0.75rem; max-width: 560px;">
          <rhombus-alert variant="info" title="Sync in progress">
            We're refreshing your data in the background.
          </rhombus-alert>
          <rhombus-alert variant="success" title="Saved">
            Your changes have been published.
          </rhombus-alert>
          <rhombus-alert variant="warning" title="Storage almost full">
            You're using 92% of your plan's storage.
          </rhombus-alert>
          <rhombus-alert variant="error" title="Couldn't connect">
            We couldn't reach the server. Retrying shortly.
          </rhombus-alert>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Dismissible</h2>
        <p class="showcase-section__lead">
          The close button emits <code>(dismissed)</code> and hides the alert.
        </p>
        <div style="max-width: 560px;">
          @if (!dismissed()) {
            <rhombus-alert
              variant="info"
              dismissible
              (dismissed)="dismissed.set(true)"
            >
              You can dismiss this one.
            </rhombus-alert>
          } @else {
            <rhombus-button variant="secondary" (click)="dismissed.set(false)">
              Bring it back
            </rhombus-button>
          }
        </div>
      </section>
    </div>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
  `,
})
export default class AlertPageComponent {
  protected readonly dismissed = signal(false);
}
