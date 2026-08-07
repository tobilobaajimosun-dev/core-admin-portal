import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { LoanService } from '../shared/services/loan.service';
import { Loan, LoanStatus, LOAN_STATUSES } from '../shared/models/loan.model';
import { PaginationMeta } from '@pages/asset-flex/shared/models/generic.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { NairaPipe } from '../shared/pipes/naira.pipe';
import { statusTone } from '../shared/utils/status-tone';
import { formatLabel } from '../shared/utils/format';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';
import { exportToCsv } from '@pages/asset-flex/shared/utils/csv-export';
import {
  DropdownComponent,
  DropdownHeaderDirective,
  DropdownMenuDirective,
} from '@shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-loans',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    HugeiconsIconComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    NairaPipe,
    ErrorStateComponent,
    EmptyStateComponent,
    DropdownComponent,
    DropdownHeaderDirective,
    DropdownMenuDirective,
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
  protected readonly filters: { label: string; value: '' | LoanStatus }[] = [
    { label: 'All', value: '' },
    ...LOAN_STATUSES.map((s) => ({ label: formatLabel(s), value: s })),
  ];

  protected readonly loans = signal<Loan[]>([]);
  protected readonly pagination = signal<PaginationMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly activeStatus = signal<'' | LoanStatus>('');
  protected readonly page = signal(1);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly fromDateControl = new FormControl('', { nonNullable: true });
  protected readonly toDateControl = new FormControl('', { nonNullable: true });
  private readonly limit = 20;
  private loadGeneration = 0;

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.activeStatus.set((qp.get('status') as LoanStatus) || '');
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

  protected setStatus(status: '' | LoanStatus): void {
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

  protected open(loan: Loan): void {
    this.router.navigate(['/asset-flex/loans', loan.id]);
  }

  // Plain methods, not computed(): FormControl.value isn't a signal, so a computed()
  // reading it would never re-evaluate after the first read. OnPush + the signal
  // writes already triggered by valueChanges (e.g. page.set) keep these fresh on
  // every change-detection pass.
  protected hasDateFilter(): boolean {
    return !!this.fromDateControl.value || !!this.toDateControl.value;
  }

  protected dateFilterLabel(): string {
    const from = this.fromDateControl.value;
    const to = this.toDateControl.value;
    if (!from && !to) return 'Date range';
    if (from && to) return `${from} → ${to}`;
    return from ? `From ${from}` : `Until ${to}`;
  }

  protected clearDateFilter(): void {
    this.fromDateControl.setValue('');
    this.toDateControl.setValue('');
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.activeStatus() || null,
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
      `loans-${this.activeStatus() || 'all'}.csv`,
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

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    const generation = ++this.loadGeneration;
    this.loanService
      .list({
        page: this.page(),
        limit: this.limit,
        search: this.searchControl.value || undefined,
        status: this.activeStatus() || undefined,
        from_date: this.fromDateControl.value || undefined,
        to_date: this.toDateControl.value || undefined,
      })
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
  }
}
