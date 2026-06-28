import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'components',
    children: [
      {
        path: 'button',
        title: 'Button',
        loadComponent: () => import('./pages/button/button-page.component'),
      },
      {
        path: 'badge',
        title: 'Badge',
        loadComponent: () => import('./pages/badge/badge-page.component'),
      },
      {
        path: 'card',
        title: 'Card',
        loadComponent: () => import('./pages/card/card-page.component'),
      },
      {
        path: 'chip',
        title: 'Chip',
        loadComponent: () => import('./pages/chip/chip-page.component'),
      },
      {
        path: 'tag',
        title: 'Tag',
        loadComponent: () => import('./pages/tag/tag-page.component'),
      },
      {
        path: 'icon',
        title: 'Icon',
        loadComponent: () => import('./pages/icon/icon-page.component'),
      },
      {
        path: 'checkbox',
        title: 'Checkbox',
        loadComponent: () => import('./pages/checkbox/checkbox-page.component'),
      },
      {
        path: 'radio',
        title: 'Radio',
        loadComponent: () => import('./pages/radio/radio-page.component'),
      },
      {
        path: 'switch',
        title: 'Switch',
        loadComponent: () => import('./pages/switch/switch-page.component'),
      },
      {
        path: 'input',
        title: 'Input',
        loadComponent: () => import('./pages/input/input-page.component'),
      },
      {
        path: 'textarea',
        title: 'Textarea',
        loadComponent: () => import('./pages/textarea/textarea-page.component'),
      },
      {
        path: 'select',
        title: 'Select',
        loadComponent: () => import('./pages/select/select-page.component'),
      },
      {
        path: 'date-picker',
        title: 'Date Picker',
        loadComponent: () =>
          import('./pages/date-picker/date-picker-page.component'),
      },
      {
        path: 'data-table',
        title: 'Data Table',
        loadComponent: () =>
          import('./pages/data-table/data-table-page.component'),
      },
      {
        path: 'overflow-menu',
        title: 'Overflow Menu',
        loadComponent: () =>
          import('./pages/overflow-menu/overflow-menu-page.component'),
      },
      {
        path: 'tooltip',
        title: 'Tooltip',
        loadComponent: () => import('./pages/tooltip/tooltip-page.component'),
      },
      {
        path: 'toast',
        title: 'Toast',
        loadComponent: () => import('./pages/toast/toast-page.component'),
      },
      {
        path: 'dialog',
        title: 'Dialog',
        loadComponent: () => import('./pages/dialog/dialog-page.component'),
      },
      {
        path: 'confirm-dialog',
        title: 'Confirm Dialog',
        loadComponent: () =>
          import('./pages/confirm-dialog/confirm-dialog-page.component'),
      },
      {
        path: 'tabs',
        title: 'Tabs',
        loadComponent: () => import('./pages/tabs/tabs-page.component'),
      },
      {
        path: 'menu',
        title: 'Menu',
        loadComponent: () => import('./pages/menu/menu-page.component'),
      },
      {
        path: 'popover',
        title: 'Popover',
        loadComponent: () => import('./pages/popover/popover-page.component'),
      },
      {
        path: 'bottom-nav',
        title: 'Bottom nav',
        loadComponent: () =>
          import('./pages/bottom-nav/bottom-nav-page.component'),
      },
      {
        path: 'nav-list',
        title: 'Nav List',
        loadComponent: () =>
          import('./pages/nav-list/nav-list-page.component'),
      },
      {
        path: 'breadcrumbs',
        title: 'Breadcrumbs',
        loadComponent: () =>
          import('./pages/breadcrumbs/breadcrumbs-page.component'),
      },
      {
        path: 'pagination',
        title: 'Pagination',
        loadComponent: () =>
          import('./pages/pagination/pagination-page.component'),
      },
      {
        path: 'progress',
        title: 'Progress',
        loadComponent: () => import('./pages/progress/progress-page.component'),
      },
      {
        path: 'avatar',
        title: 'Avatar',
        loadComponent: () => import('./pages/avatar/avatar-page.component'),
      },
      {
        path: 'alert',
        title: 'Alert',
        loadComponent: () => import('./pages/alert/alert-page.component'),
      },
      {
        path: 'theme-toggle',
        title: 'Theme Toggle',
        loadComponent: () =>
          import('./pages/theme-toggle/theme-toggle-page.component'),
      },
      {
        path: 'app-shell',
        title: 'App Shell',
        loadComponent: () =>
          import('./pages/app-shell/app-shell-page.component'),
      },
      {
        path: 'page-header',
        title: 'Page Header',
        loadComponent: () =>
          import('./pages/page-header/page-header-page.component'),
      },
      {
        path: 'empty-state',
        title: 'Empty State',
        loadComponent: () =>
          import('./pages/empty-state/empty-state-page.component'),
      },
      {
        path: 'code-block',
        title: 'Code Block',
        loadComponent: () =>
          import('./pages/code-block/code-block-page.component'),
      },
      {
        path: 'accordion',
        title: 'Accordion',
        loadComponent: () =>
          import('./pages/accordion/accordion-page.component'),
      },
      { path: '', redirectTo: 'button', pathMatch: 'full' },
    ],
  },
  {
    path: 'migrate',
    title: 'Migrate from Angular Material',
    loadComponent: () => import('./pages/migrate/migrate-page.component'),
  },
  {
    path: 'roadmap',
    title: 'Roadmap',
    loadComponent: () => import('./pages/roadmap/roadmap-page.component'),
  },
  {
    path: 'theming',
    title: 'Theming',
    loadComponent: () => import('./pages/theming/theming-page.component'),
  },
  {
    path: 'themes',
    title: 'Themes',
    loadComponent: () => import('./pages/themes/themes-page.component'),
  },
  {
    path: 'tokens',
    title: 'Design Tokens',
    loadComponent: () => import('./pages/tokens/tokens-page.component'),
  },
  {
    path: 'accessibility',
    title: 'Accessibility',
    loadComponent: () => import('./pages/accessibility/accessibility-page.component'),
  },
  {
    path: 'motion',
    title: 'Motion',
    loadComponent: () => import('./pages/motion/motion-page.component'),
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home-page.component'),
  },
];
