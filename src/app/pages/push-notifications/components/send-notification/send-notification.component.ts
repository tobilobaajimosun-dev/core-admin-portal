import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PsSelectModule } from '@pcsl-ui/ui/ps-select/ps-select.module';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { NotificationStore } from '@core/store/notification.store';
import { NotificationSendPayload } from '@core/interfaces/notification.model';

export type RecipientTab = 'all' | 'segment' | 'specific';
export type ChannelType = 'email' | 'push';
export type ScheduleType = 'now' | 'later';

export interface EmploymentType {
  label: string; value: string;
}

const TEMPLATES: Record<string, { title: string; message: string }> = {
  'Loan Repayment Reminder': {
    title: 'Your loan is overdue!',
    message: `Dear {{customer_name}},\n\nHi! Your loan of {{loan_amount}} is overdue.\n\nKindly add funds to your wallet ({{loan_id}}) within 24 hours to complete repayment.\n\nThank you for choosing Core.`,
  },
  'Loan Approved': {
    title: 'Your loan has been approved!',
    message: `Dear {{customer_name}},\n\nCongratulations! Your loan application of {{loan_amount}} has been approved.\n\nFunds will be disbursed to your wallet ({{loan_id}}) within 24 hours.\n\nThank you for choosing Core.`,
  },
};

const AVAILABLE_VARIABLES = [
  '{{customer_name}}',
  '{{loan_amount}}',
  '{{outstanding_amount}}',
  '{{due_date}}',
  '{{loan_id}}',
  '{{wallet_balance}}',
  '{{customer_id}}',
];

@Component({
  selector: 'app-send-notification',
  standalone: true,
  imports: [CommonModule, FormsModule, PsSelectModule, PsSvgIconComponent],
  templateUrl: './send-notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendNotificationComponent {
  private readonly store = inject(NotificationStore);

  readonly isSending = this.store.isSendingNotification;

  // Reference to the textarea, used to read/restore cursor selection when
  // applying formatting from the toolbar.
  private readonly messageTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('messageTextarea');

  recipientTab = signal<RecipientTab>('all');
  channel = signal<ChannelType>('push');
  schedule = signal<ScheduleType>('now');

  // Message builder
  selectedTemplate = signal('');
  notificationTitle = signal('');
  notificationMessage = signal('');

  // Segment filters
  employmentType = signal('');
  loanStatus = signal('');
  kycStatus = signal('');
  walletMin = signal('');
  walletMax = signal('');
  registrationFrom = signal('');
  registrationTo = signal('');
  lastLoginDate = signal('');

  // Specific customers
  // NOTE: holds display names for now. Swap to { id, name } objects once a
  // real customer search endpoint/store is wired in — the API needs
  // customer_ids, not names.
  customerSearch = signal('');
  selectedCustomers = signal<string[]>([]);

  // Schedule later
  scheduledDate = signal('');
  scheduledTime = signal('');

  readonly templateOptions = ['', 'Loan Repayment Reminder', 'Loan Approved'];

  readonly employmentTypeOptions = [
  { value: '', label: 'All Employment Types' },
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed' },
];

readonly loanStatusOptions = [
  { value: '', label: 'All Loan' },
  { value: 'active', label: 'Active' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
];

readonly kycStatusOptions = [
  { value: '', label: 'All Status' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

  readonly availableVariables = AVAILABLE_VARIABLES;

  // Email has no character cap (it's rendered as HTML); other channels
  // (e.g. in-app/push) stay capped at 500 chars.
  readonly isEmailChannel = computed(() => this.channel() === 'email');
  readonly messageMaxLength = computed<number | null>(() => (this.isEmailChannel() ? null : 500));

  readonly recipientTabs: { value: RecipientTab; label: string; icon: string }[] = [
    { value: 'all',      label: 'All Customers',      icon: 'customers-icon'      },
    { value: 'segment',  label: 'Customer Segment',   icon: 'add-user-icon'       },
    { value: 'specific', label: 'Specific Customers', icon: 'specific-user-icon'  },
  ];

  readonly channelOptions: { value: ChannelType; label: string; sub: string }[] = [
    { value: 'email',  label: 'Email',  sub: 'Sent to customer inbox'   },
    { value: 'push', label: 'In-App', sub: 'Appears inside the app'   },
  ];

  readonly estimatedRecipients = computed(() => {
    if (this.recipientTab() === 'specific') return this.selectedCustomers().length;
    return 128_402;
  });

  readonly canSend = computed(() => {
    if (this.isSending()) return false;
    if (!this.notificationTitle().trim() || !this.notificationMessage().trim()) return false;
    if (this.recipientTab() === 'specific' && this.selectedCustomers().length === 0) return false;
    if (this.schedule() === 'later' && (!this.scheduledDate() || !this.scheduledTime())) return false;
    return true;
  });

  onTemplateChange(val: string): void {
    this.selectedTemplate.set(val);
    if (val && TEMPLATES[val]) {
      this.notificationTitle.set(TEMPLATES[val].title);
      this.notificationMessage.set(TEMPLATES[val].message);
    } else {
      this.notificationTitle.set('');
      this.notificationMessage.set('');
    }
  }

  insertVariable(variable: string): void {
    this.notificationMessage.update(msg => {
      const combined = msg + variable;
      const max = this.messageMaxLength();
      return max !== null && combined.length > max ? combined.slice(0, max) : combined;
    });
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

    const value = this.notificationMessage();
    const cursor = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', cursor - 1) + 1;
    const lineEndIdx = value.indexOf('\n', cursor);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const line = value.slice(lineStart, lineEnd);

    const isHeader = line.startsWith('<h1>') && line.endsWith('</h1>');
    const newLine = isHeader ? line.slice(4, -5) : `<h1>${line}</h1>`;
    const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
    const offset = isHeader ? -4 : 4;

    this.notificationMessage.set(newValue);
    this.restoreSelection(el, cursor + offset, cursor + offset);
  }

  private wrapSelection(openTag: string, closeTag: string): void {
    const el = this.messageTextarea()?.nativeElement;
    if (!el) return;

    const value = this.notificationMessage();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || 'text';

    const newValue = value.slice(0, start) + openTag + selected + closeTag + value.slice(end);
    this.notificationMessage.set(newValue);
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

  /**
   * Prepares the message for HTML email delivery. The textarea already
   * contains real HTML tags (from the toolbar, or typed directly by the
   * sender). Each line is treated as its own block: lines that already start
   * with a block-level tag (<h1>, <p>, etc.) are left alone; everything else
   * — plain text or a line wrapped only in inline tags like <strong>/<em> —
   * gets wrapped in <p>...</p> so it renders as a proper paragraph with
   * normal spacing instead of running everything together.
   *
   * NOTE: this intentionally does NOT escape the input. Anyone using this
   * form can inject arbitrary HTML/script into the outgoing email — that's
   * the point (rich formatting), but it means this field must stay
   * restricted to trusted admin users.
   */
  private toHtmlMessage(message: string): string {
    return message
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map(line => (this.BLOCK_TAG_PATTERN.test(line) ? line : `<p>${line}</p>`))
      .join('\n');
  }

  removeCustomer(name: string): void {
    this.selectedCustomers.update(list => list.filter(c => c !== name));
  }

  clearAllCustomers(): void {
    this.selectedCustomers.set([]);
  }

  private buildPayload(): NotificationSendPayload {
    const isEmail = this.isEmailChannel();

    const payload: NotificationSendPayload = {
      recipient_type: this.recipientTab(),
      channel: this.channel(),
      title: this.notificationTitle(),
      message: isEmail ? this.toHtmlMessage(this.notificationMessage()) : this.notificationMessage(),
      isHtml: isEmail,
    };

    if (this.selectedTemplate()) {
      payload.templateSlug = this.selectedTemplate();
    }

    if (this.recipientTab() === 'segment') {
      payload.filters = {
        employment_type: this.employmentType() || undefined,
        active_loan_status: this.loanStatus() || undefined,
        kyc_status: this.kycStatus() || undefined,
        wallet_balance_min: this.walletMin() ? Number(this.walletMin()) : undefined,
        wallet_balance_max: this.walletMax() ? Number(this.walletMax()) : undefined,
        registration_start_date: this.registrationFrom() || undefined,
        registration_end_date: this.registrationTo() || undefined,
        last_login_start_date: this.lastLoginDate() || undefined,
      };
    }

    if (this.recipientTab() === 'specific') {
      // TODO: selectedCustomers() currently holds display names, not IDs —
      // wire a real customer picker in before this goes live.
      payload.customer_ids = this.selectedCustomers();
    }

    if (this.schedule() === 'later' && this.scheduledDate() && this.scheduledTime()) {
      payload.scheduledAt = `${this.scheduledDate()}T${this.scheduledTime()}:00`;
    }

    return payload;
  }

  onSend(): void {
    if (!this.canSend()) return;

    this.store.sendNotification(this.buildPayload()).subscribe({
      next: () => this.resetForm(),
      error: () => {}, 
    });
  }

  private resetForm(): void {
    this.recipientTab.set('all');
    this.channel.set('push');
    this.schedule.set('now');
    this.selectedTemplate.set('');
    this.notificationTitle.set('');
    this.notificationMessage.set('');
    this.employmentType.set('');
    this.loanStatus.set('');
    this.kycStatus.set('');
    this.walletMin.set('');
    this.walletMax.set('');
    this.registrationFrom.set('');
    this.registrationTo.set('');
    this.lastLoginDate.set('');
    this.selectedCustomers.set([]);
    this.customerSearch.set('');
    this.scheduledDate.set('');
    this.scheduledTime.set('');
  }
}