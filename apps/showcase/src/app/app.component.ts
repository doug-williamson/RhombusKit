import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  RhombusAppShellComponent,
  RhombusThemeMenuComponent,
} from '@rhombuskit/core';

interface NavItem {
  path: string;
  label: string;
}

/**
 * The showcase chrome dogfoods `<rhombus-app-shell>`: brand, the component nav,
 * and the theme menu are projected slots; the default slot holds the router
 * outlet. The shell owns the frame, the collapsible sidenav, and the responsive
 * overlay collapse — `[mobileBreakpoint]="959"` reproduces the previous 960px
 * breakpoint, and `closeOnNavigate` (default) dismisses the overlay drawer after
 * a mobile navigation. Nav-link styling lives in app.component.scss; the shell
 * never styles projected content.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    RhombusAppShellComponent,
    RhombusThemeMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-app-shell [mobileBreakpoint]="959">
      <a shellBrand routerLink="/" class="showcase-shell__brand">RhombusKit</a>

      <nav shellNav class="showcase-shell__nav">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="is-active">
            {{ item.label }}
          </a>
        }
      </nav>

      <rhombus-theme-menu shellHeaderActions />

      <router-outlet />
    </rhombus-app-shell>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly navItems: NavItem[] = [
    { path: '/components/button', label: 'Button' },
    { path: '/components/badge', label: 'Badge' },
    { path: '/components/card', label: 'Card' },
    { path: '/components/chip', label: 'Chip' },
    { path: '/components/input', label: 'Input' },
    { path: '/components/textarea', label: 'Textarea' },
    { path: '/components/select', label: 'Select' },
    { path: '/components/data-table', label: 'Data Table' },
    { path: '/components/overflow-menu', label: 'Overflow Menu' },
    { path: '/components/confirm-dialog', label: 'Confirm Dialog' },
    { path: '/components/theme-toggle', label: 'Theme Controls' },
    { path: '/components/app-shell', label: 'App Shell' },
  ];
}
