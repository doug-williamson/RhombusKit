/** A single navigation destination in a {@link RhombusNavListComponent}. */
export interface RhombusNavItem {
  /** Visible text and the item's accessible name. */
  label: string;
  /** RhombusIcon glyph name (falls back to a Material icon). Optional. */
  icon?: string;
  /**
   * `routerLink` target. When set, the item self-highlights via
   * `routerLinkActive` and renders `aria-current="page"` when active.
   */
  routerLink?: string | unknown[];
  /**
   * Plain anchor destination (external links, non-router targets). Used when
   * `routerLink` is absent; pair with `active` for manual highlighting.
   */
  href?: string;
  /** Trailing badge — a count, a short string, or `'dot'` for a marker. */
  badge?: number | string | 'dot';
  /** Renders the item inert: not focusable, not activatable. */
  disabled?: boolean;
  /** Exact-match active state for `routerLink` (RouterLinkActive `exact`). */
  exact?: boolean;
  /**
   * Manual active state for `href` / non-router items — applies the active
   * styling and `aria-current="page"`. Ignored for `routerLink` items, which
   * derive active state from the router.
   */
  active?: boolean;
  /** Anchor `target` (e.g. `_blank`) for `href` items. */
  target?: string;
  /** Anchor `rel` for `href` items. */
  rel?: string;
}

/** A titled (or untitled) group of nav items. */
export interface RhombusNavSection {
  /** Optional section heading rendered above the group. */
  heading?: string;
  /** The items in this section, top to bottom. */
  items: RhombusNavItem[];
}
