import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusPageHeaderComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-page-header-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusPageHeaderComponent,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Page Header"
      [hasUsage]="true"
      apiKey="RhombusPageHeaderComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-page-header&gt;</code> is a leaf composite for the top
          of a page: a required <code>title</code> with an optional
          <code>badge</code> and <code>description</code>, plus a projected
          <code>[slot=actions]</code> region. The badge composes
          <code>[rhombusChip]</code> and every colour is sourced from the token
          contract, so it tracks the active theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-page-header
              title="Posts"
              badge="Beta"
              description="Manage your drafts, scheduled posts, and published articles."
            >
              <rhombus-button slot="actions" variant="primary" leadingIcon="add">
                New post
              </rhombus-button>
            </rhombus-page-header>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use it once at the top of a routed view to introduce the page and
              anchor its primary actions.
            </li>
            <li>
              Pass <code>badge</code> for a short status pill (&ldquo;New&rdquo;,
              &ldquo;Beta&rdquo;) and project buttons into
              <code>slot="actions"</code> for the page's primary actions.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For the persistent application frame around the page &mdash; sidebar,
              top bar, content region &mdash; use the
              <a routerLink="/components/app-shell">App Shell</a> instead; the page
              header lives inside its content area.
            </li>
            <li>
              For a trail of ancestor links above the title, use
              <a routerLink="/components/breadcrumbs">Breadcrumbs</a>.
            </li>
            <li>
              When the body has no content to introduce yet, reach for an
              <a routerLink="/components/empty-state">Empty State</a> rather than a
              bare header.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/app-shell">App Shell</a> &mdash; the frame
              the header sits within.
            </li>
            <li>
              <a routerLink="/components/breadcrumbs">Breadcrumbs</a> &mdash;
              ancestor navigation above the title.
            </li>
            <li>
              <a routerLink="/components/button">Button</a> &mdash; the controls you
              project into <code>slot="actions"</code>.
            </li>
            <li>
              <a routerLink="/components/chip">Chip</a> &mdash; the directive the
              badge composes.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The page header is driven entirely by string inputs &mdash;
          <code>title</code> (required), <code>badge</code>, and
          <code>description</code> &mdash; plus a single projected
          <code>slot="actions"</code> region for its controls.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>title</code> &mdash; required string, rendered as the page's
              single <code>&lt;h1&gt;</code> inside a <code>&lt;header&gt;</code>.
            </li>
            <li>
              <code>badge</code> &mdash; optional string shown beside the title as a
              non-interactive <code>[rhombusChip]</code> pill; omit it to hide the
              chip.
            </li>
            <li>
              <code>description</code> &mdash; optional string rendered as a muted
              paragraph below the title; omit it to hide that line.
            </li>
            <li>
              <code>slot="actions"</code> &mdash; the only content-projection slot.
              Project one or more controls here for the trailing actions region; it
              collapses to nothing when no element carries the attribute. There is no
              default slot.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The component reads these contract tokens, so it tracks the active theme
            with no extra wiring:
          </p>
          <ul>
            <li><code>--text-primary</code> &mdash; title colour</li>
            <li><code>--text-secondary</code> &mdash; description colour</li>
            <li><code>--border</code> &mdash; the bottom divider rule</li>
            <li><code>--font-sans</code> &mdash; title and description font family</li>
          </ul>
          <p>
            The badge authors no colour here &mdash; it is themed globally through the
            <a routerLink="/components/chip">Chip</a> bridge.
          </p>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The <code>title</code> renders as an <code>&lt;h1&gt;</code> inside a
            <code>&lt;header&gt;</code> landmark, giving the view a single top-level
            heading that screen-reader users can jump to &mdash; so use one page
            header per routed view to keep that heading unique. The badge is a
            non-interactive <code>disableRipple</code> chip with no role of its own,
            so treat it as decorative status text rather than a control. Slotted
            actions keep their own roles and labels: an icon-only action button still
            needs its own <code>aria-label</code>. The component sets no
            <code>aria-live</code> region, so changing the title or badge at runtime is
            not announced automatically.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Title only</h2>
        <rhombus-page-header title="Dashboard" />
      </section>

      <section class="showcase-section">
        <h2>With badge</h2>
        <rhombus-page-header title="Components" badge="Stable" />
      </section>

      <section class="showcase-section">
        <h2>With description</h2>
        <rhombus-page-header
          title="Data Table"
          badge="New"
          description="A config-driven table with a cellTemplate escape hatch, client- and server-side modes, and distinct loading and empty paths."
        />
      </section>

      <section class="showcase-section">
        <h2>With actions</h2>
        <rhombus-page-header
          title="Posts"
          badge="Beta"
          description="Manage your drafts, scheduled posts, and published articles."
        >
          <rhombus-button slot="actions" variant="secondary">
            Import
          </rhombus-button>
          <rhombus-button slot="actions" variant="primary" leadingIcon="add">
            New post
          </rhombus-button>
        </rhombus-page-header>
      </section>
      </div>
    </app-component-page>
  `,
})
export default class PageHeaderPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusPageHeaderComponent, RhombusButtonComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-posts-page',
  imports: [RhombusPageHeaderComponent, RhombusButtonComponent],
  template: \`
    <rhombus-page-header
      title="Posts"
      badge="Beta"
      description="Manage your drafts, scheduled posts, and published articles."
    >
      <rhombus-button slot="actions" variant="primary" leadingIcon="add">
        New post
      </rhombus-button>
    </rhombus-page-header>
  \`,
})
export class PostsPageComponent {}`;
}
