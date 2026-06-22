import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RhombusIconRegistry } from './rhombus-icon-registry';

/**
 * Icon size — a preset (`sm` 20px · `md` 24px · `lg` 32px) or an explicit pixel
 * value. Defaults to `md`.
 */
export type RhombusIconSize = 'sm' | 'md' | 'lg' | number;

const SIZE_PX: Record<'sm' | 'md' | 'lg', number> = { sm: 20, md: 24, lg: 32 };

/**
 * `<rhombus-icon>` — the library's icon primitive. Renders any icon registered
 * with the {@link RhombusIconRegistry} (typically via `provideRhombusIcons`) as
 * an inline `currentColor` SVG, so icons inherit text colour and need no icon
 * font. The library's built-in glyphs are pre-registered; a name that is not
 * registered falls back to `<mat-icon>` (Material font).
 *
 * Decorative by default (`aria-hidden`); pass `ariaLabel` to expose it as a
 * labelled image (`role="img"`). Set `size` for the box; colour follows
 * `currentColor`, so set `color` on an ancestor to theme it.
 *
 * ```html
 * <rhombus-icon name="edit" />
 * <rhombus-icon name="delete" size="lg" ariaLabel="Delete" />
 * ```
 */
@Component({
  selector: 'rhombus-icon',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[style.--rhombus-icon-size]': 'sizeCss()',
    '[attr.role]': "ariaLabel() ? 'img' : null",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
  },
  template: `
    @if (svg(); as html) {
      <span class="rhombus-icon" [innerHTML]="html"></span>
    } @else {
      <mat-icon>{{ name() }}</mat-icon>
    }
  `,
  styles: `
    rhombus-icon {
      display: inline-flex;
      line-height: 0;
      /* Centre the icon against adjacent inline text (e.g. a menu-item label).
         Inert in icon-only flex contexts like matIconButton. Must be a CSS
         block comment: inline styles are emitted as raw CSS, and a Sass-style
         line comment here swallows the next declaration. */
      vertical-align: middle;
    }
    .rhombus-icon {
      display: inline-flex;
      width: var(--rhombus-icon-size, 24px);
      height: var(--rhombus-icon-size, 24px);
    }
    .rhombus-icon svg {
      display: block;
      width: 100%;
      height: 100%;
    }
    rhombus-icon mat-icon {
      font-size: var(--rhombus-icon-size, 24px);
      width: var(--rhombus-icon-size, 24px);
      height: var(--rhombus-icon-size, 24px);
    }
  `,
})
export class RhombusIconComponent {
  private readonly registry = inject(RhombusIconRegistry);

  /** Registered icon name (or a Material ligature name for the font fallback). */
  readonly name = input.required<string>();
  /** Icon size — an `'sm' | 'md' | 'lg'` preset or an explicit pixel number. */
  readonly size = input<RhombusIconSize>('md');
  /**
   * Accessible label. When set, the icon is exposed as `role="img"` with this
   * label; left unset (the default) it is decorative (`aria-hidden`).
   */
  readonly ariaLabel = input<string | null>(null);

  /** The registered SVG for the current name, or `undefined` (→ font fallback). */
  protected readonly svg = computed(() => this.registry.get(this.name()));

  /** Resolved box size as a CSS length, bound to `--rhombus-icon-size`. */
  protected readonly sizeCss = computed(() => {
    const size = this.size();
    const px = typeof size === 'number' ? size : SIZE_PX[size];
    return `${px}px`;
  });
}
