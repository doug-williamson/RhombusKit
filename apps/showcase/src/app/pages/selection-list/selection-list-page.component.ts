import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  RhombusCodeBlockComponent,
  RhombusErrorDirective,
  RhombusSelectionListComponent,
  SelectionListOption,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-selection-list-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusSelectionListComponent,
    RhombusErrorDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Selection List"
      [hasUsage]="true"
      apiKey="RhombusSelectionListComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A selection list shows a set of options as an always-visible list the
          user can select from — or, in action mode, a list of buttons that run
          a command. RhombusKit's <code>&lt;rhombus-selection-list&gt;</code>
          wraps Material's <code>&lt;mat-selection-list&gt;</code> (an ARIA
          listbox) and <code>&lt;mat-action-list&gt;</code>, routing every colour
          through the token contract.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-selection-list
              label="Toppings"
              [options]="toppings"
              [(value)]="picked"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              For <strong>multi-select from a visible list</strong> where every
              option should be on screen at once (no dropdown).
            </li>
            <li>
              For a <strong>single-select list</strong> that stays expanded, when
              a Radio group's styling doesn't fit.
            </li>
            <li>
              In <strong>action mode</strong>, for a menu-like column of commands
              (edit, duplicate, delete) that aren't navigation.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For <strong>navigation</strong> (links to routes/URLs), use a
              <a routerLink="/components/nav-list">Nav List</a> — a listbox can't
              hold interactive children like anchors, so the two stay separate.
            </li>
            <li>
              When space is tight and the options can collapse, use a
              <a routerLink="/components/select">Select</a> dropdown instead.
            </li>
            <li>
              For a short set of exclusive choices, a
              <a routerLink="/components/radio">Radio</a> group is more compact.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/nav-list">Nav List</a> — navigation links, not form selection.</li>
            <li><a routerLink="/components/select">Select</a> — the same choice, collapsed into a dropdown.</li>
            <li><a routerLink="/components/checkbox">Checkbox</a> — a single multi-select input.</li>
            <li><a routerLink="/components/menu">Menu</a> — a triggered floating command list.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Feed it an <code>options</code> array. In selection mode drive it with
          the two-way <code>[(value)]</code> (always a <code>T[]</code>) or a
          reactive <code>FormControl&lt;T[] | null&gt;</code> via
          <code>[control]</code>; in action mode listen to
          <code>(itemAction)</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>[options]</code> — a <code>SelectionListOption[]</code> (<code>{{ '{' }} value, label, description?, icon?, disabled?, danger? {{ '}' }}</code>).</li>
            <li><code>mode</code> — <code>'selection'</code> (default, a listbox) or <code>'action'</code> (a button list).</li>
            <li><code>[multiple]</code> — defaults to <code>true</code>; set <code>false</code> for single-select (the value is still a 0/1-length array). Set it once — Material forbids changing it after init.</li>
            <li><code>[(value)]</code> / <code>[control]</code> — the selection, always <code>T[]</code>; <code>[compareWith]</code> for object values.</li>
            <li><code>label</code> / <code>ariaLabel</code> — the listbox <strong>must</strong> be named; <code>togglePosition</code>, <code>required</code>, <code>[disabled]</code> for the rest.</li>
            <li><code>(selectionChange)</code> emits the selected values; <code>(itemAction)</code> emits the clicked option in action mode.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>The list renders in the component host, so its Material tokens are rebound to the contract on the host class:</p>
          <ul>
            <li><code>--text-primary</code> — option label; <code>--text-secondary</code> — description line.</li>
            <li><code>--surface-2</code> — hover / focus state layer.</li>
            <li><code>--nav-active-bg</code> / <code>--nav-active-text</code> — selected-row tint (an AA-verified pair, shared with Nav List and Segmented).</li>
            <li><code>--error</code> / <code>--error-bg</code> — danger action rows.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Selection mode renders Material's <code>&lt;mat-selection-list&gt;</code>
            as an ARIA <code>listbox</code> with roving <kbd>tabindex</kbd> and the
            full APG listbox keyboard model (arrows to move, <kbd>Space</kbd> to
            toggle). A listbox must have an accessible name, so always pass
            <code>label</code> (linked via <code>aria-labelledby</code>) or
            <code>ariaLabel</code>. Action mode renders real
            <code>&lt;button&gt;</code> rows. Description lines use
            <code>--text-secondary</code> (not muted) so small secondary text
            clears AA.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Multi-select (lightweight)</h2>
          <div class="sl-grid">
            <rhombus-selection-list
              label="Toppings"
              [options]="toppings"
              [(value)]="picked"
            />
          </div>
          <p class="sl-output">Selected: <strong>{{ picked().join(', ') || '(none)' }}</strong></p>
        </section>

        <section class="showcase-section">
          <h2>Single-select with descriptions</h2>
          <div class="sl-grid">
            <rhombus-selection-list
              label="Plan"
              [multiple]="false"
              [options]="plans"
              [(value)]="plan"
            />
          </div>
          <p class="sl-output">Plan: <strong>{{ plan()[0] || '(none)' }}</strong></p>
        </section>

        <section class="showcase-section">
          <h2>Reactive forms with validation</h2>
          <p class="showcase-section__lead">
            Bind a <code>FormControl&lt;string[]&gt;</code> via <code>[control]</code>.
          </p>
          <div class="sl-form">
            <rhombus-selection-list
              label="Notify me about"
              [options]="notifications"
              [control]="notify"
            >
              <span rhombusError>
                @if (notify.hasError('required')) {
                  Pick at least one channel.
                }
              </span>
            </rhombus-selection-list>
            <button
              mat-flat-button
              type="button"
              [disabled]="notify.invalid"
              (click)="onSubmit()"
            >
              Save
            </button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Action mode</h2>
          <p class="showcase-section__lead">
            <code>mode="action"</code> renders a list of buttons; mark a
            destructive row with <code>danger</code>.
          </p>
          <div class="sl-grid">
            <rhombus-selection-list
              ariaLabel="Row actions"
              mode="action"
              [options]="rowActions"
              (itemAction)="onAction($any($event))"
            />
          </div>
          <p class="sl-output">Last action: <strong>{{ lastAction() ?? '(none)' }}</strong></p>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <div class="sl-grid">
            <rhombus-selection-list
              label="Locked"
              [options]="toppings"
              [disabled]="true"
            />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .sl-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      max-width: 640px;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .sl-output {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
    .sl-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 360px;
      align-items: flex-start;
    }
  `,
})
export default class SelectionListPageComponent {
  protected readonly usage = `import { RhombusSelectionListComponent, SelectionListOption } from '@rhombuskit/core';

@Component({
  selector: 'app-toppings',
  imports: [RhombusSelectionListComponent],
  template: \`
    <rhombus-selection-list
      label="Toppings"
      [options]="toppings"
      [(value)]="picked"
    />
  \`,
})
export class ToppingsComponent {
  readonly toppings: SelectionListOption[] = [
    { value: 'cheese', label: 'Cheese' },
    { value: 'mushroom', label: 'Mushroom' },
    { value: 'olive', label: 'Olive' },
  ];
  picked = signal<string[]>([]);
}`;

  protected readonly toppings: SelectionListOption[] = [
    { value: 'cheese', label: 'Cheese' },
    { value: 'mushroom', label: 'Mushroom', description: 'Fresh cremini' },
    { value: 'olive', label: 'Olive' },
    { value: 'pepper', label: 'Pepper' },
    { value: 'anchovy', label: 'Anchovy', disabled: true },
  ];

  protected readonly plans: SelectionListOption[] = [
    { value: 'free', label: 'Free', description: 'Up to 3 projects' },
    { value: 'pro', label: 'Pro', description: '$12/mo · unlimited projects' },
    { value: 'team', label: 'Team', description: '$40/mo · shared workspaces' },
  ];

  protected readonly notifications: SelectionListOption[] = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push notifications' },
  ];

  protected readonly rowActions: SelectionListOption[] = [
    { value: 'edit', label: 'Edit' },
    { value: 'duplicate', label: 'Duplicate' },
    { value: 'archive', label: 'Archive' },
    { value: 'delete', label: 'Delete', danger: true },
  ];

  protected readonly picked = signal<string[]>(['cheese']);
  protected readonly plan = signal<string[]>(['pro']);
  protected readonly lastAction = signal<string | null>(null);

  protected readonly notify = new FormControl<string[]>([], {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected onAction(option: SelectionListOption): void {
    this.lastAction.set(option.label);
  }

  protected onSubmit(): void {
    this.notify.markAsTouched();
  }
}
