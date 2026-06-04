import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RhombusDialogService } from '../dialog/rhombus-dialog.service';
import { RhombusConfirmDialogComponent } from './rhombus-confirm-dialog.component';
import type { ConfirmConfig } from './confirm-dialog.types';

@Injectable({ providedIn: 'root' })
export class RhombusConfirmService {
  private dialog = inject(RhombusDialogService);

  /**
   * Opens a confirmation dialog. Returns an Observable that emits `true` if the
   * user confirmed, `false` if they cancelled or dismissed (backdrop / escape).
   *
   * The Observable is the cancellable primitive — pair it with takeUntilDestroyed()
   * so a result arriving after the caller is torn down never fires a dead handler.
   *
   * Confirm-then-act pattern:
   *   this.confirm.confirm({ title, message, variant: 'danger' }).pipe(
   *     filter(Boolean),
   *     switchMap(() => this.store.delete(id)),
   *     takeUntilDestroyed(this.destroyRef),
   *   ).subscribe();
   *
   * Consumers who want async/await: await firstValueFrom(this.confirm.confirm({...}))
   */
  confirm(config: ConfirmConfig): Observable<boolean> {
    // Routes through RhombusDialogService so confirm shares the library's
    // dialog defaults (autoFocus/restoreFocus/maxWidth/panel class) and theming.
    const ref = this.dialog.open<boolean, ConfirmConfig>(
      RhombusConfirmDialogComponent,
      {
        data: config,
        width: '400px',
        panelClass: 'rhombus-confirm-dialog-panel',
      }
    );

    // afterClosed() emits the dialog close value, or undefined on
    // backdrop/escape dismissal. Map undefined → false so the contract is
    // strictly boolean.
    return ref.afterClosed().pipe(map((result) => result === true));
  }
}
