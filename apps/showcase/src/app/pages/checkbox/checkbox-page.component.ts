import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  RhombusCheckboxComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-checkbox-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCheckboxComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Checkbox" [hasUsage]="true" apiKey="RhombusCheckboxComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A checkbox toggles a single option on or off. RhombusKit wraps
          Material's <code>&lt;mat-checkbox&gt;</code> with the token contract and
          the same two binding modes as the other form controls, so colour reacts
          to the active theme automatically.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-checkbox label="Remember me" [(checked)]="remember" />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a checkbox for an <strong>independent on/off choice</strong>
              (&ldquo;Remember me&rdquo;, accepting terms) where the change takes
              effect when the surrounding form is submitted.
            </li>
            <li>
              Use one for a single binary toggle, or group several checkboxes when
              the user may select <strong>any number</strong> of options
              independently.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>To pick exactly one of several mutually-exclusive options, use a <a routerLink="/components/radio">Radio</a> group.</li>
            <li>For a setting that takes effect <strong>immediately</strong> on toggle (no save step), use a <a routerLink="/components/switch">Switch</a>.</li>
            <li>To trigger an action rather than capture a value, use a <a routerLink="/components/button">Button</a>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/radio">Radio</a> — one of several mutually-exclusive choices.</li>
            <li><a routerLink="/components/switch">Switch</a> — instant-effect on/off toggle.</li>
            <li><a routerLink="/components/input">Input</a> — single-line text in the same reactive-forms contract.</li>
            <li><a routerLink="/components/select">Select</a> — choose from a longer list of options.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Drive a checkbox one of two ways: bind <code>[(checked)]</code> for
          lightweight local state, or pass a <code>FormControl&lt;boolean&gt;</code>
          via <code>[control]</code> to join a reactive form (validation,
          dirty / touched).
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>label</code> — the text rendered beside the box; it becomes the control's accessible name. The component has <strong>no content-projection slots</strong> — there is no default <code>&lt;ng-content&gt;</code>, so the label is set through this input rather than projected markup.</li>
            <li><code>[(checked)]</code> / <code>[checked]</code> + <code>(checkedChange)</code> — lightweight two-way state; ignored when <code>[control]</code> is supplied.</li>
            <li><code>[control]</code> — a <code>FormControl&lt;boolean&gt;</code>; when set it owns the value and disabled state, so the standalone <code>checked</code> / <code>disabled</code> inputs are ignored.</li>
            <li><code>required</code> exposes the required state, and <code>labelPosition</code> places the label <code>before</code> or <code>after</code> (default) the box.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Colour flows through the <code>&#64;rhombuskit/material-preset</code>
            bridge (<code>--mat-sys-*</code> → contract tokens) rather than being set
            on the host, so the checkbox tracks the active theme automatically. The
            only token the component's own styles read directly is:
          </p>
          <ul>
            <li><code>--font-sans</code> — label font family</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The component renders a Material <code>&lt;mat-checkbox&gt;</code> backed
            by a native checkbox input: it is reachable with <kbd>Tab</kbd> and
            toggles on <kbd>Space</kbd>, and the <code>label</code> text becomes its
            accessible name (clicking the label toggles it too). Set
            <code>required</code> to mark the control required for form validation and
            assistive tech, and pass a <code>FormControl</code> with validators when
            an unchecked state should block submission. Always supply a
            <code>label</code> so the checkbox has an accessible name — an unlabelled
            checkbox is announced only by its checked state.
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
