import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusToastService,
  type RhombusToastRef,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-toast-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Toast" apiKey="RhombusToastService" [hasUsage]="true">
      <div overview class="overview">
        <p class="overview__lead">
          A toast is a brief, self-dismissing message that confirms an action or
          flags a problem without interrupting the user. Inject
          <code>RhombusToastService</code> &mdash; it wraps
          <code>MatSnackBar</code> for the surface and the CDK
          <code>LiveAnnouncer</code> for the announcement, colours each severity
          through the <code>--toast-&lt;variant&gt;-bg</code> / <code>-text</code>
          tokens, and returns a leak-free <code>RhombusToastRef</code>.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-button
              variant="primary"
              (click)="toast.success('Post published')"
            >
              Publish post
            </rhombus-button>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a toast for <strong>transient, low-stakes feedback</strong>
              (&ldquo;Post published&rdquo;, &ldquo;Could not save&rdquo;) that
              does not require the user to stop what they are doing.
            </li>
            <li>
              Use a toast when an action should be <strong>briefly
              reversible</strong> &mdash; pair it with an <code>Undo</code> action
              so the consequence stays cheap to recover from.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              When the user must make a decision before continuing, use a
              <a routerLink="/components/confirm-dialog">Confirm Dialog</a> or a
              <a routerLink="/components/dialog">Dialog</a> &mdash; a toast can
              auto-dismiss and must never gate a required choice.
            </li>
            <li>
              For a persistent, in-page status message that stays put (form-level
              errors, banners), use an
              <a routerLink="/components/alert">Alert</a> instead of a
              time-limited toast.
            </li>
            <li>
              For status attached to a specific control or element, use a
              <a routerLink="/components/tooltip">Tooltip</a> rather than a
              floating, screen-anchored toast.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/alert">Alert</a> &mdash; persistent, in-flow status messages.</li>
            <li><a routerLink="/components/confirm-dialog">Confirm Dialog</a> &mdash; blocking yes/no decisions.</li>
            <li><a routerLink="/components/dialog">Dialog</a> &mdash; blocking modal surfaces.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A toast is driven imperatively: inject
          <code>RhombusToastService</code> and call a severity method with the
          message. Each call returns a <code>RhombusToastRef</code> you can use to
          dismiss it or react to its action button.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>RhombusToastService</code> &mdash; injected, root-provided
              service. There is no template tag and no content-projection slots;
              the toast surface is created imperatively from a string message.
            </li>
            <li>
              <code>info()</code> / <code>success()</code> /
              <code>warning()</code> / <code>error()</code> &mdash; severity
              shortcuts. Each takes <code>(message, opts?)</code> and applies the
              matching colour pair.
            </li>
            <li>
              <code>show(config)</code> &mdash; full control via a
              <code>ToastConfig</code>: <code>message</code>,
              <code>variant</code>, <code>duration</code> (ms;
              <code>0</code> = sticky), <code>action</code> (button label), and
              <code>politeness</code>.
            </li>
            <li>
              <code>RhombusToastRef</code> &mdash; the return handle:
              <code>dismiss()</code>, <code>afterDismissed()</code>, and
              <code>onAction()</code> (emits when the action button is pressed).
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The toast renders in a CDK overlay (it wraps
            <code>MatSnackBar</code>), so overrides must target the
            <code>.cdk-overlay-container</code> scope via the
            <code>.rhombus-toast--&lt;variant&gt;</code> panel class. Each severity
            reads its own colour pair:
          </p>
          <ul>
            <li><code>--toast-info-bg</code> / <code>--toast-info-text</code></li>
            <li><code>--toast-success-bg</code> / <code>--toast-success-text</code></li>
            <li><code>--toast-warning-bg</code> / <code>--toast-warning-text</code></li>
            <li><code>--toast-error-bg</code> / <code>--toast-error-text</code></li>
          </ul>
          <p>
            The <code>-text</code> token also colours the action button for that
            severity.
          </p>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Every toast is announced to screen readers through the CDK
            <code>LiveAnnouncer</code>: <code>info</code> and
            <code>success</code> announce <strong>politely</strong> while
            <code>warning</code> and <code>error</code> announce
            <strong>assertively</strong> (override per call with the
            <code>politeness</code> option). The snackbar's own
            <code>aria-live</code> region is set to <code>'off'</code> so the
            message is announced exactly once by the <code>LiveAnnouncer</code>
            rather than twice. Because a toast can auto-dismiss, keep messages
            short and never hide an essential action behind a time-limited toast
            &mdash; use <code>duration: 0</code> when the action must remain
            reachable.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Severities</h2>
        <p class="showcase-section__lead">
          <code>info</code> and <code>success</code> announce politely;
          <code>warning</code> and <code>error</code> announce assertively.
        </p>
        <div class="showcase-row">
          <rhombus-button variant="secondary" (click)="toast.info('Heads up — sync started')">
            Info
          </rhombus-button>
          <rhombus-button variant="primary" (click)="toast.success('Post published')">
            Success
          </rhombus-button>
          <rhombus-button variant="secondary" (click)="toast.warning('Storage is almost full')">
            Warning
          </rhombus-button>
          <rhombus-button variant="danger" (click)="toast.error('Could not save changes')">
            Error
          </rhombus-button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>With an action</h2>
        <p class="showcase-section__lead">
          Pass an <code>action</code> label and subscribe to
          <code>onAction()</code>.
        </p>
        <div class="showcase-row">
          <rhombus-button variant="secondary" (click)="undoToast()">
            Delete with undo
          </rhombus-button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Sticky toast, dismissed via the ref</h2>
        <p class="showcase-section__lead">
          <code>duration: 0</code> keeps the toast open until you dismiss it
          through the returned ref — useful for "Saving…" style status.
        </p>
        <div class="showcase-row">
          <rhombus-button variant="primary" (click)="startSticky()" [disabled]="sticky() !== null">
            Show sticky
          </rhombus-button>
          <rhombus-button variant="secondary" (click)="dismissSticky()" [disabled]="sticky() === null">
            Dismiss it
          </rhombus-button>
        </div>
      </section>

      <div class="event-log">
        <p>Last event: <strong>{{ lastEvent() }}</strong></p>
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
export default class ToastPageComponent {
  protected readonly toast = inject(RhombusToastService);
  protected readonly lastEvent = signal('—');
  protected readonly sticky = signal<RhombusToastRef | null>(null);

  /** Minimal inject + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { Component, inject } from '@angular/core';
import { RhombusButtonComponent, RhombusToastService } from '@rhombuskit/core';

@Component({
  selector: 'app-publish-bar',
  imports: [RhombusButtonComponent],
  template: \`
    <rhombus-button variant="primary" (click)="publish()">
      Publish post
    </rhombus-button>
  \`,
})
export class PublishBarComponent {
  private readonly toast = inject(RhombusToastService);

  publish(): void {
    /* persist… */
    this.toast.success('Post published');
  }
}`;

  protected undoToast(): void {
    const ref = this.toast.warning('Item deleted', { action: 'Undo' });
    ref.onAction().subscribe(() => this.lastEvent.set('Undo clicked'));
    ref.afterDismissed().subscribe(() => {
      if (this.lastEvent() !== 'Undo clicked') {
        this.lastEvent.set('Delete kept (toast dismissed)');
      }
    });
  }

  protected startSticky(): void {
    const ref = this.toast.info('Saving…', { duration: 0 });
    this.sticky.set(ref);
    this.lastEvent.set('Sticky shown');
  }

  protected dismissSticky(): void {
    this.sticky()?.dismiss();
    this.sticky.set(null);
    this.lastEvent.set('Sticky dismissed');
  }
}
