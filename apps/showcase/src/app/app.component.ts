import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  RhombusAppShellComponent,
  RhombusThemeMenuComponent,
} from '@rhombuskit/core';
import { AnalyticsService } from './shared/analytics.service';
import { CommandPaletteComponent } from './shared/command-palette.component';
import { NAV_GROUPS } from './shared/navigation';
import { communityThemeCss } from './pages/themes/community-themes';

/**
 * The showcase chrome dogfoods `<rhombus-app-shell>`: brand, the component nav,
 * a Cmd-K search trigger, and the theme menu are projected slots; the default
 * slot holds the router outlet. The shell owns the frame, the collapsible
 * sidenav, and the responsive overlay collapse — `[mobileBreakpoint]="959"`
 * reproduces the previous 960px breakpoint, and `closeOnNavigate` (default)
 * dismisses the overlay drawer after a mobile navigation. Nav-link styling lives
 * in app.component.scss; the shell never styles projected content. The nav list
 * comes from the shared `NAV_GROUPS` (also feeding the command palette).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatIconModule,
    RhombusAppShellComponent,
    RhombusThemeMenuComponent,
    CommandPaletteComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-app-shell [mobileBreakpoint]="959">
      <a shellBrand routerLink="/" class="showcase-shell__brand">RhombusKit</a>

      <nav shellNav class="showcase-shell__nav">
        @for (group of navGroups; track group.label) {
          <p class="showcase-shell__nav-group">{{ group.label }}</p>
          @for (item of group.items; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            >
              {{ item.label }}
            </a>
          }
        }
      </nav>

      <button
        shellHeaderActions
        type="button"
        class="showcase-shell__search"
        (click)="palette.openPalette()"
        aria-label="Search documentation"
      >
        <mat-icon aria-hidden="true">search</mat-icon>
        <span class="showcase-shell__search-label">Search</span>
        <kbd class="showcase-shell__search-kbd">⌘K</kbd>
      </button>

      <rhombus-theme-menu shellHeaderActions />

      <router-outlet />
      <app-command-palette #palette />
    </rhombus-app-shell>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly navGroups = NAV_GROUPS;

  constructor() {
    // No-op on the server and until a GoatCounter endpoint is configured.
    inject(AnalyticsService).init();

    // Render the community-theme [data-theme] CSS into <head> during render —
    // on the SERVER too, so it lands in the prerendered HTML and a persisted
    // community theme is fully styled before first paint (no flash on hard
    // reload). The id guard keeps browser hydration from duplicating the
    // prerendered <style>; the rules apply on every page, app-wide.
    const doc = inject(DOCUMENT);
    const id = 'rk-community-themes';
    if (!doc.getElementById(id)) {
      const style = doc.createElement('style');
      style.id = id;
      style.textContent = communityThemeCss();
      doc.head.appendChild(style);
    }
  }
}
