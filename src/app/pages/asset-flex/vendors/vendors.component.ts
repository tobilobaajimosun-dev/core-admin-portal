import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { VendorService } from '../shared/services/vendor.service';
import { Vendor, VendorStatus } from '../shared/models/vendor.model';
import { PaginationMeta } from '@pages/asset-flex/shared/models/generic.model';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { statusTone } from '../shared/utils/status-tone';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusFilterComponent } from '@pages/asset-flex/shared/components/status-filter/status-filter.component';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';
import { exportToCsv } from '@pages/asset-flex/shared/utils/csv-export';

const STATUS_FILTERS: { label: string; value: '' | VendorStatus }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING_APPROVAL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Blacklisted', value: 'BLACKLISTED' },
  { label: 'Rejected', value: 'REJECTED' },
];

@Component({
  selector: 'app-vendors',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    HugeiconsIconComponent,
    StatusBadgeComponent,
    PageHeaderComponent,
    StatusFilterComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorsComponent {
  private readonly vendorService = inject(VendorService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly searchIcon = Search01Icon;
  protected readonly filters = STATUS_FILTERS;

  protected readonly vendors = signal<Vendor[]>([]);
  protected readonly pagination = signal<PaginationMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly activeStatus = signal<'' | VendorStatus>('');
  protected readonly page = signal(1);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statusTone = statusTone;

  private readonly limit = 20;
  private loadGeneration = 0;

  constructor() {
    // Seed state from the URL so filters/search/page survive back-navigation.
    const qp = this.route.snapshot.queryParamMap;
    this.activeStatus.set((qp.get('status') as VendorStatus) || '');
    this.page.set(Number(qp.get('page')) || 1);
    this.searchControl.setValue(qp.get('search') ?? '', { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.syncUrl();
        this.load();
      });

    this.load();
  }

  protected setStatus(status: '' | VendorStatus): void {
    if (this.activeStatus() === status) return;
    this.activeStatus.set(status);
    this.page.set(1);
    this.syncUrl();
    this.load();
  }

  protected goToPage(page: number): void {
    const total = this.pagination()?.totalPages ?? 1;
    if (page < 1 || page > total || page === this.page()) return;
    this.page.set(page);
    this.syncUrl();
    this.load();
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.activeStatus() || null,
        search: this.searchControl.value || null,
        page: this.page() > 1 ? this.page() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected retry(): void {
    this.load();
  }

  protected exportCsv(): void {
    exportToCsv(
      `vendors-${this.activeStatus() || 'all'}.csv`,
      this.vendors().map((v) => ({
        id: v.id,
        business_name: v.businessName,
        contact_email: v.contactEmail,
        contact_phone: v.contactPhone,
        status: v.status,
        settlement_account_name: v.settlementAccountName,
        settlement_account_number: v.settlementAccountNumber,
        platform_fee_percentage: v.platformFeePercentage,
        created_at: v.createdAt,
      })),
    );
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    const generation = ++this.loadGeneration;
    this.vendorService
      .list({
        page: this.page(),
        limit: this.limit,
        search: this.searchControl.value || undefined,
        status: this.activeStatus() || undefined,
      })
      .subscribe({
        next: (res) => {
          if (generation !== this.loadGeneration) return;
          this.vendors.set(res.data?.data ?? []);
          this.pagination.set(res.data?.pagination ?? null);
          this.loading.set(false);
        },
        error: () => {
          if (generation !== this.loadGeneration) return;
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
