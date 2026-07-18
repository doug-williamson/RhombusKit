import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DateRange,
  DateRangeControl,
  RhombusDateRangePickerComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

function rangeGroup(start: string | null, end: string | null): DateRangeControl {
  return new FormGroup({
    start: new FormControl<string | null>(start),
    end: new FormControl<string | null>(end),
  });
}

@Component({
  selector: 'app-date-range-picker-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusDateRangePickerComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Date Range Picker"
      [hasUsage]="true"
      apiKey="RhombusDateRangePickerComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A date range picker lets the user choose a start and end date in one
          field. <code>&lt;rhombus-date-range-picker&gt;</code> wraps Material's
          <code>mat-date-range-input</code> in the same form-field shell as Input,
          Select, and Date Picker, but its public value is a plain
          <code>{{ '{' }} start, end {{ '}' }}</code> pair of ISO strings
          (<code>YYYY-MM-DD</code>) so it drops straight into a reactive form &mdash;
          and it routes the calendar's range highlight through the token contract
          so it re-skins with the active theme. This closes the last datepicker
          migration gap.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <div style="min-width: 18rem;">
              <rhombus-date-range-picker
                label="Reporting window"
                [control]="basic"
                (rangeChange)="lastEmitted = $event"
              />
              <p class="readout">
                Value: {{ basic.value.start ?? '—' }} → {{ basic.value.end ?? '—' }}
              </p>
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              When the user must pick a contiguous span of calendar dates &mdash;
              a booking, a report window, a campaign flight, a filter range.
            </li>
            <li>
              Prefer it over two separate pickers when the two dates are
              semantically one value and you want in-range highlighting.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a single date, use the
              <a routerLink="/components/date-picker">Date Picker</a>.
            </li>
            <li>
              For a free-form or partial date, use an
              <a routerLink="/components/input">Input</a>; for a duration in days,
              a numeric input or <a routerLink="/components/slider">Slider</a>.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Bind a <code>FormGroup</code> of two ISO string controls via
          <code>[control]</code>, or listen to <code>(rangeChange)</code> for the
          live <code>{{ '{' }} start, end {{ '}' }}</code> pair.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Inputs</h2>
          <ul>
            <li><code>[control]</code> &mdash; a <code>DateRangeControl</code> (a <code>FormGroup</code> of two <code>FormControl&lt;string | null&gt;</code>, ISO <code>YYYY-MM-DD</code>).</li>
            <li><code>[min]</code> / <code>[max]</code> &mdash; bounds as ISO strings; out-of-range cells are disabled.</li>
            <li><code>[startPlaceholder]</code> / <code>[endPlaceholder]</code> / <code>[separator]</code> &mdash; the two field placeholders and the visual separator.</li>
            <li><code>[label]</code> / <code>[hint]</code> / <code>[appearance]</code> / <code>[size]</code> / <code>[required]</code> &mdash; the shared form-field chrome.</li>
            <li><code>(rangeChange)</code> &mdash; the emitted <code>{{ '{' }} start, end {{ '}' }}</code> ISO pair (endpoints are <code>null</code> until entered).</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The field follows the WAI-ARIA date-picker dialog pattern inherited
            from Material: the two inputs are grouped and named by the
            <code>&lt;mat-label&gt;</code>, the calendar opens in a focus-trapped
            dialog, and the in-range highlight is conveyed through Material's range
            state (not colour alone). Always supply a <code>label</code>. The
            calendar and in-range colours clear WCAG AA in both themes.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Basic</h2>
          <p class="showcase-section__lead">A bound range with a live ISO readout.</p>
          <div style="min-width: 18rem;">
            <rhombus-date-range-picker
              label="Reporting window"
              [control]="basic"
              (rangeChange)="lastEmitted = $event"
            />
            <p class="readout">
              start: {{ basic.value.start ?? 'null' }} · end: {{ basic.value.end ?? 'null' }}
            </p>
            <p class="readout">
              last (rangeChange): {{ lastEmitted ? (lastEmitted.start + ' → ' + lastEmitted.end) : '—' }}
            </p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Bounded with min / max</h2>
          <p class="showcase-section__lead">Constrain the whole range to a quarter.</p>
          <div style="min-width: 18rem;">
            <rhombus-date-range-picker
              label="Q1 window"
              [control]="bounded"
              min="2026-01-01"
              max="2026-03-31"
              hint="Within Q1 2026"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Custom placeholders &amp; separator</h2>
          <p class="showcase-section__lead">A booking-style check-in / check-out range.</p>
          <div style="min-width: 18rem;">
            <rhombus-date-range-picker
              label="Stay"
              [control]="stay"
              startPlaceholder="Check-in"
              endPlaceholder="Check-out"
              separator="to"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <p class="showcase-section__lead">A pre-filled range with the bound group disabled.</p>
          <div style="min-width: 18rem;">
            <rhombus-date-range-picker label="Locked window" [control]="disabledRange" />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
    .readout {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0.5rem 0 0;
    }
  `,
})
export default class DateRangePickerPageComponent {
  protected readonly basic = rangeGroup('2026-01-05', '2026-01-20');
  protected readonly bounded = rangeGroup(null, null);
  protected readonly stay = rangeGroup(null, null);
  protected readonly disabledRange = (() => {
    const g = rangeGroup('2026-02-01', '2026-02-14');
    g.disable();
    return g;
  })();
  protected lastEmitted: DateRange | undefined = undefined;

  protected readonly usage = `import {
  RhombusDateRangePickerComponent,
  DateRangeControl,
} from '@rhombuskit/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-report',
  imports: [RhombusDateRangePickerComponent],
  template: \`
    <rhombus-date-range-picker label="Reporting window" [control]="range" />
  \`,
})
export class ReportComponent {
  range: DateRangeControl = new FormGroup({
    start: new FormControl<string | null>(null),
    end: new FormControl<string | null>(null),
  });
}`;
}
