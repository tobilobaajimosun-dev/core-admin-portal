import { Component, signal, computed, inject, OnInit, DestroyRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsRadioComponent } from '@pcsl-ui/ui/ps-radio/ps-radio.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TransactionStore } from '@core/store/transaction.store';
import { TransactionRaw, TransactionDateRange } from '@core/interfaces/transaction.model';

interface FilterOption {
  label: string;
  value: string;
}

type TransactionTab = 'ALL' | 'BILL' | 'LOAN';

interface TabDef {
  label: string;
  value: TransactionTab;
  icon: string;
}

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PsPaginationComponent,
    PsEmptyComponent,
    PsSvgIconComponent,
    PsRadioComponent,
    DropdownComponent,
  ],
  templateUrl: './transactions-table.component.html',
})
export class TransactionsTableComponent implements OnInit {
  readonly store = inject(TransactionStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<DropdownComponent>;

  currentPage = signal(1);
  skeletonRows = new Array(8);
  columns = ['Date & Time', 'Customer Details', 'Reference ID', 'Transaction Type', 'Category', 'Status', 'Amount', ''];

  searchQuery = signal<string>('');

  // ── Tabs ─────────────────────────────────────────────────────────────────
  readonly tabs: TabDef[] = [
    { label: 'All', value: 'ALL', icon: 'loan-icon' },
    { label: 'Bills', value: 'BILL', icon: 'loan-icon' },
    { label: 'Loans', value: 'LOAN', icon: 'loan-icon' },
  ];

  activeTab = signal<TransactionTab>('ALL');

  // ── Filter definitions ──────────────────────────────────────────────────
  readonly filterDefs: {
    type: 'transactionType' | 'category' | 'status' | 'date';
    label: string;
    options: FilterOption[];
    supportsCustomRange?: boolean;
  }[] = [
      {
        type: 'transactionType',
        label: 'Transaction Type',
        options: [
          { label: 'Credit', value: 'CREDIT' },
          { label: 'Debit', value: 'DEBIT' },
          { label: 'Refund', value: 'REFUND' },
          { label: 'Loan Request', value: 'LOAN_REQUEST' },
          { label: 'Transfer', value: 'TRANSFER' },
        ],
      },
      {
        type: 'category',
        label: 'Category',
        options: [
          { label: 'Airtime', value: 'AIRTIME' },
          { label: 'Data Subscription', value: 'DATA' },
          { label: 'Electricity', value: 'ELECTRICITY' },
          { label: 'TV Subscription', value: 'CABLE' },
        ],
      },
      {
        type: 'status',
        label: 'Status',
        options: [
          { label: 'Successful', value: 'SUCCESS' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Failed', value: 'FAILED' },
          { label: 'Reversed', value: 'REVERSED' },
        ],
      },
      {
        type: 'date',
        label: 'Date Range',
        supportsCustomRange: true,
        options: [
          { label: 'Today', value: 'today' },
          { label: 'Yesterday', value: 'yesterday' },
          { label: 'Last 7 Days', value: 'last_7_days' },
          { label: 'Last 30 Days', value: 'last_30_days' },
          { label: 'Custom range', value: 'custom_range' },
        ],
      },
    ];

  // ── Per-filter state ────────────────────────────────────────────────────
  // appliedValues is a signal now (not a plain array) so hasActiveFilters /
  // activeFilterChips recompute correctly whenever a filter is applied or cleared.
  appliedValues = signal<string[]>(this.filterDefs.map(() => ''));
  selectedValues: string[] = this.filterDefs.map(() => '');
  showCustomRange: boolean[] = this.filterDefs.map(() => false);

  // Custom date range values, kept separately since they're not a simple option value.
  private appliedCustomRange: { start_date?: string; end_date?: string } = {};

  customRangeForms = this.filterDefs.map(() =>
    this.fb.group({ start_date: [''], end_date: [''] })
  );

  // ── Computed ────────────────────────────────────────────────────────────
  transactions = computed(() => this.store.transactions());

  hasActiveFilters = computed(() =>
    !!this.searchQuery() || this.appliedValues().some(v => !!v)
  );

  activeFilterChips = computed(() =>
    this.filterDefs
      .map((def, index) => ({ index, def, value: this.appliedValues()[index] }))
      .filter(({ value }) => !!value)
      .map(({ index, def, value }) => {
        const opt = def.options.find(o => o.value === value);
        return { index, label: opt ? `${def.label}: ${opt.label}` : def.label };
      })
  );

  // ── Tab handling ─────────────────────────────────────────────────────────
  onTabChange(value: TransactionTab): void {
    if (this.activeTab() === value) return;
    this.activeTab.set(value);

    // Reset filters/search — switching context between All/Bills/Loans
    // means stale filters from the previous tab wouldn't make sense to keep.
    this.appliedValues.set(this.filterDefs.map(() => ''));
    this.selectedValues = this.filterDefs.map(() => '');
    this.showCustomRange = this.filterDefs.map(() => false);
    this.customRangeForms.forEach(f => f.reset());
    this.appliedCustomRange = {};
    this.searchQuery.set('');
    this.currentPage.set(1);

    this.store.setActiveTag(value === 'ALL' ? undefined : value);
    this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit() });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  isFilterActive(i: number): boolean { return !!this.appliedValues()[i]; }

  filterDisplayLabel(i: number): string {
    const applied = this.appliedValues()[i];
    if (!applied) return this.filterDefs[i].label;
    const opt = this.filterDefs[i].options.find(o => o.value === applied);
    return opt ? `${this.filterDefs[i].label}: ${opt.label}` : this.filterDefs[i].label;
  }

  onRadioChange(i: number, value: string): void {
    this.selectedValues[i] = value;
    this.showCustomRange[i] = value === 'custom_range';
    if (value !== 'custom_range') this.customRangeForms[i].reset();
  }

  closeOtherDropdowns(currentIndex: number): void {
    this.filterDropdowns.forEach((dropdown: DropdownComponent, i: number) => {
      if (i !== currentIndex) dropdown.close();
    });
  }

  applyFilter(i: number, dropdown: DropdownComponent): void {
    dropdown.close();
    const value = this.selectedValues[i];
    const def = this.filterDefs[i];

    // Only this filter's value changes — every other already-applied filter stays active.
    const updated = [...this.appliedValues()];
    updated[i] = value;
    this.appliedValues.set(updated);

    if (def.type === 'date') {
      if (value === 'custom_range') {
        const { start_date, end_date } = this.customRangeForms[i].getRawValue();
        this.appliedCustomRange = { start_date: start_date || undefined, end_date: end_date || undefined };
      } else {
        this.appliedCustomRange = {};
      }
    }

    this.searchQuery.set('');
    this.currentPage.set(1);
    this.fetchWithAppliedFilters();
  }

  exportTransactions(): void {
    this.store.exportTransactions();
  }

  clearFilter(i: number): void {
    const updated = [...this.appliedValues()];
    updated[i] = '';
    this.appliedValues.set(updated);

    this.selectedValues[i] = '';
    this.showCustomRange[i] = false;
    this.customRangeForms[i].reset();
    if (this.filterDefs[i].type === 'date') {
      this.appliedCustomRange = {};
    }

    this.currentPage.set(1);
    this.fetchWithAppliedFilters();
  }

  clearFilters(): void {
    this.appliedValues.set(this.filterDefs.map(() => ''));
    this.selectedValues = this.filterDefs.map(() => '');
    this.showCustomRange = this.filterDefs.map(() => false);
    this.customRangeForms.forEach(f => f.reset());
    this.appliedCustomRange = {};
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.store.fetchTransactions({ page: 1, limit: 10 });
  }

  // Builds one combined fetch call out of every currently-applied filter.
  private fetchWithAppliedFilters(): void {
    const params: Record<string, unknown> = {
      page: this.currentPage(),
      limit: this.store.currentLimit(),
    };

    this.filterDefs.forEach((def, idx) => {
      const value = this.appliedValues()[idx];
      if (!value) return;

      switch (def.type) {
        case 'transactionType':
          params['type'] = value;
          break;
        case 'category':
          params['category'] = value;
          break;
        case 'status':
          params['status'] = value;
          break;
        case 'date':
          if (value === 'custom_range') {
            params['custom_range'] = 'custom';
            params['start_date'] = this.appliedCustomRange.start_date;
            params['end_date'] = this.appliedCustomRange.end_date;
          } else {
            // See note below on this param name.
            params['date_range'] = value;
          }
          break;
      }
    });

    this.store.fetchTransactions(params as any);
  }

  // ── Search ───────────────────────────────────────────────────────────────
  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1), debounceTime(400), distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchTransactions({ page: 1, limit: 10 });
    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => this.store.setSearch(query));
  }

  onSearchChange(query: string): void { this.searchQuery.set(query); }
  clearSearch(): void { this.searchQuery.set(''); }

  // ── Pagination ───────────────────────────────────────────────────────────
  onPageChange(page: number): void { this.currentPage.set(page); this.store.setPage(page); }
  onPageSizeChange(size: number): void { this.currentPage.set(1); this.store.setPageSize(size); }

  // ── Display helpers ──────────────────────────────────────────────────────
  getInitials(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) return '-';
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'text-[#006244]';
      case 'PENDING': return 'text-[#9E3900]';
      case 'FAILED': return 'text-[#A8000F]';
      case 'REVERSED': return 'text-[#1041B7]';
      case 'REFUNDED': return 'text-[#1041B7]';
      default: return 'text-[#51575B]';
    }
  }

  getStatusBg(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'bg-[#C6FCE4]';
      case 'PENDING': return 'bg-[#FFF4BE]';
      case 'FAILED': return 'bg-[#FFE1E2]';
      case 'REVERSED': return 'bg-[#FFF4BE]';
      case 'REFUNDED': return 'bg-[#FFF4BE]';
      default: return 'bg-[#F3F4F6]';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  formatAmount(amount: number): string {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }

  viewTransaction(transaction: TransactionRaw): void {
    this.router.navigate(['/transactions', transaction.id], {
      state: { customer: transaction.customer },
    });
  }
}