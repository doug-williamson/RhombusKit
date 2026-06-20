import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  RhombusCodeBlockComponent,
  RhombusErrorDirective,
  RhombusSelectComponent,
  SelectOption,
  SelectOptionGroup,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-select-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusSelectComponent,
    RhombusErrorDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Select" [hasUsage]="true" apiKey="RhombusSelectComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A select lets the user pick from a list of options in a compact
          dropdown. RhombusKit's <code>&lt;rhombus-select&gt;</code> wraps
          Material's <code>&lt;mat-select&gt;</code> in the same form-field
          shell as input and textarea, and routes its colour through the token
          contract so it re-skins with the active theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-select
              label="Status"
              placeholder="Choose one"
              [options]="statuses"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Reach for a select when there are <strong>more options than fit
              comfortably as radios</strong> (roughly five or more), or when
              vertical space is tight.
            </li>
            <li>
              When you need <strong>grouped options</strong> under headings, or
              <strong>multi-select</strong> from a compact trigger.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a short, always-visible set of mutually exclusive choices
              (roughly two to five), use a <a routerLink="/components/radio">Radio</a>
              group — no extra click to reveal the options.
            </li>
            <li>
              For a single on/off choice, use a <a routerLink="/components/switch">Switch</a>
              or <a routerLink="/components/checkbox">Checkbox</a> rather than a two-option select.
            </li>
            <li>
              For free-form text rather than a fixed list, use an
              <a routerLink="/components/input">Input</a> or
              <a routerLink="/components/textarea">Textarea</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/radio">Radio</a> — short, always-visible exclusive choices.</li>
            <li><a routerLink="/components/checkbox">Checkbox</a> — multi-select from a visible list.</li>
            <li><a routerLink="/components/input">Input</a> — the sibling form-field for free text.</li>
            <li><a routerLink="/components/textarea">Textarea</a> — multi-line free text.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The select owns its inner <code>&lt;mat-select&gt;</code>. Feed it
          <code>options</code> (flat) or <code>groups</code> (grouped), and either
          let it manage its own value or bind a reactive
          <code>FormControl</code> via <code>[control]</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>label</code> / <code>placeholder</code> — the floating label and the empty-state trigger text.</li>
            <li><code>[options]</code> — a flat <code>SelectOption[]</code> (<code>{{ '{' }} value, label, disabled? {{ '}' }}</code>); or <code>[groups]</code> — a <code>SelectOptionGroup[]</code> (<code>{{ '{' }} groupLabel, options {{ '}' }}</code>) that takes precedence when non-empty.</li>
            <li><code>[multiple]="true"</code> for multi-select; <code>[control]</code> to drive it from reactive forms (the standalone <code>[disabled]</code> input is ignored once a control is bound); <code>[required]</code>, <code>hint</code>, <code>appearance</code>, and <code>size</code> for the field shell.</li>
            <li><strong>Projected slot</strong> — <code>[rhombusError]</code>: the only content slot. Project a <code>&lt;span rhombusError&gt;</code> here and it renders inside the field's <code>&lt;mat-error&gt;</code>. There is no default slot.</li>
            <li><code>(selectionChange)</code> emits the selected value (or an array when <code>multiple</code>) on every change.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The dropdown panel renders in a CDK overlay appended to
            <code>&lt;body&gt;</code>, so option-panel overrides must target the
            <code>.cdk-overlay-container</code> scope, not the host. The component's
            stylesheet routes everything through these contract tokens:
          </p>
          <ul>
            <li><code>--text-primary</code> — option label colour.</li>
            <li><code>--text-accent</code> — selected-option label colour.</li>
            <li><code>--surface-0</code> — dropdown panel background.</li>
            <li><code>--surface-1</code> — hover / selected state layer.</li>
            <li><code>--surface-2</code> — focus state layer.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Built on Material's <code>&lt;mat-select&gt;</code>, so the trigger is
            focusable with <kbd>Tab</kbd>, opens on <kbd>Enter</kbd> /
            <kbd>Space</kbd> / <kbd>Arrow</kbd>, and the open panel exposes the
            options as an ARIA listbox navigable with the arrow keys; type-ahead
            jumps to matching options. The <code>label</code> becomes the field's
            accessible name, so always supply one. Setting <code>[required]</code>
            reflects the required state to assistive tech, and content projected
            into <code>[rhombusError]</code> is rendered inside Material's
            <code>&lt;mat-error&gt;</code> and associated with the field for
            validation announcements.
          </p>
        </section>
      </div>
      <div examples>
      <section class="showcase-section">
        <h2>Flat options</h2>
        <div class="select-grid">
          <rhombus-select
            label="Status"
            placeholder="Choose one"
            [options]="statuses"
            (selectionChange)="lastSelection.set($any($event))"
          />
        </div>
        <p class="select-output">
          Last selection: <strong>{{ lastSelection() ?? '(none)' }}</strong>
        </p>
      </section>

      <section class="showcase-section">
        <h2>Grouped options</h2>
        <div class="select-grid">
          <rhombus-select
            label="Editor"
            placeholder="Choose your weapon"
            [groups]="editorGroups"
            hint="Groups render via mat-optgroup"
          />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Multiple selection</h2>
        <div class="select-grid">
          <rhombus-select
            label="Languages"
            placeholder="Pick all that apply"
            [multiple]="true"
            [options]="languages"
            hint="Selected values render as a comma-separated trigger"
          />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Reactive forms with validation</h2>
        <p class="showcase-section__lead">
          Pass a <code>FormControl</code> via <code>[control]</code>.
        </p>
        <div class="select-form">
          <rhombus-select
            label="Priority"
            placeholder="Choose priority"
            [options]="priorities"
            [control]="priority"
          >
            <span rhombusError>
              @if (priority.hasError('required')) {
                Pick a priority before submitting.
              }
            </span>
          </rhombus-select>
          <button
            mat-flat-button
            type="button"
            [disabled]="priority.invalid"
            (click)="onSubmit()"
          >
            Submit
          </button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>Disabled</h2>
        <div class="select-grid">
          <rhombus-select
            label="Locked"
            placeholder="Cannot change"
            [options]="statuses"
            [disabled]="true"
          />
        </div>
      </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .select-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .select-output {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
    .select-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 360px;
      align-items: flex-start;
    }
  `,
})
export default class SelectPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusSelectComponent, SelectOption } from '@rhombuskit/core';

@Component({
  selector: 'app-status-picker',
  imports: [RhombusSelectComponent],
  template: \`
    <rhombus-select
      label="Status"
      placeholder="Choose one"
      [options]="statuses"
    />
  \`,
})
export class StatusPickerComponent {
  readonly statuses: SelectOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
  ];
}`;

  protected readonly statuses: SelectOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived', disabled: true },
  ];

  protected readonly languages: SelectOption[] = [
    { value: 'ts', label: 'TypeScript' },
    { value: 'rust', label: 'Rust' },
    { value: 'go', label: 'Go' },
    { value: 'python', label: 'Python' },
    { value: 'swift', label: 'Swift' },
  ];

  protected readonly editorGroups: SelectOptionGroup[] = [
    {
      groupLabel: 'GUI',
      options: [
        { value: 'vscode', label: 'VS Code' },
        { value: 'jetbrains', label: 'JetBrains' },
        { value: 'zed', label: 'Zed' },
      ],
    },
    {
      groupLabel: 'Terminal',
      options: [
        { value: 'neovim', label: 'Neovim' },
        { value: 'helix', label: 'Helix' },
        { value: 'emacs', label: 'Emacs' },
      ],
    },
  ];

  protected readonly priorities: SelectOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  protected readonly priority = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });

  protected readonly lastSelection = signal<string | null>(null);

  protected onSubmit() {
    this.priority.markAllAsTouched();
  }
}
