import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'components',
    children: [
      {
        path: 'button',
        loadComponent: () => import('./pages/button/button-page.component'),
      },
      {
        path: 'badge',
        loadComponent: () => import('./pages/badge/badge-page.component'),
      },
      {
        path: 'card',
        loadComponent: () => import('./pages/card/card-page.component'),
      },
      {
        path: 'chip',
        loadComponent: () => import('./pages/chip/chip-page.component'),
      },
      {
        path: 'checkbox',
        loadComponent: () => import('./pages/checkbox/checkbox-page.component'),
      },
      {
        path: 'radio',
        loadComponent: () => import('./pages/radio/radio-page.component'),
      },
      {
        path: 'switch',
        loadComponent: () => import('./pages/switch/switch-page.component'),
      },
      {
        path: 'input',
        loadComponent: () => import('./pages/input/input-page.component'),
      },
      {
        path: 'textarea',
        loadComponent: () => import('./pages/textarea/textarea-page.component'),
      },
      {
        path: 'select',
        loadComponent: () => import('./pages/select/select-page.component'),
      },
      {
        path: 'data-table',
        loadComponent: () =>
          import('./pages/data-table/data-table-page.component'),
      },
      {
        path: 'overflow-menu',
        loadComponent: () =>
          import('./pages/overflow-menu/overflow-menu-page.component'),
      },
      {
        path: 'tooltip',
        loadComponent: () => import('./pages/tooltip/tooltip-page.component'),
      },
      {
        path: 'toast',
        loadComponent: () => import('./pages/toast/toast-page.component'),
      },
      {
        path: 'confirm-dialog',
        loadComponent: () =>
          import('./pages/confirm-dialog/confirm-dialog-page.component'),
      },
      {
        path: 'theme-toggle',
        loadComponent: () =>
          import('./pages/theme-toggle/theme-toggle-page.component'),
      },
      {
        path: 'app-shell',
        loadComponent: () =>
          import('./pages/app-shell/app-shell-page.component'),
      },
      {
        path: 'page-header',
        loadComponent: () =>
          import('./pages/page-header/page-header-page.component'),
      },
      {
        path: 'empty-state',
        loadComponent: () =>
          import('./pages/empty-state/empty-state-page.component'),
      },
      { path: '', redirectTo: 'button', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/components/button', pathMatch: 'full' },
];
