import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  RhombusCodeBlockComponent,
  RhombusErrorDirective,
  RhombusInputComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-input-page',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusInputComponent,
    RhombusErrorDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Input" [hasUsage]="true" apiKey="RhombusInputComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A text input collects a single line of free-form text. RhombusKit's
          <code>&lt;rhombus-input&gt;</code> wraps Material's
          <code>&lt;mat-form-field&gt;</code> + <code>matInput</code> with a
          curated appearance / size API and routes its colour through the token
          contract so it re-skins with the active theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-input
              label="Email"
              type="email"
              placeholder="you@example.com"
              hint="We never share this."
              [control]="email"
            >
              <span rhombusError>
                @if (email.hasError('required')) {
                  Email is required.
                } @else if (email.hasError('email')) {
                  That doesn't look like a valid email address.
                }
              </span>
            </rhombus-input>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use an input for <strong>short, single-line text</strong> — a
              name, an email, a search term, a quantity.
            </li>
            <li>
              When the value benefits from a leading or trailing affordance — a
              currency symbol, a search glyph, a show/hide password toggle —
              that the projected prefix/suffix slots can carry.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For longer, multi-line free text use a
              <a routerLink="/components/textarea">Textarea</a>.
            </li>
            <li>
              To pick one (or several) values from a fixed list use a
              <a routerLink="/components/select">Select</a>.
            </li>
            <li>
              For a single boolean choice use a
              <a routerLink="/components/checkbox">Checkbox</a> or a
              <a routerLink="/components/switch">Switch</a>, not a text field.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/textarea">Textarea</a> — multi-line
              free text with the same form-field contract.
            </li>
            <li>
              <a routerLink="/components/select">Select</a> — choose from a
              fixed set of options.
            </li>
            <li>
              <a routerLink="/components/data-table">Data Table</a> — inputs
              often filter or edit rows here.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The component owns the native <code>&lt;input&gt;</code>. Drive it
          declaratively with inputs (<code>label</code>, <code>type</code>,
          <code>appearance</code>, <code>size</code>, <code>hint</code>); for
          reactive forms pass a <code>FormControl</code> via
          <code>[control]</code> rather than binding <code>[formControl]</code>
          directly. Omit it for a plain uncontrolled field.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>&lt;rhombus-input&gt;</code> — the host. It renders the
              <code>&lt;mat-form-field&gt;</code> and the native control
              internally, so the control is <strong>not</strong> projected; bind
              data through <code>[control]</code> or read the uncontrolled field.
            </li>
            <li>
              <code>[matIconPrefix]</code> / <code>[matIconPrefix]</code> and
              <code>[matIconSuffix]</code> — leading / trailing icon
              affordances (e.g. a search glyph, or a password show/hide button).
            </li>
            <li>
              <code>[matPrefix]</code> / <code>[matSuffix]</code> and
              <code>[matTextPrefix]</code> / <code>[matTextSuffix]</code> —
              generic and text-styled prefix/suffix slots for symbols like a
              currency sign or unit.
            </li>
            <li>
              <code>[rhombusError]</code> — project error message text here; it
              surfaces through Material's <code>&lt;mat-error&gt;</code> once the
              bound control is invalid and touched.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The field renders inline (no overlay). Its styling lives in the
            global <code>&#64;rhombuskit/core/scss</code> form-field layer, which
            maps Material's form-field variables onto these contract tokens:
          </p>
          <ul>
            <li><code>--font-sans</code> — field font family</li>
            <li><code>--text-primary</code> — input text colour</li>
            <li><code>--text-secondary</code> — resting label colour</li>
            <li><code>--text-accent</code> — focused label colour</li>
            <li><code>--text-muted</code> — placeholder colour</li>
            <li><code>--border</code> / <code>--border-strong</code> — outline (resting / hover)</li>
            <li><code>--focus-border</code> — focused outline colour</li>
            <li><code>--surface-1</code> — container fill (<code>fill</code> appearance)</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders a native <code>&lt;input&gt;</code>, so it is focusable with
            <kbd>Tab</kbd> and the <code>label</code> floats into a
            <code>&lt;mat-label&gt;</code> wired as its accessible name. Set
            <code>required</code> to mark the native control required for
            validation and assistive tech.
          </p>
          <p>
            Any <code>hint</code> renders in a <code>&lt;mat-hint&gt;</code> and
            projected <code>rhombusError</code> text in a
            <code>&lt;mat-error&gt;</code>; Material links both to the field via
            <code>aria-describedby</code>, and the error is revealed only once
            the bound control is invalid <em>and</em> touched. When you project
            a prefix/suffix icon button (such as the password toggle), give it
            its own <code>aria-label</code> — the examples below do.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Appearance</h2>
        <div class="input-grid">
          <rhombus-input
            label="Outline (default)"
            placeholder="Pick a topic"
            hint="Border + label sit on the surface"
          />
          <rhombus-input
            label="Fill"
            placeholder="Pick a topic"
            appearance="fill"
            hint="Tonal container; subtle ground"
          />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Size scale</h2>
        <div class="input-grid">
          <rhombus-input label="Small" size="sm" placeholder="0.75rem text" />
          <rhombus-input label="Medium (default)" size="md" placeholder="0.875rem text" />
          <rhombus-input label="Large" size="lg" placeholder="1rem text" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Reactive forms with validation</h2>
        <p class="showcase-section__lead">
          Pass a <code>FormControl</code> via <code>[control]</code>. The
          error message appears once the control is invalid <em>and</em>
          touched.
        </p>
        <div class="input-form">
          <rhombus-input
            label="Email"
            type="email"
            placeholder="you@example.com"
            hint="We never share this."
            [control]="email"
          >
            <span rhombusError>
              @if (email.hasError('required')) {
                Email is required.
              } @else if (email.hasError('email')) {
                That doesn't look like a valid email address.
              }
            </span>
          </rhombus-input>

          <button
            mat-flat-button
            type="button"
            [disabled]="email.invalid"
            class="input-form__submit"
            (click)="onSubmit()"
          >
            Submit
          </button>
        </div>
        <p class="input-form__status">
          Status: <strong>{{ email.status }}</strong> · touched:
          <strong>{{ email.touched }}</strong>
        </p>
      </section>

      <section class="showcase-section">
        <h2>Password with show/hide</h2>
        <p class="showcase-section__lead">
          The trailing icon button is projected via Material's
          <code>matIconSuffix</code> directive.
        </p>
        <div class="input-grid input-grid--narrow">
          <rhombus-input
            label="Password"
            [type]="passwordVisible() ? 'text' : 'password'"
            placeholder="At least 8 characters"
            autocomplete="new-password"
          >
            <button
              type="button"
              mat-icon-button
              matIconSuffix
              [attr.aria-label]="passwordVisible() ? 'Hide password' : 'Show password'"
              (click)="togglePassword()"
            >
              <mat-icon>{{ passwordVisible() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </rhombus-input>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Disabled</h2>
        <div class="input-grid">
          <rhombus-input
            label="Disabled"
            placeholder="No interaction"
            hint="Picks up --text-disabled"
            [disabled]="true"
          />
          <rhombus-input
            label="Disabled (fill)"
            placeholder="No interaction"
            appearance="fill"
            [disabled]="true"
          />
        </div>
      </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .input-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .input-grid--narrow {
      grid-template-columns: minmax(260px, 360px);
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .input-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 420px;
    }
    .input-form__submit {
      align-self: flex-start;
    }
    .input-form__status {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
  `,
})
export default class InputPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusErrorDirective, RhombusInputComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-sign-in',
  imports: [RhombusInputComponent, RhombusErrorDirective],
  template: \`
    <rhombus-input
      label="Email"
      type="email"
      placeholder="you@example.com"
      hint="We never share this."
      [control]="email"
    >
      <span rhombusError>
        @if (email.hasError('required')) {
          Email is required.
        } @else if (email.hasError('email')) {
          That doesn't look like a valid email address.
        }
      </span>
    </rhombus-input>
  \`,
})
export class SignInComponent {
  readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
}`;

  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected readonly passwordVisible = signal(false);

  protected togglePassword() {
    this.passwordVisible.update((v) => !v);
  }

  protected onSubmit() {
    this.email.markAllAsTouched();
  }
}
