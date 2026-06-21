import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  RadioOption,
  RhombusCodeBlockComponent,
  RhombusRadioGroupComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-radio-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusRadioGroupComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Radio Group"
      [hasUsage]="true"
      apiKey="RhombusRadioGroupComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A radio group lets the user pick exactly one option from a short,
          mutually-exclusive set. RhombusKit's
          <code>&lt;rhombus-radio-group&gt;</code> wraps Material's
          <code>&lt;mat-radio-group&gt;</code>, is driven by an
          <code>options</code> array, and routes its colour through the token
          contract so it re-skins with the active theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-radio-group
              label="Priority"
              [options]="priorityOptions"
              [(value)]="priority"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Reach for a radio group when one choice out of
              <strong>two to about five visible options</strong> must be made
              and seeing them all at once aids the decision.
            </li>
            <li>
              When the options are short and the user benefits from comparing
              them side by side without opening a separate surface.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For longer lists or space-constrained forms, collapse the choices
              into a <a routerLink="/components/select">Select</a>.
            </li>
            <li>
              For an independent on/off setting (not a one-of-many choice), use a
              <a routerLink="/components/switch">Switch</a> or a single
              <a routerLink="/components/checkbox">Checkbox</a>.
            </li>
            <li>
              When the user may pick several options at once, use a group of
              <a routerLink="/components/checkbox">Checkboxes</a> instead.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/select">Select</a> — one-of-many for
              longer lists.
            </li>
            <li>
              <a routerLink="/components/checkbox">Checkbox</a> — independent or
              multi-select choices.
            </li>
            <li>
              <a routerLink="/components/switch">Switch</a> — a single binary
              setting.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The group is driven by an <code>options</code> array of
          <code>{{ '{' }} value, label, disabled? {{ '}' }}</code>. Bind
          <code>[(value)]</code> for lightweight local state, or pass a
          <code>FormControl</code> via <code>[control]</code> to join a reactive
          form (validation, dirty / touched).
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[options]</code> — the array of
              <code>RadioOption</code> records (<code>value</code>,
              <code>label</code>, optional <code>disabled</code>) rendered as
              radio buttons. There are no content-projection slots; the group is
              configured entirely through inputs.
            </li>
            <li>
              <code>label</code> — a visible group label rendered above the
              buttons and linked for assistive tech; use
              <code>ariaLabel</code> when there is no visible label.
            </li>
            <li>
              <code>[(value)]</code> — two-way binding for the selected value in
              lightweight mode (emits via <code>valueChange</code>).
            </li>
            <li>
              <code>[control]</code> — a reactive
              <code>FormControl&lt;T | null&gt;</code>; when set, the standalone
              <code>value</code> / <code>disabled</code> inputs are ignored.
            </li>
            <li>
              <code>[required]</code> / <code>[disabled]</code> — mark the group
              required (validation + ARIA) or disable it in lightweight mode.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The selected-dot and ripple colours flow through the
            <code>@rhombuskit/material-preset</code> bridge, so they re-skin with
            the active theme automatically. The component's own styles read these
            contract tokens:
          </p>
          <ul>
            <li><code>--font-sans</code> — group and label font family</li>
            <li><code>--text-secondary</code> — the visible label colour</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders native radio buttons grouped under a single roving tab stop:
            <kbd>Tab</kbd> moves into the group and the <kbd>Arrow</kbd> keys move
            the selection between options. When a visible <code>label</code> is
            set it is linked to the group via <code>aria-labelledby</code>; when
            there is no visible label, pass <code>ariaLabel</code> so the group
            still has an accessible name. Set <code>[required]</code> to reflect
            the requirement to assistive tech and reactive-form validation.
            Disabled options (<code>disabled: true</code> on an entry) are skipped
            during keyboard navigation.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Lightweight binding</h2>
        <p class="showcase-section__lead">
          Selected: <strong>{{ priority() ?? '(none)' }}</strong>
        </p>
        <rhombus-radio-group
          label="Priority"
          [options]="priorityOptions"
          [(value)]="priority"
        />
      </section>

      <section class="showcase-section">
        <h2>Reactive forms with validation</h2>
        <rhombus-radio-group
          label="Plan"
          [options]="planOptions"
          [control]="plan"
        />
        <p class="showcase-section__lead">
          Form is <strong>{{ plan.valid ? 'valid' : 'invalid' }}</strong>.
        </p>
      </section>
      </div>
    </app-component-page>
  `,
})
export default class RadioPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RadioOption, RhombusRadioGroupComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-priority-picker',
  imports: [RhombusRadioGroupComponent],
  template: \`
    <rhombus-radio-group
      label="Priority"
      [options]="priorityOptions"
      [(value)]="priority"
    />
  \`,
})
export class PriorityPickerComponent {
  readonly priorityOptions: RadioOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];
  readonly priority = signal<string | null>('medium');
}`;

  protected readonly priorityOptions: RadioOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'blocked', label: 'Blocked', disabled: true },
  ];
  protected readonly planOptions: RadioOption[] = [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'team', label: 'Team' },
  ];

  protected readonly priority = signal<string | null>('medium');
  protected readonly plan = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });
}
