import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/** Avatar size. */
export type AvatarSize = 'sm' | 'md' | 'lg';

/** Derive up-to-two-letter initials from a display name. */
function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

/**
 * `<rhombus-avatar>` — a circular user avatar. Renders the `src` image when
 * provided (with `name` as its `alt`); otherwise falls back to initials
 * derived from `name`, exposing `name` as the accessible label
 * (`role="img"`). Bespoke — no Material primitive, no new tokens.
 *
 * ```html
 * <rhombus-avatar name="Ada Lovelace" />
 * <rhombus-avatar name="Ada Lovelace" src="/ada.png" size="lg" />
 * ```
 */
@Component({
  selector: 'rhombus-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-avatar.component.scss',
  host: {
    class: 'rhombus-avatar',
    '[class.rhombus-avatar--sm]': "size() === 'sm'",
    '[class.rhombus-avatar--md]': "size() === 'md'",
    '[class.rhombus-avatar--lg]': "size() === 'lg'",
    '[attr.role]': "src() ? null : 'img'",
    '[attr.aria-label]': "src() ? null : (name() || null)",
  },
  template: `
    @if (src()) {
      <img class="rhombus-avatar__img" [src]="src()" [alt]="name()" />
    } @else {
      <span class="rhombus-avatar__initials" aria-hidden="true">{{
        initials()
      }}</span>
    }
  `,
})
export class RhombusAvatarComponent {
  /** Display name; used for initials and as the accessible label / image alt. */
  readonly name = input<string>('');
  /** Image URL. When set, the image replaces the initials fallback. */
  readonly src = input<string | null>(null);
  /** Size. Defaults to `'md'`. */
  readonly size = input<AvatarSize>('md');

  protected readonly initials = computed(() => deriveInitials(this.name()));
}
