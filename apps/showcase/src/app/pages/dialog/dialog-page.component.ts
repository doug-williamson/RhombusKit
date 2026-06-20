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
import { ExampleComponent } from '../../shared/example.component';

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
  imports: [RhombusButtonComponent, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Dialog"
      [apiKey]="[
        'RhombusDialogService',
        'RhombusDialogComponent',
        'RhombusDialogActionsDirective'
      ]"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A dialog is a modal surface that focuses the user on a single,
          self-contained task. <code>&lt;rhombus-dialog&gt;</code> supplies the
          standard chrome &mdash; a heading, body, and an
          <code>[rhombusDialogActions]</code> footer with
          <code>aria-labelledby</code> wiring &mdash; while
          <code>RhombusDialogService</code> opens any component with the
          library's defaults (focus trap, restore-focus, panel theming) and
          returns a leak-free <code>RhombusDialogRef</code>.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a dialog for a <strong>focused, interactive task</strong> that
              warrants interrupting the flow (rename, move, a short form). For a
              simple yes/no decision reach for <strong>Confirm Dialog</strong>,
              and for passive feedback use a <strong>Toast</strong>.
            </li>
            <li>
              Open a component with
              <code>dialog.open&lt;Result&gt;(MyDialogComponent)</code> and read
              the typed close value via <code>afterClosed()</code>; the opened
              component closes itself by calling <code>ref.close(result)</code>.
              <code>RhombusConfirmService</code> is built on this same service.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-button variant="primary" (click)="openDialog()">
              Move items…
            </rhombus-button>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            On open, focus moves into the dialog and is <strong>trapped</strong>
            within it (<code>autoFocus: 'dialog'</code>); on close it is
            <strong>restored</strong> to the element that opened it. The dialog
            is announced as a modal, and the <code>[title]</code> on
            <code>&lt;rhombus-dialog&gt;</code> becomes its accessible name via
            <code>mat-dialog-title</code> &mdash; when you omit the title, pass an
            <code>ariaLabel</code> through the service instead.
          </p>
        </section>
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

  /** Minimal inject + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { Component, inject } from '@angular/core';
import { RhombusButtonComponent, RhombusDialogService } from '@rhombuskit/core';
import { MoveDialogComponent } from './move-dialog.component';

@Component({
  selector: 'app-toolbar',
  imports: [RhombusButtonComponent],
  template: \`
    <rhombus-button variant="primary" (click)="moveItems()">
      Move items…
    </rhombus-button>
  \`,
})
export class ToolbarComponent {
  private readonly dialog = inject(RhombusDialogService);

  moveItems(): void {
    this.dialog
      .open<string>(MoveDialogComponent)
      .afterClosed()
      .subscribe((folder) => {
        /* folder is the typed close result, or undefined if dismissed */
      });
  }
}`;

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
