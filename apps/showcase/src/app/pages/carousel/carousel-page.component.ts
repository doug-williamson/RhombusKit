import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusCarouselComponent,
  RhombusCarouselSlideComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-carousel-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusCarouselComponent,
    RhombusCarouselSlideComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Carousel"
      [hasUsage]="true"
      [apiKey]="apiKeys"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A carousel cycles through a set of equivalent, browsable slides —
          featured content, imagery, testimonials. RhombusKit's
          <code>&lt;rhombus-carousel&gt;</code> is bespoke and follows the APG
          Auto-Rotating Carousel pattern: a labelled region of slide groups with
          CSS-only transitions, keyboard-navigable dots, and autoplay that
          respects <code>prefers-reduced-motion</code>.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="basicUsage">
            <rhombus-carousel label="Featured products">
              <rhombus-carousel-slide>
                <div class="slide slide--a">Slide one</div>
              </rhombus-carousel-slide>
              <rhombus-carousel-slide>
                <div class="slide slide--b">Slide two</div>
              </rhombus-carousel-slide>
              <rhombus-carousel-slide>
                <div class="slide slide--c">Slide three</div>
              </rhombus-carousel-slide>
            </rhombus-carousel>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>For <strong>equivalent, browsable</strong> content a user can skip through — a gallery, featured items, quotes.</li>
            <li>When space is limited and the content is <strong>supplementary</strong>, not essential to the task.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>Never place a <strong>critical, one-time call to action</strong> on an auto-rotating slide — it may rotate away before it's seen.</li>
            <li>When each section must stay <strong>individually reachable</strong>, use <a routerLink="/components/tabs">Tabs</a> or an <a routerLink="/components/accordion">Accordion</a>.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Wrap a <code>&lt;rhombus-carousel-slide&gt;</code> per slide in a
          labelled <code>&lt;rhombus-carousel&gt;</code>. Everything else —
          arrows, dots, and the play control — is built in.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; inputs</h2>
          <ul>
            <li><code>label</code> — the accessible name of the carousel region (required for a meaningful landmark).</li>
            <li><code>autoplay</code> / <code>interval</code> — auto-rotate every <em>interval</em> ms; autoplay never starts under reduced-motion or with a single slide.</li>
            <li><code>loop</code> — wrap around the ends (index rewind); <code>transition</code> — <code>slide</code> or <code>fade</code>.</li>
            <li><code>pauseOnHover</code>, <code>swipe</code>, <code>showArrows</code>, <code>showDots</code> — toggle the built-in affordances.</li>
            <li><code>[(selectedIndex)]</code> — the shown slide (clamped); imperative <code>next()</code>/<code>previous()</code>/<code>select()</code>/<code>play()</code>/<code>pause()</code> and readonly <code>count</code>/<code>playing</code> signals.</li>
            <li>Per-slide <code>label</code> overrides the default “N of M” name.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The host is a <code>role="region"</code> with
            <code>aria-roledescription="carousel"</code>; each slide is a
            <code>role="group"</code> (<strong>not</strong> a tabpanel) with
            <code>aria-roledescription="slide"</code> and a name. Non-active
            slides are <code>inert</code> and <code>aria-hidden</code>. The live
            region is <code>off</code> while auto-rotating and
            <code>polite</code> when idle, and a play/pause control lets users
            stop the motion. Dots form a keyboard-navigable group with
            <code>aria-current</code> and roving <code>tabindex</code>. Autoplay,
            swiping, and timers are all gated for SSR.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Autoplay &amp; fade</h2>
          <p class="showcase-section__lead">
            Autoplay pauses on hover and when a user prefers reduced motion. Use
            the play/pause control to stop rotation.
          </p>
          <app-example [code]="autoplayUsage">
            <rhombus-carousel
              label="Auto-rotating gallery"
              autoplay
              [interval]="3000"
              transition="fade"
            >
              <rhombus-carousel-slide>
                <div class="slide slide--a">Auto one</div>
              </rhombus-carousel-slide>
              <rhombus-carousel-slide>
                <div class="slide slide--b">Auto two</div>
              </rhombus-carousel-slide>
              <rhombus-carousel-slide>
                <div class="slide slide--c">Auto three</div>
              </rhombus-carousel-slide>
            </rhombus-carousel>
          </app-example>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    rhombus-carousel {
      display: block;
      max-width: 520px;
    }
    .slide {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-on-accent);
    }
    .slide--a { background: var(--text-accent); }
    .slide--b { background: var(--btn-primary-bg); }
    .slide--c { background: var(--border-strong); color: var(--text-primary); }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
  `,
})
export default class CarouselPageComponent {
  protected readonly apiKeys = [
    'RhombusCarouselComponent',
    'RhombusCarouselSlideComponent',
  ];

  protected readonly basicUsage = `<rhombus-carousel label="Featured products">
  <rhombus-carousel-slide>…slide one…</rhombus-carousel-slide>
  <rhombus-carousel-slide>…slide two…</rhombus-carousel-slide>
  <rhombus-carousel-slide>…slide three…</rhombus-carousel-slide>
</rhombus-carousel>`;

  protected readonly usage = `import {
  RhombusCarouselComponent,
  RhombusCarouselSlideComponent,
} from '@rhombuskit/core';

@Component({
  selector: 'app-gallery',
  imports: [RhombusCarouselComponent, RhombusCarouselSlideComponent],
  template: \`
    <rhombus-carousel label="Gallery" autoplay [interval]="4000">
      <rhombus-carousel-slide><img src="…" alt="…" /></rhombus-carousel-slide>
      <rhombus-carousel-slide><img src="…" alt="…" /></rhombus-carousel-slide>
    </rhombus-carousel>
  \`,
})
export class GalleryComponent {}`;

  protected readonly autoplayUsage = `<rhombus-carousel
  label="Auto-rotating gallery"
  autoplay
  [interval]="3000"
  transition="fade"
>
  <rhombus-carousel-slide>…</rhombus-carousel-slide>
  <rhombus-carousel-slide>…</rhombus-carousel-slide>
</rhombus-carousel>`;
}
