import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RhombusCodeBlockComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-code-block-page',
  standalone: true,
  imports: [
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Code Block" apiKey="RhombusCodeBlockComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A read-only code viewer that shows a snippet verbatim with a language
          label and a copy-to-clipboard button. It is the one core component that
          wraps no Material primitive of its own, yet its toolbar, label, and
          surface all draw from the token contract — toggle the theme above to see
          it track.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use it to <strong>display code for reading and copying</strong> —
              docs, usage examples, command snippets. It is not an editor; pass the
              source in via <code>[code]</code>.
            </li>
            <li>
              Set <code>language</code> for the label and grammar. Syntax
              highlighting via <code>highlight.js</code> is an
              <strong>optional</strong>, browser-only enhancement: install it as a
              peer to enable it; without it (or during server rendering) the block
              degrades to plain, readable code.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-code-block [code]="tsSample" />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders semantic <code>&lt;pre&gt;&lt;code&gt;</code> so the snippet is
            exposed verbatim to assistive tech and screen readers preserve its
            structure. The copy control is a real <code>matIconButton</code> —
            reachable with <kbd>Tab</kbd>, activated on <kbd>Enter</kbd> /
            <kbd>Space</kbd> — whose <code>title</code> announces &ldquo;Copy
            code&rdquo; and confirms with &ldquo;Copied!&rdquo;.
          </p>
        </section>
      </div>

      <div examples>
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
    </app-component-page>
  `,
})
export default class CodeBlockPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusCodeBlockComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-snippet',
  imports: [RhombusCodeBlockComponent],
  template: \`
    <rhombus-code-block language="typescript" [code]="snippet" />
  \`,
})
export class SnippetComponent {
  readonly snippet = 'const total = sum(items);';
}`;

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
