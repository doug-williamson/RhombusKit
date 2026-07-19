import { Injectable, inject } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay, GlobalPositionStrategy } from '@angular/cdk/overlay';
import type { ComponentType } from '@angular/cdk/portal';
import type { TemplateRef } from '@angular/core';
import { RHOMBUS_SHEET_DATA, RhombusSheetRef } from './rhombus-sheet-ref';
import type { RhombusSheetConfig, SheetSide } from './sheet.types';

const BASE_PANEL_CLASS = 'rhombus-sheet-panel';

/**
 * `RhombusSheetService` — opens a component (or template) as an edge-anchored
 * slide-over sheet / drawer.
 *
 * Built on `@angular/cdk/dialog` `Dialog` (scrim, focus-trap, focus-restore,
 * scroll-block, `role="dialog"` + `aria-modal`) plus a
 * `GlobalPositionStrategy` to pin the panel to an edge — **not** `MatDialog`,
 * which centres its panel and hard-codes an `@angular/animations` transition.
 * No new peer dependency. The returned {@link RhombusSheetRef} owns the
 * CSS-only exit animation (see D9). Pair it with the `<rhombus-sheet>` chrome.
 *
 * ```ts
 * private sheet = inject(RhombusSheetService);
 *
 * const ref = this.sheet.open<Filters>(FilterSheetComponent, {
 *   side: 'right',
 *   data: { applied },
 * });
 * ref.afterClosed().subscribe((filters) => { ... });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class RhombusSheetService {
  private dialog = inject(Dialog);
  private overlay = inject(Overlay);

  /** Open `content` as a sheet. `R` is the close-result type, `D` the data type. */
  open<R = unknown, D = unknown>(
    content: ComponentType<unknown> | TemplateRef<unknown>,
    config: RhombusSheetConfig<D> = {}
  ): RhombusSheetRef<R> {
    const side = config.side ?? 'right';
    const extraPanelClasses = config.panelClass
      ? Array.isArray(config.panelClass)
        ? config.panelClass
        : [config.panelClass]
      : [];
    const ref = new RhombusSheetRef<R>(side);

    this.dialog.open<R, D>(content, {
      data: config.data,
      hasBackdrop: config.hasBackdrop ?? true,
      // The ref owns close + animation; CDK never auto-closes. Escape/backdrop
      // are routed through the animated close by the ref.
      disableClose: true,
      autoFocus: config.autoFocus ?? 'first-tabbable',
      restoreFocus: config.restoreFocus ?? true,
      positionStrategy: this.positionFor(side),
      panelClass: [
        BASE_PANEL_CLASS,
        `${BASE_PANEL_CLASS}--${side}`,
        ...extraPanelClasses,
      ],
      ariaLabel: config.ariaLabel,
      // A sheet is a modal surface (backdrop + focus-trap + scroll-block); make
      // that explicit. CDK's DialogConfig defaults ariaModal to false.
      ariaModal: true,
      providers: (cdkRef) => {
        ref._init(cdkRef as DialogRef<R>, config);
        return [
          { provide: RhombusSheetRef, useValue: ref },
          { provide: RHOMBUS_SHEET_DATA, useValue: config.data ?? null },
        ];
      },
    });

    return ref;
  }

  /** Edge anchor for the overlay pane; CSS handles the panel's extent. */
  private positionFor(side: SheetSide): GlobalPositionStrategy {
    const g = this.overlay.position().global();
    if (side === 'left') return g.top('0').left('0');
    if (side === 'bottom') return g.bottom('0').left('0');
    return g.top('0').right('0');
  }
}
