import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsSelectModule } from '@pcsl-ui/ui/ps-select/ps-select.module';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { NotificationStore } from '@core/store/notification.store';
import { NotificationSendPayload } from '@core/interfaces/notification.model';
import { CustomerStore } from '@core/store/customer.store';
import { CustomerRaw } from '@core/interfaces/customer.model';

export type RecipientTab = 'all' | 'segment' | 'specific';
export type ChannelType = 'email' | 'in-app';
export type ScheduleType = 'now' | 'later';

export interface SelectedCustomer {
  id: string;
  name: string;
}

// TODO: confirm this mapping against the API — assuming the 'in-app' form
// channel corresponds to 'push' templates.
const CHANNEL_TO_TEMPLATE_CHANNEL: Record<ChannelType, string> = {
  'email': 'email',
  'in-app': 'push',
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
  private readonly customerStore = inject(CustomerStore);

  readonly isSending = this.store.isSendingNotification;

  private readonly messageTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('messageTextarea');

  recipientTab = signal<RecipientTab>('all');
  channel = signal<ChannelType>('in-app');
  schedule = signal<ScheduleType>('now');

  // Message builder — selectedTemplateId keys on template.id (slugs repeat
  // across channels), the actual object is derived from the store.
  selectedTemplateId = signal('');
  notificationTitle = signal('');
  notificationMessage = signal('');

  readonly templateOptions = this.store.templateOptions;
  readonly isLoadingTemplateOptions = this.store.isLoadingTemplateOptions;

  readonly selectedTemplateObj = computed(() =>
    this.templateOptions().find(t => t.id === this.selectedTemplateId()) ?? null
  );

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
  customerSearch = signal('');
  selectedCustomers = signal<SelectedCustomer[]>([]);
  readonly isSearchingCustomers = this.customerStore.isSearchingCustomers;
  readonly customerSearchResults = computed<CustomerRaw[]>(() => {
    const selectedIds = new Set(this.selectedCustomers().map(c => c.id));
    return this.customerStore.customerSearchResults().filter(c => !selectedIds.has(c.id));
  });

  // Schedule later
  scheduledDate = signal('');
  scheduledTime = signal('');

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

  readonly isEmailChannel = computed(() => this.channel() === 'email');
  readonly messageMaxLength = computed<number | null>(() => (this.isEmailChannel() ? null : 500));

  readonly recipientTabs: { value: RecipientTab; label: string; icon: string }[] = [
    { value: 'all',      label: 'All Customers',      icon: 'customers-icon'      },
    { value: 'segment',  label: 'Customer Segment',   icon: 'add-user-icon'       },
    { value: 'specific', label: 'Specific Customers', icon: 'specific-user-icon'  },
  ];

  readonly channelOptions: { value: ChannelType; label: string; sub: string }[] = [
    { value: 'email',  label: 'Email',  sub: 'Sent to customer inbox'   },
    { value: 'in-app', label: 'In-App', sub: 'Appears inside the app'   },
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

  constructor() {
    toObservable(this.customerSearch)
      .pipe(skip(1), debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => this.customerStore.searchCustomers(query.trim()));

    // Reload template options whenever the delivery channel changes, and
    // clear any selection that no longer applies to the new channel.
    effect(() => {
      const templateChannel = CHANNEL_TO_TEMPLATE_CHANNEL[this.channel()];
      this.store.fetchTemplateOptions({ channel: templateChannel });
      this.selectedTemplateId.set('');
      this.notificationTitle.set('');
      this.notificationMessage.set('');
    });
  }

  onTemplateChange(id: string): void {
    this.selectedTemplateId.set(id);
    const template = this.templateOptions().find(t => t.id === id);
    if (template) {
      this.notificationTitle.set(template.subject ?? '');
      this.notificationMessage.set(template.body);
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

  applyBold(): void { this.wrapSelection('<strong>', '</strong>'); }
  applyItalic(): void { this.wrapSelection('<em>', '</em>'); }

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

  private restoreSelection(el: HTMLTextAreaElement, start: number, end: number): void {
    setTimeout(() => { el.focus(); el.setSelectionRange(start, end); });
  }

  private readonly BLOCK_TAG_PATTERN = /^<(h[1-6]|p|div|ul|ol|li|blockquote|table|html|body)[\s>]/i;

  private toHtmlMessage(message: string): string {
    return message
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map(line => (this.BLOCK_TAG_PATTERN.test(line) ? line : `<p>${line}</p>`))
      .join('\n');
  }

  selectCustomer(customer: CustomerRaw): void {
    const name = `${customer.firstName} ${customer.lastName}`.trim();
    this.selectedCustomers.update(list => [...list, { id: customer.id, name }]);
    this.customerSearch.set('');
    this.customerStore.clearCustomerSearch();
  }

  removeCustomer(id: string): void {
    this.selectedCustomers.update(list => list.filter(c => c.id !== id));
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

    const template = this.selectedTemplateObj();
    if (template) {
      payload.templateSlug = template.slug;
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
      payload.customer_ids = this.selectedCustomers().map(c => c.id);
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
    this.channel.set('in-app');
    this.schedule.set('now');
    this.selectedTemplateId.set('');
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
    this.customerStore.clearCustomerSearch();
    this.scheduledDate.set('');
    this.scheduledTime.set('');
  }
}