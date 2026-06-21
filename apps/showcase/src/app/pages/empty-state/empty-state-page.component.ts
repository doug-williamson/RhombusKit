import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusEmptyStateComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-empty-state-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusEmptyStateComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Empty State"
      [hasUsage]="true"
      apiKey="RhombusEmptyStateComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-empty-state&gt;</code> is a centered icon, heading,
          optional body, and optional CTA for &ldquo;nothing here yet&rdquo;
          surfaces. The icon is a Material <strong>ligature</strong> name and the
          CTA composes <code>&lt;rhombus-button&gt;</code>, so it inherits the
          token contract and re-skins with the theme.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <div class="demo-surface">
              <rhombus-empty-state
                icon="description"
                heading="No drafts yet"
                body="Start writing — your first post is one click away."
                ctaLabel="New post"
                (ctaClick)="onCta()"
              />
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Reach for it when a list, column, or search result has
              <strong>no items to show</strong> &mdash; give the user a reason
              and, where there's a next step, a CTA.
            </li>
            <li>
              It nests cleanly inside a
              <a routerLink="/components/data-table">Data Table</a>'s empty
              slot to explain why a table has no rows.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a transient &ldquo;action succeeded / failed&rdquo; message,
              use a <a routerLink="/components/toast">Toast</a> &mdash; empty
              state describes a persistent absence, not an event.
            </li>
            <li>
              For an inline warning or informational banner inside otherwise
              populated content, use an
              <a routerLink="/components/alert">Alert</a>.
            </li>
            <li>
              For a loading placeholder while data is in flight, use
              <a routerLink="/components/progress">Progress</a> rather than an
              empty state.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/data-table">Data Table</a> &mdash; the
              most common host for an empty state.
            </li>
            <li>
              <a routerLink="/components/card">Card</a> &mdash; a framed surface
              that often wraps an empty state.
            </li>
            <li>
              <a routerLink="/components/button">Button</a> &mdash; powers the
              optional CTA.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The component is fully <strong>input-driven</strong>: set
          <code>icon</code>, <code>heading</code>, and (optionally)
          <code>body</code> and <code>ctaLabel</code>; there are no content slots
          to project into.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[heading]</code> &mdash; the required headline text shown
              below the icon.
            </li>
            <li>
              <code>[icon]</code> &mdash; a Material <strong>ligature</strong>
              name (e.g. <code>inbox</code>, <code>search</code>); defaults to
              <code>inbox</code>.
            </li>
            <li>
              <code>[body]</code> &mdash; optional supporting text; the paragraph
              is omitted entirely when empty.
            </li>
            <li>
              <code>[ctaLabel]</code> + <code>(ctaClick)</code> &mdash; supplying
              a label renders a primary
              <a routerLink="/components/button">Button</a> that emits
              <code>ctaClick</code> on activation; omit the label and no button
              renders.
            </li>
            <li>
              The component takes its content through inputs only &mdash; there
              are <strong>no <code>&lt;ng-content&gt;</code> projection
              slots</strong>, default or named.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            It renders inline (no CDK overlay) and reads these contract tokens:
          </p>
          <ul>
            <li><code>--text-disabled</code> &mdash; icon colour</li>
            <li><code>--text-secondary</code> &mdash; heading colour</li>
            <li><code>--text-muted</code> &mdash; body colour</li>
            <li><code>--font-sans</code> &mdash; heading font family</li>
          </ul>
          <p>
            The CTA's colours are owned by
            <a routerLink="/components/button">Button</a>, so re-skinning the
            theme re-skins the CTA automatically.
          </p>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The heading and body render as plain <code>&lt;p&gt;</code> text
            &mdash; they are <em>not</em> semantic headings, so place the empty
            state within an appropriately-headed region if a landmark is needed.
            The icon is a <code>mat-icon</code> ligature, which is marked
            <code>aria-hidden</code> so screen readers skip it. When you supply a
            <code>ctaLabel</code>, the CTA is a real
            <code>&lt;rhombus-button&gt;</code> &mdash; focusable and
            keyboard-activatable &mdash; whose visible label names the action, so
            no extra <code>aria-label</code> is needed.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Default</h2>
        <div class="demo-surface">
          <rhombus-empty-state heading="No data" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>With body</h2>
        <div class="demo-surface">
          <rhombus-empty-state
            icon="search"
            heading="No results"
            body="Try adjusting your filters or search terms to find what you're looking for."
          />
        </div>
      </section>

      <section class="showcase-section">
        <h2>With a call to action</h2>
        <div class="demo-surface">
          <rhombus-empty-state
            icon="description"
            heading="No drafts yet"
            body="Start writing — your first post is one click away."
            ctaLabel="New post"
            (ctaClick)="onCta()"
          />
        </div>
        <p class="demo-note">
          <code>(ctaClick)</code> fired {{ ctaCount() }}
          time{{ ctaCount() === 1 ? '' : 's' }}.
        </p>
      </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .demo-surface {
      border: 1px solid var(--border);
      border-radius: 12px;
      background-color: var(--surface-0);
    }

    .demo-note {
      margin: 0.75rem 0 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `,
})
export default class EmptyStatePageComponent {
  protected readonly ctaCount = signal(0);

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusEmptyStateComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-drafts',
  imports: [RhombusEmptyStateComponent],
  template: \`
    <rhombus-empty-state
      icon="description"
      heading="No drafts yet"
      body="Start writing — your first post is one click away."
      ctaLabel="New post"
      (ctaClick)="createPost()"
    />
  \`,
})
export class DraftsComponent {
  createPost(): void {
    /* navigate to the editor… */
  }
}`;

  protected onCta(): void {
    this.ctaCount.update((n) => n + 1);
  }
}
