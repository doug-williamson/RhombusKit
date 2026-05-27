import { Directive, computed, input } from '@angular/core';

/**
 * Visual variant. `default` keeps Material's neutral surface; the others
 * rebind `--mat-chip-*` tokens to CONTRACT colours via SCSS keyed off the
 * directive's `data-variant` host attribute.
 */
export type ChipVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

/**
 * `[rhombusChip]` — RhombusKit decoration directive applied to
 * `<mat-chip-option>`. Adds variant styling and a stable host class.
 *
 * Applied to `<mat-chip-option>` rather than wrapping it because Angular
 * Material's `<mat-chip-listbox>` uses `@ContentChildren(MatChipOption)`
 * to discover its chips. Content queries traverse projected content but
 * NOT view-DOM of nested components — if we wrap mat-chip-option inside
 * a `<rhombus-chip>` component, the listbox can't find it and selection
 * + ARIA fail silently.
 *
 * Usage:
 *   <rhombus-chip-group selection="single">
 *     <mat-chip-option rhombusChip variant="primary" value="draft">
 *       Draft
 *     </mat-chip-option>
 *   </rhombus-chip-group>
 *
 * For removable / leading-icon decorations, use Material's existing
 * `matChipRemove` and `matChipAvatar` directives -- this directive
 * intentionally stays out of their way.
 */
@Directive({
  selector: 'mat-chip-option[rhombusChip], mat-chip[rhombusChip], mat-chip-row[rhombusChip]',
  standalone: true,
  host: {
    class: 'rhombus-chip',
    '[attr.data-variant]': 'variant()',
  },
})
export class RhombusChipDirective {
  readonly variant = input<ChipVariant>('default');

  /**
   * Convenience signal: classes the host element will receive. Currently
   * derived from variant alone but kept as a separate signal so future
   * size / density modifiers can extend it without churning consumers.
   */
  protected readonly hostClasses = computed(() => `rhombus-chip rhombus-chip--${this.variant()}`);
}
