import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RhombusSwitchComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-switch-page',
  standalone: true,
  imports: [RhombusSwitchComponent, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Switch" apiKey="RhombusSwitchComponent">
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
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-switch label="Email notifications" [(checked)]="notify" />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Wraps a native toggle exposed as <code>role="switch"</code>: it is
            reachable with <kbd>Tab</kbd> and flips on <kbd>Space</kbd>, and the
            <code>label</code> text becomes its accessible name (clicking the
            label toggles it too).
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
