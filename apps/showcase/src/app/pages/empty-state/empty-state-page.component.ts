import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RhombusEmptyStateComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-empty-state-page',
  standalone: true,
  imports: [RhombusEmptyStateComponent, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Empty State" apiKey="RhombusEmptyStateComponent">
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-empty-state&gt;</code> is a centered icon, heading,
          optional body, and optional CTA for &ldquo;nothing here yet&rdquo;
          surfaces. The icon is a Material <strong>ligature</strong> name and the
          CTA composes <code>&lt;rhombus-button&gt;</code>, so it inherits the
          token contract and re-skins with the theme.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Reach for it when a list, column, or search result has
              <strong>no items to show</strong> &mdash; give the user a reason
              and, where there's a next step, a CTA.
            </li>
            <li>
              The element selector <code>rhombus-empty-state</code> is distinct
              from the data-table's <code>[rhombusEmptyState]</code> directive
              and nests cleanly inside it for the table's empty path.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
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

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            The heading and body are plain text, and the decorative icon adds no
            spurious label. When you supply a <code>ctaLabel</code>, the CTA is a
            real <code>&lt;rhombus-button&gt;</code> &mdash; focusable and
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
