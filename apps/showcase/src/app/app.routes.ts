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
      // Phase 2 adds: card, chip — one route per component PR.
      { path: '', redirectTo: 'button', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/components/button', pathMatch: 'full' },
];
