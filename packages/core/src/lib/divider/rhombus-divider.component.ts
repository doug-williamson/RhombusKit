import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

/** Divider layout axis. */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * `<rhombus-divider>` — a semantic `role="separator"` rule that visually and
 * structurally separates content. Bespoke (no Material primitive, no new
 * tokens): the rule is drawn from the existing `--border` contract token, or
 * `--border-accent` with the `accent` flag, so it re-skins with the theme.
 *
 * Runs `horizontal` (default) or `vertical`, can be `inset` from the container
 * edges, and can carry a short `label` to become a text divider (e.g. "OR").
 * The label is a string, not projected content: `role="separator"` makes its
 * children presentational, so the label is exposed to assistive tech through
 * `aria-label` — the only reliable accessible name. A labelled vertical divider
 * is not supported; the label is ignored when `orientation` is `vertical`.
 *
 * ```html
 * <rhombus-divider />
 * <rhombus-divider orientation="vertical" />
 * <rhombus-divider inset accent />
 * <rhombus-divider label="OR" />
 * ```
 */
@Component({
  selector: 'rhombus-divider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-divider.component.scss',
  host: {
    class: 'rhombus-divider',
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-label]': 'labelled() ? label() : null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-inset]': "inset() ? '' : null",
    '[attr.data-accent]': "accent() ? '' : null",
    '[attr.data-labelled]': "labelled() ? '' : null",
  },
  template: `
    @if (labelled()) {
      <span class="rhombus-divider__line"></span>
      <span class="rhombus-divider__label">{{ label() }}</span>
      <span class="rhombus-divider__line"></span>
    }
  `,
})
export class RhombusDividerComponent {
  /** Layout axis, reflected to `data-orientation`. Defaults to `'horizontal'`. */
  readonly orientation = input<DividerOrientation>('horizontal');
  /** Indent the rule from the container edges. Accepts a bare attribute (`inset`). */
  readonly inset = input(false, { transform: booleanAttribute });
  /** Emphasise the rule with `--border-accent`. Accepts a bare attribute (`accent`). */
  readonly accent = input(false, { transform: booleanAttribute });
  /**
   * Optional text-divider label (e.g. "OR"). When set on a horizontal divider it
   * renders a rule — label — rule layout and becomes the separator's `aria-label`.
   * Ignored on a vertical divider.
   */
  readonly label = input<string>('');

  /** True when a non-empty label should render as a horizontal text divider. */
  protected readonly labelled = computed(
    () => this.label().length > 0 && this.orientation() === 'horizontal'
  );
}
