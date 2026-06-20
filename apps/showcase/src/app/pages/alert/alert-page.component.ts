import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusAlertComponent,
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-alert-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusAlertComponent,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Alert" [hasUsage]="true" apiKey="RhombusAlertComponent">
      <div overview class="overview">
        <p class="overview__lead">
          An alert is a persistent, inline banner that conveys a severity-coded
          message in place. <code>&lt;rhombus-alert&gt;</code> &mdash; distinct
          from the transient toast &mdash; reuses the shared
          <code>--toast-&lt;variant&gt;-*</code> contract tokens, so toggling the
          theme above re-skins it without touching markup.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-alert variant="info" title="Sync in progress">
              We're refreshing your data in the background.
            </rhombus-alert>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use an alert for a <strong>message that should stay visible</strong>
              in context &mdash; a validation summary, a status banner, a warning
              tied to the surrounding content.
            </li>
            <li>
              When severity matters and the message should remain readable as the
              user works the surrounding page, rather than appearing briefly and
              vanishing.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>For a brief, auto-dismissing confirmation that doesn't need to stay on screen, use a <a routerLink="/components/toast">Toast</a>.</li>
            <li>For a decision the user must resolve before continuing, use a <a routerLink="/components/dialog">Dialog</a> (or a <a routerLink="/components/confirm-dialog">Confirm Dialog</a> for a yes/no).</li>
            <li>For a screen with no data to show rather than a status message, use an <a routerLink="/components/empty-state">Empty State</a>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/toast">Toast</a> — transient, auto-dismissing notifications.</li>
            <li><a routerLink="/components/badge">Badge</a> — compact inline status labels.</li>
            <li><a routerLink="/components/empty-state">Empty State</a> — placeholder for absent content.</li>
            <li><a routerLink="/components/dialog">Dialog</a> — blocking modal surfaces.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          An alert is driven entirely by inputs: set <code>variant</code> for
          severity, project the message as content, and add an optional
          <code>title</code> or <code>dismissible</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>variant</code> — severity selector: <code>info</code> | <code>success</code> | <code>warning</code> | <code>error</code> (defaults to <code>info</code>). It drives both the colour pair and the screen-reader severity prefix.</li>
            <li><code>title</code> — optional heading rendered above the message; omit it for a single-line banner.</li>
            <li><code>dismissible</code> — bare attribute that adds a close button; pair it with <code>(dismissed)</code> to react when the user closes the alert.</li>
            <li><strong>Default content slot</strong> — the projected children become the message body. The alert exposes no named slots.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The alert renders inline (no overlay), so overrides target the host
            normally. It reads these contract tokens:
          </p>
          <ul>
            <li><code>--toast-info-bg</code> / <code>--toast-info-text</code> — info colour pair.</li>
            <li><code>--toast-success-bg</code> / <code>--toast-success-text</code> — success colour pair.</li>
            <li><code>--toast-warning-bg</code> / <code>--toast-warning-text</code> — warning colour pair.</li>
            <li><code>--toast-error-bg</code> / <code>--toast-error-text</code> — error colour pair.</li>
            <li><code>--font-sans</code> — banner font family.</li>
            <li><code>--focus-border</code> — focus ring on the dismiss button.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Severity is never conveyed by colour alone: each variant renders a
            visually-hidden prefix (e.g. "Warning:") read by screen readers
            before the message. The <code>dismissible</code> close button is a
            native <code>&lt;button&gt;</code> with an
            <code>aria-label</code> of "Dismiss alert", so it is focusable and
            announced. The alert is a static inline banner — it sets no
            <code>role="alert"</code> or <code>aria-live</code> region, so screen
            readers encounter it in document order rather than having it announced
            on insertion. If you inject an alert in response to a user action and
            need it announced immediately, place it inside your own live region.
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
