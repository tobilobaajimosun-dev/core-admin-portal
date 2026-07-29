import { Component, inject, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationStore } from '@core/store/notification.store';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsTooltipModule } from '@pcsl-ui/ui/ps-tooltip/ps-tooltip.module';

interface NotificationStat {
  label:     string;
  value:     number;
  trend:     number | null;
  trendUp:   boolean;
  isPercent?: boolean;
  tooltipDescription: string;
}

@Component({
  selector: 'app-notification-stats',
  standalone: true,
  imports: [CommonModule, PsTooltipModule, PsSvgIconComponent],
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
        tooltipDescription: 'The total number of notifications dispatched from the platform across all channels within the selected period.',
      },
      {
        label:   'Delivered',
        value:   metrics.totalDelivered,
        trend:   deliveredTrend,
        trendUp: (deliveredTrend ?? 0) >= 0,
        tooltipDescription: 'The number of sent notifications that were successfully delivered to the recipient\'s device or inbox.',
      },
      {
        label:   'Failed',
        value:   metrics.totalFailed,
        trend:   failedTrend,
        trendUp: (failedTrend ?? 0) <= 0,
        tooltipDescription: 'The number of notifications that could not be delivered, due to issues like invalid tokens, network errors, or provider rejection.',
      },
      {
        label:     'Delivery Rate',
        value:     metrics.deliveryRate,
        trend:     rateTrend,
        trendUp:   (rateTrend ?? 0) >= 0,
        isPercent: true,
        tooltipDescription: 'The percentage of sent notifications that were successfully delivered, calculated as delivered notifications divided by total sent.',
      },
    ];
  });

  ngOnInit(): void {
    this.store.fetchMetrics({});
  }
}