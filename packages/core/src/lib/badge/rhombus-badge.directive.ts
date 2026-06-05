import { Directive, computed, input } from '@angular/core';
import { MatBadge, MatBadgePosition, MatBadgeSize } from '@angular/material/badge';

/**
 * Visual variant. `default` keeps Material's M3 defaults (error role).
 * Other variants rebind `--mat-badge-*` tokens to CONTRACT colours.
 */
export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

/**
 * `[rhombusBadge]` — RhombusKit's wrapper over Angular Material's `[matBadge]`.
 *
 * Composes `MatBadge` via `hostDirectives` so consumers don't need to
 * import both directives. All inputs are aliased with the `rhombusBadge*`
 * prefix (matching Material's own `matBadge*` convention) so they don't
 * collide with inputs of host components like `<rhombus-button>`, which
 * has its own `variant` and `size` inputs.
 *
 * The `variant` value is reflected to a `data-variant` host attribute that
 * `@rhombuskit/core/scss/badge` targets — variant styling stays out of TS.
 *
 * Usage:
 *   <button [rhombusBadge]="3" [rhombusBadgeVariant]="'primary'">Inbox</button>
 *   <mat-icon [rhombusBadge]="'!'" [rhombusBadgeVariant]="'danger'">notifications</mat-icon>
 *   <span [rhombusBadge]="'NEW'" [rhombusBadgeVariant]="'success'">Feature</span>
 */
@Directive({
  selector: '[rhombusBadge]',
  standalone: true,
  hostDirectives: [
    {
      directive: MatBadge,
      inputs: [
        'matBadge: rhombusBadge',
        'matBadgePosition: rhombusBadgePosition',
        'matBadgeSize: rhombusBadgeSize',
        'matBadgeHidden: rhombusBadgeHidden',
        'matBadgeOverlap: rhombusBadgeOverlap',
        'matBadgeDescription: rhombusBadgeDescription',
      ],
    },
  ],
  host: {
    class: 'rhombus-badge',
    '[attr.data-variant]': 'variant()',
  },
})
export class RhombusBadgeDirective {
  /**
   * Badge content. Aliased as `rhombusBadge` so the selector reads like a
   * one-shot binding: `[rhombusBadge]="count"`.
   */
  readonly content = input<string | number | null>(null, {
    alias: 'rhombusBadge',
  });

  /** Colour role, reflected to `data-variant`: `default` | `primary` | `success` | `warning` | `danger`. */
  readonly variant = input<BadgeVariant>('default', {
    alias: 'rhombusBadgeVariant',
  });
  /** Where the badge sits relative to its host; defaults to `'above after'`. */
  readonly position = input<MatBadgePosition>('above after', {
    alias: 'rhombusBadgePosition',
  });
  /** Badge size: `small` | `medium` (default) | `large`. */
  readonly size = input<MatBadgeSize>('medium', {
    alias: 'rhombusBadgeSize',
  });
  /** Hides the badge without removing it from the DOM. Defaults to `false`. */
  readonly hidden = input<boolean>(false, { alias: 'rhombusBadgeHidden' });
  /** Whether the badge overlaps its host element. Defaults to `true`. */
  readonly overlap = input<boolean>(true, { alias: 'rhombusBadgeOverlap' });

  /**
   * Exposed so consumers can introspect whether the badge currently has
   * renderable content. Useful for conditional layout.
   */
  protected readonly hasContent = computed(() => {
    const c = this.content();
    return c !== null && c !== undefined && `${c}` !== '';
  });
}
