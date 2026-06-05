import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  RhombusButtonComponent,
  RhombusToastService,
  type RhombusToastRef,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-toast-page',
  standalone: true,
  imports: [RhombusButtonComponent, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Toast" apiKey="RhombusToastService">
      <div overview>
        <p>
          <code>RhombusToastService</code> wraps <code>MatSnackBar</code> for the
          surface and the CDK <code>LiveAnnouncer</code> for the announcement —
          the same shape as <code>RhombusConfirmService</code>. Each severity is
          coloured by the <code>--toast-&lt;variant&gt;-bg</code> /
          <code>-text</code> tokens (toggle the theme to see both), and every
          call returns a leak-free <code>RhombusToastRef</code>.
        </p>
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
