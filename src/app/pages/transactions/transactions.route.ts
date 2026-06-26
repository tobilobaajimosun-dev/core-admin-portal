import { Routes } from '@angular/router';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: ':id',
        loadComponent: () =>
          import('./view-transaction/view-transaction.component')
            .then((m) => m.ViewTransactionComponent),
      },
      {
        path: '',
        loadComponent: () =>
          import('./transactions.component')
            .then((m) => m.TransactionsComponent),
      },
    ],
  },
];