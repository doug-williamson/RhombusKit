import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { RhombusButtonComponent, RhombusToastService } from '@rhombuskit/core';
import { AnalyticsService } from './analytics.service';

const REPO = 'https://github.com/doug-williamson/RhombusKit';

/**
 * Per-page feedback footer, rendered on every component page by
 * {@link ComponentPageComponent}. It captures intent at the point of friction:
 * an anonymous "was this helpful?" signal (for visitors who'll never open
 * GitHub) plus one-click deep links into the prefilled GitHub issue forms with
 * the component already filled in. Dogfoods `rhombus-button` +
 * `RhombusToastService`; all clicks emit privacy-friendly analytics events.
 */
@Component({
  selector: 'app-page-feedback',
  standalone: true,
  imports: [RhombusButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-feedback" aria-labelledby="page-feedback-heading">
      <div class="page-feedback__ask">
        @if (voted()) {
          <p class="page-feedback__thanks" role="status">Thanks for the feedback!</p>
        } @else {
          <p id="page-feedback-heading" class="page-feedback__prompt">
            Was this page helpful?
          </p>
          <rhombus-button
            variant="secondary"
            aria-label="Yes, this page was helpful"
            (click)="vote('yes')"
          >
            Yes
          </rhombus-button>
          <rhombus-button
            variant="secondary"
            aria-label="No, this page was not helpful"
            (click)="vote('no')"
          >
            No
          </rhombus-button>
        }
      </div>

      <nav class="page-feedback__links" aria-label="Contribute to this page">
        <a [href]="featureUrl()" target="_blank" rel="noopener" (click)="track('suggest')">
          Suggest a change
        </a>
        <a [href]="a11yUrl()" target="_blank" rel="noopener" (click)="track('a11y')">
          Report an accessibility issue
        </a>
        <a [href]="editUrl()" target="_blank" rel="noopener" (click)="track('edit')">
          Edit this page on GitHub
        </a>
      </nav>
    </section>
  `,
  styles: `
    .page-feedback {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem 1.5rem;
      font-size: 0.875rem;
    }
    .page-feedback__ask {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .page-feedback__prompt,
    .page-feedback__thanks {
      margin: 0;
      color: var(--text-secondary);
    }
    .page-feedback__links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-feedback__links a {
      color: var(--text-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .page-feedback__links a:hover {
      text-decoration-thickness: 2px;
    }
  `,
})
export class PageFeedbackComponent {
  /** Component display name (e.g. "Button") — prefilled into the issue forms. */
  readonly component = input.required<string>();

  private readonly router = inject(Router);
  private readonly toast = inject(RhombusToastService);
  private readonly analytics = inject(AnalyticsService);

  protected readonly voted = signal(false);

  /** Last URL path segment, e.g. `/components/button` → `button`. */
  private readonly slug = computed(() => {
    const path = this.router.url.split(/[?#]/)[0];
    const segments = path.split('/').filter(Boolean);
    return segments[segments.length - 1] ?? '';
  });

  protected readonly featureUrl = computed(
    () =>
      `${REPO}/issues/new?` +
      new URLSearchParams({
        template: '2-feature-request.yml',
        package: '@rhombuskit/core',
        component: this.component(),
      }).toString(),
  );

  protected readonly a11yUrl = computed(
    () =>
      `${REPO}/issues/new?` +
      new URLSearchParams({
        template: '4-accessibility.yml',
        component: this.component(),
      }).toString(),
  );

  protected readonly editUrl = computed(
    () => `${REPO}/tree/main/apps/showcase/src/app/pages/${this.slug()}`,
  );

  protected vote(value: 'yes' | 'no'): void {
    this.voted.set(true);
    this.analytics.event(
      `feedback-${value}/${this.slug()}`,
      `Feedback ${value}: ${this.component()}`,
    );
    this.toast.success('Thanks for the feedback!');
  }

  protected track(action: 'suggest' | 'a11y' | 'edit'): void {
    this.analytics.event(`feedback-${action}/${this.slug()}`, `${action}: ${this.component()}`);
  }
}
