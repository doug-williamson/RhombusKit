import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MenuItem,
  RhombusCodeBlockComponent,
  RhombusMenuComponent,
  RhombusOverflowMenuComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCodeBlockComponent,
    RhombusMenuComponent,
    RhombusOverflowMenuComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Menu" [hasUsage]="true" apiKey="RhombusMenuComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A menu presents a list of actions on a surface that opens from a
          trigger you project. RhombusKit wraps Material's
          <code>&lt;mat-menu&gt;</code> with the token contract and a declarative
          <code>items</code> API — each <code>MenuItem</code> carries its own
          <code>action</code> callback, so dispatch is co-located with the item.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-menu [items]="items" ariaLabel="Document actions">
              Actions
            </rhombus-menu>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a menu to collect <strong>secondary or overflow actions</strong>
              behind one trigger (row actions, a &ldquo;more&rdquo; button) rather
              than crowding them all onscreen.
            </li>
            <li>
              When each entry is a <strong>single, fire-and-forget action</strong>
              — the homogeneous <code>items</code> list keeps dispatch co-located
              with each row.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For rich, interactive panels — date grids, filter forms, multi-control
              pickers — use a <a routerLink="/components/popover">Popover</a>; a flat
              item list can't express them.
            </li>
            <li>
              For the round icon-button trigger on a table row, reach for the
              <a routerLink="/components/overflow-menu">Overflow Menu</a> preset
              instead of wiring <code>[iconButton]="true"</code> by hand.
            </li>
            <li>
              For a short, non-interactive hint, use a
              <a routerLink="/components/tooltip">Tooltip</a>.
            </li>
            <li>
              For a task that must block the rest of the UI until resolved, use a
              <a routerLink="/components/dialog">Dialog</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/overflow-menu">Overflow Menu</a> — the icon-button preset of this menu.</li>
            <li><a routerLink="/components/popover">Popover</a> — arbitrary interactive content off a trigger.</li>
            <li><a routerLink="/components/tooltip">Tooltip</a> — lightweight hover/focus hints.</li>
            <li><a routerLink="/components/dialog">Dialog</a> — blocking modal surfaces.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A menu is driven by one <code>[items]</code> array of
          <code>MenuItem</code>s; whatever you project as content becomes the
          trigger. There is no <code>(itemClick)</code> output — each item's own
          <code>action</code> callback runs when it is activated.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>&lt;rhombus-menu&gt;</code> — the host. Its
              <strong>default content slot</strong> projects the trigger (a text
              label, an icon, or any markup); there are no named slots.
            </li>
            <li>
              <code>[items]</code> — the required <code>MenuItem[]</code>. Each item
              carries <code>label</code>, an optional <code>icon</code> (Material
              icon name), and a required <code>action</code> callback.
            </li>
            <li>
              Per-item options: <code>variant: 'danger'</code> tints a destructive
              item with <code>--error</code>, <code>disabled</code> renders it inert,
              and <code>dividerBefore</code> inserts a divider above it (ignored on
              the first item).
            </li>
            <li>
              <code>ariaLabel</code> labels the trigger; <code>[iconButton]="true"</code>
              switches it to the round icon-button treatment (or use
              <code>&lt;rhombus-overflow-menu&gt;</code>).
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The trigger is styled on the host, but the panel and items render in the
            CDK overlay — those overrides must target the
            <code>.cdk-overlay-container</code> scope, not the host. The component
            reads these contract tokens:
          </p>
          <ul>
            <li><code>--font-sans</code> — trigger font family</li>
            <li><code>--text-primary</code> — trigger and item label colour</li>
            <li><code>--text-secondary</code> — icon-button trigger and item icon colour</li>
            <li><code>--border</code> / <code>--border-strong</code> — trigger border (default + hover)</li>
            <li><code>--focus-border</code> — trigger focus outline</li>
            <li><code>--surface-0</code> — panel background</li>
            <li><code>--surface-1</code> — trigger and item hover state</li>
            <li><code>--surface-2</code> — item focus state</li>
            <li><code>--error</code> — <code>variant: 'danger'</code> item label and icon</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The trigger is a real <code>&lt;button&gt;</code> wired with Material's
            <code>matMenuTriggerFor</code>, so it exposes
            <code>aria-haspopup</code> / <code>aria-expanded</code> and opens the
            panel on <kbd>Enter</kbd> / <kbd>Space</kbd>. The open menu is a
            <code>menu</code> of <code>menuitem</code>s navigable with the arrow
            keys and dismissed with <kbd>Esc</kbd>; focus returns to the trigger on
            close. The <code>ariaLabel</code> input is reflected as
            <code>aria-label</code> on the trigger — always set it for an icon-only
            trigger so its purpose is announced. Items with <code>disabled</code>
            are skipped by keyboard navigation.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Labeled trigger</h2>
        <p class="showcase-section__lead">
          Project any content as the trigger — here a text button.
        </p>
        <div class="showcase-row">
          <rhombus-menu [items]="items" ariaLabel="Document actions">
            Actions
          </rhombus-menu>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Icon-button preset</h2>
        <p class="showcase-section__lead">
          The same menu via <code>&lt;rhombus-overflow-menu&gt;</code>.
        </p>
        <div class="showcase-row">
          <rhombus-overflow-menu [items]="items" ariaLabel="Document actions" />
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
    .event-log strong {
      color: var(--text-primary);
    }
  `,
})
export default class MenuPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { MenuItem, RhombusMenuComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-doc-toolbar',
  imports: [RhombusMenuComponent],
  template: \`
    <rhombus-menu [items]="items" ariaLabel="Document actions">
      Actions
    </rhombus-menu>
  \`,
})
export class DocToolbarComponent {
  readonly items: MenuItem[] = [
    { label: 'Rename', icon: 'edit', action: () => this.rename() },
    { label: 'Duplicate', icon: 'content_copy', action: () => this.duplicate() },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      dividerBefore: true,
      action: () => this.delete(),
    },
  ];
}`;

  protected readonly lastAction = signal('—');

  private log(label: string): void {
    this.lastAction.set(label);
  }

  protected readonly items: MenuItem[] = [
    { label: 'Rename', icon: 'edit', action: () => this.log('Rename') },
    { label: 'Duplicate', icon: 'content_copy', action: () => this.log('Duplicate') },
    {
      label: 'Move to…',
      icon: 'drive_file_move',
      action: () => this.log('Move to…'),
    },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      dividerBefore: true,
      action: () => this.log('Delete'),
    },
  ];
}
