import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { TransactionStat }  from '@core/interfaces/transaction.model';

@Component({
  selector: 'app-transaction-stats',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './transaction-stats.component.html',
})
export class TransactionStatsComponent {
  isLoading    = signal(false);
  skeletonItems = new Array(3);

  stats = signal<TransactionStat[]>([
    { label: 'Total Transactions', value: 1_000_090, trend: 12, trendUp: true  },
    { label: 'Total Volume',       value: '₦1.9B',   trend: 12, trendUp: true, prefix: '' },
    { label: 'Successful Transactions', value: 100,  trend: 12, trendUp: true  },
  ]);
}