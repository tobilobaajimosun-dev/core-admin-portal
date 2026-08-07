import { HttpContext } from '@angular/common/http';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VendorService } from '../shared/services/vendor.service';
import { SKIP_LOADER } from '@core/interceptors/token';
import { HugeiconsIconComponent, IconSvgObject } from '@hugeicons/angular';
import {
  Store01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  UserBlock01Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';

interface StatCard {
  key: string;
  label: string;
  value: string;
  hint: string;
  icon: IconSvgObject;
  accent: string;
  /** When set, the card links here (e.g. the pending-KYB queue). */
  route?: string;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-dashboard',
  imports: [HugeiconsIconComponent, RouterLink, NgTemplateOutlet, ErrorStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly vendorService = inject(VendorService);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly stats = signal<StatCard[]>([
    { key: 'total', label: 'Total vendors', value: '—', hint: 'All registered', icon: Store01Icon, accent: '#00b3ff' },
    {
      key: 'pending',
      label: 'Pending KYB',
      value: '—',
      hint: 'Awaiting review',
      icon: Clock01Icon,
      accent: '#b45309',
      route: '/asset-flex/vendors',
      queryParams: { status: 'PENDING_APPROVAL' },
    },
    { key: 'approved', label: 'Approved', value: '—', hint: 'Active vendors', icon: CheckmarkCircle02Icon, accent: '#16a34a' },
    { key: 'blacklisted', label: 'Blacklisted', value: '—', hint: 'Suspended access', icon: UserBlock01Icon, accent: '#dc2626' },
  ]);

  constructor() {
    this.loadSummary();
  }

  protected retry(): void {
    this.loadSummary();
  }

  private loadSummary(): void {
    // Background fetch — suppress the global loader; the cards show their own skeleton state.
    const silent = new HttpContext().set(SKIP_LOADER, true);
    this.loading.set(true);
    this.error.set(false);
    forkJoin({
      total: this.vendorService.list({ page: 1, limit: 1 }, silent),
      pending: this.vendorService.list({ page: 1, limit: 1, status: 'PENDING_APPROVAL' }, silent),
      approved: this.vendorService.list({ page: 1, limit: 1, status: 'APPROVED' }, silent),
      blacklisted: this.vendorService.list({ page: 1, limit: 1, status: 'BLACKLISTED' }, silent),
    }).subscribe({
      next: (res) => {
        const counts: Record<string, number> = {
          total: res.total.data?.pagination?.total ?? 0,
          pending: res.pending.data?.pagination?.total ?? 0,
          approved: res.approved.data?.pagination?.total ?? 0,
          blacklisted: res.blacklisted.data?.pagination?.total ?? 0,
        };
        this.stats.update((cards) => cards.map((c) => ({ ...c, value: String(counts[c.key] ?? 0) })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
