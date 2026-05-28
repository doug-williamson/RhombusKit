import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  OverflowMenuItem,
  RhombusOverflowMenuComponent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-overflow-menu-page',
  standalone: true,
  imports: [RhombusOverflowMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Overflow Menu</h1>
        <p>
          <code>&lt;rhombus-overflow-menu&gt;</code> wraps
          <code>&lt;mat-menu&gt;</code> behind an icon-button trigger. It is
          driven by a homogeneous <code>items</code> array — each
          <code>OverflowMenuItem</code> carries its own
          <code>action</code> callback, so dispatch is co-located with the item
          (no <code>(itemClick)</code> output). <code>dividerBefore</code>
          expresses grouping without sentinel objects, <code>variant</code>
          marks a destructive item, and <code>disabled</code> renders it inert.
          The panel renders in the CDK overlay, so its colours are bound under
          <code>.cdk-overlay-container</code>.
        </p>
      </header>

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
