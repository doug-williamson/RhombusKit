import { Directive } from '@angular/core';

/**
 * `[rhombusDialogActions]` — marks the footer action row projected into
 * `<rhombus-dialog>`. A semantic slot marker (mirrors the app-shell slot
 * directives); it carries no behaviour of its own.
 *
 * ```html
 * <rhombus-dialog [title]="'Delete item?'">
 *   <p>This cannot be undone.</p>
 *   <div rhombusDialogActions>
 *     <rhombus-button appearance="text" (click)="ref.close(false)">Cancel</rhombus-button>
 *     <rhombus-button variant="danger" (click)="ref.close(true)">Delete</rhombus-button>
 *   </div>
 * </rhombus-dialog>
 * ```
 */
@Directive({
  selector: '[rhombusDialogActions]',
  standalone: true,
})
export class RhombusDialogActionsDirective {}
