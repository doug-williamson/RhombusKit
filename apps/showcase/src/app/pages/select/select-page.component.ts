import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  RhombusErrorDirective,
  RhombusSelectComponent,
  SelectOption,
  SelectOptionGroup,
} from '@rhombuskit/core';

@Component({
  selector: 'app-select-page',
  standalone: true,
  imports: [MatButtonModule, RhombusSelectComponent, RhombusErrorDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Select</h1>
        <p>
          <code>&lt;rhombus-select&gt;</code> wraps
          <code>&lt;mat-select&gt;</code> inside the same form-field shell
          as input and textarea. Pass <code>options</code> (flat) or
          <code>groups</code> (grouped). <code>multiple</code> toggles
          multi-select. The component is generic — option <code>value</code>
          can be any type — and owns the control, so reactive-forms
          consumers pass a <code>FormControl</code> via <code>[control]</code>.
          Because the option panel renders inside the CDK overlay (outside
          the host), <code>--mat-select-*</code> and
          <code>--mat-option-*</code> tokens are bound under
          <code>.cdk-overlay-container</code> rather than the component
          host. The colour walk below validates that the workaround reaches
          the panel.
        </p>
      </header>

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
