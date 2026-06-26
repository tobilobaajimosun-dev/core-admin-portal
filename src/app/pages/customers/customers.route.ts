import { Routes } from '@angular/router';
import { canDeactivatePageGuard } from '@core/guards/de-activate-page.guard';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'view-all-needs-attention',
        loadComponent: () =>
          import('./components/view-all-needs-attention/view-all-needs-attention.component').then((m) => m.ViewAllNeedsAttentionComponent),
      },
       {
        path: ':id/activity-log/:logId',  
        loadComponent: () =>
          import('./view-customer/components/activity-log-detail/activity-log-detail.component')
            .then((m) => m.ActivityLogDetailComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./view-customer/view-customer.component')
            .then((m) => m.ViewCustomerComponent)
      },
      {
        path: '',
        loadComponent: () =>
          import('./customers.component').then(
            (m) => m.CustomersComponent
          ),
      },
    ],
  },
];