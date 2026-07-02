import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { WalletStore } from '@core/store/wallet.store';
import { WalletMetricsData, WalletStat } from '@core/interfaces/wallet.model';

@Component({
  selector: 'app-wallet-stats',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './wallet-stats.component.html',
})
export class WalletStatsComponent implements OnInit {
  private readonly store = inject(WalletStore);

  readonly isLoading     = this.store.metricsLoading;
  readonly skeletonItems = new Array(4);

  readonly stats = computed<WalletStat[]>(() => {
    const data = this.store.metrics();
    if (!data) return [];
    return this.mapStats(data);
  });

  ngOnInit(): void {
    this.store.fetchMetrics();
  }

  private mapStats(data: WalletMetricsData): WalletStat[] {
    return [
      {
        label:   'Total Wallets Created',
        value:   data.total_wallets_created,
        trend:   null,
        trendUp: true,
      },
      {
        label:   'Total Funded Amount',
        value:   data.total_funded_amount,
        trend:   null,
        trendUp: true,
        prefix:  '₦',
      },
      {
        label:   'Total Debit Amount',
        value:   data.total_debit_amount,
        trend:   null,
        trendUp: true,
        prefix:  '₦',
      },
      {
        label:   'Total Transactions',
        value:   data.total_transactions,
        trend:   null,
        trendUp: true,
      },
    ];
  }
}