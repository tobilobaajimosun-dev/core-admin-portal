import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { CustomerService } from '../../shared/services/customer.service';
import { Customer } from '../../shared/models/customer.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { statusTone } from '../../shared/utils/status-tone';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';

/** Masks all but the last 4 chars of a sensitive value. */
function mask(value: string | null | undefined): string {
  if (!value) return '—';
  const s = String(value);
  return s.length <= 4 ? '••••' : '••••••' + s.slice(-4);
}

@Component({
  selector: 'app-customer-detail',
  imports: [DatePipe, RouterLink, HugeiconsIconComponent, StatusBadgeComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
    @if (loading()) {
      <div class="c-loading">Loading customer…</div>
    } @else if (loadError()) {
      <app-error-state message="Couldn't load this customer. Check your connection and try again." (retry)="retry()" />
    } @else if (!customer()) {
      <div class="c-loading">Customer not found.</div>
    } @else {
      <a class="breadcrumb" routerLink="/asset-flex/customers">
        <hugeicons-icon [icon]="backIcon" [size]="16" [strokeWidth]="1.75" color="currentColor" />
        <span>Customers</span>
      </a>

      <header class="c-head">
        <span class="c-avatar" aria-hidden="true">{{ initials() }}</span>
        <div>
          <h1 class="c-name">{{ fullName() }}</h1>
          <div class="c-meta">
            <app-status-badge [tone]="statusTone(customer()!.status)" [text]="customer()!.status" />
            <span class="c-sep">·</span>
            <span class="c-muted">{{ customer()!.email || customer()!.phoneNumber }}</span>
          </div>
        </div>
      </header>

      <section class="pa-card c-card">
        <h2 class="pa-card__title">Identity &amp; contact</h2>
        <dl class="pa-kv">
          <div class="pa-kv__row"><dt>Phone</dt><dd>{{ customer()!.phoneNumber }}</dd></div>
          <div class="pa-kv__row"><dt>Email</dt><dd>{{ customer()!.email || '—' }}</dd></div>
          <div class="pa-kv__row"><dt>BVN</dt><dd class="pa-mono">{{ maskedBvn() }}</dd></div>
          <div class="pa-kv__row"><dt>NIN</dt><dd class="pa-mono">{{ maskedNin() }}</dd></div>
          <div class="pa-kv__row"><dt>Date of birth</dt><dd>{{ customer()!.dateOfBirth || '—' }}</dd></div>
          <div class="pa-kv__row">
            <dt>Triad verified</dt>
            <dd><app-status-badge [tone]="customer()!.isTriadVerified ? 'success' : 'neutral'" [text]="customer()!.isTriadVerified ? 'VERIFIED' : 'UNVERIFIED'" /></dd>
          </div>
          <div class="pa-kv__row"><dt>Internal ID</dt><dd class="pa-mono">{{ customer()!.internalCustomerId || '—' }}</dd></div>
          <div class="pa-kv__row"><dt>Joined</dt><dd>{{ customer()!.createdAt | date: 'medium' }}</dd></div>
        </dl>
      </section>
    }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .c-loading { padding: 60px 0; text-align: center; color: #64748b; font-size: 14px; }
      .breadcrumb { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #667085; text-decoration: none; margin-bottom: 16px; }
      .breadcrumb:hover { color: #101828; }
      .c-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
      .c-avatar { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 12px; background: var(--color-primary-active-hex); color: var(--color-primary-hex); font-size: 18px; font-weight: 700; }
      .c-name { font-size: 20px; font-weight: 700; color: #101828; margin: 0 0 4px; }
      .c-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; }
      .c-sep { color: #cbd5e1; }
      .c-muted { color: #667085; }
      .c-card { max-width: 560px; }
    `,
  ],
})
export class CustomerDetailComponent {
  private readonly customerService = inject(CustomerService);

  readonly id = input<string>('');
  protected readonly backIcon = ArrowLeft01Icon;
  protected readonly statusTone = statusTone;

  protected readonly customer = signal<Customer | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly fullName = computed(() => {
    const c = this.customer();
    return c ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email : '—';
  });
  protected readonly initials = computed(() => {
    const c = this.customer();
    if (!c) return '?';
    return `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  });
  protected readonly maskedBvn = computed(() => mask(this.customer()?.bvn));
  protected readonly maskedNin = computed(() => mask(this.customer()?.nin));

  constructor() {
    effect(() => {
      this.id();
      this.load();
    });
  }

  protected retry(): void {
    this.load();
  }

  private load(): void {
    const id = this.id();
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loadError.set(false);
    this.customerService.getOne(id).subscribe({
      next: (res) => {
        this.customer.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
