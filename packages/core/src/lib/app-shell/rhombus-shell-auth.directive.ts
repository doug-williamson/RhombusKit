import { Directive } from '@angular/core';

/**
 * Marker for the header auth slot. Apply it to the element you project, e.g.
 *
 * ```html
 * <rhombus-app-shell>
 *   <div shellAuthSlot>…avatar menu / sign-in button…</div>
 * </rhombus-app-shell>
 * ```
 *
 * The shell both selects this content (`ng-content select="[shellAuthSlot]"`)
 * and detects its presence (`contentChild`) so the auth region only renders
 * when something is projected — replacing FolioKit's `config().showAuth` flag.
 */
@Directive({
  selector: '[shellAuthSlot]',
  standalone: true,
})
export class RhombusShellAuthDirective {}
