import { Directive } from '@angular/core';

/**
 * Marker for the bottom-navigation slot, used when the shell runs in
 * `navMode="bottom"`. Apply it to the projected bar:
 *
 * ```html
 * <rhombus-app-shell navMode="bottom" frame="phone">
 *   <rhombus-bottom-nav shellBottomNav [items]="navItems" />
 * </rhombus-app-shell>
 * ```
 *
 * The shell selects this content (`ng-content select="[shellBottomNav]"`) and
 * detects its presence (`contentChild`) to render the fixed bottom region.
 */
@Directive({
  selector: '[shellBottomNav]',
  standalone: true,
})
export class RhombusShellBottomNavDirective {}
