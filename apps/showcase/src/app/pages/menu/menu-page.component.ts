import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  MenuItem,
  RhombusMenuComponent,
  RhombusOverflowMenuComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [
    RhombusMenuComponent,
    RhombusOverflowMenuComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Menu" apiKey="RhombusMenuComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A menu presents a list of actions on a surface that opens from a
          trigger you project. RhombusKit wraps Material's
          <code>&lt;mat-menu&gt;</code> with the token contract and a declarative
          <code>items</code> API — each <code>MenuItem</code> carries its own
          <code>action</code> callback, so dispatch is co-located with the item.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a menu to collect <strong>secondary or overflow actions</strong>
              behind one trigger (row actions, a &ldquo;more&rdquo; button) rather
              than crowding them all onscreen.
            </li>
            <li>
              <code>dividerBefore</code> groups related items,
              <code>variant: 'danger'</code> marks a destructive one, and
              <code>disabled</code> renders an item inert. For the round
              icon-button trigger, use <code>&lt;rhombus-overflow-menu&gt;</code>
              (or pass <code>[iconButton]="true"</code>).
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-menu [items]="items" ariaLabel="Document actions">
              Actions
            </rhombus-menu>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Inherits Material's menu semantics: the trigger exposes
            <code>aria-haspopup</code> and opens the panel on <kbd>Enter</kbd> /
            <kbd>Space</kbd>; the open menu is a <code>menu</code> of
            <code>menuitem</code>s navigable with the arrow keys and dismissed
            with <kbd>Esc</kbd>. Give an icon-only trigger an
            <code>ariaLabel</code> so its purpose is announced.
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
