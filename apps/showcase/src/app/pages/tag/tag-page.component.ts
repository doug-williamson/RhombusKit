import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusTagComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-tag-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusTagComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Tag" [hasUsage]="true" apiKey="RhombusTagComponent">
      <div overview class="overview">
        <p class="overview__lead">
          A tag is an inline, rounded <strong>status or label pill</strong>.
          <code>&lt;rhombus-tag&gt;</code> renders a content-projected label
          themed by colour role — the four post/page lifecycle statuses
          (<code>draft</code>, <code>published</code>, <code>scheduled</code>,
          <code>archived</code>) plus generic semantics
          (<code>info</code>, <code>success</code>, <code>warning</code>,
          <code>error</code>). It is bespoke &mdash; no Material primitive &mdash;
          and adds no new tokens: it reuses the contract's
          <code>--status-*</code> and <code>--toast-*</code> pairs, so it re-skins
          when you toggle the theme above.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-tag variant="published">Published</rhombus-tag>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              To label the <strong>status</strong> of an entity inline &mdash; a
              post that is Draft / Published / Scheduled / Archived, a build that
              passed or failed, a feature flagged Beta.
            </li>
            <li>
              As a static, read-only <strong>category or tag</strong> beside a
              title or in a table cell. The projected text carries the meaning;
              the colour reinforces it.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a count or a small dot anchored to another element, use a
              <a routerLink="/components/badge">Badge</a> &mdash; it is an overlay
              notification marker, not an inline label.
            </li>
            <li>
              For a <strong>selectable</strong> or removable token (filters,
              multi-select), use a <a routerLink="/components/chip">Chip</a>,
              which wires into Material's chip listbox.
            </li>
            <li>
              For a persistent, dismissible message banner, use an
              <a routerLink="/components/alert">Alert</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/badge">Badge</a> &mdash; overlay counts and dots.</li>
            <li><a routerLink="/components/chip">Chip</a> &mdash; selectable / removable tokens.</li>
            <li><a routerLink="/components/alert">Alert</a> &mdash; persistent severity banners.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The tag is driven by two inputs &mdash; <code>variant</code> and
          <code>size</code> &mdash; with its label supplied through the default
          content slot.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <strong>Default content slot</strong> &mdash; whatever you project
              becomes the visible (and accessible) label. Always name the status
              in words; never convey it by colour alone.
            </li>
            <li>
              <code>[variant]</code> &mdash; the colour role:
              <code>default</code> (neutral) /
              <code>info</code> / <code>success</code> / <code>warning</code> /
              <code>error</code> (generic semantics) /
              <code>draft</code> / <code>published</code> /
              <code>scheduled</code> / <code>archived</code> (status roles).
            </li>
            <li>
              <code>[size]</code> &mdash; <code>'sm'</code> or <code>'md'</code>
              (default). Match it to the surrounding density.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The tag renders inline (no overlay) and reuses existing contract
            tokens &mdash; no new tokens were added:
          </p>
          <ul>
            <li><code>--surface-2</code> / <code>--text-secondary</code> &mdash; <code>default</code></li>
            <li><code>--toast-*-bg</code> / <code>--toast-*-text</code> &mdash; the generic semantics (info / success / warning / error)</li>
            <li><code>--status-*-bg</code> / <code>--status-*-text</code> &mdash; the status roles (draft / published / scheduled / archived)</li>
            <li><code>--radius-full</code> / <code>--font-sans</code> &mdash; shape and font</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            A tag is plain inline text, so its accessible name is simply the label
            you project &mdash; screen readers announce "Published", not a colour.
            Because colour is decorative reinforcement only, the component needs no
            <code>role</code> or <code>aria-*</code> wiring. Keep the label a real
            word or short phrase, and the colour pairs already clear WCAG AA
            contrast in both themes.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Status roles</h2>
          <p class="showcase-section__lead">
            The four lifecycle statuses, themed by the <code>--status-*</code> tokens.
          </p>
          <div class="showcase-row" style="align-items: center; gap: 0.5rem;">
            <rhombus-tag variant="draft">Draft</rhombus-tag>
            <rhombus-tag variant="published">Published</rhombus-tag>
            <rhombus-tag variant="scheduled">Scheduled</rhombus-tag>
            <rhombus-tag variant="archived">Archived</rhombus-tag>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Generic semantics</h2>
          <p class="showcase-section__lead">
            Reuses the shared <code>--toast-*</code> tint pairs.
          </p>
          <div class="showcase-row" style="align-items: center; gap: 0.5rem;">
            <rhombus-tag>Default</rhombus-tag>
            <rhombus-tag variant="info">Info</rhombus-tag>
            <rhombus-tag variant="success">Success</rhombus-tag>
            <rhombus-tag variant="warning">Warning</rhombus-tag>
            <rhombus-tag variant="error">Error</rhombus-tag>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Sizes</h2>
          <p class="showcase-section__lead">
            <code>sm</code> for dense rows, <code>md</code> (default) elsewhere.
          </p>
          <div class="showcase-row" style="align-items: center; gap: 0.5rem;">
            <rhombus-tag variant="published" size="sm">Published</rhombus-tag>
            <rhombus-tag variant="published" size="md">Published</rhombus-tag>
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
export default class TagPageComponent {
  /** Minimal import + usage snippet shown in the Overview / Usage tabs. */
  protected readonly usage = `import { RhombusTagComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-post-row',
  imports: [RhombusTagComponent],
  template: \`
    <rhombus-tag variant="published">Published</rhombus-tag>
    <rhombus-tag variant="draft" size="sm">Draft</rhombus-tag>
  \`,
})
export class PostRowComponent {}`;
}
