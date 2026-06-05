import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RhombusBadgeDirective, RhombusButtonComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-badge-page',
  standalone: true,
  imports: [RhombusBadgeDirective, RhombusButtonComponent, MatIconModule, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Badge" apiKey="RhombusBadgeDirective">
      <div overview>
        <p>
          <code>[rhombusBadge]</code> is an attribute directive that
          composes Angular Material's <code>[matBadge]</code> via
          <code>hostDirectives</code> and rebinds
          <code>--mat-badge-background-color</code> /
          <code>--mat-badge-text-color</code> per variant. Apply it to
          any host &mdash; button, icon, span. Inputs are prefixed with
          <code>rhombusBadge*</code> to avoid colliding with host
          components' own variant / size inputs.
        </p>
      </div>
      <div examples>
      <section class="showcase-section">
        <h2>Variants on a button</h2>
        <div class="showcase-row">
          <rhombus-button [rhombusBadge]="3">Default</rhombus-button>
          <rhombus-button [rhombusBadge]="7"  rhombusBadgeVariant="primary">Inbox</rhombus-button>
          <rhombus-button [rhombusBadge]="12" rhombusBadgeVariant="success">Published</rhombus-button>
          <rhombus-button [rhombusBadge]="'!'" rhombusBadgeVariant="warning">Drafts</rhombus-button>
          <rhombus-button [rhombusBadge]="99" rhombusBadgeVariant="danger">Errors</rhombus-button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>On a mat-icon</h2>
        <p class="showcase-section__note">
          Icons sized up to 36px and badges set
          <code>[rhombusBadgeOverlap]="false"</code> so the badge sits
          beside the glyph rather than over it.
        </p>
        <div class="showcase-row" style="gap: 2rem">
          <mat-icon
            class="icon-host"
            [rhombusBadge]="2"
            [rhombusBadgeOverlap]="false"
            rhombusBadgeVariant="primary"
            rhombusBadgeDescription="2 unread notifications"
            aria-hidden="false"
          >notifications</mat-icon>
          <mat-icon
            class="icon-host"
            [rhombusBadge]="'NEW'"
            [rhombusBadgeOverlap]="false"
            rhombusBadgeVariant="success"
            rhombusBadgeDescription="New inbox items"
            aria-hidden="false"
          >inbox</mat-icon>
          <mat-icon
            class="icon-host"
            [rhombusBadge]="'!'"
            [rhombusBadgeOverlap]="false"
            rhombusBadgeVariant="warning"
            rhombusBadgeDescription="Warning"
            aria-hidden="false"
          >warning</mat-icon>
          <mat-icon
            class="icon-host"
            [rhombusBadge]="4"
            [rhombusBadgeOverlap]="false"
            rhombusBadgeVariant="danger"
            rhombusBadgeDescription="4 reported bugs"
            aria-hidden="false"
          >bug_report</mat-icon>
        </div>
      </section>

      <section class="showcase-section">
        <h2>On a plain span</h2>
        <div class="showcase-row" style="gap: 1.5rem">
          <span class="badge-inline-host" [rhombusBadge]="'BETA'" rhombusBadgeVariant="primary">
            Feature flag
          </span>
          <span class="badge-inline-host" [rhombusBadge]="3" rhombusBadgeVariant="success">
            Tasks complete
          </span>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Sizes</h2>
        <div class="showcase-row" style="gap: 1.5rem">
          <span class="badge-inline-host" [rhombusBadge]="1"  rhombusBadgeSize="small"  rhombusBadgeVariant="primary">Small</span>
          <span class="badge-inline-host" [rhombusBadge]="42" rhombusBadgeSize="medium" rhombusBadgeVariant="primary">Medium</span>
          <span class="badge-inline-host" [rhombusBadge]="42" rhombusBadgeSize="large"  rhombusBadgeVariant="primary">Large</span>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Positions</h2>
        <div class="showcase-row" style="gap: 1.5rem">
          <span class="badge-inline-host" [rhombusBadge]="'AA'" rhombusBadgePosition="above after"  rhombusBadgeVariant="primary">above after</span>
          <span class="badge-inline-host" [rhombusBadge]="'AB'" rhombusBadgePosition="above before" rhombusBadgeVariant="primary">above before</span>
          <span class="badge-inline-host" [rhombusBadge]="'BA'" rhombusBadgePosition="below after"  rhombusBadgeVariant="primary">below after</span>
          <span class="badge-inline-host" [rhombusBadge]="'BB'" rhombusBadgePosition="below before" rhombusBadgeVariant="primary">below before</span>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Hidden</h2>
        <div class="showcase-row">
          <rhombus-button [rhombusBadge]="5" [rhombusBadgeHidden]="true" rhombusBadgeVariant="primary">
            Hidden badge
          </rhombus-button>
          <rhombus-button [rhombusBadge]="5" rhombusBadgeVariant="primary">
            Visible (compare)
          </rhombus-button>
        </div>
      </section>

      </div>
    </app-component-page>
  `,
  styles: `
    .badge-inline-host {
      display: inline-block;
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      background-color: var(--surface-1);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 0.875rem;
    }
    .icon-host {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--text-secondary);
    }
    .showcase-section__note {
      font-family: var(--font-sans);
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: -0.5rem 0 1rem;
      max-width: 60ch;

      code {
        font-family: var(--font-mono);
        font-size: 0.85em;
        background-color: var(--surface-1);
        padding: 0.1em 0.35em;
        border-radius: 0.25em;
      }
    }
  `,
})
export default class BadgePageComponent {}
