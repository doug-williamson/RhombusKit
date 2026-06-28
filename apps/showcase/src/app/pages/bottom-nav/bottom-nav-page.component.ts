// apps/showcase/src/app/pages/bottom-nav/bottom-nav-page.component.ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusBottomNavComponent,
  RhombusBottomNavItem,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-bottom-nav-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusBottomNavComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Bottom Nav" [hasUsage]="true" apiKey="RhombusBottomNavComponent">
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-bottom-nav&gt;</code> is a Material-style bottom tab bar for
          mobile-first apps. Router items self-highlight via
          <code>routerLinkActive</code>; pass <code>activeId</code> /
          <code>activeChange</code> for controlled usage. Pair it with the app-shell's
          <code>navMode="bottom"</code>.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <p class="showcase-section__lead">
            The bar spans the full width of its container; here it's framed at a phone
            width since it's a mobile-first component.
          </p>
          <app-example [code]="usage">
            <div class="bottom-nav-frame">
              <rhombus-bottom-nav [items]="items" [activeId]="active()" (activeChange)="active.set($event)" />
            </div>
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>Use a <strong>bottom nav</strong> as the primary navigation for 3–5 top-level destinations on a mobile-first surface. For desktop-first apps prefer the app-shell sidenav.</li>
            <li>When the destinations are persistent, equal-weight sections of the app that the user moves between frequently.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>For a desktop-first layout with a navigation rail or sidenav, reach for the <a routerLink="/components/app-shell">App shell</a> instead.</li>
            <li>For switching between views <em>within</em> a single page or panel, use <a routerLink="/components/tabs">Tabs</a>, not a global bottom bar.</li>
            <li>For a flat list of one-off actions or commands, use a <a routerLink="/components/menu">Menu</a> or <a routerLink="/components/overflow-menu">Overflow menu</a>.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/app-shell">App shell</a> — owns the responsive scaffold and pairs via <code>navMode="bottom"</code>.</li>
            <li><a routerLink="/components/tabs">Tabs</a> — in-page view switching.</li>
            <li><a routerLink="/components/badge">Badge</a> — the notification marker each item can carry.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The bar is entirely <strong>data-driven</strong>: pass an array of
          <code>RhombusBottomNavItem</code> to <code>[items]</code>. Items with a
          <code>routerLink</code> self-highlight; items without one are controlled via
          <code>[activeId]</code> and <code>(activeChange)</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>There are <strong>no content-projection slots</strong> — the bar renders itself from the <code>[items]</code> array, so each cell's icon, label, and badge come from the item object, not projected markup.</li>
            <li>Each <code>RhombusBottomNavItem</code> needs an <code>id</code> (the key emitted by <code>activeChange</code> and matched by <code>activeId</code>), a <code>label</code>, and an <code>icon</code> glyph name.</li>
            <li>Add <code>routerLink</code> for router-driven highlighting; omit it for controlled usage driven by <code>[activeId]</code> / <code>(activeChange)</code>.</li>
            <li>Optional per-item <code>badge</code> (a count or <code>'dot'</code>) and <code>disabled</code> render a notification marker or an inert cell.</li>
            <li><code>indicator</code> picks the active treatment: <code>'color'</code> (default) or the Material-3 <code>'pill'</code>; <code>ariaLabel</code> names the nav landmark.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The bar uses bespoke markup with light DOM (no overlay), styled entirely from
            these contract tokens:
          </p>
          <ul>
            <li><code>--surface-1</code> — bar background</li>
            <li><code>--border</code> — top divider</li>
            <li><code>--font-sans</code> — label font family</li>
            <li><code>--text-secondary</code> — inactive item colour</li>
            <li><code>--nav-active-text</code> — active item colour (<code>'color'</code> indicator)</li>
            <li><code>--nav-active-bg</code> — pill fill behind the active icon (<code>'pill'</code> indicator)</li>
            <li><code>--focus-border</code> / <code>--focus-ring</code> — keyboard focus outline</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The bar renders a <code>&lt;nav&gt;</code> landmark whose
            <code>aria-label</code> defaults to <code>"Primary"</code> (override via
            <code>ariaLabel</code>). Items are a semantic <code>&lt;ul&gt;</code>: router
            items are anchors, controlled items are <code>&lt;button&gt;</code>s, and the
            active one carries <code>aria-current="page"</code>. Icons are decorative.
            Every item is at least a 44px touch target and shows a visible focus ring on
            keyboard focus. Disabled router items set <code>aria-disabled="true"</code> and
            <code>tabindex="-1"</code> with their link removed; disabled controlled items
            use the native <code>disabled</code> attribute. There is no live region —
            selection feedback comes from the active styling and route change, not an
            announcement.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Pill indicator</h2>
          <div class="showcase-row">
            <div class="bottom-nav-frame">
              <rhombus-bottom-nav [items]="items" [activeId]="active()" indicator="pill" (activeChange)="active.set($event)" />
            </div>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled item</h2>
          <p class="showcase-section__lead">
            Mark an item <code>disabled</code> to render it inert; it's dimmed and
            non-interactive.
          </p>
          <div class="showcase-row">
            <div class="bottom-nav-frame">
              <rhombus-bottom-nav [items]="itemsWithDisabled" [activeId]="active()" (activeChange)="active.set($event)" />
            </div>
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
    .bottom-nav-frame {
      width: 100%;
      max-width: 390px;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
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

  protected readonly itemsWithDisabled: RhombusBottomNavItem[] = [
    { id: 'workout', label: 'Workout', icon: 'fitness_center' },
    { id: 'mesos', label: 'Mesos', icon: 'folder', badge: 3 },
    { id: 'templates', label: 'Templates', icon: 'grid_view' },
    { id: 'exercises', label: 'Exercises', icon: 'list', disabled: true },
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
