import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RhombusInputComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-input-page',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RhombusInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Input</h1>
        <p>
          <code>&lt;rhombus-input&gt;</code> wraps Material's
          <code>&lt;mat-form-field&gt;</code> + <code>matInput</code>.
          Public API: <code>label</code>, <code>type</code>,
          <code>placeholder</code>, <code>appearance</code>
          (<code>outline</code> | <code>fill</code>), <code>size</code>
          (<code>sm</code> | <code>md</code> | <code>lg</code>),
          <code>hint</code>, <code>disabled</code>, <code>required</code>.
          The component owns the native input — Material's form field can't
          see a projected control — so reactive-forms consumers pass a
          <code>FormControl</code> via <code>[control]</code> rather than
          binding <code>[formControl]</code> directly.
        </p>
      </header>

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
            <span slot="error">
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
