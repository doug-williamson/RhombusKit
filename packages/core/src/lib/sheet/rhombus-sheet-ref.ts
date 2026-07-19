import { InjectionToken } from '@angular/core';
import type { DialogRef } from '@angular/cdk/dialog';
import type { Observable } from 'rxjs';
import type { RhombusSheetConfig, SheetSide, SheetSize } from './sheet.types';

/** Injection token for the data passed to an opened sheet (`config.data`). */
export const RHOMBUS_SHEET_DATA = new InjectionToken<unknown>('RHOMBUS_SHEET_DATA');

const OPEN_CLASS = 'rhombus-sheet-panel--open';
/** Named-size → CSS length. Single value works for either axis (width/height). */
const SIZE_MAP: Record<SheetSize, string> = {
  sm: '20rem',
  md: '28rem',
  lg: '40rem',
};
/**
 * Fallback close delay (ms) when `transitionend` never fires — reduced-motion,
 * a display:none race, or a host that strips the transition. Comfortably above
 * `--motion-duration-slow` (240ms).
 */
const EXIT_FALLBACK_MS = 400;

/** Resolve `config.size` to a CSS length. */
export function resolveSheetSize(size: SheetSize | string | undefined): string {
  const s = size ?? 'md';
  return s === 'sm' || s === 'md' || s === 'lg' ? SIZE_MAP[s] : s;
}

/**
 * Handle to an open sheet. Wraps CDK's `DialogRef` so consumers never touch
 * Angular CDK types, and — per decision **D9** — **owns the exit animation**:
 * `close()` removes the panel's `--open` class to run the slide-out transition,
 * awaits `transitionend` (with a fallback timeout), then closes the underlying
 * CDK dialog. The service sets `disableClose: true` on CDK so Escape / backdrop
 * dismissals route through here and animate too.
 */
export class RhombusSheetRef<R = unknown> {
  /** Edge the sheet is anchored to. */
  readonly side: SheetSide;

  private cdkRef!: DialogRef<R>;
  private paneEl: HTMLElement | null = null;
  private containerEl: HTMLElement | null = null;
  private activated = false;
  private closing = false;
  private named = false;

  constructor(side: SheetSide) {
    this.side = side;
  }

  /**
   * @internal Wired by {@link RhombusSheetService} during `open()` (inside CDK's
   * provider factory, before the sheet content is created).
   */
  _init(cdkRef: DialogRef<R>, config: RhombusSheetConfig): void {
    this.cdkRef = cdkRef;
    this.named = !!config.ariaLabel;
    this.paneEl = cdkRef.overlayRef.overlayElement;
    this.paneEl?.style.setProperty(
      '--rhombus-sheet-size',
      resolveSheetSize(config.size)
    );

    // CDK's disableClose is always true (the ref owns close). Route Escape and
    // backdrop through the animated close unless the consumer disabled it.
    if (!config.disableClose) {
      cdkRef.keydownEvents.subscribe((e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        }
      });
      cdkRef.backdropClick.subscribe(() => this.close());
    }

    // Activate after the content has rendered (styles + initial transform in
    // place). `<rhombus-sheet>` also calls `_activate()` from afterNextRender;
    // this timeout is the fallback for a chrome-less sheet. Both are idempotent.
    setTimeout(() => this._activate(), 0);
  }

  /**
   * @internal Commit the initial (closed) transform, then add the `--open` class
   * to run the slide-in. Idempotent. Also enforces the accessible-name contract.
   */
  _activate(): void {
    if (this.activated || !this.paneEl) return;
    this.activated = true;
    this.containerEl =
      this.paneEl.querySelector<HTMLElement>('.cdk-dialog-container') ??
      this.paneEl.querySelector<HTMLElement>('[role="dialog"]');
    // Force a reflow so the closed transform is committed before `--open`, so
    // the value change animates rather than snapping.
    void this.paneEl.offsetWidth;
    this.paneEl.classList.add(OPEN_CLASS);

    if (!this.named) {
      throw new Error(
        'RhombusSheet: opened without an accessible name. Provide a ' +
          '<rhombus-sheet [title]> or a `config.ariaLabel`.'
      );
    }
  }

  /**
   * @internal Wire the sheet's accessible name to the chrome title's id. Sets
   * `aria-labelledby` on the CDK dialog container and clears any `aria-label`.
   */
  _setLabelledBy(id: string): void {
    this.named = true;
    const container =
      this.paneEl?.querySelector<HTMLElement>('[role="dialog"]') ?? null;
    if (container) {
      container.setAttribute('aria-labelledby', id);
      container.removeAttribute('aria-label');
    }
  }

  /**
   * Close the sheet, optionally returning a result. Runs the slide-out
   * animation first, then closes the CDK dialog. Safe to call more than once.
   */
  close(result?: R): void {
    if (this.closing) return;
    this.closing = true;

    const pane = this.paneEl;
    if (!pane) {
      this.cdkRef.close(result);
      return;
    }
    pane.classList.remove(OPEN_CLASS);

    const target = this.containerEl ?? pane;
    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      target.removeEventListener('transitionend', onEnd);
      this.cdkRef.close(result);
    };
    const onEnd = (e: TransitionEvent): void => {
      if (e.propertyName === 'transform') finish();
    };
    target.addEventListener('transitionend', onEnd);
    const timer = setTimeout(finish, EXIT_FALLBACK_MS);
  }

  /** Emits the close result (or `undefined` on Escape/backdrop) then completes. */
  afterClosed(): Observable<R | undefined> {
    return this.cdkRef.closed;
  }
}
