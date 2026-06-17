import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RhombusAppShellComponent,
  RhombusBottomNavComponent,
  RhombusBottomNavItem,
  RhombusButtonComponent,
  RhombusShellAsideDirective,
  RhombusShellAuthDirective,
  RhombusShellBottomNavDirective,
  RhombusShellNavFooterDirective,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

/**
 * Demo page for `<rhombus-app-shell>`. The live shell runs inside a bounded
 * frame (a full-height shell can't render inline), with toggles driving the
 * presence-gated slots and the overlay/side mode. True viewport-driven collapse
 * and the tablet icon rail are best seen by resizing the window against the
 * showcase's own chrome — which is itself a `rhombus-app-shell`.
 */
@Component({
  selector: 'app-app-shell-page',
  standalone: true,
  imports: [
    RhombusAppShellComponent,
    RhombusBottomNavComponent,
    RhombusShellBottomNavDirective,
    RhombusButtonComponent,
    RhombusShellNavFooterDirective,
    RhombusShellAuthDirective,
    RhombusShellAsideDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="App Shell" apiKey="RhombusAppShellComponent">
      <div overview class="overview">
        <p class="overview__lead">
          <code>&lt;rhombus-app-shell&gt;</code> is a structure-only layout
          primitive wrapping <code>mat-sidenav-container</code> +
          <code>mat-toolbar</code>: a header, a collapsible sidenav, a content
          area, and an optional right-rail aside. It renders no nav items, brand,
          or theme control &mdash; every product concern is a projected slot, and
          it sources its chrome from the token contract.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use it once as the application frame around your routed views; for
              the heading <em>inside</em> a single page, reach for
              <strong>Page Header</strong> instead.
            </li>
            <li>
              Project into <code>[shellBrand]</code>, <code>[shellNav]</code>,
              <code>[shellNavFooter]</code>, <code>[shellHeaderActions]</code>,
              <code>[shellAuthSlot]</code>, <code>[shellAside]</code>, and the
              default content slot. Structural inputs are
              <code>mobileBreakpoint</code>, <code>iconRail</code>,
              <code>closeOnNavigate</code>, and <code>hasNav</code> &mdash; no
              product flags. <strong>The showcase chrome around you is itself a
              <code>rhombus-app-shell</code></strong>; resize the window to watch
              the sidenav collapse to an overlay drawer.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <div class="app-shell-hero">
              <rhombus-app-shell [closeOnNavigate]="false">
                <span shellBrand class="app-shell-demo__brand">AcmeDocs</span>
                <nav shellNav class="app-shell-demo__nav">
                  <a href="#" (click)="$event.preventDefault()" class="is-active">Dashboard</a>
                  <a href="#" (click)="$event.preventDefault()">Posts</a>
                  <a href="#" (click)="$event.preventDefault()">Settings</a>
                </nav>
                <rhombus-button shellHeaderActions appearance="text">Docs</rhombus-button>
                <div class="app-shell-demo__content">
                  <h2>Getting started</h2>
                  <p>
                    The default content slot holds your routed view. The brand,
                    nav, and header actions are all projected.
                  </p>
                </div>
              </rhombus-app-shell>
            </div>
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            The shell lays out semantic regions &mdash; a <code>&lt;main&gt;</code>
            landmark for the content and an <code>&lt;aside&gt;</code> for the
            right rail &mdash; and the overlay drawer's toolbar trigger carries an
            <code>aria-label</code> of &ldquo;Toggle navigation&rdquo;. Labelling
            the projected brand, nav links, and header actions is the consumer's
            responsibility.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Live shell</h2>
        <div class="showcase-row app-shell-demo__controls">
          <rhombus-button
            [variant]="showAside() ? 'primary' : 'secondary'"
            (click)="showAside.set(!showAside())"
          >
            Aside (3-col)
          </rhombus-button>
          <rhombus-button
            [variant]="showAuth() ? 'primary' : 'secondary'"
            (click)="showAuth.set(!showAuth())"
          >
            Auth slot
          </rhombus-button>
          <rhombus-button
            [variant]="showNavFooter() ? 'primary' : 'secondary'"
            (click)="showNavFooter.set(!showNavFooter())"
          >
            Nav footer
          </rhombus-button>
          <rhombus-button
            [variant]="forceOverlay() ? 'primary' : 'secondary'"
            (click)="forceOverlay.set(!forceOverlay())"
          >
            Force overlay
          </rhombus-button>
          <rhombus-button
            [variant]="!hasNav() ? 'primary' : 'secondary'"
            (click)="hasNav.set(!hasNav())"
          >
            Bare route (no nav)
          </rhombus-button>
        </div>

        <div class="app-shell-demo">
          <rhombus-app-shell
            [closeOnNavigate]="false"
            [mobileBreakpoint]="forceOverlay() ? 9999 : 0"
            [hasNav]="hasNav()"
          >
            <span shellBrand class="app-shell-demo__brand">AcmeDocs</span>

            <nav shellNav class="app-shell-demo__nav">
              @for (item of demoNav; track item) {
                <a href="#" (click)="$event.preventDefault()" [class.is-active]="$first">
                  {{ item }}
                </a>
              }
            </nav>

            @if (showNavFooter()) {
              <div shellNavFooter class="app-shell-demo__nav-footer">v1.0.0</div>
            }

            <rhombus-button shellHeaderActions appearance="text">Docs</rhombus-button>

            @if (showAuth()) {
              <span shellAuthSlot class="app-shell-demo__auth" aria-label="Account">JD</span>
            }

            @if (showAside()) {
              <aside shellAside class="app-shell-demo__aside">
                <h3>On this page</h3>
                <ul>
                  <li>Overview</li>
                  <li>Installation</li>
                  <li>Usage</li>
                </ul>
              </aside>
            }

            <div class="app-shell-demo__content">
              <h2>Getting started</h2>
              <p>
                This is the default content slot. Toggle <em>Aside</em> to move
                between the 2-column and 3-column layout, <em>Auth slot</em> /
                <em>Nav footer</em> to see the presence-gated regions appear,
                <em>Force overlay</em> to collapse the sidenav into an overlay
                drawer with the toolbar hamburger, and <em>Bare route</em> to drop
                the nav drawer entirely.
              </p>
            </div>
          </rhombus-app-shell>
        </div>
      </section>

        <section class="showcase-section">
          <h2>Mobile-first bottom navigation</h2>
          <p class="showcase-section__lead">
            <code>navMode="bottom"</code> drops the sidenav/hamburger and hosts a
            <code>[shellBottomNav]</code> bar; <code>frame="phone"</code> centers the app at
            a phone width on desktop.
          </p>
          <div class="showcase-row">
            <rhombus-app-shell navMode="bottom" frame="phone" style="height: 420px;">
              <span shellBrand>RP Hypertrophy</span>
              <rhombus-bottom-nav shellBottomNav [items]="bottomNavItems" [activeId]="'workout'" />
              <p>Workout content&hellip;</p>
            </rhombus-app-shell>
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .app-shell-demo__controls {
      margin-bottom: 1rem;
    }

    .app-shell-demo {
      position: relative;
      height: 520px;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .app-shell-hero {
      position: relative;
      height: 360px;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .app-shell-demo__brand {
      font-family: var(--font-sans);
      font-weight: 700;
      color: var(--text-primary);
    }

    .app-shell-demo__nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem 0.75rem;
      font-family: var(--font-sans);
      font-size: 0.9rem;

      a {
        text-decoration: none;
        color: var(--text-secondary);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;

        &:hover {
          color: var(--text-primary);
          background-color: var(--surface-1);
        }

        &.is-active {
          color: var(--nav-active-text);
          background-color: var(--nav-active-bg);
          font-weight: 500;
        }
      }
    }

    .app-shell-demo__nav-footer {
      padding: 0.5rem 0.75rem;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .app-shell-demo__auth {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 9999px;
      background-color: var(--surface-2);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .app-shell-demo__aside {
      padding: 1rem;
      font-family: var(--font-sans);

      h3 {
        margin: 0 0 0.5rem;
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      ul {
        margin: 0;
        padding-left: 1rem;
        color: var(--text-secondary);
        font-size: 0.875rem;
        line-height: 1.9;
      }
    }

    .app-shell-demo__content {
      padding: 1.5rem;
      font-family: var(--font-sans);
      color: var(--text-primary);

      h2 {
        margin-top: 0;
      }

      p {
        color: var(--text-secondary);
        line-height: 1.6;
        max-width: 52ch;
      }
    }
  `,
})
export default class AppShellPageComponent {
  protected readonly demoNav = ['Dashboard', 'Posts', 'Media', 'Settings'];

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusAppShellComponent, RhombusButtonComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-root',
  imports: [RhombusAppShellComponent, RhombusButtonComponent, RouterOutlet],
  template: \`
    <rhombus-app-shell>
      <span shellBrand>AcmeDocs</span>

      <nav shellNav>
        <a routerLink="/dashboard">Dashboard</a>
        <a routerLink="/posts">Posts</a>
        <a routerLink="/settings">Settings</a>
      </nav>

      <rhombus-button shellHeaderActions appearance="text">Docs</rhombus-button>

      <router-outlet />
    </rhombus-app-shell>
  \`,
})
export class AppComponent {}`;

  protected readonly showAside = signal(true);
  protected readonly showAuth = signal(true);
  protected readonly showNavFooter = signal(true);
  protected readonly forceOverlay = signal(false);
  protected readonly hasNav = signal(true);

  protected readonly bottomNavItems: RhombusBottomNavItem[] = [
    { id: 'workout', label: 'Workout', icon: 'fitness_center' },
    { id: 'mesos', label: 'Mesos', icon: 'folder' },
    { id: 'more', label: 'More', icon: 'more_horiz' },
  ];
}
