import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  RhombusSliderComponent,
  RhombusCodeBlockComponent,
  SliderRange,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-slider-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusSliderComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Slider" [hasUsage]="true" apiKey="RhombusSliderComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A slider lets users pick a numeric value &mdash; or a range between two
          values &mdash; by dragging a handle along a track.
          <code>&lt;rhombus-slider&gt;</code> wraps Material's
          <code>&lt;mat-slider&gt;</code> and drives the active track and handle
          from the <code>--text-accent</code> contract token, so it re-skins with
          the theme. Use <code>mode="single"</code> for one value or
          <code>mode="range"</code> for a <code>{{ '{' }} start, end {{ '}' }}</code> pair.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <div style="min-width: 16rem;">
              <rhombus-slider
                [value]="volume()"
                (valueChange)="volume.set($event)"
                ariaLabel="Volume"
                [discrete]="true"
              />
              <p class="readout">Volume: {{ volume() }}</p>
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              For choosing a value within a known, continuous, bounded range where
              the relative position matters more than the exact number (volume,
              brightness, price filters, zoom).
            </li>
            <li>
              Use <code>mode="range"</code> for a min&ndash;max filter (e.g. a
              price band) instead of two separate sliders.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              When an exact, typed value matters &mdash; use a numeric
              <a routerLink="/components/input">Input</a>.
            </li>
            <li>
              For a small set of named choices, use a
              <a routerLink="/components/radio">Radio Group</a> or
              <a routerLink="/components/select">Select</a>; for a binary on/off, a
              <a routerLink="/components/switch">Switch</a>.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Bind a value with <code>[(value)]</code> / <code>[(rangeValue)]</code>,
          or a reactive control with <code>[control]</code> /
          <code>[rangeControl]</code>. Always give each thumb an accessible name.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Inputs</h2>
          <ul>
            <li><code>[mode]</code> &mdash; <code>'single'</code> (default) or <code>'range'</code>.</li>
            <li><code>[min]</code> / <code>[max]</code> / <code>[step]</code> &mdash; track bounds and increment.</li>
            <li><code>[discrete]</code> &mdash; show the value-indicator bubble on drag/focus.</li>
            <li><code>[showTickMarks]</code> &mdash; render tick marks at each step.</li>
            <li><code>[displayWith]</code> &mdash; format the value bubble (e.g. append <code>%</code> or a currency symbol).</li>
            <li><code>[(value)]</code> / <code>[control]</code> &mdash; single-mode value or <code>FormControl&lt;number&gt;</code>.</li>
            <li><code>[(rangeValue)]</code> / <code>[rangeControl]</code> &mdash; range-mode <code>{{ '{' }} start, end {{ '}' }}</code> or <code>FormControl&lt;SliderRange&gt;</code>.</li>
            <li><code>[ariaLabel]</code> / <code>[startAriaLabel]</code> / <code>[endAriaLabel]</code> &mdash; thumb accessible names.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Each thumb is a native <code>&lt;input type="range"&gt;</code> exposed
            as <code>role="slider"</code> with <code>aria-valuemin</code> /
            <code>aria-valuemax</code> / <code>aria-valuenow</code>, and full
            arrow / Home / End / Page keyboard support &mdash; all handled by the
            browser and Material. Because there is no visible label, give every
            thumb a meaningful <code>aria-label</code>. The active track and
            value-indicator colours clear WCAG AA in both themes.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Single value</h2>
          <p class="showcase-section__lead">Two-way <code>[(value)]</code> with a live readout.</p>
          <div style="min-width: 16rem;">
            <rhombus-slider
              [value]="volume()"
              (valueChange)="volume.set($event)"
              ariaLabel="Volume"
            />
            <p class="readout">Value: {{ volume() }}</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Reactive forms</h2>
          <p class="showcase-section__lead">Pass a <code>FormControl&lt;number&gt;</code> via <code>[control]</code>.</p>
          <div style="min-width: 16rem;">
            <rhombus-slider [control]="brightness" ariaLabel="Brightness" />
            <p class="readout">control.value: {{ brightness.value }}</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Range</h2>
          <p class="showcase-section__lead">
            <code>mode="range"</code> over a <code>{{ '{' }} start, end {{ '}' }}</code> pair &mdash; a price filter.
          </p>
          <div style="min-width: 16rem;">
            <rhombus-slider
              mode="range"
              [rangeValue]="price()"
              (rangeValueChange)="price.set($event)"
              [min]="0"
              [max]="500"
              [step]="10"
              startAriaLabel="Minimum price"
              endAriaLabel="Maximum price"
            />
            <p class="readout">From {{ price().start }} to {{ price().end }}</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Discrete + tick marks</h2>
          <p class="showcase-section__lead">
            <code>[discrete]</code> shows the bubble; <code>[showTickMarks]</code> marks each step.
          </p>
          <div style="min-width: 16rem;">
            <rhombus-slider
              [value]="level()"
              (valueChange)="level.set($event)"
              [step]="10"
              [discrete]="true"
              [showTickMarks]="true"
              [displayWith]="percent"
              ariaLabel="Level"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <p class="showcase-section__lead">A disabled slider at a fixed value.</p>
          <div style="min-width: 16rem;">
            <rhombus-slider [value]="40" [disabled]="true" ariaLabel="Disabled slider" />
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
export default class SliderPageComponent {
  protected readonly volume = signal(50);
  protected readonly level = signal(30);
  protected readonly brightness = new FormControl<number | null>(65);
  protected readonly price = signal<SliderRange>({ start: 100, end: 350 });

  /** Value-indicator formatter for the discrete example. */
  protected readonly percent = (value: number): string => `${value}%`;

  protected readonly usage = `import { RhombusSliderComponent, SliderRange } from '@rhombuskit/core';

@Component({
  selector: 'app-settings',
  imports: [RhombusSliderComponent],
  template: \`
    <rhombus-slider [(value)]="volume" ariaLabel="Volume" />

    <rhombus-slider
      mode="range"
      [(rangeValue)]="price"
      [min]="0" [max]="500"
      startAriaLabel="Min" endAriaLabel="Max" />
  \`,
})
export class SettingsComponent {
  volume = 50;
  price: SliderRange = { start: 100, end: 350 };
}`;
}
