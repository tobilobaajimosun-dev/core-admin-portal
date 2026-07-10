import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  signal,
  computed,
  inject,
  viewChild,
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

  // Reference to the message textarea, used to read/restore cursor
  // selection when applying formatting from the toolbar.
  private readonly messageTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('messageTextarea');

  modalData: SendNotificationData = {
    customerId:    '',
    customerName:  '',
    customerEmail: '',
  };

  selectedChannel = signal<NotificationChannel>('app');
  subject         = signal('');
  message         = signal('');

  // Email has no character cap (it's rendered as HTML); app/push notifications
  // stay capped at 500 chars.
  readonly isEmailChannel = computed(() => this.selectedChannel() === 'email');
  readonly messageMaxLength = computed<number | null>(() => (this.isEmailChannel() ? null : 500));

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
    const max = this.messageMaxLength();
    this.message.set(max !== null && value.length > max ? value.slice(0, max) : value);
  }

  /** Wraps the current textarea selection in an HTML tag (e.g. <strong>...</strong>). */
  applyBold(): void {
    this.wrapSelection('<strong>', '</strong>');
  }

  applyItalic(): void {
    this.wrapSelection('<em>', '</em>');
  }

  /** Toggles an <h1>...</h1> wrapper around the line the cursor is in. */
  applyHeader(): void {
    const el = this.messageTextarea()?.nativeElement;
    if (!el) return;

    const value = this.message();
    const cursor = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', cursor - 1) + 1;
    const lineEndIdx = value.indexOf('\n', cursor);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const line = value.slice(lineStart, lineEnd);

    const isHeader = line.startsWith('<h1>') && line.endsWith('</h1>');
    const newLine = isHeader ? line.slice(4, -5) : `<h1>${line}</h1>`;
    const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
    const offset = isHeader ? -4 : 4;

    this.message.set(newValue);
    this.restoreSelection(el, cursor + offset, cursor + offset);
  }

  private wrapSelection(openTag: string, closeTag: string): void {
    const el = this.messageTextarea()?.nativeElement;
    if (!el) return;

    const value = this.message();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || 'text';

    const newValue = value.slice(0, start) + openTag + selected + closeTag + value.slice(end);
    this.message.set(newValue);
    this.restoreSelection(el, start + openTag.length, start + openTag.length + selected.length);
  }

  /** Restores focus/selection on the textarea after the DOM updates with the new value. */
  private restoreSelection(el: HTMLTextAreaElement, start: number, end: number): void {
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, end);
    });
  }

  // Tags that already render as their own block/paragraph in email clients —
  // lines starting with one of these are left as-is rather than re-wrapped.
  private readonly BLOCK_TAG_PATTERN = /^<(h[1-6]|p|div|ul|ol|li|blockquote|table)[\s>]/i;

  private toHtmlMessage(message: string): string {
    return message
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map(line => (this.BLOCK_TAG_PATTERN.test(line) ? line : `<p>${line}</p>`))
      .join('\n');
  }

  send(): void {
    if (!this.canSend()) return;

    const isEmail = this.isEmailChannel();

    this.store.sendNotification({
      recipient_type: 'specific',
      customer_ids:   [this.modalData.customerId],
      channel:        isEmail ? 'email' : 'push',
      title:          this.subject(),
      message:        isEmail ? this.toHtmlMessage(this.message()) : this.message(),
      isHtml:         isEmail,
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
     
      error: () => {},
    });
  }
}