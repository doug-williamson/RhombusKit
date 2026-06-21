import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RhombusCodeBlockComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-code-block-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Code Block"
      [hasUsage]="true"
      apiKey="RhombusCodeBlockComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A read-only code viewer that shows a snippet verbatim with a language
          label and a copy-to-clipboard button. It is the one core component that
          wraps no Material primitive of its own, yet its toolbar, label, and
          surface all draw from the token contract — toggle the theme above to see
          it track.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-code-block [code]="tsSample" />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use it to <strong>display code for reading and copying</strong> —
              docs, usage examples, command snippets. It is not an editor; pass the
              source in via <code>[code]</code>.
            </li>
            <li>
              When you want consistent, token-themed code surfaces across light and
              dark, with a built-in copy affordance and graceful fallback when
              syntax highlighting isn't available.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>For editable code or user input, this is read-only — use a <a routerLink="/components/textarea">Textarea</a> instead.</li>
            <li>For a single short value the user should copy (a token, an ID), an <a routerLink="/components/input">Input</a> or a <a routerLink="/components/chip">Chip</a> is lighter than a full code surface.</li>
            <li>For prose, tips, or warnings rather than code, use an <a routerLink="/components/alert">Alert</a> or a <a routerLink="/components/card">Card</a>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/textarea">Textarea</a> — multiline editable text input.</li>
            <li><a routerLink="/components/input">Input</a> — single-line values and short snippets.</li>
            <li><a routerLink="/components/theming">Theming</a> — the token contract this block tracks.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The block is fully driven by two inputs: pass the source verbatim to
          <code>[code]</code> and set the grammar/label with <code>language</code>.
          There is no editing or content projection — it renders what you give it.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>[code]</code> — <strong>required</strong>. The source string, displayed verbatim in a <code>&lt;pre&gt;&lt;code&gt;</code>.</li>
            <li><code>language</code> — the toolbar label and highlight.js grammar; defaults to <code>'typescript'</code>. Bundled grammars: <code>typescript</code>, <code>html</code>, <code>scss</code>, <code>bash</code>, <code>json</code>.</li>
            <li><strong>No content-projection slots.</strong> The block has no <code>&lt;ng-content&gt;</code>; its text is populated from the <code>[code]</code> input, not from projected children. The toolbar (language label + copy button) is built in and not configurable via projection.</li>
            <li>Syntax highlighting via <code>highlight.js</code> is an <strong>optional</strong>, browser-only enhancement: install it as a peer to enable it; without it (or during server rendering) the block degrades to plain, readable code.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The block renders inline (not in a CDK overlay), so style overrides can
            target its host. It reads these contract tokens:
          </p>
          <ul>
            <li><code>--surface-0</code> — code surface background</li>
            <li><code>--surface-1</code> — toolbar background</li>
            <li><code>--border</code> — outer border and toolbar divider</li>
            <li><code>--text-primary</code> — default code colour / copy-button hover</li>
            <li><code>--text-secondary</code> — language label and copy icon</li>
            <li><code>--font-sans</code> — language label font family</li>
            <li><code>--font-mono</code> — code font family</li>
            <li><code>--code-keyword</code>, <code>--code-string</code>, <code>--code-function</code>, <code>--code-number</code>, <code>--code-comment</code>, <code>--code-punctuation</code> — syntax-token colours (applied only when highlight.js is present)</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders semantic <code>&lt;pre&gt;&lt;code&gt;</code> so the snippet is
            exposed verbatim to assistive tech and whitespace/structure are
            preserved. The copy control is a real <code>matIconButton</code> —
            reachable with <kbd>Tab</kbd>, activated on <kbd>Enter</kbd> /
            <kbd>Space</kbd> — whose <code>title</code> announces &ldquo;Copy
            code&rdquo; and switches to &ldquo;Copied!&rdquo; for two seconds after a
            successful copy, with the icon swapping from a copy glyph to a check.
            Note the confirmation is conveyed through the button's <code>title</code>
            and icon only; there is no separate <code>aria-live</code> region, so the
            change is announced when the button is focused rather than pushed
            proactively. The language label is plain decorative text in the toolbar.
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
