import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface RhombusGlyph {
  viewBox: string;
  path: string;
}

/**
 * Built-in default glyphs the library renders inline (Material Icons "filled",
 * 24px). Keyed by the Material ligature name so a default input value maps
 * straight through. Extend this map when a new built-in default icon appears.
 */
const RHOMBUS_DEFAULT_GLYPHS: Record<string, RhombusGlyph> = {
  more_vert: {
    viewBox: '0 0 24 24',
    path: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  },
  light_mode: {
    viewBox: '0 0 24 24',
    path: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13l2 0c.55 0 1-.45 1-1s-.45-1-1-1l-2 0c-.55 0-1 .45-1 1s.45 1 1 1zm18 0l2 0c.55 0 1-.45 1-1s-.45-1-1-1l-2 0c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z',
  },
  dark_mode: {
    viewBox: '0 0 24 24',
    path: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
  },
  contrast: {
    viewBox: '0 0 24 24',
    path: 'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm1-17.93c3.94.49 7 3.85 7 7.93s-3.05 7.44-7 7.93V4.07z',
  },
};

/**
 * Internal icon helper. Renders the library's built-in/default glyphs as inline
 * `currentColor` SVG so they display in hosts that do not bundle the Material
 * Icons font. Any name not in {@link RHOMBUS_DEFAULT_GLYPHS} falls back to
 * `<mat-icon>` (font), preserving consumer-supplied custom icons unchanged.
 *
 * NOT part of the public API — consumed only by other core components. The svg
 * inherits its color via `currentColor`; the host scopes that through the same
 * Material icon-color tokens it would have applied to `<mat-icon>`.
 */
@Component({
  selector: 'rhombus-icon',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (glyph(); as g) {
      <svg
        class="rhombus-icon"
        [attr.viewBox]="g.viewBox"
        width="24"
        height="24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path [attr.d]="g.path" />
      </svg>
    } @else {
      <mat-icon>{{ name() }}</mat-icon>
    }
  `,
  styles: `
    rhombus-icon {
      display: inline-flex;
      line-height: 0;
    }
    .rhombus-icon {
      display: block;
    }
  `,
})
export class RhombusIconComponent {
  readonly name = input.required<string>();

  protected readonly glyph = computed<RhombusGlyph | null>(
    () => RHOMBUS_DEFAULT_GLYPHS[this.name()] ?? null
  );
}
