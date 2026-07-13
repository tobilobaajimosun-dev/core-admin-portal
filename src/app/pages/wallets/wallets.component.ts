import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { WalletStatsComponent }       from './components/wallet-stats/wallet-stats.component';
import { TopFundedWalletsComponent }  from './components/top-funded-wallets/top-funded-wallets.component';
import { WalletsTableComponent }      from './components/wallets-table/wallets-table.component';
import { DateRange, PsDateRangePickerComponent } from '@ui/ps-date-range-picker/ps-date-range-picker.component';
import { DashboardStore }             from '@core/store/dashboard.store';
import { DashboardCustomRange }       from '@core/interfaces/dashboard.model';

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
export class WalletsComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);

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
      this.dashboardStore.setCustomDateRange(
        range.start.toISOString().split('T')[0],
        range.end.toISOString().split('T')[0]
      );
    }
  }
}