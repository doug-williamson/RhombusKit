import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import {
  RhombusChipDirective,
  RhombusChipGroupDirective,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-chip-page',
  standalone: true,
  imports: [
    RouterLink,
    MatChipsModule,
    MatIconModule,
    RhombusChipDirective,
    RhombusChipGroupDirective,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Chip" [hasUsage]="true" apiKey="RhombusChipDirective">
      <div overview class="overview">
        <p class="overview__lead">
          Chips are compact elements representing an input, attribute, or
          filterable option. <code>[rhombusChip]</code> and
          <code>[rhombusChipGroup]</code> are decoration directives applied to
          Material's <code>&lt;mat-chip-option&gt;</code> and
          <code>&lt;mat-chip-listbox&gt;</code>, adding variant colours through
          the token contract &mdash; toggle the theme above and the chips re-skin
          without touching markup.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <mat-chip-listbox rhombusChipGroup selection="single">
              @for (status of statuses; track status) {
                <mat-chip-option rhombusChip variant="primary" [value]="status">
                  {{ status }}
                </mat-chip-option>
              }
            </mat-chip-listbox>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use chips for a <strong>set of selectable options or filters</strong>
              &mdash; tags, statuses, categories rendered as a compact, wrapping row.
            </li>
            <li>
              When you want a <strong>radio- or checkbox-style choice that reads as
              tags</strong> rather than a form control &mdash; status pickers,
              category toggles, faceted filters.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a single on/off setting, use a
              <a routerLink="/components/switch">Switch</a> or
              <a routerLink="/components/checkbox">Checkbox</a>.
            </li>
            <li>
              For a mutually-exclusive choice in a form, use a
              <a routerLink="/components/radio">Radio</a> group or a
              <a routerLink="/components/select">Select</a>.
            </li>
            <li>
              For a static, non-interactive status label, use a
              <a routerLink="/components/badge">Badge</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/badge">Badge</a> &mdash; static status labels.</li>
            <li><a routerLink="/components/checkbox">Checkbox</a> &mdash; multi-select form control.</li>
            <li><a routerLink="/components/radio">Radio</a> &mdash; single-select form control.</li>
            <li><a routerLink="/components/select">Select</a> &mdash; single choice from a long list.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A chip group is two decoration directives: <code>[rhombusChipGroup]</code>
          on a <code>&lt;mat-chip-listbox&gt;</code> sets the
          <code>selection</code> mode and re-emits <code>selectionChange</code>,
          while <code>[rhombusChip]</code> on each
          <code>&lt;mat-chip-option&gt;</code> applies a colour
          <code>variant</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[rhombusChipGroup]</code> &mdash; put on a
              <code>&lt;mat-chip-listbox&gt;</code>. Drive it with
              <code>selection</code> (<code>none</code> | <code>single</code> |
              <code>multiple</code>) and read picks via
              <code>(selectionChange)</code>, which emits the selected value
              (single) or array of values (multiple).
            </li>
            <li>
              <code>[rhombusChip]</code> &mdash; put on each
              <code>&lt;mat-chip-option&gt;</code>. Set <code>variant</code>
              (<code>default</code> | <code>primary</code> | <code>success</code> |
              <code>warning</code> | <code>danger</code>) and <code>[value]</code>
              for selectable chips.
            </li>
            <li>
              These are <strong>directives, not wrappers</strong> &mdash; they decorate
              Material's elements in place so the listbox's
              <code>&#64;ContentChildren</code> queries still find the chip options.
            </li>
            <li>
              The chip's <strong>default content slot</strong> is its label text. For
              decorations, use Material's own directives:
              <code>matChipAvatar</code> for a leading icon and
              <code>matChipRemove</code> on a trailing button for removable chips
              &mdash; <code>[rhombusChip]</code> intentionally leaves those untouched.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Each <code>variant</code> rebinds Material's
            <code>--mat-chip-*</code> tokens to RhombusKit contract colours via
            the directive's <code>data-variant</code> host attribute. Override the
            contract tokens to re-skin every variant:
          </p>
          <ul>
            <li><code>--nav-active-bg</code> / <code>--nav-active-text</code> &mdash; primary chip (unselected).</li>
            <li><code>--btn-primary-bg</code> / <code>--btn-primary-text</code> &mdash; primary chip (selected).</li>
            <li><code>--status-published-bg</code> / <code>--status-published-text</code> &mdash; success variant.</li>
            <li><code>--status-draft-bg</code> / <code>--status-draft-text</code> &mdash; warning variant.</li>
            <li><code>--status-archived-bg</code> / <code>--status-archived-text</code> &mdash; danger variant.</li>
            <li><code>--font-sans</code> &mdash; chip-group font family.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            When <code>selection</code> is <code>single</code> or
            <code>multiple</code>, the group becomes a Material listbox
            (<code>role="listbox"</code> with <code>option</code> children):
            the listbox takes a single tab stop, chips are navigable with the
            arrow keys, and toggled with <kbd>Enter</kbd> / <kbd>Space</kbd>,
            with selection state exposed to assistive tech via
            <code>aria-selected</code>. With <code>selection="none"</code> the
            chips are decorative and not selectable. Pair any leading
            <code>matChipAvatar</code> icon with a visible text label so each
            option is announced clearly, and give every
            <code>matChipRemove</code> button an
            <code>aria-label</code> naming what it removes.
          </p>
        </section>
      </div>
      <div examples>
      <section class="showcase-section">
        <h2>Variants (decorative — selection="none")</h2>
        <mat-chip-listbox rhombusChipGroup selection="none">
          <mat-chip-option rhombusChip variant="default">Default</mat-chip-option>
          <mat-chip-option rhombusChip variant="primary">Primary</mat-chip-option>
          <mat-chip-option rhombusChip variant="success">Success</mat-chip-option>
          <mat-chip-option rhombusChip variant="warning">Warning</mat-chip-option>
          <mat-chip-option rhombusChip variant="danger">Danger</mat-chip-option>
        </mat-chip-listbox>
      </section>

      <section class="showcase-section">
        <h2>Single-select</h2>
        <p class="showcase-section__note">
          Picked: <strong>{{ singleChoice() ?? '—' }}</strong>
        </p>
        <mat-chip-listbox
          rhombusChipGroup
          selection="single"
          (selectionChange)="onSingleChange($event)"
        >
          @for (option of statuses; track option) {
            <mat-chip-option rhombusChip variant="primary" [value]="option">
              {{ option }}
            </mat-chip-option>
          }
        </mat-chip-listbox>
      </section>

      <section class="showcase-section">
        <h2>Multi-select</h2>
        <p class="showcase-section__note">
          Picked: <strong>{{ multiChoice().join(', ') || '—' }}</strong>
        </p>
        <mat-chip-listbox
          rhombusChipGroup
          selection="multiple"
          (selectionChange)="onMultiChange($event)"
        >
          @for (tag of tags; track tag) {
            <mat-chip-option rhombusChip variant="primary" [value]="tag">
              {{ tag }}
            </mat-chip-option>
          }
        </mat-chip-listbox>
      </section>

      <section class="showcase-section">
        <h2>With leading icons</h2>
        <mat-chip-listbox rhombusChipGroup selection="none">
          <mat-chip-option rhombusChip variant="success">
            <mat-icon matChipAvatar aria-hidden="true">check_circle</mat-icon>
            Published
          </mat-chip-option>
          <mat-chip-option rhombusChip variant="warning">
            <mat-icon matChipAvatar aria-hidden="true">schedule</mat-icon>
            Scheduled
          </mat-chip-option>
          <mat-chip-option rhombusChip variant="danger">
            <mat-icon matChipAvatar aria-hidden="true">archive</mat-icon>
            Archived
          </mat-chip-option>
        </mat-chip-listbox>
      </section>

      <section class="showcase-section">
        <h2>Removable</h2>
        <p class="showcase-section__note">
          Click the cancel icon to remove. {{ removedCount() }} removed so far.
        </p>
        <mat-chip-listbox rhombusChipGroup selection="none">
          @for (filter of activeFilters(); track filter) {
            <mat-chip-option
              rhombusChip
              variant="primary"
              (removed)="removeFilter(filter)"
            >
              {{ filter }}
              <button matChipRemove [attr.aria-label]="'Remove ' + filter">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-option>
          }
        </mat-chip-listbox>
      </section>

      <section class="showcase-section">
        <h2>Disabled</h2>
        <mat-chip-listbox rhombusChipGroup selection="single">
          <mat-chip-option rhombusChip variant="primary" disabled>
            Disabled
          </mat-chip-option>
          <mat-chip-option rhombusChip variant="primary" [value]="'active'">
            Active
          </mat-chip-option>
        </mat-chip-listbox>
      </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__note {
      font-family: var(--font-sans);
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: -0.5rem 0 1rem;

      strong {
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  `,
})
export default class ChipPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { MatChipsModule } from '@angular/material/chips';
import { RhombusChipDirective, RhombusChipGroupDirective } from '@rhombuskit/core';

@Component({
  selector: 'app-status-filter',
  imports: [MatChipsModule, RhombusChipDirective, RhombusChipGroupDirective],
  template: \`
    <mat-chip-listbox
      rhombusChipGroup
      selection="single"
      (selectionChange)="onPick($event)"
    >
      @for (status of statuses; track status) {
        <mat-chip-option rhombusChip variant="primary" [value]="status">
          {{ status }}
        </mat-chip-option>
      }
    </mat-chip-listbox>
  \`,
})
export class StatusFilterComponent {
  readonly statuses = ['Draft', 'Published', 'Scheduled', 'Archived'];

  onPick(value: unknown): void {
    /* apply filter… */
  }
}`;

  protected readonly statuses = ['Draft', 'Published', 'Scheduled', 'Archived'];
  protected readonly tags = ['design', 'engineering', 'product', 'ops'];

  protected readonly singleChoice = signal<string | null>(null);
  protected readonly multiChoice = signal<string[]>([]);
  protected readonly removedCount = signal<number>(0);
  protected readonly activeFilters = signal<string[]>([
    'recent',
    'starred',
    'unread',
    'shared with me',
  ]);

  protected onSingleChange(value: unknown): void {
    this.singleChoice.set(typeof value === 'string' ? value : null);
  }

  protected onMultiChange(value: unknown): void {
    this.multiChoice.set(Array.isArray(value) ? value : []);
  }

  protected removeFilter(filter: string): void {
    this.activeFilters.update((list) => list.filter((f) => f !== filter));
    this.removedCount.update((n) => n + 1);
  }
}
