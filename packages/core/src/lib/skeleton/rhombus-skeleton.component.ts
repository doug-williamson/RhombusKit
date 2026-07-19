import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * Skeleton shape. `text` renders one or more thin line bars; `circle` a round
 * media placeholder (avatar/thumbnail); `rect` a rectangular block (image/card).
 */
export type SkeletonVariant = 'text' | 'circle' | 'rect';

/** number → `px`, string → verbatim, null → no inline var (CSS default applies). */
function toCss(value: string | number | null): string | null {
  if (value == null) return null;
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Clamp a repeat count to a whole number ≥ 1, treating a non-finite value
 * (`NaN` from `numberAttribute` on an unresolved binding like `[count]="rows?.length"`)
 * as 1 so the skeleton never renders blank.
 */
function atLeastOne(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

/**
 * `<rhombus-skeleton>` — a pure-CSS loading placeholder. Bespoke (no Material,
 * no new tokens): a `--surface-2` block with an optional compositor-only shimmer
 * (`--surface-3` sweep via `transform: translateX`). Under
 * `prefers-reduced-motion` the sweep is dropped and the block stays a **static,
 * never-blank** surface.
 *
 * Two a11y modes. By default the skeleton is **decorative** (`aria-hidden`) — the
 * consumer owns the `aria-busy`/live-region wiring on the surrounding region.
 * Pass a `label` to make the skeleton a polite `role="status"` region that
 * announces the label (rendered as visually-hidden text so a live region has
 * real content to speak); its inner bars stay hidden from assistive tech.
 *
 * `lines` repeats bars *within* one text block; `count` repeats the *whole*
 * block (e.g. a list of placeholder rows).
 *
 * ```html
 * <!-- three text lines, last one shortened -->
 * <rhombus-skeleton [lines]="3" />
 *
 * <!-- avatar + two lines, announced to assistive tech -->
 * <rhombus-skeleton variant="circle" [width]="40" label="Loading profile" />
 *
 * <!-- a list of five placeholder rows -->
 * <rhombus-skeleton variant="rect" [height]="48" [count]="5" />
 * ```
 */
@Component({
  selector: 'rhombus-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-skeleton.component.scss',
  host: {
    class: 'rhombus-skeleton',
    '[class.rhombus-skeleton--animated]': 'animated()',
    '[attr.data-variant]': 'variant()',
    '[style.--rhombus-skeleton-w]': 'cssWidth()',
    '[style.--rhombus-skeleton-h]': 'cssHeight()',
    '[style.--rhombus-skeleton-radius]': 'cssRadius()',
    // Labelled → a polite live region; the visually-hidden text below is what it
    // announces (aria-hidden bars carry no text). Decorative → hidden from AT.
    '[attr.role]': "hasLabel() ? 'status' : null",
    '[attr.aria-hidden]': "hasLabel() ? null : 'true'",
  },
  template: `
    @if (hasLabel()) {
      <span class="rhombus-skeleton__sr">{{ label() }}</span>
    }
    @for (block of blocks(); track $index) {
      <div class="rhombus-skeleton__block" aria-hidden="true">
        @if (variant() === 'text') {
          @for (line of lineIndices(); track $index) {
            <span class="rhombus-skeleton__bar" [style.width]="barWidth($index)">
            </span>
          }
        } @else {
          <span class="rhombus-skeleton__shape"></span>
        }
      </div>
    }
  `,
})
export class RhombusSkeletonComponent {
  /** Shape. Defaults to `'text'`. */
  readonly variant = input<SkeletonVariant>('text');
  /** Block width (number → px, string verbatim, null → variant default). */
  readonly width = input<string | number | null>(null);
  /** Block height (number → px, string verbatim, null → variant default). */
  readonly height = input<string | number | null>(null);
  /** Corner radius (number → px, string verbatim, null → variant default). */
  readonly radius = input<string | number | null>(null);
  /** Number of line bars in a text block. Ignored for circle/rect. */
  readonly lines = input(1, { transform: numberAttribute });
  /** Width of the final line when `lines > 1` (a ragged paragraph edge). */
  readonly lastLineWidth = input('60%');
  /** How many times to repeat the whole block. */
  readonly count = input(1, { transform: numberAttribute });
  /** Show the shimmer sweep. Disabled under `prefers-reduced-motion`. */
  readonly animated = input(true, { transform: booleanAttribute });
  /**
   * Accessible label. `null`/empty → decorative (`aria-hidden`); a string → a
   * polite `role="status"` region that announces the label.
   */
  readonly label = input<string | null>(null);

  protected readonly hasLabel = computed(() => !!this.label());

  /** Repeat markers for `count` blocks. */
  protected readonly blocks = computed(() =>
    Array.from({ length: atLeastOne(this.count()) })
  );
  /** Repeat markers for the `lines` bars in a text block. */
  protected readonly lineIndices = computed(() =>
    Array.from({ length: atLeastOne(this.lines()) })
  );

  protected readonly cssWidth = computed(() => toCss(this.width()));
  protected readonly cssHeight = computed(() => toCss(this.height()));
  protected readonly cssRadius = computed(() => toCss(this.radius()));

  /** Inline width for a text bar: only the last of several lines is shortened. */
  protected barWidth(index: number): string | null {
    const lines = atLeastOne(this.lines());
    return lines > 1 && index === lines - 1 ? this.lastLineWidth() : null;
  }
}
