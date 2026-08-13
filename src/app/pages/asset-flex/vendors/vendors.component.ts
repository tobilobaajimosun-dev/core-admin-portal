import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, forkJoin, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fetchAllPages } from '@pages/asset-flex/shared/utils/fetch-all-pages';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon, Tag01Icon, Calendar01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { VendorService } from '../shared/services/vendor.service';
import { Vendor, VendorStatus } from '../shared/models/vendor.model';
import { PaginationMeta } from '@pages/asset-flex/shared/models/generic.model';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { statusTone } from '../shared/utils/status-tone';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { FiltersComponent, FilterSection } from '@pages/asset-flex/shared/components/filters/filters.component';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';
import { exportToCsv } from '@pages/asset-flex/shared/utils/csv-export';

const STATUS_FILTERS: { label: string; value: VendorStatus }[] = [
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
    FiltersComponent,
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
  protected readonly activeStatuses = signal<VendorStatus[]>([]);
  protected readonly page = signal(1);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statusTone = statusTone;
  protected readonly onboardedFrom = signal('');
  protected readonly onboardedTo = signal('');

  private readonly limit = 20;
  private loadGeneration = 0;

  constructor() {
    // Seed state from the URL so filters/search/page survive back-navigation.
    const qp = this.route.snapshot.queryParamMap;
    this.activeStatuses.set((qp.get('status')?.split(',').filter(Boolean) as VendorStatus[]) ?? []);
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

  protected filterSections(): FilterSection[] {
    return [
      { key: 'status', label: 'Status', icon: Tag01Icon, kind: 'checklist', options: this.filters, active: this.activeStatuses() },
      { key: 'onboarded', label: 'Date onboarded', icon: Calendar01Icon, kind: 'date-range', from: this.onboardedFrom(), to: this.onboardedTo() },
    ];
  }

  /** No server-side date filter for vendors — filtering by it means the
   * fetch-all path below runs even for 0/1 selected statuses, not just 2+. */
  private hasClientOnlyFilter(): boolean {
    return !!(this.onboardedFrom() || this.onboardedTo());
  }

  private matchesClientOnlyFilters(v: Vendor): boolean {
    const from = this.onboardedFrom();
    const to = this.onboardedTo();
    if (!from && !to) return true;
    const created = v.createdAt.slice(0, 10);
    if (from && created < from) return false;
    if (to && created > to) return false;
    return true;
  }

  protected onChecklistChange(event: { key: string; values: string[] }): void {
    if (event.key === 'status') this.setStatuses(event.values);
  }

  protected onDateRangeChange(event: { key: string; from: string; to: string }): void {
    if (event.key !== 'onboarded') return;
    this.onboardedFrom.set(event.from);
    this.onboardedTo.set(event.to);
    this.page.set(1);
    this.load();
  }

  protected setStatuses(statuses: string[]): void {
    this.activeStatuses.set(statuses as VendorStatus[]);
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
        status: this.activeStatuses().length > 0 ? this.activeStatuses().join(',') : null,
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
      `vendors-${this.activeStatuses().join('_') || 'all'}.csv`,
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
    const statuses = this.activeStatuses();
    const search = this.searchControl.value || undefined;
    const clientOnly = this.hasClientOnlyFilter();

    if (statuses.length <= 1 && !clientOnly) {
      this.vendorService
        .list({ page: this.page(), limit: this.limit, search, status: statuses[0] })
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
      return;
    }

    const statusesToFetch: (VendorStatus | undefined)[] = statuses.length > 0 ? statuses : [undefined];
    forkJoin(
      statusesToFetch.map((status) =>
        fetchAllPages((page) => this.vendorService.list({ search, status, page, limit: 100 })),
      ),
    )
      .pipe(
        map((groups) => {
          const seen = new Set<string>();
          return groups
            .flat()
            .filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)))
            .filter((v) => this.matchesClientOnlyFilters(v));
        }),
      )
      .subscribe({
        next: (all) => {
          if (generation !== this.loadGeneration) return;
          const start = (this.page() - 1) * this.limit;
          this.vendors.set(all.slice(start, start + this.limit));
          this.pagination.set({
            page: this.page(),
            limit: this.limit,
            total: all.length,
            totalPages: Math.max(1, Math.ceil(all.length / this.limit)),
          });
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
