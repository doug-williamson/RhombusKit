import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  RhombusAppShellComponent,
  RhombusIconComponent,
  RhombusMenuComponent,
  RhombusNavListComponent,
  RhombusShellFooterDirective,
  RhombusThemeMenuComponent,
  type MenuItem,
  type RhombusNavSection,
} from '@rhombuskit/core';
import { AnalyticsService } from './shared/analytics.service';
import { CommandPaletteComponent } from './shared/command-palette.component';
import { NAV_GROUPS } from './shared/navigation';
import { communityThemeCss } from './pages/themes/community-themes';

/** The "learn" group split out of the sidebar into the header "Guides" menu. */
const GUIDES_GROUP = 'Get started';

/**
 * The showcase chrome dogfoods `<rhombus-app-shell>`: brand, the component nav,
 * a Cmd-K search trigger, and the theme menu are projected slots; the default
 * slot holds the router outlet. The shell owns the frame, the collapsible
 * sidenav, and the responsive overlay collapse — `[mobileBreakpoint]="959"`
 * reproduces the previous 960px breakpoint, and `closeOnNavigate` (default)
 * dismisses the overlay drawer after a mobile navigation.
 *
 * The IA splits the single shared `NAV_GROUPS` source (which still feeds the
 * Cmd-K palette and the MCP catalog) into two surfaces: the "Get started" guides
 * become a header `<rhombus-menu>` (dogfooding the menu's routerLink items), and
 * the component reference fills the sidenav via `<rhombus-nav-list>` — which both
 * tidies the long rail and puts the new nav-list in its natural habitat.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    MatIconModule,
    RhombusAppShellComponent,
    RhombusIconComponent,
    RhombusMenuComponent,
    RhombusNavListComponent,
    RhombusShellFooterDirective,
    RhombusThemeMenuComponent,
    CommandPaletteComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-app-shell [mobileBreakpoint]="959">
      <a shellBrand routerLink="/" class="showcase-shell__brand">RhombusKit</a>

      <rhombus-nav-list
        shellNav
        class="showcase-shell__nav-list"
        [sections]="navSections"
        ariaLabel="Components"
      />

      <rhombus-menu
        shellHeaderActions
        class="showcase-shell__guides"
        [items]="guideItems"
        ariaLabel="Guides menu"
      >
        <span>Guides</span>
        <mat-icon aria-hidden="true">expand_more</mat-icon>
      </rhombus-menu>

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

      <footer shellFooter class="showcase-shell__footer">
        <span class="showcase-shell__footer-meta">RhombusKit · MIT licensed</span>
        <a routerLink="/support" class="showcase-shell__sponsor">
          <rhombus-icon name="heart" size="sm" />
          Sponsor
        </a>
      </footer>
    </rhombus-app-shell>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** "Get started" guides → header menu. Home is dropped (the brand links to /). */
  protected readonly guideItems: MenuItem[] = (
    NAV_GROUPS.find((g) => g.label === GUIDES_GROUP)?.items ?? []
  )
    .filter((item) => item.path !== '/')
    .map((item) => ({ label: item.label, routerLink: item.path }));

  /** Every other group → the sidebar component reference. */
  protected readonly navSections: RhombusNavSection[] = NAV_GROUPS.filter(
    (g) => g.label !== GUIDES_GROUP,
  ).map((g) => ({
    heading: g.label,
    items: g.items.map((item) => ({ label: item.label, routerLink: item.path })),
  }));

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
