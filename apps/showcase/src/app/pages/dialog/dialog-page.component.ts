import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import {
  RhombusButtonComponent,
  RhombusDialogActionsDirective,
  RhombusDialogComponent,
  RhombusDialogService,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-demo-dialog',
  standalone: true,
  imports: [
    RhombusDialogComponent,
    RhombusDialogActionsDirective,
    RhombusButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-dialog [title]="'Move to folder'">
      <p style="margin: 0;">Choose a destination for the selected items.</p>
      <div class="folder-choices">
        <rhombus-button variant="secondary" appearance="outlined" (click)="ref.close('Archive')">
          Archive
        </rhombus-button>
        <rhombus-button variant="secondary" appearance="outlined" (click)="ref.close('Drafts')">
          Drafts
        </rhombus-button>
        <rhombus-button variant="secondary" appearance="outlined" (click)="ref.close('Trash')">
          Trash
        </rhombus-button>
      </div>
      <div rhombusDialogActions>
        <rhombus-button variant="secondary" appearance="text" (click)="ref.close()">
          Cancel
        </rhombus-button>
      </div>
    </rhombus-dialog>
  `,
  styles: `
    .folder-choices {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `,
})
export class DemoDialogComponent {
  // The opened component closes itself with a typed result via MatDialogRef —
  // the same mechanism RhombusConfirmDialogComponent uses internally.
  protected readonly ref =
    inject<MatDialogRef<DemoDialogComponent, string>>(MatDialogRef);
}

@Component({
  selector: 'app-dialog-page',
  standalone: true,
  imports: [RhombusButtonComponent, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Dialog" apiKey="RhombusDialogService">
      <div overview>
        <p>
          <code>&lt;rhombus-dialog&gt;</code> is the standard dialog chrome — a
          heading, body, and an <code>[rhombusDialogActions]</code> footer with
          consistent padding and <code>aria-labelledby</code> wiring. Open any
          component with <code>RhombusDialogService</code>, which applies the
          library's defaults (focus trap, restore-focus, panel theming) and
          returns a leak-free <code>RhombusDialogRef</code>.
          <code>RhombusConfirmService</code> is built on this same service.
        </p>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Open a custom dialog</h2>
        <p class="showcase-section__lead">
          The opened component composes <code>&lt;rhombus-dialog&gt;</code> and
          closes itself with a typed result; the opener reads it via
          <code>afterClosed()</code>.
        </p>
        <div class="showcase-row">
          <rhombus-button variant="primary" (click)="openDialog()">
            Move items…
          </rhombus-button>
        </div>
      </section>

      <div class="event-log">
        <p>Last result: <strong>{{ lastResult() }}</strong></p>
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
export default class DialogPageComponent {
  private readonly dialog = inject(RhombusDialogService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly lastResult = signal('—');

  protected openDialog(): void {
    this.dialog
      .open<string>(DemoDialogComponent)
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((folder) =>
        this.lastResult.set(folder ? `Moved to ${folder}` : 'Dismissed')
      );
  }
}
