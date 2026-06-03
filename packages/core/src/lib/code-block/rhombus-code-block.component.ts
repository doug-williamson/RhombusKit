import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewEncapsulation,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * `<rhombus-code-block>` — a read-only code viewer with a language label and a
 * copy-to-clipboard button. The one core component that wraps no Material
 * primitive of its own (it only composes a `matIconButton`).
 *
 * Ported from FolioKit's `docs-code-block`. Syntax highlighting via highlight.js
 * is lazy and **optional**: the per-language modules are dynamically imported in
 * the browser only and registered on demand. highlight.js is declared as an
 * optional peer dependency — if it's absent (or we're rendering on the server)
 * the block degrades to plain, unstyled code. No syntax-token (`.hljs-*`) colour
 * theme ships in 1.0; the element only carries `class="hljs language-*"`.
 */
@Component({
  selector: 'rhombus-code-block',
  standalone: true,
  imports: [MatIconButton, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-code-block.component.scss',
  template: `
    <div class="rhombus-code-block">
      <div class="rhombus-code-block__toolbar">
        <span class="rhombus-code-block__lang">{{ language() }}</span>
        <button
          matIconButton
          type="button"
          class="rhombus-code-block__copy-btn"
          [title]="copied() ? 'Copied!' : 'Copy code'"
          (click)="copy()"
        >
          <mat-icon>{{ copied() ? 'check' : 'content_copy' }}</mat-icon>
        </button>
      </div>
      <pre class="rhombus-code-block__pre"><code #codeEl class="language-{{ language() }}"></code></pre>
    </div>
  `,
})
export class RhombusCodeBlockComponent implements AfterViewInit {
  readonly code = input.required<string>();
  readonly language = input<string>('typescript');

  protected readonly copied = signal(false);

  private readonly codeEl = viewChild.required<ElementRef<HTMLElement>>('codeEl');
  private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    const el = this.codeEl().nativeElement;
    // Render plain code unconditionally so the content is present server-side;
    // highlighting is a browser-only progressive enhancement layered on top.
    el.textContent = this.code();
    if (!isPlatformBrowser(this.platformId)) return;
    void this.highlight(el);
  }

  /**
   * Browser-only. Lazily loads highlight.js and the five supported language
   * grammars, then highlights in place. Any failure (optional peer absent,
   * network error) leaves the plain `textContent` untouched.
   */
  private async highlight(el: HTMLElement): Promise<void> {
    try {
      // highlight.js is an optional peer: these dynamic specifiers resolve at
      // runtime only in consumers that install it. They type as `any` here (an
      // unresolved dynamic import is not a compile error under bundler module
      // resolution), and reject at runtime when the peer is absent — caught below.
      const { default: hljs } = await import('highlight.js/lib/core');
      const [ts, xml, scss, bash, json] = await Promise.all([
        import('highlight.js/lib/languages/typescript'),
        import('highlight.js/lib/languages/xml'),
        import('highlight.js/lib/languages/scss'),
        import('highlight.js/lib/languages/bash'),
        import('highlight.js/lib/languages/json'),
      ]);
      hljs.registerLanguage('typescript', ts.default);
      hljs.registerLanguage('html', xml.default);
      hljs.registerLanguage('scss', scss.default);
      hljs.registerLanguage('bash', bash.default);
      hljs.registerLanguage('json', json.default);
      hljs.highlightElement(el);
    } catch {
      // highlight.js unavailable — leave the plain code as rendered.
    }
  }

  protected copy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    void navigator.clipboard.writeText(this.code()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
