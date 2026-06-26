import { Routes } from '@angular/router';

export const WALLETS_ROUTES: Routes = [
  {
    path: '',
    children: [
     
      {
        path: ':id',
        loadComponent: () =>
          import('./view-wallet/view-wallet.component')
            .then((m) => m.ViewWalletComponent),
      },
      {
        path: '',
        loadComponent: () =>
          import('./wallets.component')
            .then((m) => m.WalletsComponent),
      },
    ],
  },
];