import { Directive } from '@angular/core';

/**
 * Marker directive for a custom data-table empty state. Apply it to the
 * element you project, e.g.
 *
 * ```html
 * <rhombus-data-table [data]="[]" [columns]="cols">
 *   <div rhombusEmptyState>…custom empty content + CTA…</div>
 * </rhombus-data-table>
 * ```
 *
 * The table both selects this content (`ng-content select="[rhombusEmptyState]"`)
 * and detects its presence (`contentChild`) to decide whether to render the
 * built-in default empty block.
 */
@Directive({
  selector: '[rhombusEmptyState]',
  standalone: true,
})
export class RhombusEmptyStateDirective {}
