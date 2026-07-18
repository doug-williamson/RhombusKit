/** A single row in a {@link RhombusSelectionListComponent}. */
export interface SelectionListOption<T = string> {
  /** The value committed to the selection (selection mode) or passed to `(itemAction)` (action mode). */
  value: T;
  /** Primary line — the option's visible text and accessible name. */
  label: string;
  /** Optional secondary line, rendered in `--text-secondary`. */
  description?: string;
  /** Optional leading `provideRhombusIcons()` glyph name. */
  icon?: string;
  /** Renders the row inert (not selectable / not actionable). */
  disabled?: boolean;
  /** Action mode only — styles the row as a destructive action (`--error`). */
  danger?: boolean;
}

/**
 * Selection-list packaging (**D5**):
 * - `'selection'` — a multi- (or single-) select listbox over `mat-selection-list`.
 * - `'action'` — a list of buttons over `mat-action-list` that fire `(itemAction)`.
 */
export type SelectionListMode = 'selection' | 'action';
