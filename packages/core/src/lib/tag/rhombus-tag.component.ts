import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Tag colour role. The four status roles map to the `--status-*` contract
 * tokens (post/page lifecycle labels); the generic semantics map to the shared
 * `--toast-*` tint pairs; `default` is a neutral surface pill.
 */
export type TagVariant =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'draft'
  | 'published'
  | 'scheduled'
  | 'archived';

/** Tag size. */
export type TagSize = 'sm' | 'md';

/**
 * `<rhombus-tag>` — an inline, rounded status/label pill. Bespoke (no Material
 * primitive, no new tokens): it themes itself from the existing `--status-*` and
 * `--toast-*` contract pairs, so a `published` / `draft` / `info` tag re-skins
 * with the theme. The label is content-projected and carries the meaning — the
 * colour reinforces it, never replaces it (don't rely on colour alone).
 *
 * Distinct from `RhombusBadgeDirective` (an overlay count/dot) and
 * `[rhombusChip]` (a selectable Material chip): a tag is inline, static text.
 *
 * ```html
 * <rhombus-tag variant="published">Published</rhombus-tag>
 * <rhombus-tag variant="warning" size="sm">Needs review</rhombus-tag>
 * ```
 */
@Component({
  selector: 'rhombus-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-tag.component.scss',
  host: {
    class: 'rhombus-tag',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  template: `<ng-content />`,
})
export class RhombusTagComponent {
  /** Colour role, reflected to `data-variant`. Defaults to `'default'`. */
  readonly variant = input<TagVariant>('default');
  /** Size, reflected to `data-size`: `'sm'` | `'md'` (default). */
  readonly size = input<TagSize>('md');
}
