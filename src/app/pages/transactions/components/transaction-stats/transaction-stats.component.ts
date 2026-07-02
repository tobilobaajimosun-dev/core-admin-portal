import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { TransactionStore } from '@core/store/transaction.store';
import { TransactionMetricsData, TransactionStat } from '@core/interfaces/transaction.model';

@Component({
  selector: 'app-transaction-stats',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './transaction-stats.component.html',
})
export class TransactionStatsComponent implements OnInit {
  private readonly store = inject(TransactionStore);

  readonly isLoading     = this.store.metricsLoading;
  readonly skeletonItems = new Array(3);

  readonly stats = computed<TransactionStat[]>(() => {
    const data = this.store.metrics();
    if (!data) return [];
    return this.mapStats(data);
  });

  ngOnInit(): void {
    this.store.fetchMetrics();
  }

  private mapStats(data: TransactionMetricsData): TransactionStat[] {
    return [
      {
        label:   'Total Transactions',
        value:   data.total_transactions,
        trend:   null,
        trendUp: true,
      },
      {
        label:   'Total Volume',
        value:   data.total_amount,
        trend:   null,
        trendUp: true,
        prefix:  '₦',
      },
      {
        label:   'Successful Transactions',
        value:   data.successful_transactions,
        trend:   null,
        trendUp: true,
      },
    ];
  }
}