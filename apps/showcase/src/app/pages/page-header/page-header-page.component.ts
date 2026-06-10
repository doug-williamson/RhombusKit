import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  RhombusButtonComponent,
  RhombusPageHeaderComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-page-header-page',
  standalone: true,
  imports: [
    RhombusPageHeaderComponent,
    RhombusButtonComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Page Header" apiKey="RhombusPageHeaderComponent">
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
          <h2>When to use</h2>
          <ul>
            <li>
              Use it once at the top of a routed view to introduce the page and
              anchor its primary actions; for the application frame around it,
              reach for <strong>App Shell</strong> instead.
            </li>
            <li>
              Pass <code>badge</code> for a short status pill (&ldquo;New&rdquo;,
              &ldquo;Beta&rdquo;) and project buttons into
              <code>slot="actions"</code> &mdash; the actions region collapses
              when nothing is slotted.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
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

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            The <code>title</code> renders as an <code>&lt;h1&gt;</code> inside a
            <code>&lt;header&gt;</code>, giving the view a single top-level
            heading that screen-reader users can jump to. The badge is a
            non-interactive chip, and slotted actions keep their own roles and
            labels &mdash; so an icon-only action button still needs its own
            <code>aria-label</code>.
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
