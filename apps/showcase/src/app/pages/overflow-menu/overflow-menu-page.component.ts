import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  OverflowMenuItem,
  RhombusCodeBlockComponent,
  RhombusOverflowMenuComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-overflow-menu-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCodeBlockComponent,
    RhombusOverflowMenuComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Overflow Menu"
      [hasUsage]="true"
      apiKey="RhombusOverflowMenuComponent"
    >
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
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-overflow-menu [items]="basicItems" />
          </app-example>
        </section>

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
              Reach for it on dense surfaces &mdash; data-table rows, list items,
              cards &mdash; where space is tight and the actions are contextual to
              one entity.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a text-triggered action list (not an icon button), use a
              <a routerLink="/components/menu">Menu</a> directly &mdash; overflow
              menu is just its icon-button preset.
            </li>
            <li>
              For rich, interactive panels (date grids, filter forms,
              multi-control pickers), use a
              <a routerLink="/components/popover">Popover</a> &mdash; a menu only
              expresses a flat list of actions.
            </li>
            <li>
              For a single, prominent action, use a
              <a routerLink="/components/button">Button</a> rather than hiding it
              behind an overflow trigger.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/menu">Menu</a> &mdash; the text-triggered
              base this preset is built on.
            </li>
            <li>
              <a routerLink="/components/data-table">Data Table</a> &mdash; the
              canonical home for per-row overflow actions.
            </li>
            <li>
              <a routerLink="/components/popover">Popover</a> &mdash; for
              interactive panels a menu can't express.
            </li>
            <li>
              <a routerLink="/components/button">Button</a> &mdash; for primary
              actions that stay visible.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The component is driven entirely by an <code>items</code> array of
          <code>OverflowMenuItem</code>; each item carries its own
          <code>action</code> callback, so dispatch is co-located with the item
          (there is no <code>(itemClick)</code> output).
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[items]</code> &mdash; the required array of
              <code>OverflowMenuItem</code>. Per item:
              <code>label</code>, optional <code>icon</code> (Material icon name),
              <code>action</code>, <code>variant: 'danger'</code> to mark a
              destructive entry, <code>disabled</code> to render it inert, and
              <code>dividerBefore</code> to group items (ignored on the first).
            </li>
            <li>
              <code>ariaLabel</code> &mdash; accessible name for the icon-only
              trigger (default &ldquo;More actions&rdquo;).
            </li>
            <li>
              <code>triggerIcon</code> &mdash; the trigger&rsquo;s Material icon
              name (default <code>more_vert</code>).
            </li>
            <li>
              <strong>Content projection:</strong> the underlying
              <code>&lt;rhombus-menu&gt;</code> projects a single
              <strong>default slot</strong> for its trigger content. Overflow menu
              fills that default slot for you with the trigger icon &mdash; there
              are no named slots to wire up.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The trigger renders in the host, but the menu <strong>panel and its
            items render in a CDK overlay</strong>, so panel overrides must target
            the <code>.cdk-overlay-container .rhombus-menu__panel</code> scope, not
            the host. The contract tokens it reads:
          </p>
          <ul>
            <li>
              <code>--surface-0</code> &mdash; panel background
              (<code>--mat-menu-container-color</code>)
            </li>
            <li>
              <code>--text-primary</code> &mdash; item label colour
            </li>
            <li>
              <code>--text-secondary</code> &mdash; item icon colour and the
              icon-button trigger colour
            </li>
            <li>
              <code>--surface-1</code> &mdash; item hover layer and trigger hover
              background
            </li>
            <li>
              <code>--surface-2</code> &mdash; item focus layer
            </li>
            <li>
              <code>--error</code> &mdash; label and icon colour for
              <code>variant: 'danger'</code> items
            </li>
            <li>
              <code>--font-sans</code>, <code>--border</code>,
              <code>--border-strong</code>, <code>--focus-border</code> &mdash;
              trigger typography, border, and focus ring
            </li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The trigger is a real <code>&lt;button type="button"&gt;</code> with an
            accessible name (<code>ariaLabel</code>, default &ldquo;More
            actions&rdquo;) since it carries no visible text. It is wired with
            Material&rsquo;s <code>[matMenuTriggerFor]</code>, so it advertises
            <code>aria-haspopup</code> and toggles <code>aria-expanded</code>
            automatically. Opening it moves focus into the menu panel; items are a
            <code>menuitem</code> list navigable with the <kbd>Arrow</kbd> keys,
            activated with <kbd>Enter</kbd>, and the menu is dismissed with
            <kbd>Escape</kbd> &mdash; standard menu semantics inherited from
            <code>&lt;mat-menu&gt;</code>. Always pass an <code>ariaLabel</code>
            for the icon-only trigger so its purpose is announced.
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

      <section class="showcase-section">
        <h2>Custom trigger icon</h2>
        <p class="showcase-section__lead">
          <code>triggerIcon</code> swaps the default vertical
          <code>more_vert</code> dots for a horizontal <code>more_horiz</code>.
        </p>
        <div class="showcase-row">
          <rhombus-overflow-menu [items]="basicItems" triggerIcon="more_horiz" />
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
