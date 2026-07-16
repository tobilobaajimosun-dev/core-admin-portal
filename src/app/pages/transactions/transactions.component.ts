import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TransactionStatsComponent }  from './components/transaction-stats/transaction-stats.component';
import { TransactionsTableComponent } from './components/transactions-table/transactions-table.component';
import { DateRange, PsDateRangePickerComponent } from '@ui/ps-date-range-picker/ps-date-range-picker.component';
import { DashboardStore }             from '@core/store/dashboard.store';
import { DashboardCustomRange }       from '@core/interfaces/dashboard.model';
import { toLocalDateString } from '@shared/utils/date.util'
import { TransactionStore } from '@core/store/transaction.store';


@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    TransactionStatsComponent,
    TransactionsTableComponent,
    PsDateRangePickerComponent,
  ],
  templateUrl: './transactions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);
  private readonly transactionStore = inject(TransactionStore);

  activeRange = this.dashboardStore.activeRange;

  readonly timeframeTabs: { label: string; value: DashboardCustomRange }[] = [
    { label: 'Today',      value: 'today'       },
    { label: 'Yesterday',  value: 'yesterday'   },
    { label: 'This Week',  value: 'this_week' },
    { label: 'This Month', value: 'this_month'  },
  ];

  ngOnInit(): void {
    this.dashboardStore.fetchDashboardCards(this.dashboardStore.listConfig());
  }

  onTimeframeChange(value: DashboardCustomRange): void {
    this.dashboardStore.setTimeframe(value);
  }

onRangeChange(range: DateRange | null): void {
  if (range?.start && range?.end) {
    this.transactionStore.fetchMetrics({
      custom_range: 'custom',
      start_date: toLocalDateString(range.start),
      end_date:   toLocalDateString(range.end),
    });
  }
}

}