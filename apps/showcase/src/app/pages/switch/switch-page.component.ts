import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RhombusSwitchComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-switch-page',
  standalone: true,
  imports: [RhombusSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Switch</h1>
        <p>
          <code>&lt;rhombus-switch&gt;</code> wraps Material's
          <code>&lt;mat-slide-toggle&gt;</code>. Same control model as the
          checkbox: <code>[control]</code> for reactive forms or
          <code>[(checked)]</code> for lightweight use. The track colour comes
          from the dedicated <code>--switch-track-on</code> /
          <code>--switch-track-off</code> contract tokens &mdash; toggle the
          theme to see them react.
        </p>
      </header>

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
  `,
})
export default class SwitchPageComponent {
  protected readonly notify = signal(true);
  protected readonly beta = new FormControl(false, { nonNullable: true });
}
