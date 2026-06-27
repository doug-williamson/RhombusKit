import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/**
 * Avatar size — a preset (`sm` 24px · `md` 40px · `lg` 64px · `xl` 96px) or an
 * explicit pixel value (for profile-photo previews / upload widgets). Defaults
 * to `md`. Mirrors {@link RhombusIconSize}.
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | number;

/** Box size in px for each named preset. */
const SIZE_PX: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 24,
  md: 40,
  lg: 64,
  xl: 96,
};

/** Initials font size in px for each named preset (preserves the original look). */
const FONT_PX: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 32,
};

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
 * `size` is a preset (`sm`/`md`/`lg`/`xl`) or an explicit pixel number. Pass
 * `srcDark` to swap the photo under a dark theme (pure CSS — no JS, no flash).
 *
 * ```html
 * <rhombus-avatar name="Ada Lovelace" />
 * <rhombus-avatar name="Ada Lovelace" src="/ada.png" size="xl" />
 * <rhombus-avatar name="Ada Lovelace" [size]="120" src="/light.png" srcDark="/dark.png" />
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
    // BEM size markers are kept (alongside the CSS vars that actually size the
    // avatar) so consumers overriding `.rhombus-avatar--lg` keep working.
    '[class.rhombus-avatar--sm]': "size() === 'sm'",
    '[class.rhombus-avatar--md]': "size() === 'md'",
    '[class.rhombus-avatar--lg]': "size() === 'lg'",
    '[class.rhombus-avatar--xl]': "size() === 'xl'",
    '[style.--rhombus-avatar-size]': 'sizeCss()',
    '[style.--rhombus-avatar-font]': 'fontCss()',
    '[attr.role]': "src() ? null : 'img'",
    '[attr.aria-label]': "src() ? null : (name() || null)",
  },
  template: `
    @if (src()) {
      @if (srcDark()) {
        <img
          class="rhombus-avatar__img rhombus-avatar__img--light"
          [src]="src()"
          [alt]="name()"
        />
        <img
          class="rhombus-avatar__img rhombus-avatar__img--dark"
          [src]="srcDark()"
          [alt]="name()"
        />
      } @else {
        <img class="rhombus-avatar__img" [src]="src()" [alt]="name()" />
      }
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
  /**
   * Dark-theme image URL. When set (and `src` is too), the avatar swaps to this
   * photo under a `[data-theme*="dark"]` ancestor — pure CSS, SSR-safe, no flash.
   */
  readonly srcDark = input<string | null>(null);
  /** Size: a `sm`/`md`/`lg`/`xl` preset or a pixel number. Defaults to `'md'`. */
  readonly size = input<AvatarSize>('md');

  protected readonly initials = computed(() => deriveInitials(this.name()));

  /** Resolved box size as a CSS length, bound to `--rhombus-avatar-size`. */
  protected readonly sizeCss = computed(() => {
    const size = this.size();
    const px = typeof size === 'number' ? size : SIZE_PX[size];
    return `${px}px`;
  });

  /** Resolved initials font size as a CSS length, bound to `--rhombus-avatar-font`. */
  protected readonly fontCss = computed(() => {
    const size = this.size();
    const px = typeof size === 'number' ? Math.round(size * 0.35) : FONT_PX[size];
    return `${px}px`;
  });
}
