import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RadioOption, RhombusRadioGroupComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-radio-page',
  standalone: true,
  imports: [RhombusRadioGroupComponent, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Radio Group" apiKey="RhombusRadioGroupComponent">
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
          <h2>When to use</h2>
          <ul>
            <li>
              Reach for a radio group when one choice out of
              <strong>two to about five visible options</strong> must be made
              and seeing them all at once aids the decision. For longer lists
              prefer <strong>Select</strong>; for an independent on/off choice
              use <strong>Checkbox</strong>.
            </li>
            <li>
              Bind <code>[(value)]</code> for lightweight local state, or pass a
              <code>FormControl</code> via <code>[control]</code> to join a
              reactive form (validation, dirty / touched).
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-radio-group
              label="Priority"
              [options]="priorityOptions"
              [(value)]="priority"
            />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders native radio buttons grouped under a single roving
            tab stop: <kbd>Tab</kbd> moves into the group and the
            <kbd>Arrow</kbd> keys move the selection between options. A visible
            <code>label</code> is linked to the group via
            <code>aria-labelledby</code> (pass <code>ariaLabel</code> instead
            when there is no visible label).
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
