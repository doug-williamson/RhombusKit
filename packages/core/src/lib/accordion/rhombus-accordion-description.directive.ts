import { Directive } from '@angular/core';

/**
 * `[rhombusAccordionDescription]` — marks secondary header text projected into a
 * `<rhombus-accordion-panel>`, shown under the title. A semantic slot marker; it
 * carries no behaviour. Prefer the panel's `description` string input for the
 * simple text case.
 *
 * ```html
 * <rhombus-accordion-panel title="Security">
 *   <span rhombusAccordionDescription>Passwords, 2FA, sessions</span>
 *   …content…
 * </rhombus-accordion-panel>
 * ```
 */
@Directive({
  selector: '[rhombusAccordionDescription]',
  standalone: true,
})
export class RhombusAccordionDescriptionDirective {}
