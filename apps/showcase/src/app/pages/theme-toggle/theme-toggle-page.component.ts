import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusThemeMenuComponent,
  RhombusThemeToggleComponent,
} from '@rhombuskit/core';
import { RhombusThemeService } from '@rhombuskit/theme-engine';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-theme-toggle-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusThemeToggleComponent,
    RhombusThemeMenuComponent,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Theme Controls"
      [hasUsage]="true"
      apiKey="RhombusThemeToggleComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          Two UI primitives drive the same <code>RhombusThemeService</code> from
          <code>&#64;rhombuskit/theme-engine</code>:
          <code>&lt;rhombus-theme-toggle&gt;</code> is a three-state icon button
          that cycles light &rarr; dark &rarr; system, and
          <code>&lt;rhombus-theme-menu&gt;</code> opens a dropdown with explicit
          Light / Dark / System items. Both stay in sync with each other and the
          shell header.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-theme-toggle />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Reach for the <strong>toggle</strong> in compact contexts (a tight
              icon row) where a single tappable target beats a dropdown, at the
              cost of up to three taps to reach a given theme.
            </li>
            <li>
              Reach for the <strong>menu</strong> in headers and toolbars with
              room for a dropdown &mdash; every preference is one click away and
              the active one is marked.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a single on/off setting that isn't theme preference, use a
              <a routerLink="/components/switch">Switch</a> instead of a cycling
              icon button.
            </li>
            <li>
              For a flat list of unrelated actions off a trigger, reach for a
              <a routerLink="/components/menu">Menu</a> &mdash; the theme menu is
              purpose-built for the three theme options only.
            </li>
            <li>
              To document or expose the colour tokens these controls switch
              between, see <a routerLink="/components/theming">Theming</a> rather
              than building bespoke toggles.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/theming">Theming</a> &mdash; the token contract these controls switch.</li>
            <li><a routerLink="/components/menu">Menu</a> &mdash; the dropdown primitive the theme menu specialises.</li>
            <li><a routerLink="/components/switch">Switch</a> &mdash; binary on/off settings.</li>
            <li><a routerLink="/components/app-shell">App Shell</a> &mdash; the header these controls usually live in.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Both controls are thin UI over <code>RhombusThemeService</code>: drop
          either tag in a template &mdash; no inputs are required &mdash; and it
          reads and writes the shared theme preference signal.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>&lt;rhombus-theme-toggle&gt;</code> renders a single Material
              icon button that cycles light &rarr; dark &rarr; system on click.
              Neither control projects content &mdash; there are no named or
              default content slots.
            </li>
            <li>
              <code>&lt;rhombus-theme-menu&gt;</code> renders an icon-button
              trigger that opens a Material menu with explicit Light / Dark /
              System items; the active preference is highlighted.
            </li>
            <li>
              Customise the glyphs on either control with
              <code>lightIcon</code>, <code>darkIcon</code>, and
              <code>systemIcon</code> (any Material Symbol name). The toggle
              additionally accepts <code>[showTooltip]="false"</code> to suppress
              its hover tooltip.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The toggle and the menu trigger read these contract tokens on the
            host:
          </p>
          <ul>
            <li><code>--text-secondary</code> &mdash; idle icon colour</li>
            <li><code>--text-primary</code> &mdash; icon colour on hover</li>
          </ul>
          <p>
            The theme menu's <strong>panel</strong> renders in the CDK overlay,
            so overrides for it must target the
            <code>.cdk-overlay-container .rhombus-theme-menu__panel</code> scope.
            There it reads:
          </p>
          <ul>
            <li><code>--surface-0</code> &mdash; panel background</li>
            <li><code>--text-primary</code> &mdash; item label colour</li>
            <li><code>--text-secondary</code> &mdash; item icon colour</li>
            <li><code>--text-accent</code> &mdash; the active item's label and icon</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The <strong>toggle</strong> renders a native icon
            <code>&lt;button&gt;</code>, so it is focusable and activates on
            <kbd>Enter</kbd> / <kbd>Space</kbd>. Its <code>aria-label</code>
            announces the current preference (e.g. &ldquo;Switch theme &mdash;
            current: dark&rdquo;). A hover <em>tooltip</em> names the theme the
            next click selects (&ldquo;Light mode (click for dark)&rdquo;); it is
            a visual Material tooltip, so suppress it with
            <code>[showTooltip]="false"</code> when you don't want it.
          </p>
          <p>
            The <strong>menu</strong> trigger is also a native icon button; its
            <code>aria-label</code> reads &ldquo;Theme: &lt;pref&gt;. Open theme
            menu.&rdquo; The dropdown is a Material menu, so it carries
            <code>role="menu"</code> with <code>menuitem</code> children and the
            usual arrow-key / <kbd>Escape</kbd> keyboard semantics. The active
            preference is conveyed visually via an accent colour; there is no
            <code>aria-current</code> or live-region announcement of which item
            is active.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>When to use which</h2>
        <p>
          Reach for the <strong>menu</strong> in headers and toolbars where
          there's room for a dropdown &mdash; every preference is one click away
          and the active one is marked. Reach for the <strong>cycle</strong> in
          compact contexts (a tight icon row) where a single tappable target
          beats a dropdown, at the cost of needing up to three taps to reach a
          given theme.
        </p>
      </section>

      <section class="showcase-section">
        <h2>Live state</h2>
        <p>
          <code>preference()</code>:
          <strong>{{ theme.preference() }}</strong>
          &nbsp;&middot;&nbsp;
          <code>current()</code> (resolved):
          <strong>{{ theme.current() }}</strong>
        </p>
        <p>
          When preference is <code>system</code>, change your OS appearance and
          watch <code>current()</code> follow without a reload.
        </p>
      </section>

      <section class="showcase-section">
        <h2>Theme menu</h2>
        <p>
          Each item calls <code>setTheme()</code> directly &mdash; no cycling.
          The active preference is highlighted; clicking it is a no-op.
        </p>
        <div class="showcase-row">
          <rhombus-theme-menu />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Theme menu &mdash; custom icons</h2>
        <div class="showcase-row">
          <rhombus-theme-menu
            lightIcon="wb_sunny"
            darkIcon="nightlight"
            systemIcon="settings_brightness"
          />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Theme toggle (cycle)</h2>
        <div class="showcase-row">
          <rhombus-theme-toggle />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Theme toggle &mdash; custom icons</h2>
        <div class="showcase-row">
          <rhombus-theme-toggle
            lightIcon="wb_sunny"
            darkIcon="nightlight"
            systemIcon="settings_brightness"
          />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Theme toggle &mdash; tooltip disabled</h2>
        <div class="showcase-row">
          <rhombus-theme-toggle [showTooltip]="false" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Programmatic API</h2>
        <p>
          Both controls are sugar over <code>RhombusThemeService</code>. For
          direct control, call <code>setTheme()</code> on the service.
        </p>
        <div class="showcase-row">
          <rhombus-button variant="secondary" (click)="setLight()">
            setTheme('rhombus-light')
          </rhombus-button>
          <rhombus-button variant="secondary" (click)="setDark()">
            setTheme('rhombus-dark')
          </rhombus-button>
          <rhombus-button variant="secondary" (click)="setSystem()">
            setTheme('system')
          </rhombus-button>
        </div>
      </section>
      </div>
    </app-component-page>
  `,
})
export default class ThemeTogglePageComponent {
  protected readonly theme = inject(RhombusThemeService);

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusThemeToggleComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-app-bar',
  imports: [RhombusThemeToggleComponent],
  template: \`
    <rhombus-theme-toggle />
  \`,
})
export class AppBarComponent {}`;

  protected setLight(): void {
    this.theme.setTheme('rhombus-light');
  }

  protected setDark(): void {
    this.theme.setTheme('rhombus-dark');
  }

  protected setSystem(): void {
    this.theme.setTheme('system');
  }
}
