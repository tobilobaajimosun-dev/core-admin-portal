import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { VendorService } from '../shared/services/vendor.service';
import { Vendor } from '../shared/models/vendor.model';
import { SentNotification, NotificationChannel } from '../shared/models/notification.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { fetchAllPages } from '@pages/asset-flex/shared/utils/fetch-all-pages';

const DEMO_SENT: SentNotification[] = [
  {
    id: 'ntf_sent_seed1',
    subject: 'Settlement schedule update',
    body: 'From next week, T+1 settlements will run at 2pm instead of 10am. No action needed on your end.',
    recipients: ['All businesses'],
    recipientCount: 3,
    channels: ['dashboard', 'email'],
    ctaLabel: 'View settlements',
    ctaUrl: '/asset-flex/settlements',
    sentAt: '2026-08-17T10:20:00.000Z',
    sentBy: 'Wisdom Okafor',
  },
  {
    id: 'ntf_sent_seed2',
    subject: 'Action needed: re-upload CAC document',
    body: 'Your CAC certificate on file is expiring. Please re-upload a valid copy to keep payouts active.',
    recipients: ['Northgate Retail Ltd'],
    recipientCount: 1,
    channels: ['email'],
    ctaLabel: null,
    ctaUrl: null,
    sentAt: '2026-08-15T14:05:00.000Z',
    sentBy: 'Blessing Ade',
  },
];

@Component({
  selector: 'app-notifications',
  imports: [ReactiveFormsModule, DatePipe, PageHeaderComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly vendorService = inject(VendorService);
  private readonly toast = inject(PsToastService);

  protected readonly vendors = signal<Vendor[]>([]);
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly allBusinesses = signal(false);
  protected readonly dashboardChannel = signal(true);
  protected readonly emailChannel = signal(false);

  protected readonly sentLog = signal<SentNotification[]>(DEMO_SENT);

  protected readonly form = new FormGroup({
    subject: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ctaLabel: new FormControl('', { nonNullable: true }),
    ctaUrl: new FormControl('', { nonNullable: true }),
  });

  protected readonly recipientCount = computed(() =>
    this.allBusinesses() ? this.vendors().length : this.selectedIds().size,
  );

  constructor() {
    fetchAllPages((page) => this.vendorService.list({ page, limit: 100 })).subscribe({
      next: (vendors) => this.vendors.set(vendors),
      error: () => this.vendors.set([]),
    });
  }

  /** Plain method — search.value isn't a signal but typing triggers change detection. */
  protected filteredVendors(): Vendor[] {
    const q = this.search.value.trim().toLowerCase();
    const list = this.vendors();
    return q ? list.filter((v) => v.businessName.toLowerCase().includes(q)) : list;
  }

  protected isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  protected toggleVendor(id: string, checked: boolean): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected toggleAll(checked: boolean): void {
    this.allBusinesses.set(checked);
    if (checked) this.selectedIds.set(new Set());
  }

  protected send(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const channels: NotificationChannel[] = [];
    if (this.dashboardChannel()) channels.push('dashboard');
    if (this.emailChannel()) channels.push('email');
    if (!channels.length) {
      this.toast.error('Pick at least one delivery channel.');
      return;
    }
    const recipients = this.allBusinesses()
      ? ['All businesses']
      : this.vendors().filter((v) => this.selectedIds().has(v.id)).map((v) => v.businessName);
    if (!recipients.length) {
      this.toast.error('Pick at least one business.');
      return;
    }
    const v = this.form.getRawValue();
    const count = this.recipientCount();
    // Demo: no notifications endpoint yet, so record the send locally.
    const rec: SentNotification = {
      id: `ntf_sent_${this.sentLog().length + 1}`,
      subject: v.subject,
      body: v.body,
      recipients,
      recipientCount: count,
      channels,
      ctaLabel: v.ctaLabel || null,
      ctaUrl: v.ctaUrl || null,
      sentAt: new Date().toISOString(),
      sentBy: 'Wisdom Okafor',
    };
    this.sentLog.update((list) => [rec, ...list]);
    this.toast.success(`Notification sent to ${count} business${count === 1 ? '' : 'es'}.`);
    this.form.reset({ subject: '', body: '', ctaLabel: '', ctaUrl: '' });
    this.selectedIds.set(new Set());
    this.allBusinesses.set(false);
  }
}
