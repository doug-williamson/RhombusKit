import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BreadcrumbItem,
  RhombusBreadcrumbsComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-breadcrumbs-page',
  standalone: true,
  imports: [RhombusBreadcrumbsComponent, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Breadcrumbs" apiKey="RhombusBreadcrumbsComponent">
      <div overview>
        <p>
          <code>&lt;rhombus-breadcrumbs&gt;</code> is a bespoke, accessible trail
          (<code>&lt;nav aria-label="Breadcrumb"&gt;&lt;ol&gt;</code>). Each
          <code>BreadcrumbItem</code> with a <code>link</code> renders as a
          <code>routerLink</code> anchor; the last item is the current page
          (<code>aria-current="page"</code>, never a link). Separators are
          decorative (<code>aria-hidden</code>).
        </p>
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
  protected readonly trail: BreadcrumbItem[] = [
    { label: 'Components', link: '/components/button' },
    { label: 'Navigation', link: '/components/tabs' },
    { label: 'Breadcrumbs' },
  ];
}
