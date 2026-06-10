import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RhombusCheckboxComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-checkbox-page',
  standalone: true,
  imports: [RhombusCheckboxComponent, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Checkbox" apiKey="RhombusCheckboxComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A checkbox toggles a single option on or off. RhombusKit wraps
          Material's <code>&lt;mat-checkbox&gt;</code> with the token contract and
          the same two binding modes as the other form controls, so colour reacts
          to the active theme automatically.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a checkbox for an <strong>independent on/off choice</strong>
              (&ldquo;Remember me&rdquo;, accepting terms). To pick one of several
              mutually-exclusive options use <strong>Radio</strong>; for an
              instant-effect setting toggle consider <strong>Switch</strong>.
            </li>
            <li>
              Bind <code>[(checked)]</code> for lightweight local state, or pass a
              <code>FormControl&lt;boolean&gt;</code> via <code>[control]</code> to
              join a reactive form (validation, dirty / touched).
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-checkbox label="Remember me" [(checked)]="remember" />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Wraps a native checkbox: it is reachable with <kbd>Tab</kbd> and
            toggles on <kbd>Space</kbd>, and the <code>label</code> text becomes
            its accessible name (clicking the label toggles it too). Set
            <code>required</code> to expose the required state to assistive tech
            and form validation.
          </p>
        </section>
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
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusCheckboxComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-prefs',
  imports: [RhombusCheckboxComponent],
  template: \`
    <rhombus-checkbox label="Remember me" [(checked)]="remember" />
  \`,
})
export class PrefsComponent {
  readonly remember = signal(false);
}`;

  protected readonly remember = signal(false);
  protected readonly subscribed = signal(false);
  protected readonly accept = new FormControl(false, {
    nonNullable: true,
    validators: [Validators.requiredTrue],
  });
}
