import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  RhombusCodeBlockComponent,
  RhombusErrorDirective,
  RhombusTagInputComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-tag-input-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusTagInputComponent,
    RhombusErrorDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Tag Input"
      [hasUsage]="true"
      apiKey="RhombusTagInputComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A tag input lets the user <strong>author a free-text list</strong> —
          type a value and press <kbd>Enter</kbd> to add a chip, click its
          <code>×</code> to remove it. RhombusKit's
          <code>&lt;rhombus-tag-input&gt;</code> wraps Material's
          <code>&lt;mat-chip-grid&gt;</code> + <code>matChipInput</code> in the
          same form-field shell as input and select, themes each tag through the
          <a routerLink="/components/chip">Chip</a> bridge, and binds to a plain
          <code>string[]</code> — so editors never reach into Material's chip
          internals.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-tag-input
              label="Tags"
              placeholder="Add a tag…"
              [tags]="demoTags()"
              (tagsChange)="demoTags.set($event)"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              When the user <strong>authors</strong> an open-ended list — labels,
              keywords, recipients, skills — rather than picking from a fixed set.
            </li>
            <li>
              When you want the value as a simple <code>string[]</code>, with
              add-on-enter and removable chips handled for you.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              To <strong>select</strong> from a known set of values, use a
              <a routerLink="/components/chip">Chip</a> group
              (<code>[rhombusChipGroup]</code>) or a
              <a routerLink="/components/select">Select</a> — the tag input is for
              free text, not selection.
            </li>
            <li>
              For a single line of free text, use an
              <a routerLink="/components/input">Input</a>; for static status
              labels, use a <a routerLink="/components/tag">Tag</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/chip">Chip</a> — selectable chips over a fixed set.</li>
            <li><a routerLink="/components/tag">Tag</a> — inline, static status/label pills.</li>
            <li><a routerLink="/components/select">Select</a> — pick one or many from a list.</li>
            <li><a routerLink="/components/input">Input</a> — the sibling form-field for single-line text.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The component owns its inner <code>&lt;mat-chip-grid&gt;</code> and
          renders the chips itself from the active value source. Either let it
          manage its own array via <code>[(tags)]</code>, or bind a reactive
          <code>FormControl&lt;string[]&gt;</code> via <code>[control]</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>label</code> / <code>placeholder</code> — the floating label and the empty-field prompt.</li>
            <li><code>[(tags)]</code> — two-way binding to a <code>string[]</code> (or <code>[tags]</code> + <code>(tagsChange)</code>); <code>[control]</code> binds a reactive <code>FormControl&lt;string[]&gt;</code> instead (the standalone <code>[tags]</code> / <code>[disabled]</code> inputs are then ignored).</li>
            <li><code>variant</code> — the <code>[rhombusChip]</code> colour role applied to every tag (<code>default</code> · <code>primary</code> · <code>success</code> · <code>warning</code> · <code>danger</code>).</li>
            <li><code>[maxTags]</code>, <code>[addOnBlur]</code>, <code>[separatorKeyCodes]</code> — control how tags are committed (tags are a de-duplicated set); <code>[required]</code>, <code>hint</code>, <code>appearance</code>, and <code>size</code> shape the field shell.</li>
            <li><strong>Projected slot</strong> — <code>[rhombusError]</code>: project a <code>&lt;span rhombusError&gt;</code> and it renders inside the field's <code>&lt;mat-error&gt;</code>. There is no default slot.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The field shell reuses the shared <code>.rhombus-form-field</code>
            theming (loaded from <code>&#64;rhombuskit/core/scss</code>), and each
            tag is coloured by the <code>[rhombusChip]</code> bridge keyed off its
            <code>variant</code> — so tags re-skin with the theme. No new tokens.
          </p>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Built on Material's <code>&lt;mat-chip-grid&gt;</code>: the chips form
            a grid navigable with the arrow keys, each tag's remove control is a
            focusable button with an explicit
            <code>aria-label="Remove &lt;tag&gt;"</code>, and the text field lives
            outside the grid (an <code>&lt;input&gt;</code> is not a valid child of
            <code>role="grid"</code>) while staying wired to it via
            <code>matChipInputFor</code>. The <code>label</code> becomes the
            field's accessible name, so always supply one.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Lightweight (two-way binding)</h2>
          <div class="tag-grid">
            <rhombus-tag-input
              label="Keywords"
              placeholder="Add a keyword…"
              hint="Press Enter or comma to add"
              [tags]="keywords()"
              (tagsChange)="keywords.set($event)"
            />
          </div>
          <p class="tag-output">
            Value: <strong>{{ keywords().length ? keywords().join(', ') : '(empty)' }}</strong>
          </p>
        </section>

        <section class="showcase-section">
          <h2>Variants</h2>
          <div class="tag-grid">
            <rhombus-tag-input
              label="Default"
              [tags]="vDefault()"
              (tagsChange)="vDefault.set($event)"
            />
            <rhombus-tag-input
              label="Primary"
              variant="primary"
              [tags]="vPrimary()"
              (tagsChange)="vPrimary.set($event)"
            />
            <rhombus-tag-input
              label="Success"
              variant="success"
              [tags]="vSuccess()"
              (tagsChange)="vSuccess.set($event)"
            />
            <rhombus-tag-input
              label="Warning"
              variant="warning"
              [tags]="vWarning()"
              (tagsChange)="vWarning.set($event)"
            />
            <rhombus-tag-input
              label="Danger"
              variant="danger"
              [tags]="vDanger()"
              (tagsChange)="vDanger.set($event)"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Capped + no duplicates</h2>
          <div class="tag-grid">
            <rhombus-tag-input
              label="Up to 3 tags"
              placeholder="Add a tag…"
              hint="Adds are ignored past 3, and duplicates are dropped"
              [maxTags]="3"
              [tags]="capped()"
              (tagsChange)="capped.set($event)"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Reactive forms with validation</h2>
          <p class="showcase-section__lead">
            Pass a <code>FormControl&lt;string[]&gt;</code> via <code>[control]</code>.
          </p>
          <div class="tag-form">
            <rhombus-tag-input
              label="Recipients"
              placeholder="Add an address…"
              variant="primary"
              [control]="recipients"
            >
              <span rhombusError>
                @if (recipients.hasError('required')) {
                  Add at least one recipient before sending.
                }
              </span>
            </rhombus-tag-input>
            <button
              mat-flat-button
              type="button"
              [disabled]="recipients.invalid"
              (click)="onSubmit()"
            >
              Send
            </button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <div class="tag-grid">
            <rhombus-tag-input
              label="Locked"
              [tags]="lockedTags"
              [disabled]="true"
            />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .tag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .tag-output {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
    .tag-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 360px;
      align-items: flex-start;
    }
  `,
})
export default class TagInputPageComponent {
  /** Minimal import + usage snippet shown in the Overview / Usage tabs. */
  protected readonly usage = `import { RhombusTagInputComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-keyword-editor',
  imports: [RhombusTagInputComponent],
  template: \`
    <rhombus-tag-input
      label="Keywords"
      placeholder="Add a keyword…"
      [(tags)]="keywords"
    />
  \`,
})
export class KeywordEditorComponent {
  keywords = ['angular', 'signals'];
}`;

  protected readonly demoTags = signal<string[]>(['design', 'system']);
  protected readonly keywords = signal<string[]>(['angular', 'signals']);

  protected readonly vDefault = signal<string[]>(['neutral']);
  protected readonly vPrimary = signal<string[]>(['brand']);
  protected readonly vSuccess = signal<string[]>(['published']);
  protected readonly vWarning = signal<string[]>(['draft']);
  protected readonly vDanger = signal<string[]>(['archived']);

  protected readonly capped = signal<string[]>(['one', 'two']);

  /** Stable reference for the disabled (read-only) example. */
  protected readonly lockedTags = ['read-only', 'frozen'];

  protected readonly recipients = new FormControl<string[]>([], {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected onSubmit(): void {
    this.recipients.markAllAsTouched();
  }
}
