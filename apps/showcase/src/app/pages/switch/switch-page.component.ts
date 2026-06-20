import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  RhombusSwitchComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-switch-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusSwitchComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Switch"
      [hasUsage]="true"
      apiKey="RhombusSwitchComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A switch toggles a single setting on or off, taking effect
          immediately. RhombusKit's <code>&lt;rhombus-switch&gt;</code> wraps
          Material's <code>&lt;mat-slide-toggle&gt;</code> and drives its track
          from the dedicated <code>--switch-track-on</code> /
          <code>--switch-track-off</code> contract tokens, so it re-skins with
          the active theme.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use a switch for an <strong>instant-effect on/off setting</strong>
              (&ldquo;Email notifications&rdquo;, dark mode) where no Save step
              follows. For an option that is only committed on submit, prefer
              <strong>Checkbox</strong>.
            </li>
            <li>
              Bind <code>[(checked)]</code> for lightweight local state, or pass
              a <code>FormControl&lt;boolean&gt;</code> via <code>[control]</code>
              to join a reactive form.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-switch label="Email notifications" [(checked)]="notify" />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For an option that is only committed when a form is submitted, use a
              <a routerLink="/components/checkbox">Checkbox</a> — switches imply an
              instant, save-less effect.
            </li>
            <li>
              For choosing exactly one option from a mutually exclusive set, use a
              <a routerLink="/components/radio">Radio</a> group, not several
              switches.
            </li>
            <li>
              For triggering a one-off action rather than persisting a state, use a
              <a routerLink="/components/button">Button</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li>
              <a routerLink="/components/checkbox">Checkbox</a> — committed-on-submit
              boolean with the same control model.
            </li>
            <li>
              <a routerLink="/components/radio">Radio</a> — single choice from a set.
            </li>
            <li>
              <a routerLink="/components/theme-toggle">Theme Toggle</a> — a
              purpose-built switch for light/dark mode.
            </li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Drive the switch with <code>[(checked)]</code> for lightweight local
          state, or pass a <code>FormControl&lt;boolean&gt;</code> via
          <code>[control]</code> to join a reactive form. The two modes are
          mutually exclusive.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>label</code> — input string rendered beside the toggle; it
              becomes the control's accessible name. The switch has
              <strong>no content-projection slots</strong> — set the visible text
              through <code>label</code> rather than projecting markup.
            </li>
            <li>
              <code>labelPosition</code> — places the label
              <code>before</code> or <code>after</code> (default) the toggle.
            </li>
            <li>
              <code>[(checked)]</code> / <code>(checkedChange)</code> — two-way
              on/off state for lightweight mode; <code>[disabled]</code> applies
              here too.
            </li>
            <li>
              <code>[control]</code> — a <code>FormControl&lt;boolean&gt;</code>;
              when set, the standalone <code>checked</code> / <code>disabled</code>
              inputs are ignored and the form owns the state.
            </li>
            <li>
              <code>[required]</code> — marks the toggle required for validation
              and ARIA.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The switch renders inline (no overlay) and reads these contract
            tokens:
          </p>
          <ul>
            <li><code>--switch-track-on</code> — track colour when on</li>
            <li><code>--switch-track-off</code> — track colour when off</li>
            <li><code>--font-sans</code> — label font family</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            Wraps a native toggle exposed as <code>role="switch"</code>: it is
            reachable with <kbd>Tab</kbd> and flips on <kbd>Space</kbd>, and the
            <code>label</code> text becomes its accessible name (clicking the
            label toggles it too). Setting <code>[required]</code> reflects the
            requirement to assistive technology. There is no separate
            <code>aria-live</code> announcement of the change — the
            <code>role="switch"</code> state (on/off) is what screen readers report,
            so give every switch a meaningful <code>label</code>.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>States</h2>
        <div class="showcase-row">
          <rhombus-switch label="Off" />
          <rhombus-switch label="On" [checked]="true" />
          <rhombus-switch label="Disabled" [disabled]="true" />
          <rhombus-switch label="Disabled + on" [checked]="true" [disabled]="true" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Two-way binding</h2>
        <p class="showcase-section__lead">
          Notifications are <strong>{{ notify() ? 'on' : 'off' }}</strong>.
        </p>
        <rhombus-switch label="Email notifications" [(checked)]="notify" />
      </section>

      <section class="showcase-section">
        <h2>Reactive forms</h2>
        <rhombus-switch label="Enable beta features" [control]="beta" />
        <p class="showcase-section__lead">
          Control value: <strong>{{ beta.value }}</strong>
        </p>
      </section>
      </div>
    </app-component-page>
  `,
})
export default class SwitchPageComponent {
  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusSwitchComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-settings',
  imports: [RhombusSwitchComponent],
  template: \`
    <rhombus-switch label="Email notifications" [(checked)]="notify" />
  \`,
})
export class SettingsComponent {
  readonly notify = signal(true);
}`;

  protected readonly notify = signal(true);
  protected readonly beta = new FormControl(false, { nonNullable: true });
}
