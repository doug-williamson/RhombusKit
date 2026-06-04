import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  MenuItem,
  RhombusMenuComponent,
  RhombusOverflowMenuComponent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [RhombusMenuComponent, RhombusOverflowMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Menu</h1>
        <p>
          <code>&lt;rhombus-menu&gt;</code> wraps <code>&lt;mat-menu&gt;</code>
          behind a trigger you project — pass <code>[iconButton]="true"</code>
          for the round preset. It is driven by an <code>items</code> array where
          each <code>MenuItem</code> carries its own <code>action</code> callback,
          so dispatch is co-located with the item. <code>dividerBefore</code>
          expresses grouping, <code>variant: 'danger'</code> marks a destructive
          item, and <code>disabled</code> renders it inert.
          <code>&lt;rhombus-overflow-menu&gt;</code> is the icon-button preset of
          this component.
        </p>
      </header>

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
