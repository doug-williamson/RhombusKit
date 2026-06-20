import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusTooltipDirective,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-tooltip-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    RhombusTooltipDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Tooltip"
      [hasUsage]="true"
      apiKey="RhombusTooltipDirective"
    >
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
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-button [rhombusTooltip]="'Archive this item'">
              Archive
            </rhombus-button>
          </app-example>
        </section>

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
              Reach for it when the host already has its own accessible name and
              you just want to add a short clarifying label on demand, without
              taking up persistent space in the layout.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For rich, interactive content anchored to a trigger (forms, date
              grids, multi-control panels), use a
              <a routerLink="/components/popover">Popover</a>.
            </li>
            <li>
              For a list of actions off a trigger, use a
              <a routerLink="/components/menu">Menu</a> (or an
              <a routerLink="/components/overflow-menu">Overflow Menu</a> for row
              actions).
            </li>
            <li>
              For a persistent, in-flow status message, use an
              <a routerLink="/components/alert">Alert</a>; for a transient
              notification, use a <a routerLink="/components/toast">Toast</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/popover">Popover</a> — focus-trapped
              panels of arbitrary content.
            </li>
            <li>
              <a routerLink="/components/menu">Menu</a> — action lists off a
              trigger.
            </li>
            <li>
              <a routerLink="/components/button">Button</a> — the most common
              tooltip host.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A tooltip is driven entirely by attribute inputs on its host element —
          there is no panel component to place. Bind the label with
          <code>[rhombusTooltip]</code> and steer the rest with the
          <code>rhombusTooltip*</code> inputs.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[rhombusTooltip]="'…'"</code> — the only required input; its
              string is the tooltip label.
            </li>
            <li>
              <code>[rhombusTooltipPosition]</code> — placement relative to the
              host: <code>above</code> / <code>below</code> / <code>left</code> /
              <code>right</code> / <code>before</code> / <code>after</code>
              (default <code>below</code>).
            </li>
            <li>
              <code>[rhombusTooltipDisabled]</code> — suppresses the tooltip when
              <code>true</code> (default <code>false</code>).
            </li>
            <li>
              <code>rhombusTooltipShowDelay</code> /
              <code>rhombusTooltipHideDelay</code> — millisecond delays before
              the tooltip shows / hides (default <code>0</code>).
            </li>
            <li>
              There are <strong>no content-projection slots</strong>: the
              directive attaches to its host element rather than wrapping
              projected content, and the tooltip surface is rendered into the CDK
              overlay from the string label.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The tooltip surface renders in the CDK overlay, so colour overrides
            must target the <code>.cdk-overlay-container</code> scope rather than
            the host. The
            <a routerLink="/components/theming">material-preset</a> bridge maps
            these contract tokens onto Material's tooltip:
          </p>
          <ul>
            <li><code>--tooltip-bg</code> — tooltip surface background</li>
            <li><code>--tooltip-text</code> — tooltip label colour</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The tooltip shows on both pointer <strong>hover</strong> and keyboard
            <strong>focus</strong>, and dismisses on <kbd>Escape</kbd>, so the
            hint is reachable without a mouse. Apply it to a natively focusable
            host (a button, or an element with <code>tabindex="0"</code>) — a
            non-focusable host can only be reached by pointer.
          </p>
          <p>
            A tooltip <strong>supplements</strong> a control&rsquo;s accessible
            name; it does not replace it, so an icon-only button should still
            carry its own <code>aria-label</code>. Under the hood Material wires
            the host to the tooltip via <code>aria-describedby</code> while the
            tooltip is visible, so the label is announced as a description rather
            than as the element&rsquo;s name. Keep the label short — it is read
            as supplementary text, not as a live region.
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
