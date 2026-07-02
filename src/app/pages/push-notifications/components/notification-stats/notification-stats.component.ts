import { Component, inject, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationStore } from '@core/store/notification.store';

interface NotificationStat {
  label:     string;
  value:     number;
  trend:     number | null;
  trendUp:   boolean;
  isPercent?: boolean;
}

@Component({
  selector: 'app-notification-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationStatsComponent implements OnInit {
  private readonly store = inject(NotificationStore);

  readonly isLoading     = this.store.isLoading;
  readonly skeletonItems = new Array(4);

  readonly stats = computed<NotificationStat[]>(() => {
    const metrics = this.store.metrics();
    if (!metrics) return [];

    const sentTrend      = this.store.sentTrend();
    const deliveredTrend = this.store.deliveredTrend();
    const failedTrend    = this.store.failedTrend();
    const rateTrend      = this.store.rateTrend();

    return [
      {
        label:   'Total Sent',
        value:   metrics.totalSent,
        trend:   sentTrend,
        trendUp: (sentTrend ?? 0) >= 0,
      },
      {
        label:   'Delivered',
        value:   metrics.totalDelivered,
        trend:   deliveredTrend,
        trendUp: (deliveredTrend ?? 0) >= 0,
      },
      {
        label:   'Failed',
        value:   metrics.totalFailed,
        trend:   failedTrend,
        trendUp: (failedTrend ?? 0) <= 0,
      },
      {
        label:     'Delivery Rate',
        value:     metrics.deliveryRate,
        trend:     rateTrend,
        trendUp:   (rateTrend ?? 0) >= 0,
        isPercent: true,
      },
    ];
  });

  ngOnInit(): void {
    this.store.fetchMetrics({});
  }
}