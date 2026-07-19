import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * `[rhombusReorderItem]` — the **required** per-row template of a
 * `<rhombus-reorder-list>`. Apply it to an `<ng-template>`; the list renders it
 * once per item with the item as `$implicit` and its index as `index`:
 *
 * ```html
 * <rhombus-reorder-list [(items)]="rows">
 *   <ng-template rhombusReorderItem let-item let-i="index">
 *     {{ i + 1 }}. {{ item.name }}
 *   </ng-template>
 * </rhombus-reorder-list>
 * ```
 */
@Directive({
  selector: '[rhombusReorderItem]',
  standalone: true,
})
export class RhombusReorderItemDirective<T = unknown> {
  readonly template = inject(TemplateRef<RhombusReorderItemContext<T>>);
}

/** The template context a `[rhombusReorderItem]` row receives. */
export interface RhombusReorderItemContext<T> {
  $implicit: T;
  index: number;
}
