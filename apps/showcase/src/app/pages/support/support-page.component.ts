import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RhombusIconComponent } from '@rhombuskit/core';

const REPO = 'https://github.com/doug-williamson/RhombusKit';

/**
 * `/support` — a quiet, honest sponsorship page. The framing is deliberately
 * personal: RhombusKit is a solo, AI-assisted project, and sponsorship is a
 * longevity signal, not a paywall (every component and fix stays free + MIT).
 * The GitHub Sponsors links go live the moment enrollment completes — no code
 * change needed (see .github/FUNDING.yml). It also surfaces the no-cost ways to
 * help, so the page reinforces the contribution flywheel rather than only asking.
 */
@Component({
  selector: 'app-support-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RhombusIconComponent],
  template: `
    <div class="showcase-page support">
      <header class="showcase-page__header">
        <h1>Support RhombusKit</h1>
        <p class="support__lead">
          RhombusKit is built and maintained by one person, with a lot of help
          from AI tooling. Sponsorship keeps it independent, accessible, and
          moving — and every component and fix stays free and MIT-licensed.
        </p>
        <p class="support__cta">
          <a class="support__sponsor" [href]="sponsorsUrl" target="_blank" rel="noopener">
            <rhombus-icon name="heart" size="sm" />
            Sponsor on GitHub
          </a>
          <span class="support__cta-note">Monthly or one-time, from the price of a coffee.</span>
        </p>
      </header>

      <section class="support__section" aria-labelledby="why">
        <h2 id="why">A longevity signal, not a paywall</h2>
        <p>
          There's no premium tier, no paywalled LTS, no locked components. What
          sponsorship actually does is cover the cost of keeping the project
          healthy and shipping at this pace:
        </p>
        <ul class="support__list">
          <li>The CI minutes that run the WCAG 2.1 AA checks on every pull request.</li>
          <li>The <code>rhombuskit.online</code> docs domain and hosting.</li>
          <li>
            The AI-assisted development workflow that lets a solo maintainer ship a
            full release train — including the Claude subscription behind it.
          </li>
          <li>
            Time for the <a routerLink="/roadmap">public roadmap</a> — the components
            you request and upvote.
          </li>
        </ul>
      </section>

      <section class="support__section" aria-labelledby="free">
        <h2 id="free">Not in a position to sponsor?</h2>
        <p>These help just as much, and all are credited:</p>
        <ul class="support__list">
          <li><a [href]="repoUrl" target="_blank" rel="noopener">Star the repo.</a></li>
          <li>
            <a routerLink="/roadmap">Propose or upvote a component</a> on the roadmap.
          </li>
          <li>
            <a [href]="issuesUrl" target="_blank" rel="noopener">Report an accessibility gap or bug.</a>
          </li>
          <li>Tell another Angular team that RhombusKit exists.</li>
        </ul>
        <p class="support__thanks">
          Thank you — genuinely. Every star, issue, and dollar makes independent
          open source a little more sustainable.
        </p>
      </section>
    </div>
  `,
  styles: `
    .support__lead {
      color: var(--text-secondary);
      max-width: 70ch;
      margin: 0.5rem 0 0;
    }
    .support__cta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1rem;
      margin: 1.25rem 0 0;
    }
    .support__sponsor {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border-radius: var(--radius-md);
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      transition: filter 150ms ease;
    }
    .support__sponsor:hover {
      filter: brightness(0.95);
    }
    .support__cta-note {
      color: var(--text-muted);
      font-size: 0.8125rem;
    }
    .support__section {
      margin-top: 2.5rem;
      max-width: 70ch;
    }
    .support__section h2 {
      font-size: 1.15rem;
      margin: 0 0 0.5rem;
    }
    .support__section p {
      color: var(--text-secondary);
      margin: 0.5rem 0;
    }
    .support__list {
      color: var(--text-secondary);
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin: 0.5rem 0 0;
    }
    .support__list code {
      font-family: var(--font-mono);
      font-size: 0.85em;
      background: var(--surface-2);
      border-radius: var(--radius-sm);
      padding: 0.05em 0.35em;
    }
    .support__section a {
      color: var(--text-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 500;
    }
    .support__thanks {
      margin-top: 1.25rem;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
  `,
})
export default class SupportPageComponent {
  protected readonly sponsorsUrl = 'https://github.com/sponsors/doug-williamson';
  protected readonly repoUrl = REPO;
  protected readonly issuesUrl = `${REPO}/issues/new/choose`;
}
