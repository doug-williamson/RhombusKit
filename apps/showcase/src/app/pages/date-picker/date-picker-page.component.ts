import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  RhombusCodeBlockComponent,
  RhombusDatePickerComponent,
  RhombusErrorDirective,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-date-picker-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusDatePickerComponent,
    RhombusErrorDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Date Picker"
      [hasUsage]="true"
      apiKey="RhombusDatePickerComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A date picker lets the user choose a calendar date.
          RhombusKit's <code>&lt;rhombus-date-picker&gt;</code> wraps Material's
          <code>&lt;mat-datepicker&gt;</code> in the same form-field shell as input
          and select, but its public value is a plain ISO string
          (<code>YYYY-MM-DD</code>) so it drops straight into a reactive form —
          and it routes its colour through the token contract so the calendar
          re-skins with the active theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-date-picker label="Publish date" [control]="demo" />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              When the user must pick a <strong>single calendar date</strong> —
              a publish date, a deadline, a birthday — and a calendar is clearer
              than typing.
            </li>
            <li>
              When you want a date field that <strong>matches the rest of your
              RhombusKit form</strong> (label, hint, error, sizing) instead of a
              bare <code>mat-datepicker</code>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a free-form or partial date (e.g. just a year), use an
              <a routerLink="/components/input">Input</a> with
              <code>type="date"</code> or plain text.
            </li>
            <li>
              For choosing from a small fixed set of dates, a
              <a routerLink="/components/select">Select</a> may be simpler.
            </li>
            <li>
              Date <em>ranges</em> are not covered yet — pick start and end with
              two pickers, or use Material's range input directly.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/input">Input</a> — the sibling form-field for free text.</li>
            <li><a routerLink="/components/select">Select</a> — pick from a fixed list of options.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The picker owns its inner <code>&lt;mat-datepicker&gt;</code> and
          self-provides the native date adapter, so it needs no app-level setup.
          Bind a reactive <code>FormControl&lt;string | null&gt;</code> via
          <code>[control]</code>; the value is always ISO
          <code>YYYY-MM-DD</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>label</code> / <code>placeholder</code> — the floating label and empty-state text.</li>
            <li><code>[control]</code> — a <code>FormControl&lt;string | null&gt;</code> holding an ISO <code>YYYY-MM-DD</code> string (the standalone <code>[disabled]</code> input is ignored once a control is bound).</li>
            <li><code>min</code> / <code>max</code> — bounds as ISO <code>YYYY-MM-DD</code> strings; out-of-range dates are disabled in the calendar and flagged by the validator.</li>
            <li><code>[required]</code>, <code>hint</code>, <code>appearance</code>, and <code>size</code> for the field shell.</li>
            <li><strong>Projected slot</strong> — <code>[rhombusError]</code>: project a <code>&lt;span rhombusError&gt;</code> and it renders inside the field's <code>&lt;mat-error&gt;</code>. There is no default slot.</li>
            <li><code>(dateChange)</code> emits the selected ISO string (or <code>null</code>) on every user change.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The calendar renders in a CDK overlay appended to
            <code>&lt;body&gt;</code>, so its panel background is scoped on the
            panel element while the rest of the calendar tokens come from the
            Material bridge. Everything routes through these contract tokens:
          </p>
          <ul>
            <li><code>--surface-0</code> — calendar panel background.</li>
            <li><code>--btn-primary-bg</code> / <code>--btn-primary-text</code> — selected date.</li>
            <li><code>--text-accent</code> — today's date outline and the toggle's active state.</li>
            <li><code>--text-primary</code> / <code>--text-secondary</code> — date cells and the weekday / navigation header.</li>
            <li><code>--border</code> — calendar panel border and header divider.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Built on Material's datepicker: the field is focusable with
            <kbd>Tab</kbd>, the toggle button opens the calendar, and the calendar
            grid is navigable with the <kbd>Arrow</kbd> keys
            (<kbd>PageUp</kbd>/<kbd>PageDown</kbd> change month). The
            <code>label</code> becomes the field's accessible name, so always
            supply one. The displayed text is formatted in the active locale,
            while the value the form sees is always the ISO
            <code>YYYY-MM-DD</code> string. Content projected into
            <code>[rhombusError]</code> renders inside Material's
            <code>&lt;mat-error&gt;</code> and is announced for validation.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Basic</h2>
          <div class="date-grid">
            <rhombus-date-picker
              label="Publish date"
              [control]="basic"
              (dateChange)="lastPicked.set($event)"
            />
          </div>
          <p class="date-output">
            Value (ISO): <strong>{{ basic.value ?? '(none)' }}</strong> · last
            emitted: <strong>{{ lastPicked() ?? '(none)' }}</strong>
          </p>
        </section>

        <section class="showcase-section">
          <h2>Bounded with min / max</h2>
          <div class="date-grid">
            <rhombus-date-picker
              label="Within Q1 2026"
              min="2026-01-01"
              max="2026-03-31"
              hint="Only dates in Q1 2026 are selectable"
              [control]="bounded"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Reactive forms with validation</h2>
          <p class="showcase-section__lead">
            Pass a required <code>FormControl</code> via <code>[control]</code>.
          </p>
          <div class="date-form">
            <rhombus-date-picker
              label="Deadline"
              [required]="true"
              [control]="deadline"
            >
              <span rhombusError>
                @if (deadline.hasError('required')) {
                  Pick a deadline before submitting.
                }
              </span>
            </rhombus-date-picker>
            <button
              mat-flat-button
              type="button"
              [disabled]="deadline.invalid"
              (click)="onSubmit()"
            >
              Submit
            </button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <div class="date-grid">
            <rhombus-date-picker
              label="Locked"
              [control]="locked"
            />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .date-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .date-output {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
    .date-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 360px;
      align-items: flex-start;
    }
  `,
})
export default class DatePickerPageComponent {
  /** Minimal import + usage snippet shown in the Overview / Usage tabs. */
  protected readonly usage = `import { RhombusDatePickerComponent } from '@rhombuskit/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-publish-form',
  imports: [RhombusDatePickerComponent],
  template: \`
    <rhombus-date-picker
      label="Publish date"
      [control]="publishDate"
      min="2026-01-01"
    />
  \`,
})
export class PublishFormComponent {
  // The value is an ISO 'YYYY-MM-DD' string, or null.
  readonly publishDate = new FormControl<string | null>('2026-02-14');
}`;

  protected readonly demo = new FormControl<string | null>('2026-02-14');
  protected readonly basic = new FormControl<string | null>(null);
  protected readonly bounded = new FormControl<string | null>(null);
  protected readonly deadline = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });
  protected readonly locked = new FormControl<string | null>({
    value: '2026-02-14',
    disabled: true,
  });

  protected readonly lastPicked = signal<string | null>(null);

  protected onSubmit() {
    this.deadline.markAllAsTouched();
  }
}
