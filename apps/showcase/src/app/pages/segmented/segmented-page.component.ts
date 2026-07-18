import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  RhombusSegmentedComponent,
  RhombusCodeBlockComponent,
  SegmentOption,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-segmented-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusSegmentedComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Segmented" [hasUsage]="true" apiKey="RhombusSegmentedComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A segmented control is a connected row of mutually-exclusive toggle
          buttons for switching a view, unit, or mode inline &mdash; think List /
          Grid / Board or °C / °F. <code>&lt;rhombus-segmented&gt;</code> wraps
          Material's <code>&lt;mat-button-toggle-group&gt;</code>, is driven by an
          options array (like Select and Radio Group), and routes its colour
          through the token contract so the active segment re-skins with the
          theme. Unlike a Radio Group it is a compact inline switcher; unlike a
          Chip group it is not a set of removable filters.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <div>
              <rhombus-segmented
                [options]="views"
                [value]="view()"
                (valueChange)="view.set($any($event))"
                ariaLabel="Layout"
              />
              <p class="readout">View: {{ view() }}</p>
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              When 2&ndash;5 short, mutually-exclusive options must all stay
              visible and picking one switches a view/unit/mode inline.
            </li>
            <li>
              Use the opt-in <code>multiple</code> mode for a small toggle-button
              toolbar (e.g. Bold / Italic / Underline).
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a form's one-of-many question, prefer a
              <a routerLink="/components/radio">Radio Group</a>.
            </li>
            <li>
              For longer lists or tight space, prefer a
              <a routerLink="/components/select">Select</a>; for removable filter
              tags, a <a routerLink="/components/chip">Chip</a> group.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Drive it with an <code>options</code> array and bind
          <code>[(value)]</code> or a reactive <code>[control]</code>. Give the
          group an accessible name via <code>label</code> or <code>ariaLabel</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Inputs</h2>
          <ul>
            <li><code>[options]</code> &mdash; <code>{{ '{' }} value, label, disabled?, icon?, ariaLabel? {{ '}' }}[]</code>.</li>
            <li><code>[(value)]</code> / <code>[control]</code> &mdash; the selected value(s); an array in <code>multiple</code> mode.</li>
            <li><code>[multiple]</code> &mdash; multi-select toolbar mode.</li>
            <li><code>[size]</code> &mdash; <code>'sm'</code> / <code>'md'</code> / <code>'lg'</code>; <code>[fullWidth]</code> stretches segments; <code>[vertical]</code> stacks them.</li>
            <li><code>[label]</code> / <code>[ariaLabel]</code> &mdash; the group's accessible name.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Single-select renders a <code>radiogroup</code> of <code>radio</code>
            buttons (arrow keys move and select); multi-select renders a
            <code>group</code> of toggle buttons with <code>aria-pressed</code>.
            Selection is never colour-only &mdash; the active segment differs by a
            filled background <em>and</em> its ARIA state. The group must be named:
            supply a visible <code>label</code> (linked via
            <code>aria-labelledby</code>) or an <code>ariaLabel</code>, and give
            icon-only segments an <code>ariaLabel</code>. The
            <code>--nav-active-*</code> colours clear WCAG AA in both themes.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>View switcher</h2>
          <p class="showcase-section__lead">Single-select with a live readout.</p>
          <div>
            <rhombus-segmented
              [options]="views"
              [value]="view()"
              (valueChange)="view.set($any($event))"
              ariaLabel="Layout"
            />
            <p class="readout">Selected: {{ view() }}</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Unit toggle</h2>
          <p class="showcase-section__lead">A compact two-option switch.</p>
          <rhombus-segmented
            [options]="units"
            [value]="unit()"
            (valueChange)="unit.set($any($event))"
            ariaLabel="Temperature unit"
            size="sm"
          />
        </section>

        <section class="showcase-section">
          <h2>Reactive forms</h2>
          <p class="showcase-section__lead">Pass a <code>FormControl</code> via <code>[control]</code>.</p>
          <div>
            <rhombus-segmented [options]="views" [control]="viewControl" ariaLabel="Layout" />
            <p class="readout">control.value: {{ viewControl.value }}</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Multi-select toolbar</h2>
          <p class="showcase-section__lead">
            <code>multiple</code> with icon-only segments and an array value.
          </p>
          <div>
            <rhombus-segmented
              [options]="formats"
              [value]="activeFormats()"
              (valueChange)="activeFormats.set($any($event))"
              [multiple]="true"
              ariaLabel="Text format"
            />
            <p class="readout">Active: {{ activeFormats().join(', ') || 'none' }}</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Full width</h2>
          <p class="showcase-section__lead">Segments stretch to fill the container.</p>
          <rhombus-segmented
            [options]="views"
            [value]="view()"
            (valueChange)="view.set($any($event))"
            [fullWidth]="true"
            ariaLabel="Layout"
          />
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
export default class SegmentedPageComponent {
  protected readonly views: SegmentOption[] = [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
    { value: 'board', label: 'Board' },
  ];
  protected readonly units: SegmentOption[] = [
    { value: 'c', label: '°C' },
    { value: 'f', label: '°F' },
  ];
  protected readonly formats: SegmentOption[] = [
    { value: 'bold', label: 'Bold', icon: 'more_vert', ariaLabel: 'Bold' },
    { value: 'italic', label: 'Italic', icon: 'more_vert', ariaLabel: 'Italic' },
    { value: 'underline', label: 'Underline', icon: 'more_vert', ariaLabel: 'Underline' },
  ];

  protected readonly view = signal('grid');
  protected readonly unit = signal('c');
  protected readonly activeFormats = signal<string[]>(['bold']);
  protected readonly viewControl = new FormControl('list');

  protected readonly usage = `import { RhombusSegmentedComponent, SegmentOption } from '@rhombuskit/core';

@Component({
  selector: 'app-toolbar',
  imports: [RhombusSegmentedComponent],
  template: \`
    <rhombus-segmented [options]="views" [(value)]="view" ariaLabel="Layout" />
  \`,
})
export class ToolbarComponent {
  views: SegmentOption[] = [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
  ];
  view = 'grid';
}`;
}
