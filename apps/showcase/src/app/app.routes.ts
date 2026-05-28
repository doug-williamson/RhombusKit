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
      { path: '', redirectTo: 'button', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/components/button', pathMatch: 'full' },
];
