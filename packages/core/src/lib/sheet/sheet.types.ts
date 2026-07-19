/** Edge the sheet slides in from. Physical (RTL-agnostic) by design. */
export type SheetSide = 'left' | 'right' | 'bottom';

/** Named sheet extent (width for side sheets, height for a bottom sheet). */
export type SheetSize = 'sm' | 'md' | 'lg';

/**
 * Options for {@link RhombusSheetService.open}. A lean, CDK-free surface (mirrors
 * {@link RhombusDialogConfig}) so consumers never depend on Angular CDK types.
 */
export interface RhombusSheetConfig<D = unknown> {
  /** Data injected into the opened component via {@link RHOMBUS_SHEET_DATA}. */
  data?: D;
  /** Edge to anchor/slide from. Defaults to `'right'`. */
  side?: SheetSide;
  /**
   * Extent: a `'sm' | 'md' | 'lg'` preset or any raw CSS length. Applies to the
   * width of a left/right sheet or the height of a bottom sheet. Defaults to `'md'`.
   */
  size?: SheetSize | string;
  /** When `true`, Escape / backdrop click do not close the sheet. Defaults to `false`. */
  disableClose?: boolean;
  /** Show the scrim backdrop. Defaults to `true`. */
  hasBackdrop?: boolean;
  /** Extra panel class(es); merged with the base sheet panel classes. */
  panelClass?: string | string[];
  /**
   * Accessible name for a sheet with no `<rhombus-sheet [title]>`. Exactly one of
   * a chrome title or `ariaLabel` must supply a name (else the sheet fails loud).
   */
  ariaLabel?: string;
  /** Initial focus target. Defaults to `'first-tabbable'`. */
  autoFocus?: 'dialog' | 'first-tabbable' | 'first-heading' | string;
  /** Restore focus to the previously-focused element on close. Defaults to `true`. */
  restoreFocus?: boolean;
}
