/** Public type surface for the RhombusKit reorder list. */

/** Layout axis of a {@link RhombusReorderListComponent} (vertical-only in v1). */
export type ReorderListOrientation = 'vertical' | 'horizontal';

/**
 * Emitted once per committed reorder (pointer drop, move button, or a keyboard
 * grab-and-drop) — never on an intermediate arrow move or an escape-cancel.
 */
export interface ReorderEvent<T> {
  /** The item that moved. */
  item: T;
  /** Its index before the reorder. */
  previousIndex: number;
  /** Its index after the reorder. */
  currentIndex: number;
  /** The full list in its new order (a fresh array). */
  items: T[];
}

/**
 * The context passed to a custom `announce` formatter so the live-region
 * message can be localised. `index` / `total` are for a "position N of M"
 * phrasing (both usable 1-based as `index + 1`).
 */
export interface ReorderAnnounceContext<T> {
  /** Which stage of the interaction is being announced. */
  phase: 'grabbed' | 'moved' | 'dropped' | 'cancelled';
  /** The item involved. */
  item: T;
  /** Its resolved `itemLabel`. */
  label: string;
  /** Its current 0-based index. */
  index: number;
  /** The total number of items. */
  total: number;
}
