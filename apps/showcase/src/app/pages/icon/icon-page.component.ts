import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusIconComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-icon-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusIconComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Icon"
      [hasUsage]="true"
      apiKey="RhombusIconComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-icon&gt;</code> renders an icon as an inline
          <strong>currentColor SVG</strong> — so it inherits text colour and
          needs no icon font. Icons come from a registry you populate once with
          <code>provideRhombusIcons()</code> (a <code>name → SVG</code> map, the
          same shape as a Material <code>addSvgIconLiteral</code> map). The
          library's built-in glyphs are pre-registered, and any unregistered
          name falls back to <code>&lt;mat-icon&gt;</code> (Material font).
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <div class="demo-row">
              <rhombus-icon name="rhombus" />
              <rhombus-icon name="heart" />
              <rhombus-icon name="more_vert" />
              <rhombus-icon name="light_mode" />
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              To show a <strong>standalone icon</strong> in your own markup —
              next to text, inside a custom control, or as a status glyph.
            </li>
            <li>
              When you want icons that <strong>theme with the text colour</strong>
              automatically and ship as bundled SVG (no icon-font request).
            </li>
            <li>
              To replace ad-hoc <code>&lt;mat-icon svgIcon&gt;</code> usage with
              a registry that lives in <code>@rhombuskit/core</code>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For an icon that is <em>part of</em> another RhombusKit component,
              use that component's icon input — e.g.
              <a routerLink="/components/button">Button</a>'s
              <code>leadingIcon</code> or
              <a routerLink="/components/empty-state">Empty State</a>'s
              <code>icon</code>.
            </li>
            <li>
              For a purely decorative flourish that the design owns in CSS, a
              background image or CSS shape may be simpler than a DOM icon.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/button">Button</a> &mdash; renders icons
              via <code>leadingIcon</code> / <code>trailingIcon</code>.
            </li>
            <li>
              <a routerLink="/components/empty-state">Empty State</a> &mdash;
              shows a large illustrative icon.
            </li>
            <li>
              <a routerLink="/components/theme-toggle">Theme Controls</a> &mdash;
              built on the same pre-registered glyphs.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Register your icon set once at bootstrap with
          <code>provideRhombusIcons()</code>, then reference each icon by
          <code>name</code>. Colour follows <code>currentColor</code>; size is a
          preset or a pixel number.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; inputs</h2>
          <ul>
            <li>
              <code>[name]</code> &mdash; <strong>required</strong>. The
              registered icon name. Unregistered names fall back to a
              <code>&lt;mat-icon&gt;</code> font glyph of the same name.
            </li>
            <li>
              <code>[size]</code> &mdash; <code>'sm'</code> (20px),
              <code>'md'</code> (24px, default), <code>'lg'</code> (32px), or an
              explicit pixel number.
            </li>
            <li>
              <code>[ariaLabel]</code> &mdash; when set, the icon is exposed as
              <code>role="img"</code> with that label; omit it (the default) and
              the icon is decorative (<code>aria-hidden</code>).
            </li>
            <li>
              The component takes content through inputs only &mdash; there are
              <strong>no projection slots</strong>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <ul>
            <li>
              <code>currentColor</code> &mdash; the SVG inherits the surrounding
              text colour, so set <code>color</code> on an ancestor to tint it.
            </li>
            <li>
              <code>--rhombus-icon-size</code> &mdash; the box length the
              component sets from <code>[size]</code>; the SVG fills it.
            </li>
          </ul>
          <p>
            Registered SVGs should use <code>fill="currentColor"</code> (and omit
            <code>width</code>/<code>height</code>) so colour and size flow
            through the component.
          </p>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Icons are <strong>decorative by default</strong> — the host carries
            <code>aria-hidden="true"</code>, so screen readers skip them. This is
            correct when the icon sits beside a text label that already conveys
            the meaning. When an icon stands alone and <em>is</em> the meaning
            (e.g. an icon-only button), give it a name with
            <code>[ariaLabel]</code>; the component then exposes
            <code>role="img"</code> with that label.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Built-in glyphs</h2>
          <p class="demo-note">
            Pre-registered, so they render with no <code>provideRhombusIcons()</code>
            call and no icon font.
          </p>
          <div class="demo-row">
            <rhombus-icon name="more_vert" ariaLabel="More" />
            <rhombus-icon name="light_mode" ariaLabel="Light mode" />
            <rhombus-icon name="dark_mode" ariaLabel="Dark mode" />
            <rhombus-icon name="contrast" ariaLabel="System theme" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Registered icons</h2>
          <p class="demo-note">
            Registered for this showcase via <code>provideRhombusIcons()</code>.
          </p>
          <div class="demo-row">
            <rhombus-icon name="rhombus" ariaLabel="Rhombus" />
            <rhombus-icon name="heart" ariaLabel="Favourite" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Sizes</h2>
          <div class="demo-row demo-row--baseline">
            <rhombus-icon name="rhombus" size="sm" />
            <rhombus-icon name="rhombus" size="md" />
            <rhombus-icon name="rhombus" size="lg" />
            <rhombus-icon name="rhombus" [size]="48" />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Colour follows currentColor</h2>
          <div class="demo-row">
            <span style="color: var(--text-accent)">
              <rhombus-icon name="heart" size="lg" />
            </span>
            <span style="color: var(--text-secondary)">
              <rhombus-icon name="heart" size="lg" />
            </span>
            <span style="color: var(--text-disabled)">
              <rhombus-icon name="heart" size="lg" />
            </span>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Font fallback</h2>
          <p class="demo-note">
            An unregistered name (<code>settings</code>) falls back to a Material
            font glyph.
          </p>
          <div class="demo-row">
            <rhombus-icon name="settings" ariaLabel="Settings" />
            <rhombus-icon name="search" ariaLabel="Search" />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .demo-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      color: var(--text-primary);
    }

    .demo-row--baseline {
      align-items: baseline;
    }

    .demo-note {
      margin: 0 0 0.75rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `,
})
export default class IconPageComponent {
  /** Minimal import + registration snippet shown in the Overview/Usage tabs. */
  protected readonly usage = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideRhombusIcons, RhombusIconComponent } from '@rhombuskit/core';

// Register your icon set once (any name → SVG-literal map; the same shape
// you'd hand Material's addSvgIconLiteral).
bootstrapApplication(AppComponent, {
  providers: [
    provideRhombusIcons({
      heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="…" /></svg>',
    }),
  ],
});

@Component({
  selector: 'app-like-button',
  imports: [RhombusIconComponent],
  template: \`
    <button type="button">
      <rhombus-icon name="heart" size="sm" ariaLabel="Like" />
      Like
    </button>
  \`,
})
export class LikeButtonComponent {}`;
}
