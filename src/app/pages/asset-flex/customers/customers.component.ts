import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, forkJoin, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fetchAllPages } from '@pages/asset-flex/shared/utils/fetch-all-pages';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon, Tag01Icon, Calendar01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { CustomerService } from '../shared/services/customer.service';
import { Customer } from '../shared/models/customer.model';
import { PaginationMeta } from '@pages/asset-flex/shared/models/generic.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { FiltersComponent, FilterSection } from '@pages/asset-flex/shared/components/filters/filters.component';
import { ActiveFilterChipsComponent } from '@pages/asset-flex/shared/components/active-filter-chips/active-filter-chips.component';
import { statusTone } from '../shared/utils/status-tone';
import { formatLabel } from '../shared/utils/format';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';
import { exportToCsv } from '@pages/asset-flex/shared/utils/csv-export';

@Component({
  selector: 'app-customers',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    HugeiconsIconComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    FiltersComponent,
    ActiveFilterChipsComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent {
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly searchIcon = Search01Icon;
  protected readonly statusTone = statusTone;

  protected readonly customers = signal<Customer[]>([]);
  protected readonly pagination = signal<PaginationMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly page = signal(1);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly activeStatuses = signal<string[]>([]);
  protected readonly joinedFrom = signal('');
  protected readonly joinedTo = signal('');
  /** No documented status enum for customers — options are discovered from real
   * data as it loads, rather than guessed (a wrong guess would silently return
   * zero results). Grows as more distinct statuses are observed. */
  private readonly knownStatuses = signal<string[]>([]);
  private readonly limit = 20;
  private loadGeneration = 0;

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.activeStatuses.set(qp.get('status')?.split(',').filter(Boolean) ?? []);
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
      {
        key: 'status',
        label: 'Status',
        icon: Tag01Icon,
        kind: 'checklist',
        options: this.knownStatuses().map((s) => ({ label: formatLabel(s), value: s })),
        active: this.activeStatuses(),
      },
      { key: 'joined', label: 'Date joined', icon: Calendar01Icon, kind: 'date-range', from: this.joinedFrom(), to: this.joinedTo() },
    ];
  }

  private hasClientOnlyFilter(): boolean {
    return !!(this.joinedFrom() || this.joinedTo());
  }

  private matchesClientOnlyFilters(c: Customer): boolean {
    const from = this.joinedFrom();
    const to = this.joinedTo();
    if (!from && !to) return true;
    const joined = c.createdAt.slice(0, 10);
    if (from && joined < from) return false;
    if (to && joined > to) return false;
    return true;
  }

  private rememberStatuses(rows: Customer[]): void {
    const seen = new Set(this.knownStatuses());
    let changed = false;
    for (const c of rows) {
      if (c.status && !seen.has(c.status)) {
        seen.add(c.status);
        changed = true;
      }
    }
    if (changed) this.knownStatuses.set([...seen].sort());
  }

  protected onChecklistChange(event: { key: string; values: string[] }): void {
    if (event.key !== 'status') return;
    this.activeStatuses.set(event.values);
    this.page.set(1);
    this.syncUrl();
    this.load();
  }

  protected onDateRangeChange(event: { key: string; from: string; to: string }): void {
    if (event.key !== 'joined') return;
    this.joinedFrom.set(event.from);
    this.joinedTo.set(event.to);
    this.page.set(1);
    this.load();
  }

  protected clearAllFilters(): void {
    this.activeStatuses.set([]);
    this.joinedFrom.set('');
    this.joinedTo.set('');
    this.page.set(1);
    this.syncUrl();
    this.load();
  }

  protected fullName(c: Customer): string {
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email || c.phoneNumber;
  }

  protected initials(c: Customer): string {
    return `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase() || c.email?.[0]?.toUpperCase() || '?';
  }

  protected goToPage(page: number): void {
    const total = this.pagination()?.totalPages ?? 1;
    if (page < 1 || page > total || page === this.page()) return;
    this.page.set(page);
    this.syncUrl();
    this.load();
  }

  protected open(c: Customer): void {
    this.router.navigate(['/asset-flex/customers', c.id]);
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

  /** Deliberately excludes BVN/NIN — those stay masked everywhere else in this UI. */
  protected exportCsv(): void {
    exportToCsv(
      'customers.csv',
      this.customers().map((c) => ({
        id: c.id,
        name: this.fullName(c),
        phone_number: c.phoneNumber,
        email: c.email,
        status: c.status,
        triad_verified: c.isTriadVerified,
        created_at: c.createdAt,
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
      this.customerService
        .list({ page: this.page(), limit: this.limit, search, status: statuses[0] })
        .subscribe({
          next: (res) => {
            if (generation !== this.loadGeneration) return;
            const rows = res.data?.data ?? [];
            this.customers.set(rows);
            this.pagination.set(res.data?.pagination ?? null);
            this.rememberStatuses(rows);
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

    const statusesToFetch: (string | undefined)[] = statuses.length > 0 ? statuses : [undefined];
    forkJoin(
      statusesToFetch.map((status) =>
        fetchAllPages((page) => this.customerService.list({ search, status, page, limit: 100 })),
      ),
    )
      .pipe(
        map((groups) => {
          const seen = new Set<string>();
          return groups
            .flat()
            .filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)))
            .filter((c) => this.matchesClientOnlyFilters(c));
        }),
      )
      .subscribe({
        next: (all) => {
          if (generation !== this.loadGeneration) return;
          const start = (this.page() - 1) * this.limit;
          const page = all.slice(start, start + this.limit);
          this.customers.set(page);
          this.pagination.set({
            page: this.page(),
            limit: this.limit,
            total: all.length,
            totalPages: Math.max(1, Math.ceil(all.length / this.limit)),
          });
          this.rememberStatuses(all);
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
