import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  RhombusButtonComponent,
  RhombusPageHeaderComponent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-page-header-page',
  standalone: true,
  imports: [RhombusPageHeaderComponent, RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Page Header</h1>
        <p>
          A leaf composite for the top of a page: a required
          <code>title</code> with an optional <code>badge</code> and
          <code>description</code>, plus a projected <code>[slot=actions]</code>
          region. The badge composes <code>[rhombusChip]</code>; every colour is
          sourced from the token contract, so it tracks the theme &mdash; toggle
          the theme above to see it.
        </p>
      </header>

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
  `,
})
export default class PageHeaderPageComponent {}
