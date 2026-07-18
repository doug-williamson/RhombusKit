import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RhombusDividerComponent, RhombusCodeBlockComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-divider-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusDividerComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Divider" [hasUsage]="true" apiKey="RhombusDividerComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A divider is a thin rule that visually and semantically separates
          content. <code>&lt;rhombus-divider&gt;</code> is bespoke &mdash; a
          <code>role="separator"</code> element themed straight off the contract
          (<code>--border</code>, or <code>--border-accent</code> with the
          <code>accent</code> flag) &mdash; so it adds no new tokens and re-skins
          with the theme. It runs horizontal (default) or vertical, can be inset
          from the container edges, and can carry a short label to become a text
          divider (e.g. "OR").
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <div style="max-width: 24rem;">
              <p style="margin: 0 0 0.75rem;">Account settings</p>
              <rhombus-divider />
              <p style="margin: 0.75rem 0 0;">Danger zone</p>
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              To separate stacked <strong>sections</strong>, list rows, or menu
              groups (horizontal).
            </li>
            <li>
              To split inline actions in a toolbar or button row
              (<strong>vertical</strong>, inside a flex container).
            </li>
            <li>
              As a labelled <strong>"OR"</strong> break between two choices, such
              as separating sign-in methods.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              Where whitespace or a heading already implies the break &mdash; a
              divider adds visual noise without adding meaning.
            </li>
            <li>
              To create spacing. Stacking dividers for gaps is a job for layout
              margins; reach for <code>inset</code> only when the rule itself
              should not run edge-to-edge.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/card">Card</a> &mdash; a bounded surface that groups content.</li>
            <li><a routerLink="/components/accordion">Accordion</a> &mdash; collapsible sections instead of a static rule.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The divider is driven by four inputs &mdash; <code>orientation</code>,
          <code>inset</code>, <code>accent</code>, and <code>label</code> &mdash;
          and projects no content.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; inputs</h2>
          <ul>
            <li>
              <code>[orientation]</code> &mdash; <code>'horizontal'</code>
              (default) or <code>'vertical'</code>. A vertical divider takes its
              length from a flex/grid parent, so give the container a height (or
              <code>align-items: stretch</code>).
            </li>
            <li>
              <code>inset</code> &mdash; a bare attribute that indents the rule
              from the container edges using logical margins (RTL-safe).
            </li>
            <li>
              <code>accent</code> &mdash; a bare attribute that swaps the rule
              colour from <code>--border</code> to <code>--border-accent</code>
              for an emphasised break.
            </li>
            <li>
              <code>[label]</code> &mdash; a short string that turns a horizontal
              divider into a rule&nbsp;—&nbsp;text&nbsp;—&nbsp;rule text divider
              (e.g. "OR"). Ignored on a vertical divider.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>The rule reuses existing contract tokens &mdash; no new tokens were added:</p>
          <ul>
            <li><code>--border</code> / <code>--border-accent</code> &mdash; the rule colour (with <code>accent</code>)</li>
            <li><code>--border-width</code> &mdash; the rule thickness</li>
            <li><code>--text-secondary</code> / <code>--font-sans</code> &mdash; the text-divider label</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The host carries <code>role="separator"</code> with an
            <code>aria-orientation</code> reflecting its axis, and is not
            focusable (it is a static separator, not a window splitter). Because a
            separator's children are presentational, a labelled divider exposes
            its label to assistive tech through <code>aria-label</code> rather
            than the visible text, so the name is announced exactly once. The rule
            and label colours clear WCAG AA contrast in both themes.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Horizontal</h2>
          <p class="showcase-section__lead">The default &mdash; a rule between stacked content.</p>
          <div style="max-width: 24rem;">
            <p style="margin: 0 0 0.75rem;">First paragraph.</p>
            <rhombus-divider />
            <p style="margin: 0.75rem 0 0;">Second paragraph.</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Vertical</h2>
          <p class="showcase-section__lead">
            Inside a flex row with a height &mdash; splitting inline actions.
          </p>
          <div style="display: flex; align-items: center; gap: 0.75rem; height: 1.5rem;">
            <span>Edit</span>
            <rhombus-divider orientation="vertical" />
            <span>Duplicate</span>
            <rhombus-divider orientation="vertical" />
            <span>Delete</span>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Inset</h2>
          <p class="showcase-section__lead">
            The rule indented from both edges with <code>inset</code>.
          </p>
          <div style="max-width: 24rem;">
            <p style="margin: 0 0 0.75rem;">Above.</p>
            <rhombus-divider inset />
            <p style="margin: 0.75rem 0 0;">Below.</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Accent</h2>
          <p class="showcase-section__lead">
            An emphasised break using <code>--border-accent</code>.
          </p>
          <div style="max-width: 24rem;">
            <p style="margin: 0 0 0.75rem;">Above.</p>
            <rhombus-divider accent />
            <p style="margin: 0.75rem 0 0;">Below.</p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Labelled text divider</h2>
          <p class="showcase-section__lead">
            A <code>label</code> turns the rule into an "OR" break.
          </p>
          <div style="max-width: 24rem;">
            <rhombus-divider label="OR" />
          </div>
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
export default class DividerPageComponent {
  /** Minimal import + usage snippet shown in the Overview / Usage tabs. */
  protected readonly usage = `import { RhombusDividerComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-settings',
  imports: [RhombusDividerComponent],
  template: \`
    <p>Account settings</p>
    <rhombus-divider />
    <p>Danger zone</p>

    <rhombus-divider label="OR" />
  \`,
})
export class SettingsComponent {}`;
}
