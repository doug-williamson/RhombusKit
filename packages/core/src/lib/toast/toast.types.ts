import type { Observable } from 'rxjs';

/** Severity of a toast; selects the `--toast-<variant>-*` colour pair. */
export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

/** Options for {@link RhombusToastService.show}. */
export interface ToastConfig {
  /** The message to display and announce. */
  message: string;
  /** Severity. Defaults to `'info'`. */
  variant?: ToastVariant;
  /** Auto-dismiss delay in milliseconds. Defaults to `5000`; `0` keeps it sticky. */
  duration?: number;
  /** Optional action button label (e.g. `'Undo'`). */
  action?: string;
  /**
   * Screen-reader urgency. Defaults to `'assertive'` for `warning`/`error` and
   * `'polite'` otherwise.
   */
  politeness?: 'polite' | 'assertive';
}

/**
 * Leak-free handle to an open toast. Wraps Material's `MatSnackBarRef` so
 * consumers never depend on Angular Material types directly.
 */
export interface RhombusToastRef {
  /** Dismiss the toast immediately. */
  dismiss(): void;
  /** Emits (and completes) once the toast has closed. */
  afterDismissed(): Observable<void>;
  /** Emits when the action button is activated. */
  onAction(): Observable<void>;
}
