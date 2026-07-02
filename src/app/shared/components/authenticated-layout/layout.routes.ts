import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
     canMatch: [authGuard({ requiresAuthentication: true })],
    loadComponent: () =>
      import('./authenticated-layout.component').then(
        (m) => m.AuthenticatedLayoutComponent
      ),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('@pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'admin-users',
        loadChildren: () =>
          import('@pages/admin/admin.route').then(
            (m) => m.ADMIN_ROUTES
          ),
      },
       {
        path: 'users',
        loadChildren: () =>
          import('@pages/customers/customers.route').then(
            (m) => m.CUSTOMERS_ROUTES
          ),
      },
       {
        path: 'loans',
        loadChildren: () =>
          import('@pages/loans/loans.route').then(
            (m) => m.LOANS_ROUTES
          ),
      },
      {
        path: 'wallets',
        loadChildren: () =>
          import('@pages/wallets/wallets.route').then(
            (m) => m.WALLETS_ROUTES
          ),
      },
       {
        path: 'transactions',
        loadChildren: () =>
          import('@pages/transactions/transactions.route').then(
            (m) => m.TRANSACTIONS_ROUTES
          ),
      },
      {
        path: 'activity-logs',
        loadComponent: () =>
          import('@pages/activity-logs/activity-logs.component').then((m) => m.ActivityLogsComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('@pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('@pages/customers/customers.component').then((m) => m.CustomersComponent),
      },
      {
        path: 'push-notifications',
        loadComponent: () =>
          import('@pages/push-notifications/push-notifications.component').then((m) => m.PushNotificationsComponent),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];