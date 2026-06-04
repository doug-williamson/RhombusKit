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

interface NavGroup {
  label: string;
  items: NavItem[];
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
        @for (group of navGroups; track group.label) {
          <p class="showcase-shell__nav-group">{{ group.label }}</p>
          @for (item of group.items; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="is-active">
              {{ item.label }}
            </a>
          }
        }
      </nav>

      <rhombus-theme-menu shellHeaderActions />

      <router-outlet />
    </rhombus-app-shell>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly navGroups: NavGroup[] = [
    {
      label: 'Primitives',
      items: [
        { path: '/components/button', label: 'Button' },
        { path: '/components/badge', label: 'Badge' },
        { path: '/components/card', label: 'Card' },
        { path: '/components/chip', label: 'Chip' },
      ],
    },
    {
      label: 'Forms',
      items: [
        { path: '/components/checkbox', label: 'Checkbox' },
        { path: '/components/radio', label: 'Radio Group' },
        { path: '/components/switch', label: 'Switch' },
        { path: '/components/input', label: 'Input' },
        { path: '/components/textarea', label: 'Textarea' },
        { path: '/components/select', label: 'Select' },
      ],
    },
    {
      label: 'Data & overlays',
      items: [
        { path: '/components/data-table', label: 'Data Table' },
        { path: '/components/overflow-menu', label: 'Overflow Menu' },
        { path: '/components/tooltip', label: 'Tooltip' },
        { path: '/components/toast', label: 'Toast' },
        { path: '/components/dialog', label: 'Dialog' },
        { path: '/components/confirm-dialog', label: 'Confirm Dialog' },
      ],
    },
    {
      label: 'Navigation',
      items: [
        { path: '/components/tabs', label: 'Tabs' },
        { path: '/components/menu', label: 'Menu' },
        { path: '/components/breadcrumbs', label: 'Breadcrumbs' },
        { path: '/components/pagination', label: 'Pagination' },
      ],
    },
    {
      label: 'Status & layout',
      items: [
        { path: '/components/progress', label: 'Progress' },
        { path: '/components/avatar', label: 'Avatar' },
        { path: '/components/alert', label: 'Alert' },
      ],
    },
    {
      label: 'Layout & theming',
      items: [
        { path: '/components/app-shell', label: 'App Shell' },
        { path: '/components/theme-toggle', label: 'Theme Controls' },
      ],
    },
    {
      label: 'Content',
      items: [
        { path: '/components/page-header', label: 'Page Header' },
        { path: '/components/empty-state', label: 'Empty State' },
      ],
    },
  ];
}
