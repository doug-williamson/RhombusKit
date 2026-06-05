import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  RhombusButtonComponent,
  RhombusThemeMenuComponent,
  RhombusThemeToggleComponent,
} from '@rhombuskit/core';
import { RhombusThemeService } from '@rhombuskit/theme-engine';
import { ComponentPageComponent } from '../../shared/component-page.component';

@Component({
  selector: 'app-theme-toggle-page',
  standalone: true,
  imports: [
    RhombusThemeToggleComponent,
    RhombusThemeMenuComponent,
    RhombusButtonComponent,
    ComponentPageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Theme Controls" apiKey="RhombusThemeToggleComponent">
      <div overview>
        <p>
          Two UI primitives drive the same <code>RhombusThemeService</code> from
          <code>&#64;rhombuskit/theme-engine</code>.
          <code>&lt;rhombus-theme-menu&gt;</code> opens a dropdown with explicit
          Light / Dark / System items;
          <code>&lt;rhombus-theme-toggle&gt;</code> is a three-state icon button
          that cycles light &rarr; dark &rarr; system. Both stay in sync with
          each other and with the shell header &mdash; click any of them and the
          live state below updates.
        </p>
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
