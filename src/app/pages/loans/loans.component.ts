import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { LoanTableComponent } from "./components/loan-table/loan-table.component";
import { LoanStatsComponent } from "./components/loan-stats/loan-stats.component";
import { LoanAlertsComponent } from "./components/loan-alerts/loan-alerts.component";
import { DateRange, PsDateRangePickerComponent } from '@ui/ps-date-range-picker/ps-date-range-picker.component';
import { DashboardStore } from '@core/store/dashboard.store';
import { DashboardCustomRange } from '@core/interfaces/dashboard.model';

import { LoanStore } from '@core/store/loan.store';
import { toLocalDateString } from '@shared/utils/date.util';

@Component({
  selector: 'app-loans',
  imports: [
    LoanTableComponent,
    LoanStatsComponent,
    LoanAlertsComponent,
    PsDateRangePickerComponent,
  ],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoansComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);
  private readonly loanStore      = inject(LoanStore);

  activeRange = this.dashboardStore.activeRange;

  ngOnInit(): void {
    this.dashboardStore.fetchDashboardCards(this.dashboardStore.listConfig());
  }

  onTimeframeChange(value: DashboardCustomRange): void {
    this.dashboardStore.setTimeframe(value);
  }

  onRangeChange(range: DateRange | null): void {
    if (range?.start && range?.end) {
      this.loanStore.fetchMetrics({
        custom_range: 'custom',
        start_date:   toLocalDateString(range.start),
        end_date:     toLocalDateString(range.end),
      });
    }
  }
}