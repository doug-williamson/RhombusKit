import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { MatCardAppearance, MatCardModule } from '@angular/material/card';

/**
 * Visual variant. `elevated` is the M3-correct term for Material's
 * `raised` appearance; RhombusKit normalizes the public name.
 */
export type CardVariant = 'elevated' | 'outlined' | 'filled';

/** Inner padding scale for the card body. */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * `<rhombus-card>` — RhombusKit wrapper over Material's `<mat-card>`.
 *
 * Slots:
 *   <span slot="title">…</span>      → mat-card-title
 *   <span slot="subtitle">…</span>   → mat-card-subtitle
 *   <ng-content>                     → mat-card-content (default body)
 *   <div slot="actions">…</div>      → mat-card-actions (footer)
 *
 * If no `[slot=title]` content is projected the header collapses. Set
 * `[hasHeader]="false"` explicitly to also drop the heading region for
 * cards that are pure body + actions.
 */
@Component({
  selector: 'rhombus-card',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-card.component.scss',
  template: `
    <mat-card [appearance]="matAppearance()" [class]="hostClasses()">
      @if (hasHeader()) {
        <mat-card-header class="rhombus-card__header">
          <mat-card-title>
            <ng-content select="[slot=title]" />
          </mat-card-title>
          <mat-card-subtitle>
            <ng-content select="[slot=subtitle]" />
          </mat-card-subtitle>
        </mat-card-header>
      }
      <mat-card-content class="rhombus-card__content">
        <ng-content />
      </mat-card-content>
      <mat-card-actions class="rhombus-card__actions" align="end">
        <ng-content select="[slot=actions]" />
      </mat-card-actions>
    </mat-card>
  `,
})
export class RhombusCardComponent {
  /** Visual variant: `elevated` (default) | `outlined` | `filled`. */
  readonly variant = input<CardVariant>('elevated');
  /** Whether to render the title/subtitle header region. Defaults to `true`. */
  readonly hasHeader = input<boolean>(true);
  /** Inner padding scale for the card body: `none` | `sm` | `md` (default) | `lg`. */
  readonly padding = input<CardPadding>('md');

  /**
   * Translate RhombusKit's `elevated` (M3 vocabulary) into Material's
   * `raised` value. `outlined` and `filled` pass through unchanged.
   */
  protected readonly matAppearance = computed<MatCardAppearance>(() => {
    const map: Record<CardVariant, MatCardAppearance> = {
      elevated: 'raised',
      outlined: 'outlined',
      filled: 'filled',
    };
    return map[this.variant()];
  });

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-card',
      `rhombus-card--${this.variant()}`,
      `rhombus-card--padding-${this.padding()}`,
    ].join(' ')
  );
}
