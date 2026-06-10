import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RhombusErrorDirective, RhombusTextareaComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-textarea-page',
  standalone: true,
  imports: [RhombusTextareaComponent, RhombusErrorDirective, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Textarea" apiKey="RhombusTextareaComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A textarea collects multi-line free-form text. RhombusKit's
          <code>&lt;rhombus-textarea&gt;</code> wraps Material's
          <code>&lt;textarea matInput&gt;</code>, adds a CDK-powered autosize
          mode, and routes its colour through the token contract so it re-skins
          with the active theme.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a textarea for <strong>longer, multi-line entry</strong> (a
              comment, a bio, a message). For a single short line use
              <strong>Input</strong> instead.
            </li>
            <li>
              Use a fixed <code>[rows]</code> height, or set
              <code>[autosize]="true"</code> with <code>minRows</code> /
              <code>maxRows</code> to grow with content. Like input, the
              component owns the control, so reactive-forms consumers pass a
              <code>FormControl</code> via <code>[control]</code>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
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

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders a native <code>&lt;textarea&gt;</code>, so it is focusable
            with <kbd>Tab</kbd> and the <code>label</code> floats into a
            <code>&lt;mat-label&gt;</code> wired as its accessible name. Any
            <code>hint</code> or projected <code>rhombusError</code> text is
            linked to the field via <code>aria-describedby</code>.
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
