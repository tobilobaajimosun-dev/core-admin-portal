import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TransactionStatsComponent }  from './components/transaction-stats/transaction-stats.component';
import { TransactionsTableComponent } from './components/transactions-table/transactions-table.component';
import { DateRange, PsDateRangePickerComponent } from '@ui/ps-date-range-picker/ps-date-range-picker.component';
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
  private readonly transactionStore = inject(TransactionStore);

  ngOnInit(): void {
    this.transactionStore.fetchMetrics();
  }

  onRangeChange(range: DateRange | null): void {
    if (range?.start && range?.end) {
      this.transactionStore.fetchMetrics({
        custom_range: 'custom',
        start_date: toLocalDateString(range.start),
        end_date:   toLocalDateString(range.end),
      });
    } else {
      // Cleared — refetch metrics with no date filter
      this.transactionStore.fetchMetrics();
    }
  }
}