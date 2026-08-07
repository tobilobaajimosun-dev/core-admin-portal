import { Routes } from '@angular/router';

export const ASSET_FLEX_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'vendors',
    loadComponent: () => import('./vendors/vendors.component').then((m) => m.VendorsComponent),
  },
  {
    path: 'vendors/:id',
    loadComponent: () =>
      import('./vendors/vendor-detail/vendor-detail.component').then((m) => m.VendorDetailComponent),
  },
  {
    path: 'customers',
    loadComponent: () => import('./customers/customers.component').then((m) => m.CustomersComponent),
  },
  {
    path: 'customers/:id',
    loadComponent: () =>
      import('./customers/customer-detail/customer-detail.component').then((m) => m.CustomerDetailComponent),
  },
  {
    path: 'loans',
    loadComponent: () => import('./loans/loans.component').then((m) => m.LoansComponent),
  },
  {
    path: 'loans/:id',
    loadComponent: () => import('./loans/loan-detail/loan-detail.component').then((m) => m.LoanDetailComponent),
  },
  {
    path: 'loan-products',
    loadComponent: () =>
      import('./loan-products/loan-products.component').then((m) => m.LoanProductsComponent),
  },
  {
    path: 'settlements',
    loadComponent: () => import('./settlements/settlements.component').then((m) => m.SettlementsComponent),
  },
  {
    path: 'payment-methods',
    loadComponent: () =>
      import('./payment-methods/payment-methods.component').then((m) => m.PaymentMethodsComponent),
  },
  {
    path: 'identity-providers',
    data: { kind: 'identity' },
    loadComponent: () => import('./providers/providers.component').then((m) => m.ProvidersComponent),
  },
  {
    path: 'utilities-providers',
    data: { kind: 'utilities' },
    loadComponent: () => import('./providers/providers.component').then((m) => m.ProvidersComponent),
  },
  {
    path: 'admin-users',
    loadComponent: () =>
      import('./admin-users/admin-users.component').then((m) => m.AdminUsersComponent),
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles/roles.component').then((m) => m.RolesComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
