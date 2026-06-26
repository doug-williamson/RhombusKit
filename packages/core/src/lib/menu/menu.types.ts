/** A single entry in a {@link RhombusMenuComponent}. */
export interface MenuItem {
  /** Display text. */
  label: string;
  /** Optional leading Material icon name. */
  icon?: string;
  /**
   * Invoked when the item is activated. Optional when the item is a navigation
   * link (`routerLink` / `href`); for a plain command item it is the handler.
   * A link item may still set `action` to run alongside navigation.
   */
  action?: () => void;
  /**
   * Router destination — renders the item as `<a mat-menu-item [routerLink]>` so
   * the menu can host navigation. Takes precedence over `href`.
   */
  routerLink?: string | unknown[];
  /** Plain anchor destination — renders the item as `<a mat-menu-item href>`. */
  href?: string;
  /** Anchor `target` (e.g. `_blank`) for `routerLink` / `href` items. */
  target?: string;
  /** Anchor `rel` for `routerLink` / `href` items. */
  rel?: string;
  /** Visual treatment; `'danger'` renders the item in `--error`. Defaults to `'default'`. */
  variant?: 'default' | 'danger';
  /** Renders the item inert. */
  disabled?: boolean;
  /** Inserts a divider above the item (ignored on the first item). */
  dividerBefore?: boolean;
}
