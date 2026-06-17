// apps/showcase/src/app/pages/bottom-nav/bottom-nav-page.component.ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RhombusBottomNavComponent,
  RhombusBottomNavItem,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-bottom-nav-page',
  standalone: true,
  imports: [RhombusBottomNavComponent, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Bottom nav" apiKey="RhombusBottomNavComponent">
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-bottom-nav&gt;</code> is a Material-style bottom tab bar for
          mobile-first apps. Router items self-highlight via
          <code>routerLinkActive</code>; pass <code>activeId</code> /
          <code>activeChange</code> for controlled usage. Pair it with the app-shell's
          <code>navMode="bottom"</code>.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>Use a <strong>bottom nav</strong> as the primary navigation for 3–5 top-level destinations on a mobile-first surface. For desktop-first apps prefer the app-shell sidenav.</li>
            <li><code>indicator</code> switches the active treatment between <code>'color'</code> (default) and the Material-3 <code>'pill'</code>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-bottom-nav [items]="items" [activeId]="active()" (activeChange)="active.set($event)" />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            Renders a <code>&lt;nav aria-label="Primary"&gt;</code> landmark; the active item
            carries <code>aria-current="page"</code>, icons are decorative, and every item is a
            44px touch target with a visible focus ring.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Pill indicator</h2>
          <div class="showcase-row">
            <rhombus-bottom-nav [items]="items" [activeId]="active()" indicator="pill" (activeChange)="active.set($event)" />
          </div>
        </section>
      </div>
    </app-component-page>
  `,
})
export default class BottomNavPageComponent {
  protected readonly active = signal('workout');
  protected readonly items: RhombusBottomNavItem[] = [
    { id: 'workout', label: 'Workout', icon: 'fitness_center' },
    { id: 'mesos', label: 'Mesos', icon: 'folder', badge: 3 },
    { id: 'templates', label: 'Templates', icon: 'grid_view' },
    { id: 'exercises', label: 'Exercises', icon: 'list' },
    { id: 'more', label: 'More', icon: 'more_horiz' },
  ];

  protected readonly usage = `import { RhombusBottomNavComponent, RhombusBottomNavItem } from '@rhombuskit/core';

@Component({
  selector: 'app-root',
  imports: [RhombusBottomNavComponent],
  template: \`<rhombus-bottom-nav [items]="items" />\`,
})
export class AppComponent {
  readonly items: RhombusBottomNavItem[] = [
    { id: 'workout', label: 'Workout', icon: 'fitness_center', routerLink: '/workout' },
    { id: 'mesos', label: 'Mesos', icon: 'folder', routerLink: '/mesos' },
  ];
}`;
}
