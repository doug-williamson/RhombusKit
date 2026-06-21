import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusAppShellComponent,
  RhombusBottomNavComponent,
  RhombusBottomNavItem,
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
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
    RouterLink,
    RhombusAppShellComponent,
    RhombusBottomNavComponent,
    RhombusShellBottomNavDirective,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    RhombusShellNavFooterDirective,
    RhombusShellAuthDirective,
    RhombusShellAsideDirective,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="App Shell" [hasUsage]="true" apiKey="RhombusAppShellComponent">
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
          <h2>Example</h2>
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

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use it once as the application frame around your routed views, when
              you need a header, a collapsible sidenav, and a content area in a
              single responsive primitive. <strong>The showcase chrome around you
              is itself a <code>rhombus-app-shell</code></strong>; resize the
              window to watch the sidenav collapse to an overlay drawer.
            </li>
            <li>
              Reach for the bottom-nav mode (<code>navMode="bottom"</code>) on a
              mobile-first product where a bottom tab bar fits better than a
              side drawer.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For the heading <em>inside</em> a single routed view, use a
              <a routerLink="/components/page-header">Page Header</a> — the shell
              is the outer frame, not the per-page title.
            </li>
            <li>
              For a standalone bottom tab bar without the surrounding shell, use
              <a routerLink="/components/bottom-nav">Bottom Nav</a> directly.
            </li>
            <li>
              For in-page section navigation rather than app-level routing, use
              <a routerLink="/components/tabs">Tabs</a> or
              <a routerLink="/components/breadcrumbs">Breadcrumbs</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/page-header">Page Header</a> — the title block inside a routed view.</li>
            <li><a routerLink="/components/bottom-nav">Bottom Nav</a> — the bar projected into the shell's bottom mode.</li>
            <li><a routerLink="/components/breadcrumbs">Breadcrumbs</a> — location trail within the content area.</li>
            <li><a routerLink="/components/theme-toggle">Theme Toggle</a> — a common header-actions control.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The shell is driven entirely by <strong>content projection</strong>:
          you slot brand, nav, and actions into named regions, and a handful of
          structural inputs (<code>hasNav</code>, <code>mobileBreakpoint</code>,
          <code>iconRail</code>, <code>navMode</code>, <code>frame</code>) tune
          the responsive behaviour. It renders no product chrome of its own.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>[shellBrand]</code> — the brand/logo, rendered at the start of the top toolbar.</li>
            <li><code>[shellHeaderActions]</code> — trailing toolbar controls (e.g. a docs link or theme toggle).</li>
            <li><code>[shellAuthSlot]</code> — presence-gated account/avatar region at the toolbar's end; the slot only renders when projected.</li>
            <li><code>[shellNav]</code> — the navigation links inside the sidenav drawer.</li>
            <li><code>[shellNavFooter]</code> — presence-gated footer pinned to the bottom of the sidenav (e.g. a version badge).</li>
            <li><code>[shellAside]</code> — presence-gated right-rail; when present the content becomes a 3-column grid on desktop and the aside hides below 1024px.</li>
            <li><code>[shellBottomNav]</code> — the bar shown only when <code>navMode="bottom"</code>; project a <a routerLink="/components/bottom-nav">Bottom Nav</a> here.</li>
            <li><strong>Default slot</strong> — everything not matched lands in the <code>&lt;main&gt;</code> content region (your routed view / <code>&lt;router-outlet&gt;</code>).</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            Surface colours (toolbar/sidenav background and text) are themed
            globally via the Material preset; this primitive owns structure and
            reads these contract tokens for its frame:
          </p>
          <ul>
            <li><code>--border</code> — toolbar, sidenav, aside, and phone-frame dividers</li>
            <li><code>--text-primary</code> — nav-toggle (hamburger) icon colour</li>
            <li><code>--surface-2</code> — nav-toggle hover background</li>
            <li><code>--focus-border</code> — nav-toggle focus ring</li>
          </ul>
          <p>
            Layout dimensions are consumer-overridable custom properties:
            <code>--rhombus-app-shell-sidenav-width</code> (220px),
            <code>--rhombus-app-shell-aside-width</code> (240px),
            <code>--rhombus-app-shell-toolbar-height</code> (56px), and
            <code>--rhombus-app-shell-phone-max</code> (the phone-frame column
            width). Set them on the host element.
          </p>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The shell lays out semantic regions — a <code>&lt;main&gt;</code>
            landmark for the content and an <code>&lt;aside&gt;</code> element for
            the right rail. On mobile widths the toolbar renders a single
            hamburger <code>&lt;button&gt;</code> carrying an
            <code>aria-label</code> of &ldquo;Toggle navigation&rdquo; that opens
            and closes the overlay drawer; its inline icon is
            <code>aria-hidden</code>. Beyond these landmarks and the toggle, the
            shell adds no roles or live regions — labelling the projected brand,
            nav links, header actions, auth slot, and aside is the consumer's
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
