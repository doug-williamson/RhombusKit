import { Injectable, inject } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { RhombusToastRef, ToastConfig, ToastVariant } from './toast.types';

const ASSERTIVE_VARIANTS: ReadonlySet<ToastVariant> = new Set([
  'warning',
  'error',
]);

/** Per-variant convenience options — message and variant are supplied by the method. */
type ToastOptions = Omit<ToastConfig, 'message' | 'variant'>;

/**
 * `RhombusToastService` — transient feedback messages, mirroring how
 * `RhombusConfirmService` wraps `MatDialog`. It wraps `MatSnackBar` for the
 * surface and the CDK `LiveAnnouncer` for the announcement, returning a
 * leak-free {@link RhombusToastRef}.
 *
 * Severity colours come from the `--toast-<variant>-bg/text` contract tokens,
 * applied via the `rhombus-toast--<variant>` panel class bridged in
 * `@rhombuskit/material-preset`.
 *
 * ```ts
 * private toast = inject(RhombusToastService);
 *
 * this.toast.success('Post published');
 * const ref = this.toast.show({ message: 'Saving…', duration: 0 });
 * // …later
 * ref.dismiss();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class RhombusToastService {
  private snackBar = inject(MatSnackBar);
  private liveAnnouncer = inject(LiveAnnouncer);

  /** Show a toast described by an explicit {@link ToastConfig}. */
  show(config: ToastConfig): RhombusToastRef {
    const variant = config.variant ?? 'info';
    const politeness =
      config.politeness ??
      (ASSERTIVE_VARIANTS.has(variant) ? 'assertive' : 'polite');

    const ref = this.snackBar.open(config.message, config.action, {
      duration: config.duration ?? 5000,
      panelClass: ['rhombus-toast', `rhombus-toast--${variant}`],
      // The message is announced explicitly through LiveAnnouncer below;
      // 'off' stops the snackbar's own aria-live region from double-announcing.
      politeness: 'off',
    });

    this.liveAnnouncer.announce(config.message, politeness);

    return {
      dismiss: () => ref.dismiss(),
      afterDismissed: (): Observable<void> =>
        ref.afterDismissed().pipe(map(() => undefined as void)),
      onAction: () => ref.onAction(),
    };
  }

  /** Show a neutral, informational toast. */
  info(message: string, opts?: ToastOptions): RhombusToastRef {
    return this.show({ ...opts, message, variant: 'info' });
  }

  /** Show a success toast. */
  success(message: string, opts?: ToastOptions): RhombusToastRef {
    return this.show({ ...opts, message, variant: 'success' });
  }

  /** Show a warning toast (announced assertively by default). */
  warning(message: string, opts?: ToastOptions): RhombusToastRef {
    return this.show({ ...opts, message, variant: 'warning' });
  }

  /** Show an error toast (announced assertively by default). */
  error(message: string, opts?: ToastOptions): RhombusToastRef {
    return this.show({ ...opts, message, variant: 'error' });
  }
}
