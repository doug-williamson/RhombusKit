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
  /**
   * Trailing icon glyph rendered after the label (and badge), e.g. a
   * `'chevron_right'` for link-in-bio rows. Works in both appearances; most at
   * home in the `'list'` appearance.
   */
  trailingIcon?: string;
  /** Renders the item inert: not focusable, not activatable. */
  disabled?: boolean;
  /**
   * Marks the item as gated (e.g. behind a plan/feature lock). Unlike
   * `disabled`, a locked item stays **focusable and activatable**: it renders as
   * a `<button>` that does NOT navigate (any `routerLink` / `href` is ignored)
   * and instead runs its `action` and emits `(itemAction)`, so the consumer can
   * open an upgrade sheet/dialog. A trailing lock affordance is shown. `disabled`
   * takes precedence over `locked` (a disabled item stays inert).
   */
  locked?: boolean;
  /**
   * Custom callback invoked on activation. Fires for `locked` items (alongside
   * the `(itemAction)` output) so dispatch can be co-located with the item, the
   * way {@link MenuItem} does. Ignored for inert (`disabled`) items.
   */
  action?: () => void;
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
  /**
   * The items in this section, top to bottom. */
  items: RhombusNavItem[];
  /**
   * Render the (required) `heading` as a disclosure toggle so the group can be
   * collapsed and expanded, with `aria-expanded` wired to the items. Defaults to
   * `false` (a static heading). Requires a `heading`.
   */
  collapsible?: boolean;
  /**
   * Initial expanded state for a `collapsible` section. Defaults to `true`
   * (expanded). The toggle is uncontrolled — the component tracks the state
   * after first interaction.
   */
  expanded?: boolean;
}

/**
 * Visual appearance of the whole list.
 * - `'sidebar'` (default) — compact rows for an app-shell sidenav / sidebar.
 * - `'list'` — full-width, prominent rows (leading icon · label · trailing
 *   icon) for "link in bio" / link-row pages.
 */
export type NavListAppearance = 'sidebar' | 'list';
