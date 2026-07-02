import { ChangeDetectionStrategy, Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanStore } from '@core/store/loan.store';
import { LoanMetricsData } from '@core/interfaces/loan.model';

interface LoanStatCard {
  label:      string;
  value:      number;
  isCurrency: boolean;
  suffix?:    string;
}

@Component({
  selector: 'app-loan-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-stats.component.html',
  styleUrl: './loan-stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanStatsComponent implements OnInit {
  private readonly store = inject(LoanStore);

  readonly isLoading     = this.store.metricsLoading;
  readonly skeletonItems = new Array(6);

  readonly topStats = computed(() => {
    const data = this.store.metrics();
    if (!data) return [];
    return this.mapTopStats(data);
  });

  readonly bottomStats = computed(() => {
    const data = this.store.metrics();
    if (!data) return [];
    return this.mapBottomStats(data);
  });

  ngOnInit(): void {
    this.store.fetchMetrics();
  }

  private mapTopStats(data: LoanMetricsData): LoanStatCard[] {
    return [
      { label: 'Total Loan Applications', value: data.total_loan_applications, isCurrency: false },
      { label: 'Total Disbursed Loans',   value: data.total_disbursed_loans,   isCurrency: false },
      { label: 'Active Loans',            value: data.total_active_loans,      isCurrency: false },
    ];
  }

  private mapBottomStats(data: LoanMetricsData): LoanStatCard[] {
    return [
      { label: 'Outstanding Balance', value: data.total_outstanding_balance, isCurrency: true },
      { label: 'Total Repaid',        value: data.total_repaid,              isCurrency: true },
      { label: 'Default Rate',        value: data.rate_of_defaulting,        isCurrency: false, suffix: '%' },
    ];
  }
}