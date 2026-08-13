import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsClickOutsideDirective } from '@shared/directives/ps-click-outside.directive';
import { AppNotification } from '@shared/components/modals/notification-modal/notification-modal.component';

/**
 * Anchored notification dropdown — same visual content as the older
 * NotificationModalComponent, but rendered directly under the bell instead
 * of through the modal service (which centers with a backdrop). Kept as a
 * separate component rather than reworking NotificationModalComponent itself,
 * since that one extends the shared PsModalComponent base other modals rely on.
 */
@Component({
  selector: 'app-notification-dropdown',
  imports: [PsSvgIconComponent, PsClickOutsideDirective],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDropdownComponent {
  readonly notifications = input.required<AppNotification[]>();
  readonly closed = output<void>();
  readonly markAllRead = output<void>();

  protected get unreadCount(): number {
    return this.notifications().filter((n) => !n.read).length;
  }

  protected get hasNotifications(): boolean {
    return this.notifications().length > 0;
  }

  protected iconBg(type: 'success' | 'error'): string {
    return type === 'success' ? '#12B76A' : '#EF4444';
  }
}
