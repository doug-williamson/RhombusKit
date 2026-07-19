import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';

/** Arrow direction. `auto` follows the numeric sign of `delta`. */
export type StatTrend = 'up' | 'down' | 'neutral' | 'auto';
/**
 * Colour role. `auto` follows the resolved trend (up→positive, down→negative);
 * set it explicitly to decouple colour from direction for inverted metrics
 * (e.g. a falling churn rate is a *positive*, still shown with a down arrow).
 */
export type StatSentiment = 'positive' | 'negative' | 'neutral' | 'auto';
/** Tile scale. */
export type StatSize = 'sm' | 'md' | 'lg';

type ResolvedTrend = 'up' | 'down' | 'neutral';
type ResolvedSentiment = 'positive' | 'negative' | 'neutral';

const TREND_GLYPH: Record<ResolvedTrend, string> = {
  up: 'trending_up',
  down: 'trending_down',
  neutral: 'trending_flat',
};

const TREND_PHRASE: Record<ResolvedTrend, string> = {
  up: 'Increased',
  down: 'Decreased',
  neutral: 'No change',
};

/** −1 / 0 / +1 sign of a numeric or numeric-ish string delta (else 0). */
function numericSign(delta: string | number | null): -1 | 0 | 1 {
  if (delta == null) return 0;
  const n = typeof delta === 'number' ? delta : parseFloat(delta);
  if (Number.isNaN(n) || n === 0) return 0;
  return n > 0 ? 1 : -1;
}

/**
 * `<rhombus-stat>` — a display-only KPI tile designed to sit inside a
 * `<rhombus-card>`. Bespoke (no Material, no new tokens): the delta pill reuses
 * the `--toast-success/error-*` tint pairs, the rest rides the surface/text
 * contract.
 *
 * **Two independent knobs (D8).** `trend` sets the arrow direction; `sentiment`
 * sets the colour. They default to `auto` (derived from `delta`'s sign) but are
 * decoupled so an inverted metric keeps its true arrow — a falling churn rate
 * shows a *down* arrow in a *positive* colour via `sentiment="positive"`.
 *
 * Direction is conveyed **three ways** so it never rests on colour alone: the
 * sentiment colour, a labelled arrow glyph, and a visually-hidden phrase
 * ("Increased", overridable/translatable via `deltaLabel`).
 *
 * Semantics use `<dl><dt>label</dt><dd>value…</dd></dl>`. Project `[slot=icon]`
 * for leading media and default content (a sparkline / secondary line) after.
 *
 * ```html
 * <rhombus-card>
 *   <rhombus-stat label="Revenue" [value]="42800" delta="+12%" caption="vs. last month" />
 * </rhombus-card>
 *
 * <!-- inverted metric: down arrow, positive colour -->
 * <rhombus-stat label="Churn" value="2.1%" delta="-0.4pt" sentiment="positive" />
 * ```
 */
@Component({
  selector: 'rhombus-stat',
  standalone: true,
  imports: [RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-stat.component.scss',
  host: {
    class: 'rhombus-stat',
    '[attr.data-size]': 'size()',
  },
  template: `
    <div class="rhombus-stat__icon"><ng-content select="[slot=icon]" /></div>
    <div class="rhombus-stat__content">
      <dl class="rhombus-stat__dl">
        <dt class="rhombus-stat__label">{{ label() }}</dt>
        <dd class="rhombus-stat__dd">
          <div
            class="rhombus-stat__value-row"
            [attr.aria-live]="live() ? 'polite' : null"
            [attr.aria-atomic]="live() ? 'true' : null"
          >
            @if (value() != null) {
              <span class="rhombus-stat__value">{{ value() }}</span>
            }
            @if (delta() != null) {
              <span
                class="rhombus-stat__delta"
                [attr.data-trend]="resolvedTrend()"
                [attr.data-sentiment]="resolvedSentiment()"
              >
                <rhombus-icon
                  class="rhombus-stat__delta-icon"
                  [name]="trendGlyph()"
                  [size]="16"
                />
                <span class="rhombus-stat__sr">{{ deltaPhrase() }}</span>
                <span class="rhombus-stat__delta-value">{{ delta() }}</span>
              </span>
            }
          </div>
          @if (caption()) {
            <span class="rhombus-stat__caption">{{ caption() }}</span>
          }
        </dd>
      </dl>
      <div class="rhombus-stat__extra"><ng-content /></div>
    </div>
  `,
})
export class RhombusStatComponent {
  /** Metric name (the `<dt>`). */
  readonly label = input<string>('');
  /** Primary value, rendered verbatim. `0` renders (guarded on `!= null`). */
  readonly value = input<string | number | null>(null);
  /** Change indicator. `null` → no pill. */
  readonly delta = input<string | number | null>(null);
  /** Arrow direction. `auto` (default) derives from `delta`'s sign. */
  readonly trend = input<StatTrend>('auto');
  /** Colour role. `auto` (default) follows the resolved trend. */
  readonly sentiment = input<StatSentiment>('auto');
  /** Secondary caption under the value (comparison period, context). */
  readonly caption = input<string | null>(null);
  /** Tile scale, reflected to `data-size`. */
  readonly size = input<StatSize>('md');
  /**
   * Screen-reader phrase for the change direction (default `Increased` /
   * `Decreased` / `No change`). Override to translate or reword; the visible
   * `delta` text supplies the magnitude.
   */
  readonly deltaLabel = input<string | null>(null);
  /** Announce value changes to assistive tech (`aria-live="polite"`). */
  readonly live = input(false, { transform: booleanAttribute });

  protected readonly resolvedTrend = computed<ResolvedTrend>(() => {
    const t = this.trend();
    if (t !== 'auto') return t;
    const s = numericSign(this.delta());
    return s > 0 ? 'up' : s < 0 ? 'down' : 'neutral';
  });

  protected readonly resolvedSentiment = computed<ResolvedSentiment>(() => {
    const s = this.sentiment();
    if (s !== 'auto') return s;
    const t = this.resolvedTrend();
    return t === 'up' ? 'positive' : t === 'down' ? 'negative' : 'neutral';
  });

  protected readonly trendGlyph = computed(() => TREND_GLYPH[this.resolvedTrend()]);

  protected readonly deltaPhrase = computed(
    () => this.deltaLabel() ?? TREND_PHRASE[this.resolvedTrend()]
  );
}
