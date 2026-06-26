import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NotificationItem {
  key:         string;
  label:       string;
  description: string;
  enabled:     boolean;
}

@Component({
  selector: 'app-email-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-notifications.component.html',
  styleUrl: './email-notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailNotificationsComponent {

  notifications: NotificationItem[] = [
    {
      key:         'kyc_submissions',
      label:       'KYC submissions',
      description: 'Get notified when a user submits KYC',
      enabled:     true,
    },
    {
      key:         'failed_transactions',
      label:       'Failed transactions',
      description: 'Get notified when a transactions fails',
      enabled:     true,
    },
    {
      key:         'new_user_sign_ups',
      label:       'New user sign ups',
      description: 'Get notified when a new user onboards on Core app.',
      enabled:     false,
    },
  ];

  toggleNotification(key: string): void {
    const item = this.notifications.find(n => n.key === key);
    if (item) {
      item.enabled = !item.enabled;
      // console.log('Toggle notification:', key, item.enabled);
    }
  }
}