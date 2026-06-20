import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
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
      title="Dialog"
      [hasUsage]="true"
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
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-button variant="primary" (click)="openDialog()">
              Move items…
            </rhombus-button>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a dialog for a <strong>focused, interactive task</strong> that
              warrants interrupting the flow &mdash; a rename, a move, a short
              form &mdash; where the user should resolve it before returning to
              the page.
            </li>
            <li>
              When the task <strong>must block the rest of the UI</strong> until
              it is completed or dismissed, and benefits from a captured,
              trapped focus context.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a simple yes/no decision (delete, discard, confirm), use a
              <a routerLink="/components/confirm-dialog">Confirm Dialog</a> &mdash;
              it builds on this service with a ready-made prompt.
            </li>
            <li>
              For passive, non-blocking feedback after an action, use a
              <a routerLink="/components/toast">Toast</a>.
            </li>
            <li>
              For a rich panel anchored to a trigger that should leave the page
              visible, use a <a routerLink="/components/popover">Popover</a>; for
              a flat list of actions, a <a routerLink="/components/menu">Menu</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/confirm-dialog">Confirm Dialog</a> &mdash; prebuilt yes/no prompt on this service.</li>
            <li><a routerLink="/components/popover">Popover</a> &mdash; non-blocking panels off a trigger.</li>
            <li><a routerLink="/components/toast">Toast</a> &mdash; transient, non-blocking feedback.</li>
            <li><a routerLink="/components/button">Button</a> &mdash; the triggers and footer actions.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A dialog is two parts: the <code>RhombusDialogService</code> opens any
          component with the library's defaults and returns a typed
          <code>RhombusDialogRef</code>, while
          <code>&lt;rhombus-dialog&gt;</code> supplies the chrome
          (heading, body, footer) inside that component.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>RhombusDialogService.open&lt;Result&gt;(MyDialogComponent, config?)</code>
              &mdash; opens the component as a themed dialog and returns a
              <code>RhombusDialogRef</code>; read the typed close value via
              <code>afterClosed()</code>. Config accepts <code>data</code>,
              <code>width</code>, <code>maxWidth</code>, <code>disableClose</code>,
              <code>panelClass</code>, and <code>ariaLabel</code>.
            </li>
            <li>
              <code>[title]</code> on <code>&lt;rhombus-dialog&gt;</code> &mdash;
              renders the heading and wires it as the accessible name; omit it
              and pass <code>ariaLabel</code> through the service instead.
            </li>
            <li>
              <strong>Default content slot</strong> &mdash; everything you
              project (other than the actions row) becomes the dialog body.
            </li>
            <li>
              <code>[rhombusDialogActions]</code> &mdash; a semantic slot marker;
              put it on the footer <code>&lt;div&gt;</code> holding your buttons.
              The footer collapses when empty.
            </li>
            <li>
              The opened component injects <code>MatDialogRef</code> and closes
              itself with a typed result via <code>ref.close(result)</code>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The dialog renders inside a CDK overlay. The panel surface
            (background, radius, elevation) comes from the
            <code>@rhombuskit/material-preset</code> bridge in the
            <code>.cdk-overlay-container</code> scope, so panel-level overrides
            must target that scope rather than the host. The chrome itself
            (<code>rhombus-dialog</code>) reads these contract tokens:
          </p>
          <ul>
            <li><code>--font-sans</code> &mdash; chrome font family</li>
            <li><code>--text-primary</code> &mdash; heading / body emphasis colour</li>
            <li><code>--text-secondary</code> &mdash; body content colour</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The dialog is opened through Material's <code>MatDialog</code>, which
            renders the panel as a modal <code>role="dialog"</code> with
            <code>aria-modal="true"</code> and a backdrop. On open, focus moves
            into the dialog and is <strong>trapped</strong> within it
            (<code>autoFocus: 'dialog'</code>); on close it is
            <strong>restored</strong> to the element that opened it
            (<code>restoreFocus: true</code>). The <code>[title]</code> on
            <code>&lt;rhombus-dialog&gt;</code> becomes the dialog's accessible
            name via <code>mat-dialog-title</code> (<code>aria-labelledby</code>)
            &mdash; when you omit the title, pass an <code>ariaLabel</code>
            through the service so the dialog is still named. By default
            <kbd>Escape</kbd> and a backdrop click dismiss the dialog; set
            <code>disableClose: true</code> for tasks that must be resolved
            explicitly.
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
