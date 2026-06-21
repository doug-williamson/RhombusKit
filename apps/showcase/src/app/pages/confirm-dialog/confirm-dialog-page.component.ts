import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, of, switchMap } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusConfirmService,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-confirm-dialog-page',
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
    <app-component-page
      title="Confirm Dialog"
      [hasUsage]="true"
      apiKey="RhombusConfirmService"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A confirm dialog asks the user to approve or cancel a single action
          before it proceeds. <code>RhombusConfirmService</code> wraps
          <code>MatDialog</code> and returns a strict
          <code>Observable&lt;boolean&gt;</code> &mdash; never a
          <code>Promise</code>, never <code>boolean | undefined</code> &mdash; so
          a backdrop click or <kbd>Escape</kbd> both resolve to
          <code>false</code>. The dialog component is internal; consumers only
          ever call the service.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-button variant="primary" (click)="defaultConfirm()">
              Publish post
            </rhombus-button>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a confirm dialog for a <strong>quick, reversible yes/no
              decision</strong>, especially before a destructive action
              (&ldquo;Delete post?&rdquo;).
            </li>
            <li>
              Reach for it when you need the action to <strong>block</strong>
              until the user explicitly approves or cancels, and a single
              sentence of context is enough to make the decision.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a task that needs multiple fields or richer content, build a
              custom <a routerLink="/components/dialog">Dialog</a> instead.
            </li>
            <li>
              For passive, non-blocking feedback after an action already ran,
              use a <a routerLink="/components/toast">Toast</a>.
            </li>
            <li>
              For an inline, persistent warning the user doesn't have to dismiss
              to continue, use an <a routerLink="/components/alert">Alert</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/dialog">Dialog</a> &mdash; the
              general-purpose modal this service is built on.
            </li>
            <li>
              <a routerLink="/components/toast">Toast</a> &mdash; transient
              feedback once the action completes.
            </li>
            <li>
              <a routerLink="/components/alert">Alert</a> &mdash; inline,
              non-blocking warnings.
            </li>
            <li>
              <a routerLink="/components/button">Button</a> &mdash; the trigger
              that opens the confirmation.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The confirm dialog is driven entirely through
          <code>RhombusConfirmService</code>: inject it, call
          <code>confirm(config)</code>, and react to the
          <code>Observable&lt;boolean&gt;</code> it returns. The dialog
          component itself is internal &mdash; you never declare or import it.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>inject(RhombusConfirmService)</code> &mdash; the service is
              <code>providedIn: 'root'</code>, so no module wiring is needed.
            </li>
            <li>
              <code>confirm(config)</code> &mdash; opens the dialog and returns
              an <code>Observable&lt;boolean&gt;</code> that emits exactly once:
              <code>true</code> on confirm, <code>false</code> on cancel,
              backdrop click, or <kbd>Escape</kbd>.
            </li>
            <li>
              <code>config.title</code> / <code>config.message</code> &mdash;
              required heading and body copy.
            </li>
            <li>
              <code>config.confirmLabel</code> /
              <code>config.cancelLabel</code> &mdash; optional button text
              (default <code>'Confirm'</code> / <code>'Cancel'</code>).
            </li>
            <li>
              <code>config.variant: 'danger'</code> &mdash; styles the confirm
              button destructively for irreversible actions.
            </li>
            <li>
              There are <strong>no content-projection slots</strong>: the dialog
              body and actions are rendered internally from the config, so
              everything is data-driven rather than templated.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The dialog renders in a CDK overlay, so style overrides must target
            the <code>.cdk-overlay-container</code> scope, not the host. The
            panel surface (background, radius, elevation) comes from the global
            <code>mat.dialog-overrides</code> bridge in
            <code>@rhombuskit/material-preset</code>; the chrome itself reads
            these contract tokens:
          </p>
          <ul>
            <li><code>--font-sans</code> &mdash; dialog font family</li>
            <li><code>--text-primary</code> &mdash; title colour</li>
            <li><code>--text-secondary</code> &mdash; message body colour</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The dialog is opened through Material's <code>MatDialog</code> (via
            <code>RhombusConfirmService</code> &rarr;
            <code>RhombusDialogService</code>), so it is a true
            <code>role="dialog"</code> with <code>aria-modal</code>. The
            <code>title</code> is wired as the accessible name via
            <code>mat-dialog-title</code> (<code>aria-labelledby</code>). Focus
            is <strong>trapped</strong> inside the dialog on open
            (<code>autoFocus: 'dialog'</code>) and <strong>restored</strong> to
            the triggering element on close (<code>restoreFocus: true</code>).
            <kbd>Escape</kbd> and a backdrop click both dismiss it, resolving to
            <code>false</code> &mdash; equivalent to cancelling &mdash; so no
            action runs unless the user explicitly confirms. Because the body is
            plain projected text rather than a live region, write a clear
            <code>title</code> and <code>message</code> so the purpose is
            announced when focus lands inside the dialog.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Default confirm</h2>
        <p class="showcase-section__lead">
          Primary confirm button. Confirming emits <code>true</code>; cancel,
          backdrop, and Escape all emit <code>false</code>.
        </p>
        <div class="showcase-row">
          <rhombus-button variant="primary" (click)="defaultConfirm()">
            Publish post
          </rhombus-button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Danger confirm</h2>
        <p class="showcase-section__lead">
          <code>variant: 'danger'</code> styles the confirm button
          destructively.
        </p>
        <div class="showcase-row">
          <rhombus-button variant="danger" (click)="dangerConfirm()">
            Delete post
          </rhombus-button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Confirm-then-act (teardown-safe)</h2>
        <p class="showcase-section__lead">
          The canonical chain: confirm, drop falsy results with
          <code>filter(Boolean)</code>, run the action with
          <code>switchMap</code>, and bind teardown with
          <code>takeUntilDestroyed</code> so a late result never fires a dead
          handler. The button below runs exactly this (the action is a mocked
          750ms async delete).
        </p>
        <pre class="code-sample"><code>{{ chainSample }}</code></pre>
        <div class="showcase-row">
          <rhombus-button variant="danger" (click)="confirmThenAct()">
            Delete with mocked action
          </rhombus-button>
        </div>
      </section>

      <div class="event-log">
        <p>Last result: <strong>{{ lastResult() }}</strong></p>
        <p>Action status: <strong>{{ actionStatus() }}</strong></p>
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
    .code-sample {
      margin: 0 0 1rem 0;
      padding: 0.875rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background-color: var(--surface-1);
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      line-height: 1.5;
      overflow-x: auto;
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
    .event-log p {
      margin: 0.2rem 0;
    }
    .event-log strong {
      color: var(--text-primary);
    }
  `,
})
export default class ConfirmDialogPageComponent {
  private readonly confirm = inject(RhombusConfirmService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly lastResult = signal('—');
  protected readonly actionStatus = signal('—');

  /** Minimal inject + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { RhombusButtonComponent, RhombusConfirmService } from '@rhombuskit/core';

@Component({
  selector: 'app-post-actions',
  imports: [RhombusButtonComponent],
  template: \`
    <rhombus-button variant="primary" (click)="publish()">
      Publish post
    </rhombus-button>
  \`,
})
export class PostActionsComponent {
  private readonly confirm = inject(RhombusConfirmService);
  private readonly destroyRef = inject(DestroyRef);

  publish(): void {
    this.confirm
      .confirm({
        title: 'Publish this post?',
        message: 'It will become visible to all readers immediately.',
        confirmLabel: 'Publish',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.store.publish()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}`;

  protected readonly chainSample = `this.confirm.confirm({
  title: 'Delete post?',
  message: 'This permanently removes the post.',
  variant: 'danger',
}).pipe(
  filter(Boolean),
  switchMap(() => this.store.delete(id)),
  takeUntilDestroyed(this.destroyRef),
).subscribe();`;

  protected defaultConfirm(): void {
    this.confirm
      .confirm({
        title: 'Publish this post?',
        message: 'It will become visible to all readers immediately.',
        confirmLabel: 'Publish',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(String(result)));
  }

  protected dangerConfirm(): void {
    this.confirm
      .confirm({
        title: 'Delete post?',
        message:
          'This permanently removes the post and cannot be undone.',
        variant: 'danger',
        confirmLabel: 'Delete',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.lastResult.set(String(result)));
  }

  protected confirmThenAct(): void {
    this.confirm
      .confirm({
        title: 'Delete post?',
        message: 'This permanently removes the post.',
        variant: 'danger',
        confirmLabel: 'Delete',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.actionStatus.set('deleting…');
          // Mock async action (e.g. an HTTP delete).
          return of('deleted').pipe(delay(750));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.lastResult.set('true');
        this.actionStatus.set('done');
      });
  }
}
