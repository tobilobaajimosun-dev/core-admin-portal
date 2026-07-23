import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsTooltipModule } from '@pcsl-ui/ui/ps-tooltip/ps-tooltip.module';
import { DateRange, PsDateRangePickerComponent } from '@ui/ps-date-range-picker/ps-date-range-picker.component';
import { DashboardStore } from '@core/store/dashboard.store';
import { DashboardCustomRange } from '@core/interfaces/dashboard.model';
import { toLocalDateString } from '@shared/utils/date.util';

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [
    CommonModule,
    PsEmptyComponent,
    PsSvgIconComponent,
    PsDateRangePickerComponent,
    PsTooltipModule,
  ],
  templateUrl: './stats-grid.component.html',
  styleUrl: './stats-grid.component.scss',
})
export class StatsGridComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);

  isLoading   = this.dashboardStore.isLoading;
  activeRange = this.dashboardStore.activeRange;
  stats       = this.dashboardStore.stats;

  readonly skeletonItems = new Array(15);

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
        toLocalDateString(range.start),
        toLocalDateString(range.end)
      );
    } else {
      this.dashboardStore.setTimeframe('today');
    }
  }
}