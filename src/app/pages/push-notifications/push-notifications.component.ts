import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationStatsComponent } from './components/notification-stats/notification-stats.component';
import { SendNotificationComponent } from './components/send-notification/send-notification.component';
import { TemplateListComponent } from './components/template-list/template-list.component';
import { NotificationHistoryComponent } from './components/notification-history/notification-history.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { DateRange, PsDateRangePickerComponent } from '@ui/ps-date-range-picker/ps-date-range-picker.component';
import { NotificationStore } from '@core/store/notification.store';
import { NotificationMetricsCustomRange } from '@core/interfaces/notification.model';

export type NotificationTabValue = 'send' | 'template' | 'history';

@Component({
  selector: 'app-push-notifications',
  standalone: true,
  imports: [
    CommonModule,
    NotificationStatsComponent,
    SendNotificationComponent,
    TemplateListComponent,
    NotificationHistoryComponent,
    PsSvgIconComponent,
    PsDateRangePickerComponent,
  ],
  templateUrl: './push-notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PushNotificationsComponent implements OnInit {
  private readonly store = inject(NotificationStore);

  activeTab = signal<NotificationTabValue>('send');

  tabs: { value: NotificationTabValue; label: string; icon: string }[] = [
    { value: 'send',     label: 'Send Notification',    icon: 'send-icon'    },
    { value: 'template', label: 'Template',             icon: 'add-template-icon' },
    { value: 'history',  label: 'Notification History', icon: 'transactions-icon'  },
  ];

  readonly timeframeTabs: { label: string; value: Exclude<NotificationMetricsCustomRange, 'custom'> }[] = [
    { label: 'Today',      value: 'today'       },
    { label: 'Yesterday',  value: 'yesterday'   },
    { label: 'This Week',  value: 'past_7_days' },
    { label: 'This Month', value: 'this_month'  },
  ];

  activeRange = this.store.metricsActiveRange;

  ngOnInit(): void {
    this.store.setMetricsTimeframe('today');
  }

  onTimeframeChange(value: Exclude<NotificationMetricsCustomRange, 'custom'>): void {
    this.store.setMetricsTimeframe(value);
  }

  onRangeChange(range: DateRange | null): void {
    if (range?.start && range?.end) {
      this.store.setMetricsCustomRange(
        range.start.toISOString().split('T')[0],
        range.end.toISOString().split('T')[0]
      );
    }
  }
}