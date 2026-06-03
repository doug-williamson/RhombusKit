import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RhombusAppShellComponent,
  RhombusButtonComponent,
  RhombusShellAsideDirective,
  RhombusShellAuthDirective,
  RhombusShellNavFooterDirective,
} from '@rhombuskit/core';

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
    RhombusButtonComponent,
    RhombusShellNavFooterDirective,
    RhombusShellAuthDirective,
    RhombusShellAsideDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>App Shell</h1>
        <p>
          <code>&lt;rhombus-app-shell&gt;</code> is a structure-only layout
          primitive wrapping <code>mat-sidenav-container</code> +
          <code>mat-toolbar</code>: a header, a collapsible sidenav, a content
          area, and an optional right-rail aside. Content projects into
          <code>[shellBrand]</code>, <code>[shellNav]</code>,
          <code>[shellNavFooter]</code>, <code>[shellHeaderActions]</code>,
          <code>[shellAuthSlot]</code>, <code>[shellAside]</code>, and the
          default slot. Structural inputs are <code>mobileBreakpoint</code>,
          <code>iconRail</code>, and <code>closeOnNavigate</code> — no product
          flags. <strong>The showcase chrome around you is itself a
          <code>rhombus-app-shell</code></strong>; resize the window to watch it
          collapse to an overlay drawer at 960px.
        </p>
      </header>

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
        </div>

        <div class="app-shell-demo">
          <rhombus-app-shell
            [closeOnNavigate]="false"
            [mobileBreakpoint]="forceOverlay() ? 9999 : 0"
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
                <em>Nav footer</em> to see the presence-gated regions appear, and
                <em>Force overlay</em> to collapse the sidenav into an overlay
                drawer with the toolbar hamburger.
              </p>
            </div>
          </rhombus-app-shell>
        </div>
      </section>
    </div>
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

  protected readonly showAside = signal(true);
  protected readonly showAuth = signal(true);
  protected readonly showNavFooter = signal(true);
  protected readonly forceOverlay = signal(false);
}
