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
      { path: '', redirectTo: 'button', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/components/button', pathMatch: 'full' },
];
