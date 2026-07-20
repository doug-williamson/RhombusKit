import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  RhombusCardComponent,
  RhombusCodeBlockComponent,
  RhombusInputComponent,
  RhombusStepComponent,
  RhombusStepLabelDirective,
  RhombusStepperComponent,
  RhombusStepperNextDirective,
  RhombusStepperPreviousDirective,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-stepper-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    RhombusCardComponent,
    RhombusCodeBlockComponent,
    RhombusInputComponent,
    RhombusStepComponent,
    RhombusStepLabelDirective,
    RhombusStepperComponent,
    RhombusStepperNextDirective,
    RhombusStepperPreviousDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Stepper"
      [hasUsage]="true"
      [apiKey]="apiKeys"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A stepper walks the user through a task one step at a time. RhombusKit's
          <code>&lt;rhombus-stepper&gt;</code> <strong>extends the CDK stepper</strong>,
          so linear gating, <code>stepControl</code> validation, and roving-focus
          keyboard come for free — themed entirely off the token contract, with no
          Angular Material and no new peer dependency.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="basicUsage">
            <rhombus-card>
              <rhombus-stepper>
                <rhombus-step label="Cart">
                  <p>Review the items in your cart.</p>
                  <div class="step-actions">
                    <button rhombusStepperNext class="step-btn step-btn--primary">
                      Continue
                    </button>
                  </div>
                </rhombus-step>
                <rhombus-step label="Shipping">
                  <p>Where should we send it?</p>
                  <div class="step-actions">
                    <button rhombusStepperPrevious class="step-btn">Back</button>
                    <button rhombusStepperNext class="step-btn step-btn--primary">
                      Continue
                    </button>
                  </div>
                </rhombus-step>
                <rhombus-step label="Payment">
                  <p>Enter your payment details and place the order.</p>
                  <div class="step-actions">
                    <button rhombusStepperPrevious class="step-btn">Back</button>
                  </div>
                </rhombus-step>
              </rhombus-stepper>
            </rhombus-card>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>For a <strong>sequential task</strong> — checkout, onboarding, a multi-part form — where progress moves step to step.</li>
            <li>When later steps depend on earlier ones and you want to <strong>gate progress</strong> until each is valid (<code>linear</code>).</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>For <strong>peer sections</strong> the user can visit in any order, use <a routerLink="/components/tabs">Tabs</a>.</li>
            <li>For <strong>independent collapsible</strong> panels (an FAQ, settings groups), use an <a routerLink="/components/accordion">Accordion</a>.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Import the stepper family, nest a <code>&lt;rhombus-step&gt;</code> per
          step, and drive navigation with
          <code>[rhombusStepperNext]</code> / <code>[rhombusStepperPrevious]</code>
          buttons (or the two-way <code>[(selectedIndex)]</code>).
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; inputs</h2>
          <ul>
            <li><code>orientation</code> — <code>horizontal</code> (default) or <code>vertical</code>; <code>labelPosition</code> — <code>end</code> / <code>bottom</code> (horizontal only).</li>
            <li><code>linear</code> — require each step's <code>stepControl</code> to be valid before advancing.</li>
            <li><code>[(selectedIndex)]</code> — two-way current step; the setter throws on an out-of-range index.</li>
            <li>Per-step: <code>label</code> (or a rich <code>[rhombusStepLabel]</code> template), <code>stepControl</code>, <code>optional</code>, <code>optionalLabel</code>, <code>editable</code>, <code>completed</code>, <code>state</code>, <code>errorMessage</code>.</li>
            <li><code>(stepChange)</code> — emits the new step index on every selection change.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The header is a <code>role="tablist"</code> of
            <code>role="tab"</code> headers; each step body is a
            <code>role="tabpanel"</code> wired via
            <code>aria-controls</code> / <code>aria-labelledby</code>, with
            collapsed panels marked <code>inert</code>. Activation is
            <strong>manual</strong>: arrow keys roam focus between headers and
            <kbd>Enter</kbd> / <kbd>Space</kbd> selects the focused step. Step
            state (done / edit / error) is conveyed by a glyph plus a
            visually-hidden phrase, never colour alone; error indicators appear
            only once a step's control has been touched.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Vertical</h2>
          <app-example [code]="verticalUsage">
            <rhombus-card>
              <rhombus-stepper orientation="vertical">
                <rhombus-step label="Choose a plan">
                  <p>Pick the tier that fits your team.</p>
                  <div class="step-actions">
                    <button rhombusStepperNext class="step-btn step-btn--primary">Next</button>
                  </div>
                </rhombus-step>
                <rhombus-step label="Invite teammates">
                  <p>Add the people you work with.</p>
                  <div class="step-actions">
                    <button rhombusStepperPrevious class="step-btn">Back</button>
                    <button rhombusStepperNext class="step-btn step-btn--primary">Next</button>
                  </div>
                </rhombus-step>
                <rhombus-step label="Done">
                  <p>You're all set.</p>
                </rhombus-step>
              </rhombus-stepper>
            </rhombus-card>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>Linear with validation</h2>
          <p class="showcase-section__lead">
            A <code>linear</code> stepper won't advance past a step whose
            <code>stepControl</code> is invalid — the email below is required.
          </p>
          <app-example [code]="linearUsage">
            <rhombus-card>
              <rhombus-stepper linear>
                <rhombus-step label="Account" [stepControl]="emailCtrl">
                  <div class="step-field">
                    <rhombus-input
                      label="Email"
                      type="email"
                      [control]="emailCtrl"
                      hint="Required to continue"
                    />
                  </div>
                  <div class="step-actions">
                    <button rhombusStepperNext class="step-btn step-btn--primary">Next</button>
                  </div>
                </rhombus-step>
                <rhombus-step label="Profile" optional optionalLabel="Optional">
                  <p>Tell us a bit about yourself (you can skip this).</p>
                  <div class="step-actions">
                    <button rhombusStepperPrevious class="step-btn">Back</button>
                    <button rhombusStepperNext class="step-btn step-btn--primary">Next</button>
                  </div>
                </rhombus-step>
                <rhombus-step label="Confirm">
                  <p>Review and finish.</p>
                  <div class="step-actions">
                    <button rhombusStepperPrevious class="step-btn">Back</button>
                  </div>
                </rhombus-step>
              </rhombus-stepper>
            </rhombus-card>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>Rich labels &amp; bottom label position</h2>
          <app-example [code]="labelUsage">
            <rhombus-card>
              <rhombus-stepper labelPosition="bottom">
                <rhombus-step>
                  <ng-template rhombusStepLabel>Pick <strong>items</strong></ng-template>
                  <p>Step one content.</p>
                  <div class="step-actions">
                    <button rhombusStepperNext class="step-btn step-btn--primary">Next</button>
                  </div>
                </rhombus-step>
                <rhombus-step>
                  <ng-template rhombusStepLabel>Review <strong>order</strong></ng-template>
                  <p>Step two content.</p>
                  <div class="step-actions">
                    <button rhombusStepperPrevious class="step-btn">Back</button>
                  </div>
                </rhombus-step>
              </rhombus-stepper>
            </rhombus-card>
          </app-example>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    rhombus-card {
      display: block;
      max-width: 640px;
    }
    .step-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .step-field {
      max-width: 320px;
      margin-bottom: 0.5rem;
    }
    .step-btn {
      font: inherit;
      padding: 0.4375rem 0.875rem;
      border-radius: var(--radius-md);
      border: var(--border-width) solid var(--border);
      background: var(--surface-0);
      color: var(--text-primary);
      cursor: pointer;
    }
    .step-btn--primary {
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
      border-color: transparent;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
  `,
})
export default class StepperPageComponent {
  protected readonly apiKeys = [
    'RhombusStepperComponent',
    'RhombusStepComponent',
    'RhombusStepLabelDirective',
    'RhombusStepperNextDirective',
    'RhombusStepperPreviousDirective',
  ];

  protected readonly emailCtrl = new FormControl('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true,
  });

  protected readonly basicUsage = `<rhombus-stepper>
  <rhombus-step label="Cart">
    <p>Review your cart.</p>
    <button rhombusStepperNext>Continue</button>
  </rhombus-step>
  <rhombus-step label="Shipping">
    <p>Where should we send it?</p>
    <button rhombusStepperPrevious>Back</button>
    <button rhombusStepperNext>Continue</button>
  </rhombus-step>
  <rhombus-step label="Payment">
    <p>Place the order.</p>
    <button rhombusStepperPrevious>Back</button>
  </rhombus-step>
</rhombus-stepper>`;

  protected readonly usage = `import {
  RhombusStepperComponent,
  RhombusStepComponent,
  RhombusStepLabelDirective,
  RhombusStepperNextDirective,
  RhombusStepperPreviousDirective,
} from '@rhombuskit/core';

@Component({
  selector: 'app-wizard',
  imports: [
    RhombusStepperComponent,
    RhombusStepComponent,
    RhombusStepperNextDirective,
    RhombusStepperPreviousDirective,
  ],
  template: \`
    <rhombus-stepper linear [(selectedIndex)]="index">
      <rhombus-step label="Account" [stepControl]="form">
        <!-- fields -->
        <button rhombusStepperNext>Next</button>
      </rhombus-step>
      <rhombus-step label="Done">Finished!</rhombus-step>
    </rhombus-stepper>
  \`,
})
export class WizardComponent {
  index = 0;
}`;

  protected readonly verticalUsage = `<rhombus-stepper orientation="vertical">
  <rhombus-step label="Choose a plan"> … </rhombus-step>
  <rhombus-step label="Invite teammates"> … </rhombus-step>
  <rhombus-step label="Done"> … </rhombus-step>
</rhombus-stepper>`;

  protected readonly linearUsage = `<rhombus-stepper linear>
  <rhombus-step label="Account" [stepControl]="emailCtrl">
    <rhombus-input label="Email" [control]="emailCtrl" />
    <button rhombusStepperNext>Next</button>
  </rhombus-step>
  <rhombus-step label="Profile" optional optionalLabel="Optional"> … </rhombus-step>
  <rhombus-step label="Confirm"> … </rhombus-step>
</rhombus-stepper>`;

  protected readonly labelUsage = `<rhombus-stepper labelPosition="bottom">
  <rhombus-step>
    <ng-template rhombusStepLabel>Pick <strong>items</strong></ng-template>
    …
  </rhombus-step>
</rhombus-stepper>`;
}
