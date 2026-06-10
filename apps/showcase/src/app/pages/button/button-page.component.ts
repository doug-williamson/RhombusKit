import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RhombusButtonComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [RhombusButtonComponent, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Button" apiKey="RhombusButtonComponent">
      <div overview class="overview">
        <p class="overview__lead">
          Buttons trigger an action or a navigation. RhombusKit wraps Angular
          Material's <code>matButton</code> directive with a curated variant /
          size / appearance API and routes every colour through the token
          contract &mdash; toggle the theme above and the buttons re-skin without
          touching markup.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a button to <strong>trigger an action</strong> (save, submit,
              open a dialog). For moving between pages, prefer a link.
            </li>
            <li>
              Give a view exactly one <code>variant="primary"</code> button for
              its main action; use <code>secondary</code> or <code>ghost</code>
              for supporting actions and <code>danger</code> for destructive
              ones.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-button variant="primary">Save changes</rhombus-button>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders a native <code>&lt;button&gt;</code>, so it is focusable and
            activates on <kbd>Enter</kbd> / <kbd>Space</kbd>, and
            <code>[disabled]</code> is conveyed to assistive tech natively. For an
            icon-only button (a <code>leadingIcon</code> / <code>trailingIcon</code>
            with no text label), add an <code>aria-label</code> so its purpose is
            announced.
          </p>
        </section>
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
export default class ButtonPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusButtonComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-save-bar',
  imports: [RhombusButtonComponent],
  template: \`
    <rhombus-button variant="primary" (click)="save()">
      Save changes
    </rhombus-button>
  \`,
})
export class SaveBarComponent {
  save(): void {
    /* persist… */
  }
}`;
}
