import { Routes } from '@angular/router';

export const LOANS_ROUTES: Routes = [
    {
        path: '',
        children: [
            {
                path: 'failed-disbursements',
                loadComponent: () =>
                    import('./failed-disbursements/failed-disbursements.component').then(
                        m => m.FailedDisbursementsComponent
                    ),
            },
            {
                path: 'repayments-due',
                loadComponent: () =>
                    import('./repayments-due/repayments-due.component').then(
                        m => m.RepaymentsDueComponent
                    ),
            },
            {
                path: ':id',
                loadComponent: () =>
                    import('./view-loan/view-loan.component')
                        .then((m) => m.ViewLoanComponent),
            },
            {
                path: '',
                loadComponent: () =>
                    import('./loans.component').then((m) => m.LoansComponent),
            },
        ],
    },
];