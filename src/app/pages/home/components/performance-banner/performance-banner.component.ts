import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { DashboardStore } from '@core/store/dashboard.store';

@Component({
  selector: 'app-performance-banner',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent, PsEmptyComponent],
  templateUrl: './performance-banner.component.html',
  styleUrl:    './performance-banner.component.scss',
})
export class PerformanceBannerComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);

  isLoading          = this.dashboardStore.isDailyPerformanceLoading;
  productPerformance = this.dashboardStore.productPerformance;
  lastUpdated        = this.dashboardStore.lastUpdated;

  readonly skeletonRows = new Array(4);

  ngOnInit(): void {
    this.dashboardStore.fetchDailyPerformance();
  }

  refresh(): void {
    this.dashboardStore.fetchDailyPerformance();
  }
}