import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RhombusAlertComponent,
  RhombusButtonComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-alert-page',
  standalone: true,
  imports: [
    RhombusAlertComponent,
    RhombusButtonComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Alert" apiKey="RhombusAlertComponent">
      <div overview class="overview">
        <p class="overview__lead">
          An alert is a persistent, inline banner that conveys a severity-coded
          message in place. <code>&lt;rhombus-alert&gt;</code> &mdash; distinct
          from the transient toast &mdash; reuses the shared
          <code>--toast-&lt;variant&gt;-*</code> contract tokens, so toggling the
          theme above re-skins it without touching markup.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use an alert for a <strong>message that should stay visible</strong>
              in context &mdash; a validation summary, a status banner, a warning
              tied to the surrounding content. For a brief, auto-dismissing
              confirmation, prefer a toast.
            </li>
            <li>
              Pick the <code>variant</code> by severity (<code>info</code> |
              <code>success</code> | <code>warning</code> | <code>error</code>),
              project the message as content, and add a <code>title</code> or
              <code>dismissible</code> as needed.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-alert variant="info" title="Sync in progress">
              We're refreshing your data in the background.
            </rhombus-alert>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Severity is never conveyed by colour alone: each variant renders a
            visually-hidden prefix (e.g. "Warning:") read by screen readers
            before the message. The <code>dismissible</code> close button is a
            native <code>&lt;button&gt;</code> with an
            <code>aria-label</code> of "Dismiss alert", so it is focusable and
            announced.
          </p>
        </section>
      </div>

      <div examples>
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
    </app-component-page>
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
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusAlertComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-sync-banner',
  imports: [RhombusAlertComponent],
  template: \`
    <rhombus-alert variant="info" title="Sync in progress">
      We're refreshing your data in the background.
    </rhombus-alert>
  \`,
})
export class SyncBannerComponent {}`;

  protected readonly dismissed = signal(false);
}
