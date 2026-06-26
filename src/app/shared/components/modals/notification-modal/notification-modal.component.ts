import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  /** 'success' = green circle, 'error' = red circle */
  type: 'success' | 'error';
  read: boolean;
}

export interface NotificationModalData {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './notification-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationModalComponent extends PsModalComponent implements OnInit {

  panelData: NotificationModalData = {
    notifications: [],
    onMarkAllRead: () => { },
  };

  notifications = signal<AppNotification[]>([]);

  ngOnInit(): void {
    if (this.data) {
      this.panelData = { ...this.panelData, ...this.data };
      this.notifications.set(this.panelData.notifications);
    }
  }

  get unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  get hasNotifications(): boolean {
    return this.notifications().length > 0;
  }

  iconBg(type: 'success' | 'error'): string {
    return type === 'success' ? '#12B76A' : '#EF4444';
  }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    this.panelData.onMarkAllRead();
  }
}