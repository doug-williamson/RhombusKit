import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  RhombusButtonComponent,
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
    RhombusButtonComponent,
    RhombusPopoverComponent,
    RhombusPopoverTriggerDirective,
    RhombusPopoverCloseDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Popover" apiKey="RhombusPopoverComponent">
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-popover&gt;</code> hangs arbitrary content off a trigger
          element via <code>[rhombusPopoverTriggerFor]</code>. It renders in a CDK
          overlay, traps focus, dismisses on <code>Escape</code> / outside click, and
          restores focus to the trigger — the building block for calendar panels,
          filters, and pickers that a menu's item list can't express.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>Use a <strong>popover</strong> for rich, interactive panels (grids, forms, pickers). For a flat list of actions, prefer <strong>Menu</strong>.</li>
            <li>Put <code>[rhombusPopoverClose]</code> on any inner control to dismiss after a selection.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-button [rhombusPopoverTriggerFor]="demo" aria-label="Open panel">Open panel</rhombus-button>
            <rhombus-popover #demo ariaLabel="Demo panel">
              <p style="margin:0 0 8px">A focus-trapped panel of arbitrary content.</p>
              <rhombus-button rhombusPopoverClose>Done</rhombus-button>
            </rhombus-popover>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            The trigger advertises <code>aria-haspopup="dialog"</code> and reflects
            <code>aria-expanded</code>. The panel is a <code>role="dialog"</code> with the
            supplied <code>ariaLabel</code>, focus is captured on open and restored on close.
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
