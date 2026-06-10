import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RhombusButtonComponent, RhombusTooltipDirective } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-tooltip-page',
  standalone: true,
  imports: [
    MatButtonModule,
    RhombusButtonComponent,
    RhombusTooltipDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Tooltip" apiKey="RhombusTooltipDirective">
      <div overview class="overview">
        <p class="overview__lead">
          A tooltip is a small label that appears on hover or focus to explain a
          control. <code>[rhombusTooltip]</code> composes Material's
          <code>[matTooltip]</code> via <code>hostDirectives</code>, so you
          import one directive, apply it to any element, and route its colour
          through the <code>--tooltip-bg</code> / <code>--tooltip-text</code>
          tokens &mdash; toggle the theme above and it re-skins without touching
          markup.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a tooltip for a <strong>brief, supplementary hint</strong> on
              an interactive element &mdash; most often an icon-only button. It
              is hover/focus-only, so never put essential information or actions
              inside it.
            </li>
            <li>
              Bind the label with <code>[rhombusTooltip]="'…'"</code> and steer
              placement with <code>[rhombusTooltipPosition]</code>
              (<code>above</code> / <code>below</code> / <code>left</code> /
              <code>right</code>, default <code>below</code>); tune timing with
              <code>rhombusTooltipShowDelay</code> /
              <code>rhombusTooltipHideDelay</code>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-button [rhombusTooltip]="'Archive this item'">
              Archive
            </rhombus-button>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            The tooltip shows on both pointer <strong>hover</strong> and keyboard
            <strong>focus</strong>, and dismisses on <kbd>Escape</kbd>, so the
            hint is reachable without a mouse. Apply it to a natively focusable
            host (a button, or an element with <code>tabindex="0"</code>). A
            tooltip supplements a control&rsquo;s accessible name &mdash; it does
            not replace it, so an icon-only button should still carry its own
            <code>aria-label</code>.
          </p>
        </section>
      </div>

      <div examples>
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
    </app-component-page>
  `,
})
export default class TooltipPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusButtonComponent, RhombusTooltipDirective } from '@rhombuskit/core';

@Component({
  selector: 'app-archive-action',
  imports: [RhombusButtonComponent, RhombusTooltipDirective],
  template: \`
    <rhombus-button [rhombusTooltip]="'Archive this item'">
      Archive
    </rhombus-button>
  \`,
})
export class ArchiveActionComponent {}`;
}
