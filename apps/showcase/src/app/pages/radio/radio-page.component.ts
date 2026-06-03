import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RadioOption, RhombusRadioGroupComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-radio-page',
  standalone: true,
  imports: [RhombusRadioGroupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Radio Group</h1>
        <p>
          <code>&lt;rhombus-radio-group&gt;</code> wraps Material's
          <code>&lt;mat-radio-group&gt;</code> and is driven by an
          <code>options</code> array, exactly like
          <code>&lt;rhombus-select&gt;</code>. Use <code>[control]</code> for
          reactive forms or <code>[(value)]</code> for lightweight binding. A
          visible <code>label</code> is wired to the group via
          <code>aria-labelledby</code>.
        </p>
      </header>

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
  `,
})
export default class RadioPageComponent {
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
