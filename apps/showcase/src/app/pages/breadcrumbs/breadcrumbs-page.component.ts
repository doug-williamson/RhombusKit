import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BreadcrumbItem,
  RhombusBreadcrumbsComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-breadcrumbs-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusBreadcrumbsComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Breadcrumbs"
      [hasUsage]="true"
      apiKey="RhombusBreadcrumbsComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          Breadcrumbs show where the current page sits in the site hierarchy and
          offer one-click steps back up it. <code>&lt;rhombus-breadcrumbs&gt;</code>
          is a bespoke, accessible trail — it wraps no Material primitive — driven
          by an <code>items</code> array, with all colour flowing through the token
          contract.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-breadcrumbs [items]="trail" />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use breadcrumbs for <strong>deep, hierarchical pages</strong> so
              users can see and jump up the path.
            </li>
            <li>
              When the trail is short or the destinations are equally important
              ancestors, breadcrumbs keep the path lightweight and scannable
              without stealing focus from the page content.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For switching between peer views of one page, use
              <a routerLink="/components/tabs">Tabs</a> — breadcrumbs imply a
              parent-child hierarchy, not siblings.
            </li>
            <li>
              For paging through a long list of records, use
              <a routerLink="/components/pagination">Pagination</a>.
            </li>
            <li>
              For a fixed app-wide navigation rail, use the
              <a routerLink="/components/app-shell">App Shell</a> or
              <a routerLink="/components/bottom-nav">Bottom Nav</a> instead.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/tabs">Tabs</a> — switch between peer views of a single page.</li>
            <li><a routerLink="/components/page-header">Page Header</a> — a common host for a breadcrumb trail.</li>
            <li><a routerLink="/components/pagination">Pagination</a> — step through sequential pages of data.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A breadcrumb trail is driven entirely by its <code>[items]</code>
          input — an array of <code>BreadcrumbItem</code> (root first). There is
          no content projection; the component renders the trail itself.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[items]</code> (required) — a <code>BreadcrumbItem[]</code>,
              root first. Each item has a <code>label</code> and an optional
              <code>link</code> (a <code>routerLink</code> target: a string path
              or commands array).
            </li>
            <li>
              Give each ancestor a <code>link</code>; <strong>omit it on the last
              item</strong>, which renders as the current page rather than an
              anchor.
            </li>
            <li>
              <code>separator</code> — the glyph drawn between entries. Defaults
              to <code>'/'</code>.
            </li>
            <li>
              <code>ariaLabel</code> — the accessible label for the
              <code>&lt;nav&gt;</code> landmark. Defaults to
              <code>'Breadcrumb'</code>.
            </li>
            <li>
              The component renders its own template — it exposes
              <strong>no content-projection slots</strong>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Breadcrumbs render in the host (not a CDK overlay) and read only
            colour and typography from the contract tokens:
          </p>
          <ul>
            <li><code>--font-sans</code> — trail font family</li>
            <li><code>--text-secondary</code> — ancestor link colour</li>
            <li><code>--text-accent</code> — link hover colour</li>
            <li><code>--text-primary</code> — current-page colour</li>
            <li><code>--text-muted</code> — separator colour</li>
            <li><code>--focus-border</code> — link focus ring</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders a <code>&lt;nav&gt;</code> landmark labelled by
            <code>ariaLabel</code> (default <code>"Breadcrumb"</code>) wrapping
            an ordered list. Ancestor entries are real <code>routerLink</code>
            anchors with a visible focus ring; the last entry is rendered as a
            <code>&lt;span&gt;</code> carrying <code>aria-current="page"</code>
            and is never a link. Separators are decorative
            (<code>aria-hidden="true"</code>) so they are not announced. Because
            <code>aria-current</code> is set only on the final item, screen
            readers announce exactly one current page; keep the last item as the
            page the user is on.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Trail</h2>
        <p class="showcase-section__lead">
          The first two entries link via the router; the last is the current
          page. (These point at real showcase routes — try them.)
        </p>
        <div class="showcase-row">
          <rhombus-breadcrumbs [items]="trail" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Custom separator</h2>
        <p class="showcase-section__lead">
          The <code>separator</code> input replaces the default slash.
        </p>
        <div class="showcase-row">
          <rhombus-breadcrumbs [items]="trail" separator="›" />
        </div>
      </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
  `,
})
export default class BreadcrumbsPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { BreadcrumbItem, RhombusBreadcrumbsComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-page-header',
  imports: [RhombusBreadcrumbsComponent],
  template: \`
    <rhombus-breadcrumbs [items]="trail" />
  \`,
})
export class PageHeaderComponent {
  readonly trail: BreadcrumbItem[] = [
    { label: 'Components', link: '/components/button' },
    { label: 'Navigation', link: '/components/tabs' },
    { label: 'Breadcrumbs' },
  ];
}`;

  protected readonly trail: BreadcrumbItem[] = [
    { label: 'Components', link: '/components/button' },
    { label: 'Navigation', link: '/components/tabs' },
    { label: 'Breadcrumbs' },
  ];
}
