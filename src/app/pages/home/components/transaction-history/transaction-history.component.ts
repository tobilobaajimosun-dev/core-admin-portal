import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { DashboardStore } from '@core/store/dashboard.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, PsEmptyComponent],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.scss',
})
export class TransactionHistoryComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);
  private readonly router = inject(Router);

  isLoadingTransactions  = this.dashboardStore.isTransactionsLoading;
  isLoadingDisbursements = this.dashboardStore.isTransactionsLoading; 
  transactions           = this.dashboardStore.transactions;

  readonly skeletonRows = new Array(5);
  readonly columns = [
    'Customer Details', 'Transaction Type', 'Reference Number', 'Amount', 'Status',
  ];

  ngOnInit(): void {
    this.dashboardStore.fetchTransactions({ page: 1, limit: 5 });
  }

  // ── Status helpers ─────────────────────────────────
  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      SUCCESS: '#10B981',
      FAILED:     '#EF4444',
      PENDING:    '#F59E0B',
      PROCESSING: '#00B3FF',
    };
    return map[status?.toUpperCase()] ?? '#6B7280';
  }

  getStatusBg(status: string): string {
    const map: Record<string, string> = {
      SUCCESS: '#D1FAE5',
      FAILED:     '#FEE2E2',
      PENDING:    '#FEF3C7',
      PROCESSING: '#D0EEFB',
    };
    return map[status?.toUpperCase()] ?? '#F3F4F6';
  }

   viewAll(): void {
    this.router.navigate(['/transactions']);
  }
}