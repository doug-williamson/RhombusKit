import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * `[rhombusReorderEmpty]` — an optional template shown by
 * `<rhombus-reorder-list>` when it has no items. Apply it to an `<ng-template>`:
 *
 * ```html
 * <rhombus-reorder-list [(items)]="rows">
 *   <ng-template rhombusReorderItem let-item>{{ item }}</ng-template>
 *   <ng-template rhombusReorderEmpty>Nothing to sort yet.</ng-template>
 * </rhombus-reorder-list>
 * ```
 */
@Directive({
  selector: '[rhombusReorderEmpty]',
  standalone: true,
})
export class RhombusReorderEmptyDirective {
  readonly template = inject(TemplateRef);
}
