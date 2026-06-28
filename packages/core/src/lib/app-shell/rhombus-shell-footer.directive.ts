import { Directive } from '@angular/core';

/**
 * Marker for the optional shell footer slot (e.g. a status bar, legal links, or a
 * persistent action row). Apply it to the element you project, e.g.
 *
 * ```html
 * <rhombus-app-shell>
 *   <main>…routed content…</main>
 *   <footer shellFooter>© 2026 Acme · v1.9.0</footer>
 * </rhombus-app-shell>
 * ```
 *
 * The shell both selects this content (`ng-content select="[shellFooter]"`) and
 * detects its presence (`contentChild`), so the footer region only renders when
 * something is projected into it. The footer is pinned below the main scroll
 * region (it does not scroll with the content) and spans the content column:
 * - `navMode="sidenav"` → it sits to the right of the sidenav, aligned with main.
 * - `navMode="bottom"` → it sits above the bottom nav bar.
 *
 * The shell provides the pinned region only; the footer's own content and layout
 * are consumer-owned. Consumers no longer need to style the private
 * `.rhombus-app-shell__main` to pin a footer.
 */
@Directive({
  selector: '[shellFooter]',
  standalone: true,
})
export class RhombusShellFooterDirective {}
