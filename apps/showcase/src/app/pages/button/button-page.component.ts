import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Button"
      [hasUsage]="true"
      apiKey="RhombusButtonComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          Buttons trigger an action or a navigation. RhombusKit wraps Angular
          Material's <code>matButton</code> directive with a curated variant /
          size / appearance API and routes every colour through the token
          contract &mdash; toggle the theme above and the buttons re-skin without
          touching markup.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-button variant="primary">Save changes</rhombus-button>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a button to <strong>trigger an action</strong> (save, submit,
              open a dialog).
            </li>
            <li>
              Give a view exactly one <strong>primary</strong> button for its main
              action; use <strong>secondary</strong> or <strong>ghost</strong> for
              supporting actions and <strong>danger</strong> for destructive ones.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For moving between pages or to an external URL, set
              <code>routerLink</code> / <code>href</code> so the button renders a
              real <code>&lt;a&gt;</code> (see <em>Link buttons</em> below) —
              don't fake a navigation with <code>(click)</code> on a plain
              button.
            </li>
            <li>
              For an on/off setting that takes effect immediately, use a
              <a routerLink="/components/switch">Switch</a> rather than a button.
            </li>
            <li>
              For row-level actions hidden behind a "more" affordance, use an
              <a routerLink="/components/overflow-menu">Overflow Menu</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/menu">Menu</a> — action lists off a trigger.</li>
            <li><a routerLink="/components/chip">Chip</a> — compact, selectable tokens.</li>
            <li><a routerLink="/components/switch">Switch</a> — immediate on/off settings.</li>
            <li><a routerLink="/components/dialog">Dialog</a> — modal surfaces buttons often open.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          A button is driven entirely by inputs — <code>variant</code>,
          <code>size</code>, <code>appearance</code>, <code>disabled</code>, and
          optional <code>leadingIcon</code> / <code>trailingIcon</code> — with its
          label supplied through the default content slot.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>&lt;rhombus-button&gt;</code> renders a native <code>&lt;button&gt;</code> wrapping Material's <code>matButton</code>; the <code>appearance</code> input picks <code>filled</code> / <code>outlined</code> / <code>text</code>.</li>
            <li><strong>Default content slot</strong> — whatever you project becomes the visible label (the component exposes no named slots).</li>
            <li><code>leadingIcon</code> renders a Material icon before the label; <code>trailingIcon</code> renders one after it. Pass a Material icon name string; <code>null</code> (default) hides it.</li>
            <li>Set <code>routerLink</code> or <code>href</code> to render the button as a real <code>&lt;a&gt;</code> instead of a <code>&lt;button&gt;</code> (<code>target</code> / <code>rel</code> pass through; <code>routerLink</code> wins if both are set). Omit both for a plain button.</li>
            <li><code>iconButton</code> renders a compact square icon button from a single <code>leadingIcon</code> (the <code>trailingIcon</code> and projected label are suppressed); always pair it with <code>ariaLabel</code> for the accessible name.</li>
            <li><code>ariaLabel</code> is forwarded to the underlying <code>&lt;button&gt;</code> / <code>&lt;a&gt;</code> as <code>aria-label</code> — required for icon-only buttons, harmless on labelled ones.</li>
            <li>Bind <code>(click)</code> on the host as usual; <code>[disabled]="true"</code> disables the underlying native button.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The button renders inline (no overlay) and routes every colour, shadow,
            and font through contract tokens. Variants locally rebind Material's
            <code>--mat-sys-primary</code> / <code>--mat-sys-on-primary</code> roles
            from these tokens:
          </p>
          <ul>
            <li><code>--font-sans</code> — label font family</li>
            <li><code>--shadow-sm</code> — hover elevation shadow</li>
            <li><code>--surface-2</code> / <code>--text-primary</code> — <code>secondary</code> fill and label</li>
            <li><code>--text-accent</code> / <code>--surface-1</code> — <code>ghost</code> label and hover fill</li>
            <li><code>--error</code> / <code>--error-bg</code> / <code>--bg</code> — <code>danger</code> fill, hover, and label</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders a native <code>&lt;button&gt;</code>, so it is focusable and
            activates on <kbd>Enter</kbd> / <kbd>Space</kbd> with no extra wiring,
            and <code>[disabled]</code> is conveyed to assistive tech natively
            (the native <code>disabled</code> attribute removes it from the tab
            order). The label comes from the projected text content, which screen
            readers announce as the accessible name. For an icon-only button (a
            <code>leadingIcon</code> / <code>trailingIcon</code> with no projected
            text), add an <code>aria-label</code> so its purpose is announced — the
            component does not derive a label from the icon name. With
            <code>routerLink</code> / <code>href</code> the button is a genuine
            <code>&lt;a&gt;</code> link; a disabled link drops its href, sets
            <code>aria-disabled="true"</code>, and leaves the tab order
            (<code>tabindex="-1"</code>), since an anchor has no native disabled
            state.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Variants</h2>
          <div class="showcase-row">
            <rhombus-button variant="primary">Primary</rhombus-button>
            <rhombus-button variant="secondary">Secondary</rhombus-button>
            <rhombus-button variant="ghost">Ghost</rhombus-button>
            <rhombus-button variant="danger">Danger</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Appearances</h2>
          <div class="showcase-row">
            <rhombus-button appearance="filled">Filled</rhombus-button>
            <rhombus-button appearance="outlined">Outlined</rhombus-button>
            <rhombus-button appearance="text">Text</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Sizes</h2>
          <div class="showcase-row">
            <rhombus-button size="sm">Small</rhombus-button>
            <rhombus-button size="md">Medium</rhombus-button>
            <rhombus-button size="lg">Large</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>States</h2>
          <div class="showcase-row">
            <rhombus-button [disabled]="true">Disabled</rhombus-button>
            <rhombus-button leadingIcon="add">With leading icon</rhombus-button>
            <rhombus-button trailingIcon="arrow_forward">
              With trailing icon
            </rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Icon buttons</h2>
          <p class="showcase-section__lead">
            Set <code>iconButton</code> with a single <code>leadingIcon</code>
            and an <code>ariaLabel</code> to render a compact, square icon
            button (~32 / 40 / 48px at <code>sm</code> / <code>md</code> /
            <code>lg</code>) — for edit / delete / back / close actions in
            tables, toolbars, and cards. It keeps the normal variant, hover,
            focus-ring, and disabled treatment, and works as a link too.
          </p>
          <div class="showcase-row">
            <rhombus-button
              iconButton
              ariaLabel="Edit"
              variant="ghost"
              leadingIcon="edit"
            />
            <rhombus-button
              iconButton
              ariaLabel="Delete"
              variant="danger"
              leadingIcon="delete"
            />
            <rhombus-button
              iconButton
              ariaLabel="More"
              variant="secondary"
              leadingIcon="more_vert"
            />
            <rhombus-button
              iconButton
              ariaLabel="Settings"
              appearance="outlined"
              leadingIcon="settings"
            />
            <rhombus-button
              iconButton
              ariaLabel="Back to Card"
              appearance="text"
              leadingIcon="arrow_back"
              routerLink="/components/card"
            />
          </div>
          <div class="showcase-row" style="align-items: center;">
            <rhombus-button iconButton ariaLabel="Edit (small)" size="sm" appearance="outlined" leadingIcon="edit" />
            <rhombus-button iconButton ariaLabel="Edit (medium)" size="md" appearance="outlined" leadingIcon="edit" />
            <rhombus-button iconButton ariaLabel="Edit (large)" size="lg" appearance="outlined" leadingIcon="edit" />
          </div>
          <rhombus-code-block language="html" [code]="iconUsage" />
        </section>

        <section class="showcase-section">
          <h2>Link buttons</h2>
          <p class="showcase-section__lead">
            Set <code>routerLink</code> (or <code>href</code>) and the same
            button renders as a real <code>&lt;a&gt;</code> — identical pixels,
            with full link semantics for keyboard and screen-reader users. Use
            it for nav CTAs, "back to home", social links, and "link in bio"
            rows. External links with <code>target="_blank"</code> auto-harden
            <code>rel="noopener noreferrer"</code>.
          </p>
          <div class="showcase-row">
            <rhombus-button routerLink="/components/card" leadingIcon="arrow_back">
              Back to Card
            </rhombus-button>
            <rhombus-button
              href="https://github.com/doug-williamson/RhombusKit"
              target="_blank"
              appearance="outlined"
              trailingIcon="open_in_new"
            >
              View on GitHub
            </rhombus-button>
            <rhombus-button
              routerLink="/components/button"
              appearance="text"
              [disabled]="true"
            >
              Disabled link
            </rhombus-button>
          </div>
          <rhombus-code-block language="html" [code]="linkUsage" />
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
  `,
})
export default class ButtonPageComponent {
  /** Icon-button snippet shown in the Examples tab. */
  protected readonly iconUsage = `<!-- iconButton + a single leadingIcon + ariaLabel → compact square icon button -->
<rhombus-button iconButton ariaLabel="Edit" variant="ghost" leadingIcon="edit"
                (click)="edit(row)" />

<!-- works as a link, too -->
<rhombus-button iconButton ariaLabel="Back" appearance="text"
                leadingIcon="arrow_back" routerLink="/dashboard" />`;

  /** Link-button snippet shown in the Examples tab. */
  protected readonly linkUsage = `<!-- routerLink → renders <a routerLink> with identical button styling -->
<rhombus-button routerLink="/dashboard" leadingIcon="arrow_back">
  Back to dashboard
</rhombus-button>

<!-- href + target → external link; rel auto-hardens to "noopener noreferrer" -->
<rhombus-button href="https://example.com" target="_blank" appearance="outlined">
  Open docs
</rhombus-button>`;

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusButtonComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-save-bar',
  imports: [RhombusButtonComponent],
  template: \`
    <rhombus-button variant="primary" (click)="save()">
      Save changes
    </rhombus-button>
  \`,
})
export class SaveBarComponent {
  save(): void {
    /* persist… */
  }
}`;
}
