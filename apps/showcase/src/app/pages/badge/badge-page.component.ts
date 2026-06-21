import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  RhombusBadgeDirective,
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-badge-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusBadgeDirective,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    MatIconModule,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Badge"
      [hasUsage]="true"
      apiKey="RhombusBadgeDirective"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A badge is a small count or status marker pinned to the corner of
          another element. <code>[rhombusBadge]</code> is an attribute directive
          that composes Angular Material's <code>[matBadge]</code> via
          <code>hostDirectives</code> and routes its colours through the token
          contract per variant &mdash; toggle the theme above and the badges
          re-skin without touching markup.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-button [rhombusBadge]="7" rhombusBadgeVariant="primary">
              Inbox
            </rhombus-button>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a badge to draw attention to a <strong>count or short
              status</strong> on its host &mdash; an unread tally on an inbox
              button, a "NEW" flag on an icon.
            </li>
            <li>
              When the marker belongs to <strong>another element</strong>
              (button, <code>mat-icon</code>, span) rather than standing on its
              own, so it should be pinned to that host's corner.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a standalone, free-standing label or tag, use a
              <a routerLink="/components/chip">Chip</a> &mdash; it renders as its
              own element rather than overlaying a host.
            </li>
            <li>
              For a full inline status message with an icon and copy, use an
              <a routerLink="/components/alert">Alert</a>.
            </li>
            <li>
              To show ongoing or determinate activity rather than a static count,
              use <a routerLink="/components/progress">Progress</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/chip">Chip</a> — standalone labels and tags.</li>
            <li><a routerLink="/components/button">Button</a> — a common badge host.</li>
            <li><a routerLink="/components/avatar">Avatar</a> — another corner-marker host.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The badge is driven entirely by host-element inputs: bind
          <code>[rhombusBadge]</code> to the content and tune it with the
          <code>rhombusBadge*</code> inputs &mdash; there is no template or
          projected content of its own.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[rhombusBadge]="value"</code> &mdash; apply the attribute
              directive to <strong>any host element</strong> (button,
              <code>mat-icon</code>, span). The host element is the only "slot":
              the badge is pinned to its corner; the badge has no content
              projection of its own.
            </li>
            <li>
              <code>rhombusBadgeVariant</code> &mdash; colour role:
              <code>default</code> | <code>primary</code> | <code>success</code>
              | <code>warning</code> | <code>danger</code> (reflected to a
              <code>data-variant</code> host attribute).
            </li>
            <li>
              <code>rhombusBadgePosition</code> /
              <code>rhombusBadgeSize</code> /
              <code>[rhombusBadgeOverlap]</code> /
              <code>[rhombusBadgeHidden]</code> &mdash; placement, sizing,
              whether it overlaps the host, and visibility.
            </li>
            <li>
              <code>rhombusBadgeDescription</code> &mdash; accessible label for
              the marker (see Accessibility).
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Each variant rebinds Material's per-badge tokens
            (<code>--mat-badge-background-color</code> /
            <code>--mat-badge-text-color</code>) to RhombusKit contract colours.
            Override those contract tokens to re-skin badges; the badge renders
            inline on its host (not in a CDK overlay), so target the host
            normally. The variants read:
          </p>
          <ul>
            <li><code>--btn-primary-bg</code> / <code>--btn-primary-text</code> — primary.</li>
            <li><code>--status-published-bg</code> / <code>--status-published-text</code> — success.</li>
            <li><code>--status-draft-bg</code> / <code>--status-draft-text</code> — warning.</li>
            <li><code>--error</code> / <code>--bg</code> — danger.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The badge is decorative by default. Pass
            <code>rhombusBadgeDescription</code> to give it an accessible label;
            Material applies it via <code>aria-describedby</code> on the host so
            the count or status is announced when the host receives focus,
            rather than left as a silent visual marker. The directive does not
            emit an <code>aria-live</code> region, so a dynamically changing
            count is not auto-announced &mdash; if you need live updates spoken,
            add your own polite live region. When the host is otherwise
            non-interactive (e.g. a bare <code>mat-icon</code>), ensure it can
            convey the description to assistive tech (the icon examples set
            <code>aria-hidden="false"</code>).
          </p>
        </section>
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
export default class BadgePageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusBadgeDirective, RhombusButtonComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-inbox-button',
  imports: [RhombusBadgeDirective, RhombusButtonComponent],
  template: \`
    <rhombus-button [rhombusBadge]="unread()" rhombusBadgeVariant="primary">
      Inbox
    </rhombus-button>
  \`,
})
export class InboxButtonComponent {
  readonly unread = signal(7);
}`;
}
