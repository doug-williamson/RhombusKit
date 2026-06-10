import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  OverflowMenuItem,
  RhombusOverflowMenuComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-overflow-menu-page',
  standalone: true,
  imports: [
    RhombusOverflowMenuComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Overflow Menu" apiKey="RhombusOverflowMenuComponent">
      <div overview class="overview">
        <p class="overview__lead">
          An overflow menu tucks a set of secondary actions behind a
          &ldquo;&middot;&middot;&middot;&rdquo; icon-button trigger &mdash; the
          familiar pattern for per-row or per-card actions.
          <code>&lt;rhombus-overflow-menu&gt;</code> wraps
          <code>&lt;mat-menu&gt;</code> and is driven entirely by an
          <code>items</code> array, with the panel themed through the token
          contract.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use an overflow menu to <strong>collapse secondary actions</strong>
              that would clutter a row or toolbar. Keep a view's primary action
              as a visible <strong>Button</strong>; only the supporting actions
              belong in the menu.
            </li>
            <li>
              Each <code>OverflowMenuItem</code> carries its own
              <code>action</code> callback, so dispatch is co-located with the
              item (no <code>(itemClick)</code> output). Use
              <code>dividerBefore</code> to group items,
              <code>variant: 'danger'</code> to mark a destructive one, and
              <code>disabled</code> to render an item inert.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-overflow-menu [items]="basicItems" />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            The trigger is a real icon button with an accessible name
            (<code>ariaLabel</code>, default &ldquo;More actions&rdquo;) since it
            has no visible text. Opening it moves focus into the menu, and items
            are navigable with the <kbd>Arrow</kbd> keys, activated with
            <kbd>Enter</kbd>, and dismissed with <kbd>Escape</kbd> &mdash;
            standard menu semantics inherited from <code>&lt;mat-menu&gt;</code>.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Basic menu</h2>
        <p class="showcase-section__lead">
          Edit / archive / delete, each with a leading icon.
        </p>
        <div class="showcase-row">
          <rhombus-overflow-menu [items]="basicItems" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Grouped with a divider</h2>
        <p class="showcase-section__lead">
          <code>dividerBefore</code> on "Delete post…" separates the
          destructive action from navigation items above it.
        </p>
        <div class="showcase-row">
          <rhombus-overflow-menu [items]="groupedItems" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Danger, disabled, and a leading divider</h2>
        <p class="showcase-section__lead">
          The danger item renders in <code>var(--error)</code>; the disabled
          item is non-interactive. The first item carries
          <code>dividerBefore: true</code> — it must NOT produce a leading
          divider.
        </p>
        <div class="showcase-row">
          <rhombus-overflow-menu [items]="edgeItems" />
        </div>
      </section>

      <div class="event-log">
        <p>Last action: <strong>{{ lastAction() }}</strong></p>
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
    .event-log p {
      margin: 0.2rem 0;
    }
    .event-log strong {
      color: var(--text-primary);
    }
  `,
})
export default class OverflowMenuPageComponent {
  protected readonly lastAction = signal('—');

  private log(label: string): void {
    this.lastAction.set(label);
  }

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { Component } from '@angular/core';
import { OverflowMenuItem, RhombusOverflowMenuComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-row-actions',
  imports: [RhombusOverflowMenuComponent],
  template: \`
    <rhombus-overflow-menu [items]="items" ariaLabel="Row actions" />
  \`,
})
export class RowActionsComponent {
  protected readonly items: OverflowMenuItem[] = [
    { label: 'Edit', icon: 'edit', action: () => this.edit() },
    { label: 'Archive', icon: 'archive', action: () => this.archive() },
    { label: 'Delete', icon: 'delete', variant: 'danger', action: () => this.delete() },
  ];
}`;

  protected readonly basicItems: OverflowMenuItem[] = [
    { label: 'Edit', icon: 'edit', action: () => this.log('Edit') },
    { label: 'Archive', icon: 'archive', action: () => this.log('Archive') },
    { label: 'Delete', icon: 'delete', action: () => this.log('Delete') },
  ];

  protected readonly groupedItems: OverflowMenuItem[] = [
    {
      label: 'View on site',
      icon: 'open_in_new',
      action: () => this.log('View on site'),
    },
    { label: 'Duplicate', icon: 'content_copy', action: () => this.log('Duplicate') },
    {
      label: 'Delete post…',
      icon: 'delete',
      variant: 'danger',
      dividerBefore: true,
      action: () => this.log('Delete post…'),
    },
  ];

  protected readonly edgeItems: OverflowMenuItem[] = [
    // dividerBefore on the first item must be ignored (no leading divider).
    {
      label: 'Pin to top',
      icon: 'push_pin',
      dividerBefore: true,
      action: () => this.log('Pin to top'),
    },
    {
      label: 'Move (unavailable)',
      icon: 'drive_file_move',
      disabled: true,
      action: () => this.log('Move'),
    },
    {
      label: 'Delete forever',
      icon: 'delete_forever',
      variant: 'danger',
      dividerBefore: true,
      action: () => this.log('Delete forever'),
    },
  ];
}
