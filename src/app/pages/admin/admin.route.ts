import { Routes } from '@angular/router';
import { canDeactivatePageGuard } from '@core/guards/de-activate-page.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'roles',
        loadComponent: () =>
          import('./roles/roles.component').then((m) => m.RolesComponent),
        canDeactivate: [canDeactivatePageGuard],
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./admin-users/view-admin/view-admin.component').then(
            (m) => m.ViewAdminComponent
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent
          ),
      },
    ],
  },
];