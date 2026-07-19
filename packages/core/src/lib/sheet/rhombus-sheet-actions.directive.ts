import { Directive } from '@angular/core';

/**
 * `[rhombusSheetActions]` — marks the footer action row projected into
 * `<rhombus-sheet>`. A semantic slot marker (mirrors `[rhombusDialogActions]`);
 * it carries no behaviour of its own.
 *
 * ```html
 * <rhombus-sheet title="Filters">
 *   <!-- body -->
 *   <div rhombusSheetActions>
 *     <rhombus-button appearance="text" rhombusSheetClose>Cancel</rhombus-button>
 *     <rhombus-button (click)="apply()">Apply</rhombus-button>
 *   </div>
 * </rhombus-sheet>
 * ```
 */
@Directive({
  selector: '[rhombusSheetActions]',
  standalone: true,
})
export class RhombusSheetActionsDirective {}
