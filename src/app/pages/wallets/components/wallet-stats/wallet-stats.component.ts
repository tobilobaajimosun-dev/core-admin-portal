import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { WalletStat } from '@core/interfaces/wallet.model';

@Component({
  selector: 'app-wallet-stats',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './wallet-stats.component.html',
})
export class WalletStatsComponent {
  isLoading     = signal(false);
  skeletonItems = new Array(4);

  stats = signal<WalletStat[]>([
    { label: 'Total Wallets Created', value: 1_000_090, trend: 12, trendUp: true },
    { label: 'Total Funded Amount',   value: '₦1.9B',   trend: 12, trendUp: true, prefix: '' },
    { label: 'Total Debit Amount',    value: '₦1.9B',   trend: 12, trendUp: true, prefix: '' },
    { label: 'Total Transactions',    value: 100,        trend: 12, trendUp: true },
  ]);
}