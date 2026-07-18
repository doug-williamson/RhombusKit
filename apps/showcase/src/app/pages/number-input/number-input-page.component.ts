import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  RhombusCodeBlockComponent,
  RhombusErrorDirective,
  RhombusNumberInputComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-number-input-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusNumberInputComponent,
    RhombusErrorDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Number Input"
      [hasUsage]="true"
      apiKey="RhombusNumberInputComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A number input is a numeric field with a ± spinbox for stepping by a
          fixed amount, plus min/max clamping. RhombusKit's
          <code>&lt;rhombus-number-input&gt;</code> pairs Material's
          <code>&lt;mat-form-field&gt;</code> chrome with a bespoke stepper over a
          native <code>&lt;input type="number"&gt;</code> — so it's an accessible
          spinbutton out of the box — and routes every colour through the token
          contract.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-number-input
              label="Quantity"
              [min]="0"
              [max]="10"
              [(value)]="qty"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              For a <strong>precise numeric entry</strong> where the exact value
              matters — quantities, ages, counts, prices.
            </li>
            <li>
              When <strong>stepping by a fixed amount</strong> (± buttons, arrow
              keys) and clamping to a range is helpful.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For choosing a value along a <strong>visible range</strong> where
              the exact number is secondary, use a
              <a routerLink="/components/slider">Slider</a>.
            </li>
            <li>
              For <strong>unbounded numeric text</strong> with no stepper (e.g. a
              free-form quantity), a plain
              <a routerLink="/components/input">Input</a> with
              <code>type="number"</code> is enough.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/slider">Slider</a> — pick a value along a draggable range.</li>
            <li><a routerLink="/components/input">Input</a> — free-form text (including <code>type="number"</code>).</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Bind <code>[(value)]</code> or a reactive
          <code>FormControl&lt;number | null&gt;</code> via <code>[control]</code>.
          Set <code>min</code>, <code>max</code>, and <code>step</code>; the value
          clamps on blur and on every step.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>label</code> / <code>placeholder</code> — the floating label and empty-state text.</li>
            <li><code>min</code> / <code>max</code> — the clamp range (reflected as the native <code>min</code>/<code>max</code>, so the spinbutton announces them); <code>step</code> for the ± buttons and arrow keys; <code>largeStep</code> for <kbd>PageUp</kbd>/<kbd>PageDown</kbd> (defaults to <code>step × 10</code>).</li>
            <li><code>[(value)]</code> / <code>[control]</code> — the numeric value (<code>number | null</code>); <code>[showButtons]="false"</code> hides the spinner.</li>
            <li><strong>Projected slots</strong> — <code>[rhombusError]</code>, and <code>[matTextPrefix]</code> / <code>[matIconPrefix]</code> for a unit or currency mark (the ± live in the trailing region).</li>
            <li><code>(valueChange)</code> emits the value on every change (lightweight mode).</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <ul>
            <li><code>--text-primary</code> / <code>--text-secondary</code> — value and button glyphs.</li>
            <li><code>--surface-1</code> / <code>--surface-2</code> / <code>--surface-3</code> — button rest / hover / active.</li>
            <li><code>--border</code> / <code>--border-strong</code> — button borders.</li>
            <li><code>--focus-border</code> — keyboard focus ring.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The field is a native <code>&lt;input type="number"&gt;</code>, which
            is an implicit ARIA <code>spinbutton</code> and derives
            <code>aria-valuemin</code>, <code>aria-valuemax</code>, and
            <code>aria-valuenow</code> from the reflected <code>min</code>,
            <code>max</code>, and value — no manual ARIA is added. The
            <code>label</code> becomes its accessible name. Arrow keys step by
            <code>step</code>, <kbd>Page</kbd> keys by <code>largeStep</code>, and
            <kbd>Home</kbd>/<kbd>End</kbd> jump to min/max. The ± buttons are taken
            out of the tab order (<code>tabindex="-1"</code>) with
            <code>aria-label</code>s, so the input stays a single tab stop.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Basic</h2>
          <div class="ni-grid">
            <rhombus-number-input
              label="Quantity"
              [min]="0"
              [max]="10"
              [(value)]="qty"
              (valueChange)="lastValue.set($event)"
            />
          </div>
          <p class="ni-output">Value: <strong>{{ lastValue() ?? qty() ?? '(empty)' }}</strong></p>
        </section>

        <section class="showcase-section">
          <h2>Step &amp; large step</h2>
          <p class="showcase-section__lead">
            Arrow keys step by <code>5</code>; <kbd>PageUp</kbd>/<kbd>PageDown</kbd>
            by <code>25</code>.
          </p>
          <div class="ni-grid">
            <rhombus-number-input
              label="Volume"
              [min]="0"
              [max]="100"
              [step]="5"
              [largeStep]="25"
              [(value)]="volume"
              hint="0–100"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Currency prefix</h2>
          <div class="ni-grid">
            <rhombus-number-input
              label="Price"
              [min]="0"
              [step]="1"
              [(value)]="price"
            >
              <span matTextPrefix>$&nbsp;</span>
            </rhombus-number-input>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Reactive forms with validation</h2>
          <p class="showcase-section__lead">
            Bind a <code>FormControl</code> via <code>[control]</code>.
          </p>
          <div class="ni-form">
            <rhombus-number-input
              label="Guests"
              [min]="1"
              [max]="8"
              [control]="guests"
            >
              <span rhombusError>
                @if (guests.hasError('required')) {
                  Enter the number of guests.
                }
              </span>
            </rhombus-number-input>
            <button
              mat-flat-button
              type="button"
              [disabled]="guests.invalid"
              (click)="onSubmit()"
            >
              Book
            </button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Without spinner buttons</h2>
          <div class="ni-grid">
            <rhombus-number-input
              label="Year"
              [min]="1900"
              [max]="2100"
              [showButtons]="false"
              [(value)]="year"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <div class="ni-grid">
            <rhombus-number-input
              label="Locked"
              [min]="0"
              [max]="10"
              [value]="5"
              [disabled]="true"
            />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .ni-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      max-width: 560px;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .ni-output {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
    .ni-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 320px;
      align-items: flex-start;
    }
  `,
})
export default class NumberInputPageComponent {
  protected readonly usage = `import { RhombusNumberInputComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-quantity',
  imports: [RhombusNumberInputComponent],
  template: \`
    <rhombus-number-input
      label="Quantity"
      [min]="0"
      [max]="10"
      [(value)]="qty"
    />
  \`,
})
export class QuantityComponent {
  qty = signal<number | null>(1);
}`;

  protected readonly qty = signal<number | null>(1);
  protected readonly volume = signal<number | null>(40);
  protected readonly price = signal<number | null>(9);
  protected readonly year = signal<number | null>(2026);
  protected readonly lastValue = signal<number | null>(null);

  protected readonly guests = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1)],
  });

  protected onSubmit(): void {
    this.guests.markAsTouched();
  }
}
