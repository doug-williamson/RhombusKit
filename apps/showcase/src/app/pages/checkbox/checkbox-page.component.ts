import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RhombusCheckboxComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-checkbox-page',
  standalone: true,
  imports: [RhombusCheckboxComponent, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Checkbox" apiKey="RhombusCheckboxComponent">
      <div overview>
        <p>
          <code>&lt;rhombus-checkbox&gt;</code> wraps Material's
          <code>&lt;mat-checkbox&gt;</code> with the RhombusKit token contract.
          Two usage modes mirror the other form controls: pass a
          <code>FormControl&lt;boolean&gt;</code> via <code>[control]</code> for
          reactive forms, or bind <code>[(checked)]</code> for lightweight use.
          Colour flows through the <code>--mat-sys-*</code> &rarr; CONTRACT
          bridge &mdash; toggle the theme to see it react.
        </p>
      </div>
      <div examples>
      <section class="showcase-section">
        <h2>States</h2>
        <div class="showcase-row">
          <rhombus-checkbox label="Default" />
          <rhombus-checkbox label="Checked" [checked]="true" />
          <rhombus-checkbox label="Disabled" [disabled]="true" />
          <rhombus-checkbox label="Disabled + checked" [checked]="true" [disabled]="true" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Label position</h2>
        <div class="showcase-row">
          <rhombus-checkbox label="Label after (default)" />
          <rhombus-checkbox label="Label before" labelPosition="before" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Two-way binding</h2>
        <p class="showcase-section__lead">
          <code>[(checked)]</code> keeps a local signal in sync. Currently:
          <strong>{{ subscribed() ? 'subscribed' : 'not subscribed' }}</strong>.
        </p>
        <rhombus-checkbox label="Email me product updates" [(checked)]="subscribed" />
      </section>

      <section class="showcase-section">
        <h2>Reactive forms with validation</h2>
        <p class="showcase-section__lead">
          Pass a <code>FormControl</code> via <code>[control]</code>. This one is
          <code>requiredTrue</code>; it stays invalid until checked.
        </p>
        <rhombus-checkbox label="I accept the terms" [control]="accept" />
        <p class="showcase-section__lead">
          Form is <strong>{{ accept.valid ? 'valid' : 'invalid' }}</strong>.
        </p>
      </section>
      </div>
    </app-component-page>
  `,
})
export default class CheckboxPageComponent {
  protected readonly subscribed = signal(false);
  protected readonly accept = new FormControl(false, {
    nonNullable: true,
    validators: [Validators.requiredTrue],
  });
}
