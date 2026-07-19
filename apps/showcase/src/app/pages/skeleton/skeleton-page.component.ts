import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusCardComponent,
  RhombusCodeBlockComponent,
  RhombusSkeletonComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-skeleton-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCardComponent,
    RhombusCodeBlockComponent,
    RhombusSkeletonComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Skeleton"
      [hasUsage]="true"
      apiKey="RhombusSkeletonComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A skeleton is a placeholder that mimics the <em>shape</em> of content
          while it loads, reducing layout shift and perceived wait.
          RhombusKit's <code>&lt;rhombus-skeleton&gt;</code> is pure CSS — a
          <code>--surface-2</code> block with an optional compositor-only shimmer
          — with no Material dependency and no new tokens.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="basicUsage">
            <div class="sk-card">
              <rhombus-skeleton variant="circle" [width]="48" />
              <div class="sk-card__body">
                <rhombus-skeleton [width]="'40%'" />
                <rhombus-skeleton [lines]="2" />
              </div>
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              While <strong>fetching content whose layout is known</strong> — a
              profile card, a list row, a media thumbnail — so the page holds its
              shape and doesn't jump when data arrives.
            </li>
            <li>
              For waits long enough to notice (roughly <strong>&gt; 300ms</strong>)
              where showing the coming structure feels faster than a blank space
              or a lone spinner.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For an <strong>indeterminate action</strong> with no known result
              shape (submitting a form, a background sync), use
              <a routerLink="/components/progress">Progress</a> — a spinner or bar.
            </li>
            <li>
              When there is <strong>genuinely no data</strong> to load, use an
              <a routerLink="/components/empty-state">Empty State</a>, not a
              skeleton that will never resolve.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/progress">Progress</a> — an indeterminate spinner/bar for a discrete wait.</li>
            <li><a routerLink="/components/empty-state">Empty State</a> — for the no-data case.</li>
            <li><a routerLink="/components/avatar">Avatar</a> / <a routerLink="/components/card">Card</a> — the real content a skeleton stands in for.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Drop a <code>&lt;rhombus-skeleton&gt;</code> wherever content will land.
          Pick a <code>variant</code>, size it with <code>width</code>/<code>height</code>,
          and use <code>lines</code> for paragraphs or <code>count</code> to repeat
          a row.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; inputs</h2>
          <ul>
            <li><code>variant</code> — <code>text</code> (line bars), <code>circle</code> (round media), or <code>rect</code> (image/card block).</li>
            <li><code>width</code> / <code>height</code> / <code>radius</code> — a number (px) or any CSS length/percentage; omit for a sensible per-variant default.</li>
            <li><code>lines</code> — number of bars in a text block; <code>lastLineWidth</code> (default <code>60%</code>) gives the final line a ragged edge.</li>
            <li><code>count</code> — repeats the whole block, for a list of placeholder rows.</li>
            <li><code>animated</code> — the shimmer sweep (on by default); automatically dropped under <code>prefers-reduced-motion</code>.</li>
            <li><code>label</code> — omit for a decorative placeholder, or pass a phrase to announce loading (see Accessibility).</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <ul>
            <li><code>--surface-2</code> — the placeholder block fill.</li>
            <li><code>--surface-3</code> — the shimmer highlight sweep.</li>
            <li><code>--radius-xs</code> / <code>--radius-md</code> / <code>--radius-full</code> — the per-variant corner defaults.</li>
            <li><code>--motion-duration-slow</code> / <code>--motion-ease-standard</code> — the shimmer timing.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            A skeleton is <strong>decorative by default</strong> — the host is
            <code>aria-hidden</code>, so assistive tech skips the placeholder bars
            entirely. The surrounding region should own the
            <code>aria-busy</code>/live-region wiring for the load.
          </p>
          <p>
            If instead you want the skeleton to <strong>announce the load itself</strong>,
            pass a <code>label</code>: the host becomes a polite
            <code>role="status"</code> region that announces the label (rendered
            as visually-hidden text so the live region has real content to speak),
            while the inner bars stay hidden from assistive tech. Either way the
            shimmer is a compositor-only <code>transform</code> sweep, dropped
            under <code>prefers-reduced-motion</code> — leaving a static,
            never-blank block.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Text lines</h2>
          <p class="showcase-section__lead">
            <code>lines</code> stacks bars; the last is shortened to
            <code>lastLineWidth</code>.
          </p>
          <div class="sk-block">
            <rhombus-skeleton [lines]="4" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Media placeholders</h2>
          <div class="sk-row">
            <rhombus-skeleton variant="circle" [width]="64" />
            <rhombus-skeleton variant="rect" [width]="160" [height]="96" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Profile card</h2>
          <rhombus-card>
            <div class="sk-card">
              <rhombus-skeleton variant="circle" [width]="48" />
              <div class="sk-card__body">
                <rhombus-skeleton [width]="'40%'" />
                <rhombus-skeleton [lines]="2" />
              </div>
            </div>
          </rhombus-card>
        </section>

        <section class="showcase-section">
          <h2>Repeated rows</h2>
          <p class="showcase-section__lead">
            <code>count</code> repeats a block — here a list of five rows.
          </p>
          <div class="sk-block">
            <rhombus-skeleton variant="rect" [height]="44" [radius]="8" [count]="5" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Static (no shimmer)</h2>
          <p class="showcase-section__lead">
            <code>[animated]="false"</code> — also the automatic fallback under
            reduced-motion. The block stays visible, never blank.
          </p>
          <div class="sk-block">
            <rhombus-skeleton [lines]="2" [animated]="false" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Announced loading</h2>
          <p class="showcase-section__lead">
            With a <code>label</code>, the skeleton is a
            <code>role="status"</code> busy region.
          </p>
          <div class="sk-card">
            <rhombus-skeleton
              variant="circle"
              [width]="48"
              label="Loading profile"
            />
            <div class="sk-card__body">
              <rhombus-skeleton [width]="'40%'" />
              <rhombus-skeleton [lines]="2" />
            </div>
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .sk-block {
      max-width: 480px;
    }
    .sk-row {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
    }
    .sk-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      /* width:100% so the card fills its container (incl. the example
         preview's flex row) rather than shrinking to the circle and
         collapsing the flex:1 body to zero width. */
      width: 100%;
      max-width: 420px;
    }
    .sk-card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 0.25rem;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
  `,
})
export default class SkeletonPageComponent {
  protected readonly basicUsage = `<div class="card">
  <rhombus-skeleton variant="circle" [width]="48" />
  <div>
    <rhombus-skeleton [width]="'40%'" />
    <rhombus-skeleton [lines]="2" />
  </div>
</div>`;

  protected readonly usage = `import { RhombusSkeletonComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-user-card',
  imports: [RhombusSkeletonComponent],
  template: \`
    @if (loading()) {
      <!-- decorative: the region owns aria-busy -->
      <div [attr.aria-busy]="true">
        <rhombus-skeleton variant="circle" [width]="48" />
        <rhombus-skeleton [lines]="3" />
      </div>
    } @else {
      <app-user [user]="user()" />
    }
  \`,
})
export class UserCardComponent {
  loading = signal(true);
}`;
}
