import { Directive } from '@angular/core';

/**
 * `[rhombusAccordionTitle]` — marks rich header title content projected into a
 * `<rhombus-accordion-panel>` (e.g. an icon + text + badge). A semantic slot
 * marker; it carries no behaviour. Prefer the panel's `title` string input for
 * the simple text case.
 *
 * ```html
 * <rhombus-accordion-panel>
 *   <span rhombusAccordionTitle><rhombus-icon name="lock" /> Security</span>
 *   …content…
 * </rhombus-accordion-panel>
 * ```
 */
@Directive({
  selector: '[rhombusAccordionTitle]',
  standalone: true,
})
export class RhombusAccordionTitleDirective {}
