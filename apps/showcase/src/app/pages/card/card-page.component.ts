import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RhombusButtonComponent, RhombusCardComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-card-page',
  standalone: true,
  imports: [
    RhombusCardComponent,
    RhombusButtonComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Card" apiKey="RhombusCardComponent">
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
              Project content into <code>[slot=title]</code>,
              <code>[slot=subtitle]</code>, and <code>[slot=actions]</code>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-card variant="elevated">
              <span slot="title">Monthly report</span>
              <span slot="subtitle">Updated 2 hours ago</span>
              <p>Revenue is up 12% over last month across all regions.</p>
              <rhombus-button slot="actions" appearance="text">View</rhombus-button>
            </rhombus-card>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            A card is a styled container, not an interactive control, so it adds
            no roles or keyboard handling of its own. Any focusable elements you
            project &mdash; buttons in <code>[slot=actions]</code>, links in the
            body &mdash; keep their native semantics and tab order. When the whole
            card represents one item, give its <code>[slot=title]</code> a real
            heading so assistive tech can navigate by structure.
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
  /** Minimal import + usage snippet shown in the Overview tab. */
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
