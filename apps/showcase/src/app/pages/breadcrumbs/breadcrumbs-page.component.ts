import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BreadcrumbItem,
  RhombusBreadcrumbsComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-breadcrumbs-page',
  standalone: true,
  imports: [
    RhombusBreadcrumbsComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Breadcrumbs" apiKey="RhombusBreadcrumbsComponent">
      <div overview class="overview">
        <p class="overview__lead">
          Breadcrumbs show where the current page sits in the site hierarchy and
          offer one-click steps back up it. <code>&lt;rhombus-breadcrumbs&gt;</code>
          is a bespoke, accessible trail — it wraps no Material primitive — driven
          by an <code>items</code> array, with all colour flowing through the token
          contract.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use breadcrumbs for <strong>deep, hierarchical pages</strong> so
              users can see and jump up the path. For switching between peer
              views of one page, prefer <strong>Tabs</strong>.
            </li>
            <li>
              Give each ancestor <code>BreadcrumbItem</code> a <code>link</code>
              (a <code>routerLink</code> target); omit it on the last item, which
              renders as the current page rather than an anchor. The
              <code>separator</code> input swaps the default slash.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-breadcrumbs [items]="trail" />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders a <code>&lt;nav aria-label="Breadcrumb"&gt;</code> landmark
            wrapping an ordered list. Ancestor entries are real
            <code>routerLink</code> anchors, the last entry carries
            <code>aria-current="page"</code> and is never a link, and the
            separators are decorative (<code>aria-hidden</code>) so they are not
            announced.
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
