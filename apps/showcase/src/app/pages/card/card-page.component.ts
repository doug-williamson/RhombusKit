import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCardComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-card-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCardComponent,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Card" [hasUsage]="true" apiKey="RhombusCardComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A card groups related content and actions into a single surface.
          <code>&lt;rhombus-card&gt;</code> wraps Material's
          <code>&lt;mat-card&gt;</code> with a curated
          <code>variant</code> / <code>padding</code> API and routes its surface,
          border, and shadow through the token contract &mdash; toggle the theme
          above and the card re-skins without touching markup.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-card variant="elevated">
              <span slot="title">Monthly report</span>
              <span slot="subtitle">Updated 2 hours ago</span>
              <p>Revenue is up 12% over last month across all regions.</p>
              <rhombus-button slot="actions" appearance="text">View</rhombus-button>
            </rhombus-card>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Reach for a card to present a <strong>self-contained unit</strong>
              &mdash; a summary, a setting, a list item with its own actions.
              Avoid nesting cards deeply; prefer a <code>filled</code> variant
              for grouped panels.
            </li>
            <li>
              Pick a <code>variant</code> by emphasis:
              <code>elevated</code> for a raised surface, <code>outlined</code>
              for a flat bordered one, <code>filled</code> for a tonal panel.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>For a single piece of status metadata &mdash; a count or label &mdash; use a <a routerLink="/components/badge">Badge</a> or <a routerLink="/components/chip">Chip</a> rather than a whole surface.</li>
            <li>For transient feedback that should appear and dismiss itself, use a <a routerLink="/components/toast">Toast</a>; for inline messages, an <a routerLink="/components/alert">Alert</a>.</li>
            <li>When the &ldquo;card&rdquo; must block the page until the user responds, use a <a routerLink="/components/dialog">Dialog</a> &mdash; a card never traps focus or dims the background.</li>
            <li>To frame a whole route's heading and actions, use a <a routerLink="/components/page-header">Page Header</a> instead of a top-level card.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/button">Button</a> &mdash; the controls you project into <code>[slot=actions]</code>.</li>
            <li><a routerLink="/components/page-header">Page Header</a> &mdash; route-level title and action bar.</li>
            <li><a routerLink="/components/empty-state">Empty State</a> &mdash; the placeholder shown when a card's data set is empty.</li>
            <li><a routerLink="/components/theming">Theming</a> &mdash; the token contract the card re-skins through.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A card is driven entirely by content projection: set the
          <code>variant</code>, <code>padding</code>, and <code>hasHeader</code>
          inputs, then project markup into the title, subtitle, body, and actions
          slots.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>variant</code> &mdash; <code>elevated</code> (default) | <code>outlined</code> | <code>filled</code>; selects the surface treatment.</li>
            <li><code>padding</code> &mdash; <code>none</code> | <code>sm</code> | <code>md</code> (default) | <code>lg</code>; sets inner body padding.</li>
            <li><code>[hasHeader]="false"</code> &mdash; drops the title/subtitle region entirely for pure body + actions cards.</li>
            <li><code>[slot=title]</code> &mdash; projects into the card title (give it a real heading element when the card represents one item).</li>
            <li><code>[slot=subtitle]</code> &mdash; projects into the secondary subtitle line under the title.</li>
            <li><code>[slot=actions]</code> &mdash; projects into the end-aligned footer; collapses when empty so cards without buttons reserve no dead space.</li>
            <li><strong>Default slot</strong> &mdash; any other projected markup becomes the card body.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The card renders inline (no overlay) and reads these contract tokens,
            so overriding any of them re-skins it in place:
          </p>
          <ul>
            <li><code>--surface-0</code> &mdash; container background for <code>elevated</code> and <code>outlined</code></li>
            <li><code>--surface-1</code> &mdash; tonal container background for <code>filled</code></li>
            <li><code>--border</code> &mdash; outline colour for <code>outlined</code></li>
            <li><code>--shadow-md</code> &mdash; elevation shadow for <code>elevated</code></li>
            <li><code>--text-primary</code> &mdash; body and title colour</li>
            <li><code>--text-secondary</code> &mdash; subtitle colour</li>
            <li><code>--font-sans</code> &mdash; card font family</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            A card is a styled container, not an interactive control, so it adds
            no roles, ARIA attributes, or keyboard handling of its own &mdash; the
            template renders a plain <code>&lt;mat-card&gt;</code> with projected
            content. Any focusable elements you project &mdash; buttons in
            <code>[slot=actions]</code>, links in the body &mdash; keep their native
            semantics and tab order. When the whole card represents one item, give
            its <code>[slot=title]</code> a real heading element so assistive tech
            can navigate by structure; the title slot is styled text only and
            carries no heading role on its own.
          </p>
        </section>
      </div>
      <div examples>
      <section class="showcase-section">
        <h2>Variants</h2>
        <div class="card-grid">
          <rhombus-card variant="elevated">
            <span slot="title">Elevated</span>
            <span slot="subtitle">Default shadow ramp</span>
            <p>
              Picks up <code>--mat-sys-shadow</code> from the bridge,
              which maps to <code>var(--shadow-md)</code>.
            </p>
            <rhombus-button slot="actions" appearance="text">Open</rhombus-button>
          </rhombus-card>

          <rhombus-card variant="outlined">
            <span slot="title">Outlined</span>
            <span slot="subtitle">No shadow, 1px border</span>
            <p>
              Border uses <code>--border</code> from the contract;
              theme-aware in both light and dark mode.
            </p>
            <rhombus-button slot="actions" appearance="text">Open</rhombus-button>
          </rhombus-card>

          <rhombus-card variant="filled">
            <span slot="title">Filled</span>
            <span slot="subtitle">Tonal surface, no shadow</span>
            <p>
              Container colour rebinds to <code>--surface-1</code>; useful
              for grouped panels and nested cards.
            </p>
            <rhombus-button slot="actions" appearance="text">Open</rhombus-button>
          </rhombus-card>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Without header</h2>
        <div class="card-grid">
          <rhombus-card variant="elevated" [hasHeader]="false">
            <p>
              Set <code>[hasHeader]="false"</code> when the body is
              self-explanatory. The title / subtitle region is dropped
              entirely; vertical rhythm tightens.
            </p>
            <rhombus-button slot="actions" appearance="outlined">Dismiss</rhombus-button>
            <rhombus-button slot="actions" variant="primary">Confirm</rhombus-button>
          </rhombus-card>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Padding scale</h2>
        <div class="card-grid">
          <rhombus-card variant="outlined" padding="none">
            <span slot="title">none</span>
            <p>Edge-to-edge body. Useful when projecting media or tables.</p>
          </rhombus-card>
          <rhombus-card variant="outlined" padding="sm">
            <span slot="title">sm</span>
            <p>0.5rem on all sides.</p>
          </rhombus-card>
          <rhombus-card variant="outlined" padding="md">
            <span slot="title">md (default)</span>
            <p>1rem on all sides.</p>
          </rhombus-card>
          <rhombus-card variant="outlined" padding="lg">
            <span slot="title">lg</span>
            <p>1.5rem on all sides; airy.</p>
          </rhombus-card>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Body-only (no actions)</h2>
        <div class="card-grid">
          <rhombus-card variant="filled">
            <span slot="title">Note</span>
            <span slot="subtitle">Last edited 2 hours ago</span>
            <p>
              When <code>[slot=actions]</code> is empty the footer
              collapses, so cards without buttons don't reserve dead
              space at the bottom.
            </p>
          </rhombus-card>
        </div>
      </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
  `,
})
export default class CardPageComponent {
  /** Minimal import + usage snippet shown in the Usage tab. */
  protected readonly usage = `import { RhombusButtonComponent, RhombusCardComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-report-card',
  imports: [RhombusCardComponent, RhombusButtonComponent],
  template: \`
    <rhombus-card variant="elevated">
      <span slot="title">Monthly report</span>
      <span slot="subtitle">Updated 2 hours ago</span>
      <p>Revenue is up 12% over last month across all regions.</p>
      <rhombus-button slot="actions" appearance="text">View</rhombus-button>
    </rhombus-card>
  \`,
})
export class ReportCardComponent {}`;
}
