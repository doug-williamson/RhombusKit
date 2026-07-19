import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface RhombusGlyph {
  viewBox: string;
  path: string;
}

/**
 * Built-in default glyphs the library renders inline (Material Icons "filled",
 * 24px), keyed by their Material ligature name. Pre-seeded into every
 * {@link RhombusIconRegistry} so the library's own frame components
 * (overflow-menu, bottom-nav, theme controls) render without any consumer
 * registration and without the Material Icons font. Extend this map when a new
 * built-in default icon appears.
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
  // Trend arrows for the Stat KPI tile (decorative, but themed so they render on
  // a font-less host). Reused by any future data-viz primitive.
  trending_up: {
    viewBox: '0 0 24 24',
    path: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  },
  trending_down: {
    viewBox: '0 0 24 24',
    path: 'M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
  },
  trending_flat: {
    viewBox: '0 0 24 24',
    path: 'M22 12l-4-4v3H3v2h15v3z',
  },
};

/**
 * Wrap raw glyph path data in a width/height-less, `currentColor` SVG string so
 * `<rhombus-icon>` can size it via CSS and inherit text colour.
 */
function glyphToSvg(glyph: RhombusGlyph): string {
  return `<svg viewBox="${glyph.viewBox}" fill="currentColor" focusable="false"><path d="${glyph.path}"/></svg>`;
}

/**
 * Name → inline-SVG registry backing `<rhombus-icon>`. Mirrors the shape of an
 * Angular Material `addSvgIconLiteral` map: register an icon set once (typically
 * via {@link provideRhombusIcons}) and reference each entry by name.
 *
 * The library's built-in glyphs are pre-seeded, so the frame components render
 * with no consumer setup. SVG literals are stored as trusted HTML
 * (`DomSanitizer.bypassSecurityTrustHtml`), exactly as `MatIconRegistry` does —
 * register only static, bundled, trusted SVG strings, never markup derived from
 * user input.
 */
@Injectable({ providedIn: 'root' })
export class RhombusIconRegistry {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly icons = new Map<string, SafeHtml>();

  constructor() {
    for (const [name, glyph] of Object.entries(RHOMBUS_DEFAULT_GLYPHS)) {
      this.register(name, glyphToSvg(glyph));
    }
  }

  /** Register one icon by name, or a whole name → SVG-literal map at once. */
  register(name: string, svg: string): void;
  register(icons: Record<string, string>): void;
  register(nameOrIcons: string | Record<string, string>, svg?: string): void {
    if (typeof nameOrIcons === 'string') {
      this.icons.set(
        nameOrIcons,
        this.sanitizer.bypassSecurityTrustHtml(svg ?? '')
      );
      return;
    }
    for (const [name, literal] of Object.entries(nameOrIcons)) {
      this.icons.set(name, this.sanitizer.bypassSecurityTrustHtml(literal));
    }
  }

  /** The trusted SVG registered for `name`, or `undefined` if there is none. */
  get(name: string): SafeHtml | undefined {
    return this.icons.get(name);
  }

  /** Whether `name` resolves to a registered inline SVG. */
  has(name: string): boolean {
    return this.icons.has(name);
  }
}
