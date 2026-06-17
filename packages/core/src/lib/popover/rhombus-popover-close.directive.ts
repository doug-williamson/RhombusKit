// packages/core/src/lib/popover/rhombus-popover-close.directive.ts
import { Directive, inject } from '@angular/core';
import { RhombusPopoverComponent } from './rhombus-popover.component';

/**
 * Closes the enclosing `<rhombus-popover>` when the host element is clicked.
 * Works on projected content because the panel content keeps the popover in its
 * injector hierarchy. Usage: `<button rhombusPopoverClose>Done</button>`.
 */
@Directive({
  selector: '[rhombusPopoverClose]',
  standalone: true,
  host: { '(click)': 'popover.close()' },
})
export class RhombusPopoverCloseDirective {
  protected readonly popover = inject(RhombusPopoverComponent);
}
