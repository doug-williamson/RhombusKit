import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RhombusErrorDirective, RhombusTextareaComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-textarea-page',
  standalone: true,
  imports: [RhombusTextareaComponent, RhombusErrorDirective, ComponentPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Textarea" apiKey="RhombusTextareaComponent">
      <div overview>
        <p>
          <code>&lt;rhombus-textarea&gt;</code> wraps
          <code>&lt;textarea matInput&gt;</code>. In addition to the
          shared form-field inputs (appearance, size, hint, etc.) it
          exposes <code>rows</code> for the fixed-height mode and
          <code>autosize</code> + <code>minRows</code> / <code>maxRows</code>
          for the CDK autosize mode. As with input, the component owns the
          control; reactive-forms consumers pass a <code>FormControl</code>
          via <code>[control]</code>.
        </p>
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
