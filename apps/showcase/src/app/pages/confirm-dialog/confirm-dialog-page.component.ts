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
import { RhombusButtonComponent, RhombusConfirmService } from '@rhombuskit/core';

@Component({
  selector: 'app-confirm-dialog-page',
  standalone: true,
  imports: [RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Confirm Dialog</h1>
        <p>
          <code>RhombusConfirmService</code> wraps
          <code>MatDialog</code> and returns
          <code>Observable&lt;boolean&gt;</code> — never a
          <code>Promise</code>, never <code>boolean | undefined</code>. Backdrop
          click and Escape both resolve to <code>false</code>. The rendered
          dialog component is internal; consumers only ever call the service.
          The dialog surface renders in the CDK overlay, so its colours are
          bound under <code>.cdk-overlay-container</code>.
        </p>
      </header>

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
