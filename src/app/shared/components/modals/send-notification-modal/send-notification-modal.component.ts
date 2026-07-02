import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { SuccessNotificationModalComponent } from '../success-notification-modal/success-notification-modal.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { NotificationStore } from '@core/store/notification.store';

export type NotificationChannel = 'app' | 'email';

export interface SendNotificationData {
  customerId:    string;
  customerName:  string;
  customerEmail: string;
}

@Component({
  selector: 'app-send-notification-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PsSvgIconComponent],
  templateUrl: './send-notification-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendNotificationModalComponent extends PsModalComponent implements OnInit {
  private readonly modalService = inject(PsModalService);
  private readonly store        = inject(NotificationStore);

  readonly isSending = this.store.isSendingNotification;

  modalData: SendNotificationData = {
    customerId:    '',
    customerName:  '',
    customerEmail: '',
  };

  selectedChannel = signal<NotificationChannel>('app');
  subject         = signal('');
  message         = signal('');

  canSend = computed(() =>
    !this.isSending() &&
    this.subject().trim().length > 0 &&
    this.message().trim().length > 0
  );

  ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
    }
  }

  selectChannel(channel: NotificationChannel): void {
    this.selectedChannel.set(channel);
  }

  onSubjectChange(value: string): void {
    this.subject.set(value);
  }

  onMessageChange(value: string): void {
    this.message.set(value);
  }

  send(): void {
    if (!this.canSend()) return;

    this.store.sendNotification({
      recipient_type: 'specific',
      customer_ids:   [this.modalData.customerId],
      channel:        this.selectedChannel() === 'app' ? 'push' : 'email',
      title:          this.subject(),
      message:        this.message(),
    }).subscribe({
      next: () => {
        this.close();
        this.modalService.open(SuccessNotificationModalComponent, {
          data: {
            iconSrc: 'icons/invite-sent.svg',
            title: 'Notification sent',
            description: `Your notification has been sent to ${this.modalData.customerName} (${this.modalData.customerEmail})`,
            doneLabel: 'Done',
          },
        });
      },
      // Error toast + isSendingNotification reset already handled in the
      // store — modal stays open so the person can retry.
      error: () => {},
    });
  }
}