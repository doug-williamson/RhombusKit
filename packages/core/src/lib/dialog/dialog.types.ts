import type { Observable } from 'rxjs';

/** Options for {@link RhombusDialogService.open}. A lean subset of `MatDialogConfig`. */
export interface RhombusDialogConfig<D = unknown> {
  /** Data injected into the opened component via `MAT_DIALOG_DATA`. */
  data?: D;
  /** Dialog width. Defaults to `'480px'`. */
  width?: string;
  /** Maximum width. Defaults to `'90vw'`. */
  maxWidth?: string;
  /** When `true`, backdrop click / Escape do not close the dialog. Defaults to `false`. */
  disableClose?: boolean;
  /** Extra panel class(es); merged with the base `rhombus-dialog-panel`. */
  panelClass?: string | string[];
  /** Accessible label for dialogs that have no visible `mat-dialog-title`. */
  ariaLabel?: string;
}

/**
 * Leak-free handle to an open dialog. Wraps Material's `MatDialogRef` so
 * consumers never depend on Angular Material types directly.
 */
export interface RhombusDialogRef<R = unknown> {
  /** Close the dialog, optionally returning a result to `afterClosed()`. */
  close(result?: R): void;
  /** Emits the close result (or `undefined` on backdrop/Escape) then completes. */
  afterClosed(): Observable<R | undefined>;
}
