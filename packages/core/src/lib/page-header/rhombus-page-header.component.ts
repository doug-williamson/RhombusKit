import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { RhombusChipDirective } from '../chip/rhombus-chip.directive';

/**
 * `<rhombus-page-header>` — a leaf composite for the top of a page: a required
 * title with an optional badge and description, plus an actions slot.
 *
 * Ported from FolioKit's `docs-page-header`, swapping its `DOCS_PAGE_META` DI
 * token for signal inputs and re-homing the Tailwind / `--mat-sys-*` styling
 * onto BEM + the @rhombuskit/tokens CONTRACT.
 *
 * Slots:
 *   <… slot="actions">…</…>  → trailing actions region (collapses when empty)
 *
 * The badge composes the existing chip: a bare `<mat-chip rhombusChip>` is a
 * non-interactive display badge. Its colour is owned entirely by
 * `[rhombusChip]` + the global chips bridge — this component authors no chip
 * styling. `variant="primary"` (unselected) is the closest analog to the old
 * `primary-container` badge.
 */
@Component({
  selector: 'rhombus-page-header',
  standalone: true,
  imports: [MatChipsModule, RhombusChipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-page-header.component.scss',
  template: `
    <header class="rhombus-page-header">
      <div class="rhombus-page-header__main">
        <div class="rhombus-page-header__heading-row">
          <h1 class="rhombus-page-header__title">{{ title() }}</h1>
          @if (badge()) {
            <mat-chip rhombusChip variant="primary" disableRipple>{{ badge() }}</mat-chip>
          }
        </div>
        @if (description()) {
          <p class="rhombus-page-header__description">{{ description() }}</p>
        }
      </div>
      <div class="rhombus-page-header__actions">
        <ng-content select="[slot=actions]" />
      </div>
    </header>
  `,
})
export class RhombusPageHeaderComponent {
  /** Page title rendered as the `<h1>` heading (required). */
  readonly title = input.required<string>();
  /** Optional badge text shown beside the title as a non-interactive chip. */
  readonly badge = input<string>();
  /** Optional descriptive text shown below the title. */
  readonly description = input<string>();
}
