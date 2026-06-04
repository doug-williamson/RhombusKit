import { Injectable, inject } from '@angular/core';
import type { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import type { Observable } from 'rxjs';
import type { RhombusDialogConfig, RhombusDialogRef } from './dialog.types';

const BASE_PANEL_CLASS = 'rhombus-dialog-panel';

/**
 * `RhombusDialogService` — opens a component as a RhombusKit-themed dialog.
 * A thin wrapper over `MatDialog` that applies the library's defaults
 * (`autoFocus: 'dialog'`, `restoreFocus`, sensible width, the
 * `rhombus-dialog-panel` class) and returns a leak-free
 * {@link RhombusDialogRef}. Pair it with the `<rhombus-dialog>` chrome for a
 * consistent surface.
 *
 * ```ts
 * private dialog = inject(RhombusDialogService);
 *
 * const ref = this.dialog.open<string>(RenameDialogComponent, { data: { name } });
 * ref.afterClosed().subscribe((newName) => { ... });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class RhombusDialogService {
  private dialog = inject(MatDialog);

  /** Open `component` as a dialog. `R` is the close-result type, `D` the data type. */
  open<R = unknown, D = unknown>(
    component: ComponentType<unknown>,
    config: RhombusDialogConfig<D> = {}
  ): RhombusDialogRef<R> {
    const extraPanelClasses = config.panelClass
      ? Array.isArray(config.panelClass)
        ? config.panelClass
        : [config.panelClass]
      : [];

    const ref = this.dialog.open<unknown, D, R>(component, {
      data: config.data,
      width: config.width ?? '480px',
      maxWidth: config.maxWidth ?? '90vw',
      disableClose: config.disableClose ?? false,
      ariaLabel: config.ariaLabel,
      autoFocus: 'dialog',
      restoreFocus: true,
      panelClass: [BASE_PANEL_CLASS, ...extraPanelClasses],
    });

    return {
      close: (result?: R) => ref.close(result),
      afterClosed: (): Observable<R | undefined> => ref.afterClosed(),
    };
  }
}
