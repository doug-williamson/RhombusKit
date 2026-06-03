import { Directive } from '@angular/core';

/**
 * Marker for the optional right-rail / aside slot (e.g. a docs table-of-contents).
 * Apply it to the element you project, e.g.
 *
 * ```html
 * <rhombus-app-shell>
 *   <aside shellAside>…on-page table of contents…</aside>
 * </rhombus-app-shell>
 * ```
 *
 * The shell both selects this content (`ng-content select="[shellAside]"`) and
 * detects its presence (`contentChild`): absent → 2-column layout (sidenav +
 * main), present → 3-column layout (sidenav + main + aside). The shell provides
 * the region only; the aside's scroll-spy / sticky behaviour is consumer content.
 */
@Directive({
  selector: '[shellAside]',
  standalone: true,
})
export class RhombusShellAsideDirective {}
