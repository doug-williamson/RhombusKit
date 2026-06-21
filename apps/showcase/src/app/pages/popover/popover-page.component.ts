import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusPopoverComponent,
  RhombusPopoverTriggerDirective,
  RhombusPopoverCloseDirective,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-popover-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    RhombusPopoverComponent,
    RhombusPopoverTriggerDirective,
    RhombusPopoverCloseDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Popover"
      [hasUsage]="true"
      [apiKey]="[
        'RhombusPopoverComponent',
        'RhombusPopoverTriggerDirective',
        'RhombusPopoverCloseDirective'
      ]"
    >
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-popover&gt;</code> hangs arbitrary content off a trigger
          element via <code>[rhombusPopoverTriggerFor]</code>. It renders in a CDK
          overlay, traps focus, dismisses on <code>Escape</code> / outside click, and
          restores focus to the trigger — the building block for calendar panels,
          filters, and pickers that a menu's item list can't express.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-button [rhombusPopoverTriggerFor]="demo" aria-label="Open panel">Open panel</rhombus-button>
            <rhombus-popover #demo ariaLabel="Demo panel">
              <p style="margin:0 0 8px">A focus-trapped panel of arbitrary content.</p>
              <rhombus-button rhombusPopoverClose>Done</rhombus-button>
            </rhombus-popover>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>For <strong>rich, interactive panels</strong> — date grids, filter forms, multi-control pickers — anchored to a trigger.</li>
            <li>When the content needs focus management and dismissal semantics but should stay <strong>non-blocking</strong> (the page behind remains visible).</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>For a flat list of actions, use a <a routerLink="/components/menu">Menu</a> (or an <a routerLink="/components/overflow-menu">Overflow Menu</a> for row actions) — they own keyboard list semantics.</li>
            <li>For a short, non-interactive hint, use a <a routerLink="/components/tooltip">Tooltip</a>.</li>
            <li>For a task that must block the rest of the UI until resolved, use a <a routerLink="/components/dialog">Dialog</a>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/menu">Menu</a> — action lists off a trigger.</li>
            <li><a routerLink="/components/tooltip">Tooltip</a> — lightweight hover/focus hints.</li>
            <li><a routerLink="/components/dialog">Dialog</a> — blocking modal surfaces.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A popover is three parts: a <strong>trigger</strong> directive, the
          <strong>panel</strong> component, and an optional <strong>close</strong>
          marker on any inner control.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>[rhombusPopoverTriggerFor]="panelRef"</code> — put on the element that opens the panel; it manages the overlay and ARIA. Imperative control via its <code>exportAs="rhombusPopoverTrigger"</code> (<code>open()</code> / <code>close()</code> / <code>toggle()</code>).</li>
            <li><code>&lt;rhombus-popover&gt;</code> — the panel. Its <strong>default content slot</strong> projects any markup (no named slots).</li>
            <li><code>[rhombusPopoverClose]</code> — add to any control inside the panel to dismiss after a selection.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The panel renders in the CDK overlay, so style overrides must target
            <code>.cdk-overlay-container .rhombus-popover</code>, not the host. It reads
            these contract tokens:
          </p>
          <ul>
            <li><code>--surface-0</code> — panel background</li>
            <li><code>--text-primary</code> — panel text colour</li>
            <li><code>--border</code> — panel border</li>
            <li><code>--radius-lg</code> — corner radius</li>
            <li><code>--shadow-md</code> — elevation shadow</li>
            <li><code>--font-sans</code> — panel font family</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The trigger advertises <code>aria-haspopup="dialog"</code> and reflects
            <code>aria-expanded</code>. The panel is a <code>role="dialog"</code> with the
            supplied <code>ariaLabel</code>; focus is captured on open and restored to the
            trigger on close, and <kbd>Escape</kbd> dismisses it. Always pass an
            <code>ariaLabel</code> (or label the panel's heading) so its purpose is announced.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Placement</h2>
          <div class="showcase-row">
            <rhombus-button [rhombusPopoverTriggerFor]="below" aria-label="Below end">Below end</rhombus-button>
            <rhombus-popover #below position="below-end" ariaLabel="Below end panel">
              <p style="margin:0">Anchored to the trigger's end edge.</p>
            </rhombus-popover>
          </div>
        </section>
      </div>
    </app-component-page>
  `,
})
export default class PopoverPageComponent {
  protected readonly usage = `import {
  RhombusPopoverComponent,
  RhombusPopoverTriggerDirective,
  RhombusPopoverCloseDirective,
} from '@rhombuskit/core';

@Component({
  selector: 'app-toolbar',
  imports: [RhombusPopoverComponent, RhombusPopoverTriggerDirective, RhombusPopoverCloseDirective],
  template: \`
    <button [rhombusPopoverTriggerFor]="cal" aria-label="Calendar">📅</button>
    <rhombus-popover #cal ariaLabel="Calendar">
      <app-my-grid (select)="cal.close()" />
    </rhombus-popover>
  \`,
})
export class ToolbarComponent {}`;
}
