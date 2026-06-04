import { Directive } from '@angular/core';

/**
 * Marker for a form-field error message. Project it into `<rhombus-input>`,
 * `<rhombus-textarea>`, or `<rhombus-select>`; the host surfaces it through
 * Material's `<mat-error>`, which reveals it once the bound control is invalid
 * and touched and wires `aria-describedby` so assistive tech announces it.
 *
 * ```html
 * <rhombus-input label="Email" [control]="email">
 *   <span rhombusError>Email is required.</span>
 * </rhombus-input>
 * ```
 *
 * Replaces the pre-1.0 `slot="error"` convention, whose name implied native
 * shadow-DOM slotting that never applied in this (emulation-free) context.
 */
@Directive({
  selector: '[rhombusError]',
  standalone: true,
})
export class RhombusErrorDirective {}
