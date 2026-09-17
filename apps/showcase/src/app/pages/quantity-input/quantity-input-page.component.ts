import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  RhombusCodeBlockComponent,
  RhombusQuantityInputComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

interface CartLine {
  readonly name: string;
  readonly qty: WritableSignal<number | null>;
}

@Component({
  selector: 'app-quantity-input-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusQuantityInputComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Quantity Input"
      [hasUsage]="true"
      apiKey="RhombusQuantityInputComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A quantity input is a compact count — a label, a round − button, the
          number, and a round + button in one row. RhombusKit's
          <code>&lt;rhombus-quantity-input&gt;</code> has no form-field chrome at
          all: the number is a borderless native
          <code>&lt;input type="number"&gt;</code> (an accessible spinbutton out
          of the box), the buttons are round outlined circles sized from the
          density scale, and every colour routes through the token contract. It
          shares its stepping, clamping and keyboard behaviour with
          <a routerLink="/components/number-input">Number Input</a>.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-quantity-input
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
              For a <strong>count in a row, card, list or toolbar</strong> — cart
              quantity, seats, sets and reps — where a full form field would be
              too heavy.
            </li>
            <li>
              When the value is a <strong>small bounded integer</strong> that is
              mostly stepped, occasionally typed.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For <strong>labelled numeric entry inside a form</strong> — with a
              hint, an error message, a currency prefix or a fill/outline
              appearance — use a
              <a routerLink="/components/number-input">Number Input</a>.
            </li>
            <li>
              For choosing a value along a <strong>visible range</strong> where
              the exact number is secondary, use a
              <a routerLink="/components/slider">Slider</a>.
            </li>
            <li>
              For values wider than four digits: the number box is fixed at three
              rem; use a <a routerLink="/components/number-input">Number Input</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/number-input">Number Input</a> — the same spinbox inside a Material form field.</li>
            <li><a routerLink="/components/slider">Slider</a> — pick a value along a draggable range.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Bind <code>[(value)]</code> or a reactive
          <code>FormControl&lt;number | null&gt;</code> via <code>[control]</code>.
          <code>label</code> is required — it is the visible text before the −
          button and the accessible name of both the input and the group. Set
          <code>min</code>, <code>max</code>, and <code>step</code>; the value
          clamps on blur and on every step.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>label</code> (required) — rendered inline <em>before</em> the − button as a real <code>&lt;label for&gt;</code>; also names the <code>role="group"</code> host.</li>
            <li><code>min</code> / <code>max</code> — the clamp range (reflected as the native <code>min</code>/<code>max</code>, so the spinbutton announces them); <code>step</code> for the ± buttons and arrow keys; <code>largeStep</code> for <kbd>PageUp</kbd>/<kbd>PageDown</kbd> (defaults to <code>step × 10</code>).</li>
            <li><code>[(value)]</code> / <code>[control]</code> — the numeric value (<code>number | null</code>); <code>(valueChange)</code> emits on every change in lightweight mode.</li>
            <li><code>incrementLabel</code> / <code>decrementLabel</code> — the accessible names of the + and − buttons.</li>
            <li>No projected slots: there is no hint, error, prefix or <code>appearance</code> — that is <a routerLink="/components/number-input">Number Input</a>'s job.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <ul>
            <li><code>--text-primary</code> / <code>--text-secondary</code> — number and glyphs / the label.</li>
            <li><code>--text-disabled</code> — glyphs and number when disabled (colour only; no opacity is applied).</li>
            <li><code>--border-strong</code> — the button ring at rest; <code>--border</code> when disabled.</li>
            <li><code>--surface-2</code> / <code>--surface-3</code> — button hover / active; <code>--surface-1</code> — the number's hover wash.</li>
            <li><code>--control-height-md</code> — the diameter of the circles and the height of the number box (40px; 36px compact, 48px comfortable).</li>
            <li><code>--focus-border</code> / <code>--focus-ring</code> — keyboard focus ring and halo.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The number is a native <code>&lt;input type="number"&gt;</code>, which
            is an implicit ARIA <code>spinbutton</code> and derives
            <code>aria-valuemin</code>, <code>aria-valuemax</code>, and
            <code>aria-valuenow</code> from the reflected <code>min</code>,
            <code>max</code>, and value — no manual ARIA is added. The
            <code>label</code> is a real <code>&lt;label&gt;</code>, and the host
            is a <code>group</code> named by it, so the − and + buttons are
            announced with context. The input is the single tab stop: arrow keys
            step by <code>step</code>, <kbd>Page</kbd> keys by
            <code>largeStep</code>, and <kbd>Home</kbd>/<kbd>End</kbd> jump to
            min/max. The round buttons are pointer and touch helpers
            (<code>tabindex="-1"</code> with <code>aria-label</code>s); after every
            click focus returns to the input, so the keyboard set stays live and
            a screen reader hears the new value. On touch devices the tap does
            not refocus the number (that would raise the keypad every time); the
            new value is announced through a polite live region instead. Buttons
            are 40 × 40 px at the default density (36 px compact), above the
            24 px WCAG 2.2 target floor. The ring uses
            <code>--border-strong</code> and measures about 2.3–2.6:1 in the
            light theme — below WCAG 1.4.11's 3:1 non-text floor, which the
            17:1 glyph carries instead; the design floor of 2.25:1 is gated by a
            Playwright row in both themes.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Basic</h2>
          <div class="qi-row">
            <rhombus-quantity-input
              label="Quantity"
              [min]="0"
              [max]="10"
              [(value)]="qty"
              (valueChange)="lastValue.set($event)"
            />
          </div>
          <p class="qi-output">Value: <strong>{{ lastValue() ?? qty() ?? '(empty)' }}</strong></p>
        </section>

        <section class="showcase-section">
          <h2>Step &amp; large step</h2>
          <p class="showcase-section__lead">
            Buttons and arrow keys step by <code>5</code>;
            <kbd>PageUp</kbd>/<kbd>PageDown</kbd> by <code>25</code>.
          </p>
          <div class="qi-row">
            <rhombus-quantity-input
              label="Reps"
              [min]="0"
              [max]="100"
              [step]="5"
              [largeStep]="25"
              [(value)]="reps"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Reactive forms</h2>
          <p class="showcase-section__lead">
            Bind a <code>FormControl</code> via <code>[control]</code>; disabling
            the control disables the whole row.
          </p>
          <div class="qi-form">
            <rhombus-quantity-input
              label="Players"
              [min]="1"
              [max]="8"
              [control]="players"
            />
            <button mat-flat-button type="button" (click)="togglePlayers()">
              {{ players.disabled ? 'Enable' : 'Disable' }}
            </button>
            <p class="qi-output">Control value: <strong>{{ players.value ?? '(empty)' }}</strong></p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>At a bound</h2>
          <p class="showcase-section__lead">
            The buttons stay enabled at <code>min</code> / <code>max</code>; the
            value simply clamps. Typing past a bound clamps on blur.
          </p>
          <div class="qi-row">
            <rhombus-quantity-input
              label="Tickets"
              [min]="1"
              [max]="4"
              [(value)]="tickets"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <div class="qi-row">
            <rhombus-quantity-input
              label="Locked"
              [min]="0"
              [max]="10"
              [value]="3"
              [disabled]="true"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>In a list</h2>
          <p class="showcase-section__lead">
            Each row carries its own label, so every group is announced by the
            item it counts.
          </p>
          <ul class="qi-cart">
            @for (line of cart; track line.name) {
              <li class="qi-cart__line">
                <rhombus-quantity-input
                  [label]="line.name"
                  [min]="0"
                  [max]="20"
                  [(value)]="line.qty"
                />
              </li>
            }
          </ul>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .qi-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 2rem;
      align-items: center;
    }
    .qi-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 320px;
      align-items: flex-start;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .qi-output {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
    .qi-cart {
      list-style: none;
      margin: 0;
      padding: 0;
      max-width: 480px;
    }
    /* The component's own inline label IS the product name, so the row needs no
       second label of its own. (Page styles are encapsulated: they can reach the
       child's host element, not its inner label, which is why the row does not
       try to restyle it.) */
    .qi-cart__line {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
    }
  `,
})
export default class QuantityInputPageComponent {
  protected readonly usage = `import { RhombusQuantityInputComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-cart-line',
  imports: [RhombusQuantityInputComponent],
  template: \`
    <rhombus-quantity-input
      label="Quantity"
      [min]="0"
      [max]="10"
      [(value)]="qty"
    />
  \`,
})
export class CartLineComponent {
  qty = signal<number | null>(1);
}`;

  protected readonly qty = signal<number | null>(1);
  protected readonly reps = signal<number | null>(10);
  protected readonly tickets = signal<number | null>(4);
  protected readonly lastValue = signal<number | null>(null);

  protected readonly players = new FormControl<number | null>(2);

  protected readonly cart: readonly CartLine[] = [
    { name: 'Resistance band', qty: signal<number | null>(2) },
    { name: 'Chalk block', qty: signal<number | null>(1) },
    { name: 'Lifting straps', qty: signal<number | null>(1) },
  ];

  protected togglePlayers(): void {
    if (this.players.disabled) {
      this.players.enable();
    } else {
      this.players.disable();
    }
  }
}
