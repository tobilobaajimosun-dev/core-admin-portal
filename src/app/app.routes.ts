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
    path: 'select-app',
    canMatch: [authGuard({ requiresAuthentication: true })],
    loadComponent: () =>
      import('./pages/select-app/select-app.component').then((m) => m.SelectAppComponent),
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