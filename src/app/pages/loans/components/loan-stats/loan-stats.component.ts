import { ChangeDetectionStrategy, Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanStore } from '@core/store/loan.store';
import { LoanMetricsData } from '@core/interfaces/loan.model';
import { PsTooltipModule } from '@pcsl-ui/ui/ps-tooltip/ps-tooltip.module';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

interface LoanStatCard {
  label:              string;
  value:              number;
  isCurrency:         boolean;
  suffix?:            string;
  tooltipDescription: string;
}

@Component({
  selector: 'app-loan-stats',
  standalone: true,
  imports: [CommonModule, PsTooltipModule, PsSvgIconComponent],
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
      {
        label: 'Total Loan Applications',
        value: data.total_loan_applications,
        isCurrency: false,
        tooltipDescription: 'The total number of loan applications submitted by customers, including pending, approved and declined requests.',
      },
      {
        label: 'Total Disbursed Loans',
        value: data.total_disbursed_loans,
        isCurrency: false,
        tooltipDescription: 'The total number of approved loans that have been disbursed to customers.',
      },
      {
        label: 'Active Loans',
        value: data.total_active_loans,
        isCurrency: false,
        tooltipDescription: 'Loans currently running that customers are still repaying and have not yet closed.',
      },
    ];
  }

  private mapBottomStats(data: LoanMetricsData): LoanStatCard[] {
    return [
      {
        label: 'Outstanding Balance',
        value: data.total_outstanding_balance,
        isCurrency: true,
        tooltipDescription: 'The total amount still owed by customers across all active loans.',
      },
      {
        label: 'Total Repaid',
        value: data.total_repaid,
        isCurrency: true,
        tooltipDescription: 'The total amount customers have repaid across all loans to date.',
      },
      {
        label: 'Default Rate',
        value: data.rate_of_defaulting,
        isCurrency: false,
        suffix: '%',
        tooltipDescription: 'The percentage of loans that are overdue or have defaulted on repayment.',
      },
    ];
  }
}