import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [authGuard({ requiresAuthentication: false })],
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canMatch: [authGuard({ requiresAuthentication: true })],
    loadChildren: () =>
      import('./shared/components/authenticated-layout/layout.routes').then(
        (m) => m.LAYOUT_ROUTES
      ),
  },
];