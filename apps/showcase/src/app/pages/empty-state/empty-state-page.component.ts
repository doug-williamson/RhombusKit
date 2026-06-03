import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RhombusEmptyStateComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-empty-state-page',
  standalone: true,
  imports: [RhombusEmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Empty State</h1>
        <p>
          A centered icon, heading, optional body, and optional CTA for
          "nothing here yet" surfaces. The icon is a Material
          <strong>ligature</strong> name; the CTA composes
          <code>&lt;rhombus-button&gt;</code>. The element selector
          <code>rhombus-empty-state</code> is distinct from the data-table's
          <code>[rhombusEmptyState]</code> directive and nests cleanly inside it.
        </p>
      </header>

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

  protected onCta(): void {
    this.ctaCount.update((n) => n + 1);
  }
}
