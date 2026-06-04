import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RhombusButtonComponent, RhombusTooltipDirective } from '@rhombuskit/core';

@Component({
  selector: 'app-tooltip-page',
  standalone: true,
  imports: [MatButtonModule, RhombusButtonComponent, RhombusTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Tooltip</h1>
        <p>
          <code>[rhombusTooltip]</code> composes Material's
          <code>[matTooltip]</code> via <code>hostDirectives</code>, so you
          import one directive and apply it to any element. Inputs use the
          <code>rhombusTooltip*</code> prefix. The surface renders in the CDK
          overlay and is themed by the <code>--tooltip-bg</code> /
          <code>--tooltip-text</code> tokens &mdash; toggle the theme to see it.
        </p>
      </header>

      <section class="showcase-section">
        <h2>Positions</h2>
        <div class="showcase-row">
          <rhombus-button [rhombusTooltip]="'Shown above'" [rhombusTooltipPosition]="'above'">
            Above
          </rhombus-button>
          <rhombus-button [rhombusTooltip]="'Shown below'" [rhombusTooltipPosition]="'below'">
            Below
          </rhombus-button>
          <rhombus-button [rhombusTooltip]="'Shown left'" [rhombusTooltipPosition]="'left'">
            Left
          </rhombus-button>
          <rhombus-button [rhombusTooltip]="'Shown right'" [rhombusTooltipPosition]="'right'">
            Right
          </rhombus-button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>On any element</h2>
        <div class="showcase-row">
          <button mat-flat-button [rhombusTooltip]="'Works on a plain Material button too'">
            Material button
          </button>
          <span
            [rhombusTooltip]="'Even on inline text'"
            tabindex="0"
            style="text-decoration: underline dotted; cursor: help;"
          >
            Hover or focus me
          </span>
        </div>
      </section>
    </div>
  `,
})
export default class TooltipPageComponent {}
