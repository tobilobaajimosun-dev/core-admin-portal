import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { WalletStatsComponent }       from './components/wallet-stats/wallet-stats.component';
import { TopFundedWalletsComponent }  from './components/top-funded-wallets/top-funded-wallets.component';
import { WalletsTableComponent }      from './components/wallets-table/wallets-table.component';
import { DateRange, PsDateRangePickerComponent } from '@ui/ps-date-range-picker/ps-date-range-picker.component';
import { WalletStore } from '@core/store/wallet.store';
import { toLocalDateString } from '@shared/utils/date.util';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    WalletStatsComponent,
    TopFundedWalletsComponent,
    WalletsTableComponent,
    PsDateRangePickerComponent,
  ],
  templateUrl: './wallets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletsComponent {
  private readonly walletStore    = inject(WalletStore);

onRangeChange(range: DateRange | null): void {
  if (range?.start && range?.end) {
    this.walletStore.fetchMetrics({
      custom_range: 'custom',
      start_date:   toLocalDateString(range.start),
      end_date:     toLocalDateString(range.end),
    });
  }
}
}