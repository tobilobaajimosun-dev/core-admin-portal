import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsTooltipModule } from '@pcsl-ui/ui/ps-tooltip/ps-tooltip.module';
import { WalletStore } from '@core/store/wallet.store';
import { WalletMetricsData, WalletStat } from '@core/interfaces/wallet.model';

@Component({
  selector: 'app-wallet-stats',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent, PsTooltipModule],
  templateUrl: './wallet-stats.component.html',
})
export class WalletStatsComponent implements OnInit {
  private readonly store = inject(WalletStore);

  readonly isLoading     = this.store.metricsLoading;
  readonly skeletonItems = new Array(6);

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
      label:              'Total Wallets Created',
      value:              data.total_wallets_created,
      trend:              null,
      trendUp:            true,
      tooltipDescription: 'The total number of customer wallets that have been created on the platform.',
    },
    {
      label:              'Total Active Wallets',
      value:              data.total_active_wallet,
      trend:              null,
      trendUp:            true,
      tooltipDescription: 'The total number of customer wallets that are currently active.',
    },
    {
      label:              'Total Inactive Wallets',
      value:              data.total_inactive_wallet,
      trend:              null,
      trendUp:            false,
      tooltipDescription: 'The total number of customer wallets that are currently inactive.',
    },
    {
      label:              'Total Funded Amount',
      value:              data.total_funded_amount,
      trend:              null,
      trendUp:            true,
      prefix:             '₦',
      tooltipDescription: 'The total amount that has been credited into customer wallets across all funding sources.',
    },
    {
      label:              'Total Debit Amount',
      value:              data.total_debit_amount,
      trend:              null,
      trendUp:            true,
      prefix:             '₦',
      tooltipDescription: 'The total amount that has been debited from customer wallets, including withdrawals and payments.',
    },
    {
      label:              'Total Transactions',
      value:              data.total_transactions,
      trend:              null,
      trendUp:            true,
      tooltipDescription: 'The total number of wallet transactions recorded, including credits and debits.',
    },
  ];
}
}