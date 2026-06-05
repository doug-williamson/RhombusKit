import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RhombusButtonComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [RhombusButtonComponent, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Button" apiKey="RhombusButtonComponent">
      <div overview>
        <p>
          Wraps Angular Material's <code>matButton</code> directive with the
          RhombusKit token contract and a curated variant / size /
          appearance API. Every visible colour is sourced through
          <code>--mat-sys-*</code> &rarr; <code>--btn-primary-*</code> /
          <code>--surface-*</code> /
          <code>--status-*</code> CONTRACT names &mdash; toggle the theme
          above to see the bridge fire end-to-end.
        </p>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Variants</h2>
          <div class="showcase-row">
            <rhombus-button variant="primary">Primary</rhombus-button>
            <rhombus-button variant="secondary">Secondary</rhombus-button>
            <rhombus-button variant="ghost">Ghost</rhombus-button>
            <rhombus-button variant="danger">Danger</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Appearances</h2>
          <div class="showcase-row">
            <rhombus-button appearance="filled">Filled</rhombus-button>
            <rhombus-button appearance="outlined">Outlined</rhombus-button>
            <rhombus-button appearance="text">Text</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Sizes</h2>
          <div class="showcase-row">
            <rhombus-button size="sm">Small</rhombus-button>
            <rhombus-button size="md">Medium</rhombus-button>
            <rhombus-button size="lg">Large</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>States</h2>
          <div class="showcase-row">
            <rhombus-button [disabled]="true">Disabled</rhombus-button>
            <rhombus-button leadingIcon="add">With leading icon</rhombus-button>
            <rhombus-button trailingIcon="arrow_forward">
              With trailing icon
            </rhombus-button>
          </div>
        </section>
      </div>
    </app-component-page>
  `,
})
export default class ButtonPageComponent {}
