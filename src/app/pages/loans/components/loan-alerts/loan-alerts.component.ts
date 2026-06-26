import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

interface LoanAlert {
  key: string;
  title: string;
  subtitle: string;
  value: number;
  route: string;
}

@Component({
  selector: 'app-loan-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-alerts.component.html',
})
export class LoanAlertsComponent {
  private readonly router = inject(Router);

  alerts = signal<LoanAlert[]>([
    {
      key: 'failed_disbursements',
      title: 'Failed Disbursements',
      subtitle: 'Disbursements failed',
      value: 0,
      route: '/loans/failed-disbursements',
    },
    {
      key: 'repayments_due',
      title: 'Repayments Due Today',
      subtitle: 'Payments due today',
      value: 0,
      route: '/loans/repayments-due',
    },
  ]);

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}