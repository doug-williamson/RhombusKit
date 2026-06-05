import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RhombusButtonComponent, RhombusCardComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-card-page',
  standalone: true,
  imports: [RhombusCardComponent, RhombusButtonComponent, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Card" apiKey="RhombusCardComponent">
      <div overview>
        <p>
          <code>&lt;rhombus-card&gt;</code> wraps Material's
          <code>&lt;mat-card&gt;</code>. Public API:
          <code>variant</code>
          (<code>elevated</code> | <code>outlined</code> | <code>filled</code>),
          <code>padding</code> (<code>none</code> | <code>sm</code> |
          <code>md</code> | <code>lg</code>), and <code>hasHeader</code>.
          Content projects into named slots — <code>[slot=title]</code>,
          <code>[slot=subtitle]</code>, and <code>[slot=actions]</code> —
          with the default slot rendering the body.
        </p>
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
export default class CardPageComponent {}
