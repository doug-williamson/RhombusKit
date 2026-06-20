import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  RhombusCodeBlockComponent,
  RhombusErrorDirective,
  RhombusTextareaComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-textarea-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusTextareaComponent,
    RhombusErrorDirective,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Textarea"
      [hasUsage]="true"
      apiKey="RhombusTextareaComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A textarea collects multi-line free-form text. RhombusKit's
          <code>&lt;rhombus-textarea&gt;</code> wraps Material's
          <code>&lt;textarea matInput&gt;</code>, adds a CDK-powered autosize
          mode, and routes its colour through the token contract so it re-skins
          with the active theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-textarea
              label="Short bio"
              placeholder="A sentence or two about yourself."
              [autosize]="true"
              [minRows]="3"
              [maxRows]="6"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a textarea for <strong>longer, multi-line entry</strong> (a
              comment, a bio, a message) where line breaks and wrapping matter.
            </li>
            <li>
              When content length is unpredictable — set
              <code>[autosize]="true"</code> so the field grows with what the
              user types instead of forcing a scrollbar.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a single short line (name, email, search term), use an
              <a routerLink="/components/input">Input</a> — it keeps the field
              compact and signals "one line" to the user.
            </li>
            <li>
              To pick from a fixed set of options rather than free text, use a
              <a routerLink="/components/select">Select</a>.
            </li>
            <li>
              For a boolean choice, use a
              <a routerLink="/components/checkbox">Checkbox</a> or
              <a routerLink="/components/switch">Switch</a> instead of asking
              for typed input.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/input">Input</a> — single-line free
              text with the same ownership model.
            </li>
            <li>
              <a routerLink="/components/select">Select</a> — choose from a
              defined list of values.
            </li>
            <li>
              <a routerLink="/components/checkbox">Checkbox</a> — capture a
              boolean instead of text.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The component owns its control: pass a reactive-forms
          <code>FormControl</code> via <code>[control]</code>, or use it
          standalone with the <code>[disabled]</code> input. Height is driven by
          a fixed <code>[rows]</code> count or by autosize bounds.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>&lt;rhombus-textarea&gt;</code> renders a
              <code>&lt;mat-form-field&gt;</code> with a floating
              <code>label</code>, the native <code>&lt;textarea&gt;</code>, and
              an optional <code>hint</code> subscript.
            </li>
            <li>
              Set height with <code>[rows]</code> (fixed) or
              <code>[autosize]="true"</code> plus <code>[minRows]</code> /
              <code>[maxRows]</code> to grow with content.
            </li>
            <li>
              <strong><code>[rhombusError]</code> slot</strong> — project a
              <code>&lt;span rhombusError&gt;</code> into the field's error
              subscript; it surfaces validation messages tied to the
              <code>[control]</code>. There is no default content slot.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Styling is authored once globally for all form fields and flows
            entirely through the token contract. It reads:
          </p>
          <ul>
            <li><code>--font-sans</code> — field font family</li>
            <li><code>--text-primary</code> — entered text and hovered label</li>
            <li><code>--text-secondary</code> — resting label colour</li>
            <li><code>--text-accent</code> — focused label colour</li>
            <li><code>--text-muted</code> — placeholder colour</li>
            <li><code>--border</code> — resting outline</li>
            <li><code>--border-strong</code> — hovered outline</li>
            <li><code>--focus-border</code> — focused outline</li>
            <li>
              <code>--surface-1</code> — container fill in
              <code>fill</code> appearance
            </li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders a native <code>&lt;textarea&gt;</code>, so it is focusable
            with <kbd>Tab</kbd> and the <code>label</code> floats into a
            <code>&lt;mat-label&gt;</code> wired as its accessible name. Always
            supply a <code>label</code> so the field is named. Any
            <code>hint</code> or projected <code>rhombusError</code> text is
            linked to the field via <code>aria-describedby</code> by Material's
            form-field, so screen readers announce it alongside the value. Set
            <code>[required]="true"</code> to mark the field required for both
            validation and ARIA.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Appearance</h2>
        <div class="textarea-grid">
          <rhombus-textarea
            label="Outline"
            placeholder="Write something thoughtful..."
            hint="3 rows by default"
          />
          <rhombus-textarea
            label="Fill"
            placeholder="Write something thoughtful..."
            appearance="fill"
            hint="Tonal container"
          />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Fixed vs autosize</h2>
        <div class="textarea-grid">
          <rhombus-textarea
            label="Fixed (rows=5)"
            placeholder="Heightened — exactly 5 rows."
            [rows]="5"
            hint="Vertical scroll appears past the fifth line"
          />
          <rhombus-textarea
            label="Autosize (2-8 rows)"
            placeholder="Type past two lines to watch it grow."
            [autosize]="true"
            [minRows]="2"
            [maxRows]="8"
            hint="Powered by @angular/cdk/text-field"
          />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Reactive forms with character count</h2>
        <p class="showcase-section__lead">
          The hint subscript binds the live character count; the error
          message binds the control's validity.
        </p>
        <form class="textarea-form">
          <rhombus-textarea
            label="Short bio"
            placeholder="A sentence or two about yourself."
            [autosize]="true"
            [minRows]="3"
            [maxRows]="6"
            [control]="bio"
            [hint]="charCountLabel()"
          >
            <span rhombusError>
              @if (bio.hasError('required')) {
                A short bio is required.
              } @else if (bio.hasError('maxlength')) {
                Bio must be {{ MAX_BIO }} characters or fewer.
              }
            </span>
          </rhombus-textarea>
        </form>
      </section>

      <section class="showcase-section">
        <h2>Disabled</h2>
        <div class="textarea-grid">
          <rhombus-textarea
            label="Disabled"
            placeholder="Read-only state."
            hint="Picks up --text-disabled"
            [disabled]="true"
          />
        </div>
      </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .textarea-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .textarea-form {
      max-width: 480px;
    }
  `,
})
export default class TextareaPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusTextareaComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-profile',
  imports: [RhombusTextareaComponent],
  template: \`
    <rhombus-textarea
      label="Short bio"
      placeholder="A sentence or two about yourself."
      [autosize]="true"
      [minRows]="3"
      [maxRows]="6"
    />
  \`,
})
export class ProfileComponent {}`;

  protected readonly MAX_BIO = 140;

  protected readonly bio = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(this.MAX_BIO)],
  });

  private readonly bioValue = signal(this.bio.value);

  constructor() {
    this.bio.valueChanges.subscribe((v) => this.bioValue.set(v ?? ''));
  }

  protected readonly charCountLabel = computed(
    () => `${this.bioValue().length} / ${this.MAX_BIO}`
  );
}
