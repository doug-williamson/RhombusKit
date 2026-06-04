/** A single actionable entry in a {@link RhombusMenuComponent}. */
export interface MenuItem {
  /** Display text. */
  label: string;
  /** Optional leading Material icon name. */
  icon?: string;
  /** Invoked when the item is activated. */
  action: () => void;
  /** Visual treatment; `'danger'` renders the item in `--error`. Defaults to `'default'`. */
  variant?: 'default' | 'danger';
  /** Renders the item inert. */
  disabled?: boolean;
  /** Inserts a divider above the item (ignored on the first item). */
  dividerBefore?: boolean;
}
