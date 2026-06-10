import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import {
  RhombusChipDirective,
  RhombusChipGroupDirective,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-chip-page',
  standalone: true,
  imports: [
    MatChipsModule,
    MatIconModule,
    RhombusChipDirective,
    RhombusChipGroupDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Chip" apiKey="RhombusChipDirective">
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
          <h2>When to use</h2>
          <ul>
            <li>
              Use chips for a <strong>set of selectable options or filters</strong>
              &mdash; tags, statuses, categories. For a single on/off setting,
              prefer a checkbox or switch.
            </li>
            <li>
              Set <code>selection</code> on the group: <code>none</code> for
              decorative labels, <code>single</code> for radio-style choice, or
              <code>multiple</code> for multi-select. They are directives (not
              wrapping components) so Material's content queries can still find
              the chip children.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
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

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            When <code>selection</code> is <code>single</code> or
            <code>multiple</code>, the group becomes a Material listbox
            (<code>role="listbox"</code> with <code>option</code> children):
            chips are reachable with <kbd>Tab</kbd>, navigable with the arrow
            keys, and toggled with <kbd>Enter</kbd> / <kbd>Space</kbd>, with
            selection state exposed to assistive tech. Pair leading icons with a
            visible text label so each option is announced clearly.
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
