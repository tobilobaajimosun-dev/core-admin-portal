import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, forkJoin, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fetchAllPages } from '@pages/asset-flex/shared/utils/fetch-all-pages';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon, Tag01Icon, Calendar01Icon, Coins01Icon, TimeQuarterPassIcon } from '@hugeicons-pro/core-stroke-rounded';

import { LoanService } from '../shared/services/loan.service';
import { Loan, LoanStatus, LOAN_STATUSES } from '../shared/models/loan.model';
import { PaginationMeta } from '@pages/asset-flex/shared/models/generic.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { FiltersComponent, FilterSection } from '@pages/asset-flex/shared/components/filters/filters.component';
import { ActiveFilterChipsComponent } from '@pages/asset-flex/shared/components/active-filter-chips/active-filter-chips.component';
import { NairaPipe } from '../shared/pipes/naira.pipe';
import { statusTone } from '../shared/utils/status-tone';
import { formatLabel } from '../shared/utils/format';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';
import { exportToCsv } from '@pages/asset-flex/shared/utils/csv-export';

@Component({
  selector: 'app-loans',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    HugeiconsIconComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    FiltersComponent,
    ActiveFilterChipsComponent,
    NairaPipe,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoansComponent {
  private readonly loanService = inject(LoanService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly searchIcon = Search01Icon;
  protected readonly statusTone = statusTone;
  protected readonly label = formatLabel;
  protected readonly filters = LOAN_STATUSES.map((s) => ({ label: formatLabel(s), value: s }));

  protected readonly loans = signal<Loan[]>([]);
  protected readonly pagination = signal<PaginationMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly activeStatuses = signal<LoanStatus[]>([]);
  protected readonly page = signal(1);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly fromDateControl = new FormControl('', { nonNullable: true });
  protected readonly toDateControl = new FormControl('', { nonNullable: true });
  protected readonly tenorMin = signal('');
  protected readonly tenorMax = signal('');
  protected readonly principalMin = signal('');
  protected readonly principalMax = signal('');
  private readonly limit = 20;
  private loadGeneration = 0;

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.activeStatuses.set((qp.get('status')?.split(',').filter(Boolean) as LoanStatus[]) ?? []);
    this.page.set(Number(qp.get('page')) || 1);
    this.searchControl.setValue(qp.get('search') ?? '', { emitEvent: false });
    this.fromDateControl.setValue(qp.get('from_date') ?? '', { emitEvent: false });
    this.toDateControl.setValue(qp.get('to_date') ?? '', { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.syncUrl();
        this.load();
      });

    this.fromDateControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.syncUrl();
        this.load();
      });

    this.toDateControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.syncUrl();
        this.load();
      });
    this.load();
  }

  // Plain method, not computed(): FormControl.value isn't a signal, so a computed()
  // reading it would never re-evaluate after the first read. OnPush + the signal
  // writes already triggered elsewhere (e.g. page.set) keep this fresh on every
  // change-detection pass.
  protected filterSections(): FilterSection[] {
    return [
      { key: 'status', label: 'Status', icon: Tag01Icon, kind: 'checklist', options: this.filters, active: this.activeStatuses() },
      { key: 'date', label: 'Date', icon: Calendar01Icon, kind: 'date-range', from: this.fromDateControl.value, to: this.toDateControl.value },
      { key: 'tenor', label: 'Tenor', icon: TimeQuarterPassIcon, kind: 'number-range', min: this.tenorMin(), max: this.tenorMax(), unit: 'months' },
      { key: 'principal', label: 'Principal', icon: Coins01Icon, kind: 'number-range', min: this.principalMin(), max: this.principalMax(), unit: '₦' },
    ];
  }

  /** Tenor/principal have no server-side filter param — filtering them means the
   * fetch-all path below runs even for 0/1 selected statuses, not just 2+. */
  private hasClientOnlyFilter(): boolean {
    return !!(this.tenorMin() || this.tenorMax() || this.principalMin() || this.principalMax());
  }

  protected onChecklistChange(event: { key: string; values: string[] }): void {
    if (event.key === 'status') this.setStatuses(event.values);
  }

  protected onDateRangeChange(event: { key: string; from: string; to: string }): void {
    if (event.key !== 'date') return;
    // FormControl.valueChanges subscriptions (constructor) already page.set(1)/syncUrl()/load() on change.
    this.fromDateControl.setValue(event.from);
    this.toDateControl.setValue(event.to);
  }

  protected onNumberRangeChange(event: { key: string; min: string; max: string }): void {
    if (event.key === 'tenor') {
      this.tenorMin.set(event.min);
      this.tenorMax.set(event.max);
    } else if (event.key === 'principal') {
      this.principalMin.set(event.min);
      this.principalMax.set(event.max);
    } else {
      return;
    }
    this.page.set(1);
    this.load();
  }

  protected clearAllFilters(): void {
    this.tenorMin.set('');
    this.tenorMax.set('');
    this.principalMin.set('');
    this.principalMax.set('');
    this.fromDateControl.setValue('');
    this.toDateControl.setValue('');
    this.setStatuses([]);
  }

  protected setStatuses(statuses: string[]): void {
    this.activeStatuses.set(statuses as LoanStatus[]);
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

  protected open(loan: Loan): void {
    this.router.navigate(['/asset-flex/loans', loan.id]);
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.activeStatuses().length > 0 ? this.activeStatuses().join(',') : null,
        search: this.searchControl.value || null,
        page: this.page() > 1 ? this.page() : null,
        from_date: this.fromDateControl.value || null,
        to_date: this.toDateControl.value || null,
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
      `loans-${this.activeStatuses().join('_') || 'all'}.csv`,
      this.loans().map((l) => ({
        id: l.id,
        reference: l.loanReference,
        vendor: l.vendor?.businessName || l.vendorId,
        principal_amount: l.principalAmount,
        total_repayable: l.totalRepayable,
        tenor_months: l.tenorMonths,
        status: l.status,
        disbursed_at: l.disbursedAt ?? '',
        created_at: l.createdAt,
      })),
    );
  }

  private matchesClientOnlyFilters(l: Loan): boolean {
    const tenorMin = Number(this.tenorMin());
    const tenorMax = Number(this.tenorMax());
    const principalMin = Number(this.principalMin());
    const principalMax = Number(this.principalMax());
    const principalAmount = Number(l.principalAmount);
    if (this.tenorMin() && l.tenorMonths < tenorMin) return false;
    if (this.tenorMax() && l.tenorMonths > tenorMax) return false;
    if (this.principalMin() && principalAmount < principalMin) return false;
    if (this.principalMax() && principalAmount > principalMax) return false;
    return true;
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    const generation = ++this.loadGeneration;
    const statuses = this.activeStatuses();
    const clientOnly = this.hasClientOnlyFilter();
    const commonParams = {
      search: this.searchControl.value || undefined,
      from_date: this.fromDateControl.value || undefined,
      to_date: this.toDateControl.value || undefined,
    };

    // The API only accepts one status per request and has no tenor/principal
    // filter at all. 0 or 1 status with no tenor/principal filter stays on normal
    // server-side pagination; anything else fetches every matching page (per
    // selected status, or unfiltered if none), merges, applies the client-only
    // predicates, then paginates locally.
    if (statuses.length <= 1 && !clientOnly) {
      this.loanService
        .list({ ...commonParams, page: this.page(), limit: this.limit, status: statuses[0] })
        .subscribe({
          next: (res) => {
            if (generation !== this.loadGeneration) return;
            this.loans.set(res.data?.data ?? []);
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

    const statusesToFetch: (LoanStatus | undefined)[] = statuses.length > 0 ? statuses : [undefined];
    forkJoin(
      statusesToFetch.map((status) =>
        fetchAllPages((page) =>
          this.loanService.list({ ...commonParams, status, page, limit: 100 }),
        ),
      ),
    )
      .pipe(
        map((groups) => {
          const seen = new Set<string>();
          return groups
            .flat()
            .filter((l) => (seen.has(l.id) ? false : (seen.add(l.id), true)))
            .filter((l) => this.matchesClientOnlyFilters(l));
        }),
      )
      .subscribe({
        next: (all) => {
          if (generation !== this.loadGeneration) return;
          const start = (this.page() - 1) * this.limit;
          this.loans.set(all.slice(start, start + this.limit));
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
