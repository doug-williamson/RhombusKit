import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  AutocompleteOption,
  RhombusAutocompleteComponent,
  RhombusCodeBlockComponent,
  RhombusErrorDirective,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

interface User {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-autocomplete-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusAutocompleteComponent,
    RhombusErrorDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Autocomplete"
      [hasUsage]="true"
      apiKey="RhombusAutocompleteComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          An autocomplete is a text field that filters a list of suggestions as
          the user types. RhombusKit's
          <code>&lt;rhombus-autocomplete&gt;</code> wraps Material's
          <code>&lt;mat-autocomplete&gt;</code> in the same form-field shell as
          input and select, and routes its panel colour through the token
          contract so it re-skins with the active theme. It is free-text by
          default, so the field accepts a typed value even when nothing matches.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-autocomplete
              label="Fruit"
              placeholder="Start typing…"
              [options]="fruits"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              When there are <strong>too many options to scroll</strong> a
              select comfortably, and filtering by typing is faster.
            </li>
            <li>
              For <strong>server-backed search</strong> — set
              <code>[filterWith]="null"</code> and refetch from
              <code>(queryChange)</code>.
            </li>
            <li>
              When the user may enter a <strong>value not on the list</strong>
              (free text), which the default <code>requireSelection=false</code>
              allows.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a short, fixed list of choices, use a
              <a routerLink="/components/select">Select</a> — no typing needed.
            </li>
            <li>
              For unconstrained free text with no suggestions, use an
              <a routerLink="/components/input">Input</a>.
            </li>
            <li>
              To build a set of tags/tokens from free text, use
              <a routerLink="/components/tag-input">Tag Input</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/select">Select</a> — a fixed-list dropdown, no type-ahead.</li>
            <li><a routerLink="/components/input">Input</a> — free text with no suggestion list.</li>
            <li><a routerLink="/components/tag-input">Tag Input</a> — build a list of tokens from free text.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The autocomplete owns its inner <code>&lt;input&gt;</code> and
          <code>&lt;mat-autocomplete&gt;</code>. Feed it <code>options</code> and
          either let it manage its own value or bind a reactive
          <code>FormControl&lt;T | string | null&gt;</code> via
          <code>[control]</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>label</code> / <code>placeholder</code> — the floating label and empty-state text.</li>
            <li><code>[options]</code> — an <code>AutocompleteOption[]</code> (<code>{{ '{' }} value, label, disabled? {{ '}' }}</code>).</li>
            <li><code>[filterWith]</code> — the match predicate; defaults to a case-insensitive label substring. Set <code>null</code> for server-side search (options treated as already filtered).</li>
            <li><code>[displayWith]</code> — maps the selected value to display text; <strong>required for object-valued options</strong>.</li>
            <li><code>[requireSelection]</code> (default <code>false</code>), <code>[minChars]</code>, <code>[debounceMs]</code>, <code>[loading]</code>, <code>noResultsText</code>.</li>
            <li><code>[control]</code> drives it from reactive forms (the standalone <code>[disabled]</code> is ignored once a control is bound); <code>[required]</code>, <code>hint</code>, <code>appearance</code>, <code>size</code> for the field shell.</li>
            <li><strong>Projected slots</strong> — <code>[rhombusError]</code> (error subscript), <code>[matPrefix]/[matIconPrefix]</code>, <code>[matSuffix]/[matIconSuffix]</code>.</li>
            <li><code>(optionSelected)</code> emits the picked value; <code>(queryChange)</code> emits the debounced query text.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The suggestion panel renders in a CDK overlay appended to
            <code>&lt;body&gt;</code>, so panel overrides target the
            <code>.cdk-overlay-container</code> scope, not the host. Everything
            routes through these contract tokens:
          </p>
          <ul>
            <li><code>--text-primary</code> — option label colour.</li>
            <li><code>--text-accent</code> — active/selected option label.</li>
            <li><code>--surface-0</code> — panel background.</li>
            <li><code>--surface-1</code> / <code>--surface-2</code> — hover / focus state layers.</li>
            <li><code>--text-secondary</code> — loading / no-results message.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Built on Material's <code>&lt;mat-autocomplete&gt;</code>, so the
            field is an ARIA combobox: the input carries
            <code>role="combobox"</code> with <code>aria-expanded</code> and
            <code>aria-activedescendant</code>, and the panel is a listbox
            navigable with the arrow keys (<kbd>Enter</kbd> selects,
            <kbd>Esc</kbd> closes). The <code>label</code> becomes the field's
            accessible name, so always supply one. Because disabled panel options
            (loading and no-results) aren't reliably announced, the component
            mirrors the result count, loading, and no-results state into a
            visually-hidden <code>aria-live="polite"</code> region.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Basic filtering</h2>
          <div class="ac-grid">
            <rhombus-autocomplete
              label="Fruit"
              placeholder="Start typing…"
              [options]="fruits"
              (optionSelected)="lastPick.set($any($event))"
            />
          </div>
          <p class="ac-output">
            Last selection: <strong>{{ lastPick() ?? '(none)' }}</strong>
          </p>
        </section>

        <section class="showcase-section">
          <h2>Object options with displayWith</h2>
          <p class="showcase-section__lead">
            When the value is an object, supply <code>[displayWith]</code> so the
            field renders readable text.
          </p>
          <div class="ac-grid">
            <rhombus-autocomplete
              label="Assignee"
              placeholder="Search people…"
              [options]="userOptions"
              [displayWith]="displayUser"
              (optionSelected)="lastUser.set($any($event))"
            />
          </div>
          <p class="ac-output">
            Assigned to: <strong>{{ lastUser()?.name ?? '(none)' }}</strong>
          </p>
        </section>

        <section class="showcase-section">
          <h2>Server-side search</h2>
          <p class="showcase-section__lead">
            Set <code>[filterWith]="null"</code>, refetch from
            <code>(queryChange)</code>, and show the spinner via
            <code>[loading]</code>. This demo resolves after a short delay.
          </p>
          <div class="ac-grid">
            <rhombus-autocomplete
              label="Country"
              placeholder="Type at least 2 letters…"
              [options]="countryResults()"
              [filterWith]="null"
              [minChars]="2"
              [debounceMs]="250"
              [loading]="searching()"
              (queryChange)="onCountrySearch($event)"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Require a selection</h2>
          <p class="showcase-section__lead">
            <code>[requireSelection]="true"</code> clears any free text that
            doesn't match an option when the field loses focus.
          </p>
          <div class="ac-grid">
            <rhombus-autocomplete
              label="Language"
              placeholder="Pick from the list"
              [options]="languages"
              [requireSelection]="true"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Reactive forms with validation</h2>
          <p class="showcase-section__lead">
            Pass a <code>FormControl</code> via <code>[control]</code>.
          </p>
          <div class="ac-form">
            <rhombus-autocomplete
              label="Favourite fruit"
              placeholder="Start typing…"
              [options]="fruits"
              [control]="favourite"
            >
              <span rhombusError>
                @if (favourite.hasError('required')) {
                  Choose a fruit before submitting.
                }
              </span>
            </rhombus-autocomplete>
            <button
              mat-flat-button
              type="button"
              [disabled]="favourite.invalid"
              (click)="onSubmit()"
            >
              Submit
            </button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <div class="ac-grid">
            <rhombus-autocomplete
              label="Locked"
              placeholder="Cannot change"
              [options]="fruits"
              [disabled]="true"
            />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .ac-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .ac-output {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
    .ac-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 360px;
      align-items: flex-start;
    }
  `,
})
export default class AutocompletePageComponent {
  /** Minimal import + usage snippet shown in the Usage tab. */
  protected readonly usage = `import { RhombusAutocompleteComponent, AutocompleteOption } from '@rhombuskit/core';

@Component({
  selector: 'app-fruit-search',
  imports: [RhombusAutocompleteComponent],
  template: \`
    <rhombus-autocomplete
      label="Fruit"
      placeholder="Start typing…"
      [options]="fruits"
    />
  \`,
})
export class FruitSearchComponent {
  readonly fruits: AutocompleteOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];
}`;

  protected readonly fruits: AutocompleteOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'apricot', label: 'Apricot' },
    { value: 'banana', label: 'Banana' },
    { value: 'blackberry', label: 'Blackberry' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'grape', label: 'Grape' },
    { value: 'mango', label: 'Mango' },
    { value: 'orange', label: 'Orange' },
    { value: 'peach', label: 'Peach' },
    { value: 'pear', label: 'Pear' },
  ];

  protected readonly languages: AutocompleteOption[] = [
    { value: 'ts', label: 'TypeScript' },
    { value: 'rust', label: 'Rust' },
    { value: 'go', label: 'Go' },
    { value: 'python', label: 'Python' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
  ];

  protected readonly userOptions: AutocompleteOption<User>[] = [
    { value: { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' }, label: 'Ada Lovelace' },
    { value: { id: '2', name: 'Alan Turing', email: 'alan@example.com' }, label: 'Alan Turing' },
    { value: { id: '3', name: 'Grace Hopper', email: 'grace@example.com' }, label: 'Grace Hopper' },
    { value: { id: '4', name: 'Katherine Johnson', email: 'kj@example.com' }, label: 'Katherine Johnson' },
  ];

  /** Object options need an explicit display mapper. */
  protected readonly displayUser = (value: User | string | null): string =>
    value && typeof value === 'object' ? value.name : (value ?? '');

  private readonly allCountries = [
    'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada',
    'Chile', 'China', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany',
    'Greece', 'India', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Kenya',
    'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Portugal', 'Spain',
    'Sweden', 'Switzerland', 'Thailand', 'United Kingdom', 'United States',
  ];

  protected readonly countryResults = signal<AutocompleteOption[]>([]);
  protected readonly searching = signal(false);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly lastPick = signal<string | null>(null);
  protected readonly lastUser = signal<User | null>(null);

  protected readonly favourite = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });

  /** Simulates a debounced server round-trip against `queryChange`. */
  protected onCountrySearch(query: string): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searching.set(true);
    this.searchTimer = setTimeout(() => {
      const q = query.toLowerCase();
      this.countryResults.set(
        this.allCountries
          .filter((c) => c.toLowerCase().includes(q))
          .map((c) => ({ value: c.toLowerCase(), label: c }))
      );
      this.searching.set(false);
    }, 400);
  }

  protected onSubmit(): void {
    this.favourite.markAllAsTouched();
  }
}
