import { Directive } from '@angular/core';

/**
 * Marker for the sidenav footer slot. Apply it to the element you project, e.g.
 *
 * ```html
 * <rhombus-app-shell>
 *   <nav shellNav>…</nav>
 *   <div shellNavFooter>…sign-out / collapse control…</div>
 * </rhombus-app-shell>
 * ```
 *
 * The shell both selects this content (`ng-content select="[shellNavFooter]"`)
 * and detects its presence (`contentChild`) so the footer region only renders
 * when something is projected into it.
 */
@Directive({
  selector: '[shellNavFooter]',
  standalone: true,
})
export class RhombusShellNavFooterDirective {}
