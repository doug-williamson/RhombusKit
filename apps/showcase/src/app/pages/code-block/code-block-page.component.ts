import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RhombusCodeBlockComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-code-block-page',
  standalone: true,
  imports: [RhombusCodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Code Block</h1>
        <p>
          A read-only code viewer with a language label and a copy-to-clipboard button.
          It's the one core component that wraps no Material primitive of its own.
          Syntax highlighting via <code>highlight.js</code> is an <strong>optional</strong>,
          browser-only progressive enhancement: install it as a peer to enable it; without
          it (or during server rendering) the block degrades to plain, readable code. The
          toolbar, label, and surface all draw from the token contract &mdash; toggle the
          theme above to see it track.
        </p>
      </header>

      <section class="showcase-section">
        <h2>TypeScript (default)</h2>
        <rhombus-code-block [code]="tsSample" />
      </section>

      <section class="showcase-section">
        <h2>HTML</h2>
        <rhombus-code-block language="html" [code]="htmlSample" />
      </section>

      <section class="showcase-section">
        <h2>SCSS</h2>
        <rhombus-code-block language="scss" [code]="scssSample" />
      </section>

      <section class="showcase-section">
        <h2>Shell</h2>
        <rhombus-code-block language="bash" [code]="bashSample" />
      </section>
    </div>
  `,
})
export default class CodeBlockPageComponent {
  protected readonly tsSample = `import { RhombusButtonComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-demo',
  imports: [RhombusButtonComponent],
  template: '<rhombus-button variant="primary">Save</rhombus-button>',
})
export class DemoComponent {}`;

  protected readonly htmlSample = `<rhombus-input label="Email" type="email" [control]="email">
  <span rhombusError>Enter a valid email.</span>
</rhombus-input>`;

  protected readonly scssSample = `@use '@rhombuskit/tokens/scss' as tokens;

.card {
  background: var(--surface-0);
  color: var(--text-primary);
  border-radius: var(--radius-lg);
}`;

  protected readonly bashSample = `pnpm add @rhombuskit/core @rhombuskit/material-preset`;
}
