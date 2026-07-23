import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsEmptyComponent } from '@ui/ps-empty/ps-empty.component';
import { DashboardStore } from '@core/store/dashboard.store';
import { Router } from '@angular/router';
import { LoanDateRange, LoanView } from '@core/interfaces/loan.model';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

@Component({
  selector: 'app-recent-loans',
  standalone: true,
  imports: [CommonModule, PsPaginationComponent, PsEmptyComponent,DropdownComponent, PsSvgIconComponent],
  templateUrl: './recent-loans.component.html',
  styleUrl: './recent-loans.component.scss',
})
export class RecentLoansComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);
  private readonly router = inject(Router);

  isLoading   = this.dashboardStore.isRecentLoansLoading;
  loans       = this.dashboardStore.recentLoans;
  totalItems  = this.dashboardStore.recentLoansTotalItems;
  currentPage = signal(1);
  pageSize    = this.dashboardStore.recentLoansPageSize;

  readonly skeletonRows = new Array(5);
  readonly columns = [
    'Date & Time', 'Customer Details', 'Loan ID',
    'Amount & Tenor', 'Product', 'Status', '',
  ];

  ngOnInit(): void {
    this.dashboardStore.fetchRecentLoans({ page: 1, limit: 5 });
  }

  // ── Status helpers ────────────────────────────────────────────────────────
 getStatusColor(status: string): string {
  const map: Record<string, string> = {
    NEW:       '#00B3FF',
    DISBURSED: '#10B981',
    COMPLETED: '#10B981',
    FAILED:    '#EF4444',
    PENDING:   '#F59E0B',
  };
  return map[status?.toUpperCase()] ?? '#6B7280';
}

getStatusBg(status: string): string {
  const map: Record<string, string> = {
    NEW:       '#D0EEFB',
    DISBURSED: '#D1FAE5',
    COMPLETED: '#D1FAE5',
    FAILED:    '#FEE2E2',
    PENDING:   '#FEF3C7',
  };
  return map[status?.toUpperCase()] ?? '#F3F4F6';
}

  onPageChange(page: number): void {
    this.currentPage.set(page); 
    this.dashboardStore.setRecentLoansPage(page);
  }

  onPageSizeChange(size: number): void {
    this.currentPage.set(1);
    this.dashboardStore.setRecentLoansPageSize(size);
  }

  viewLoan(loan: any): void { 
      this.router.navigate(['/loans', loan.id]); 
    }
    
 viewAll(): void {
    this.router.navigate(['/loans']);
  }
}