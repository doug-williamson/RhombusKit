import { Directive, inject } from '@angular/core';
import { RhombusSheetRef } from './rhombus-sheet-ref';

/**
 * Closes the enclosing sheet when the host element is clicked (running the
 * slide-out animation via the ref). Usage: `<button rhombusSheetClose>Cancel</button>`.
 * Must be used inside a sheet opened by {@link RhombusSheetService}; injecting
 * the {@link RhombusSheetRef} throws if it is absent.
 */
@Directive({
  selector: '[rhombusSheetClose]',
  standalone: true,
  host: { '(click)': 'sheetRef.close()' },
})
export class RhombusSheetCloseDirective {
  protected readonly sheetRef = inject(RhombusSheetRef);
}
