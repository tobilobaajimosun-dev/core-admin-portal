import { Component, signal, computed, inject, OnInit, DestroyRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsEmptyComponent }      from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsSvgIconComponent }    from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsRadioComponent }      from '@pcsl-ui/ui/ps-radio/ps-radio.component';
import { DropdownComponent }     from '@shared/components/dropdown/dropdown.component';
import { TransactionStore }      from '@core/store/transaction.store';
import { TransactionRaw, TransactionDateRange } from '@core/interfaces/transaction.model';

interface FilterOption {
  label: string;
  value: string;
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
  readonly store              = inject(TransactionStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router     = inject(Router);
  private readonly fb         = inject(NonNullableFormBuilder);

  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<DropdownComponent>;

  currentPage  = signal(1);
  skeletonRows = new Array(8);
  columns      = ['Date & Time', 'Customer Details', 'Reference ID', 'Transaction Type', 'Category', 'Status', 'Amount', ''];

  searchQuery = signal<string>('');

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
        { label: 'Debit',  value: 'DEBIT'  },
      ],
    },
    {
      type: 'category',
      label: 'Category',
      options: [
        { label: 'Airtime',           value: 'Airtime'           },
        { label: 'Data Subscription', value: 'Data Subscription' },
        { label: 'Electricity',       value: 'Electricity'       },
        { label: 'TV Subscription',   value: 'TV Subscription'   },
        { label: 'Wallet Funding',    value: 'Wallet Funding'    },
        { label: 'Transfer',          value: 'Transfer'          },
      ],
    },
    {
      type: 'status',
      label: 'Status',
      options: [
        { label: 'Successful', value: 'SUCCESSFUL' },
        { label: 'Pending',    value: 'PENDING'    },
        { label: 'Failed',     value: 'FAILED'     },
        { label: 'Reversed',   value: 'REVERSED'   },
      ],
    },
    {
      type: 'date',
      label: 'Date Range',
      supportsCustomRange: true,
      options: [
        { label: 'Today',        value: 'today'        },
        { label: 'Yesterday',    value: 'yesterday'    },
        { label: 'Last 7 Days',  value: 'last_7_days'  },
        { label: 'Last 30 Days', value: 'last_30_days' },
        { label: 'Custom range', value: 'custom_range' },
      ],
    },
  ];

  // ── Per-filter state ────────────────────────────────────────────────────
  selectedValues:  string[]  = this.filterDefs.map(() => '');
  appliedValues:   string[]  = this.filterDefs.map(() => '');
  showCustomRange: boolean[] = this.filterDefs.map(() => false);

  customRangeForms = this.filterDefs.map(() =>
    this.fb.group({ start_date: [''], end_date: [''] })
  );

  // ── Computed ────────────────────────────────────────────────────────────
  transactions = computed(() => this.store.transactions());

  hasActiveFilters = computed(() =>
    !!this.searchQuery() || this.appliedValues.some(v => !!v)
  );

  bannerLabel = computed(() => {
    if (this.searchQuery()) return this.searchQuery();
    const activeIdx = this.appliedValues.findIndex(v => !!v);
    if (activeIdx === -1) return '';
    const val = this.appliedValues[activeIdx];
    return this.filterDefs[activeIdx].options.find(o => o.value === val)?.label ?? val;
  });

  bannerPrefix = computed(() =>
    this.searchQuery() ? 'Displaying search result:' : 'Displaying filtered result:'
  );

  // ── Helpers ─────────────────────────────────────────────────────────────
  isFilterActive(i: number): boolean { return !!this.appliedValues[i]; }

  filterDisplayLabel(i: number): string {
    const applied = this.appliedValues[i];
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

    // Enforce single active filter
    this.appliedValues   = this.appliedValues.map((_, idx)  => idx === i ? value : '');
    this.selectedValues  = this.selectedValues.map((_, idx) => idx === i ? value : '');
    this.showCustomRange = this.showCustomRange.map((_, idx) => idx === i ? this.showCustomRange[idx] : false);
    this.customRangeForms.forEach((f, idx) => { if (idx !== i) f.reset(); });
    this.searchQuery.set('');

    const def = this.filterDefs[i];

    switch (def.type) {
      case 'transactionType':
        this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit(), type: value || undefined });
        return;

      case 'category':
        this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit(), category: value || undefined });
        return;

      case 'status':
        this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit(), status: value || undefined });
        return;

      case 'date': {
        if (!value || value === 'custom_range') {
          if (value === 'custom_range') {
            // wire up custom date range store call here if needed
          }
          this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit() });
          return;
        }
        this.store.setTimeframe(value as TransactionDateRange);
        return;
      }
    }
  }

  exportTransactions(): void {
  this.store.exportTransactions();
}

  clearFilter(i: number): void {
    this.appliedValues[i]   = '';
    this.selectedValues[i]  = '';
    this.showCustomRange[i] = false;
    this.customRangeForms[i].reset();
    this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit() });
  }

  clearFilters(): void {
    this.appliedValues   = this.filterDefs.map(() => '');
    this.selectedValues  = this.filterDefs.map(() => '');
    this.showCustomRange = this.filterDefs.map(() => false);
    this.customRangeForms.forEach(f => f.reset());
    this.searchQuery.set('');
    this.store.fetchTransactions({ page: 1, limit: 10 });
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
  onPageChange(page: number):     void { this.currentPage.set(page); this.store.setPage(page); }
  onPageSizeChange(size: number): void { this.currentPage.set(1); this.store.setPageSize(size); }

  // ── Display helpers ──────────────────────────────────────────────────────
  getInitials(f: string, l: string): string {
    return `${(f ?? ' ').charAt(0)}${(l ?? ' ').charAt(0)}`.toUpperCase();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'SUCCESSFUL': return 'text-[#12B76A]';
      case 'PENDING':    return 'text-[#F59E0B]';
      case 'FAILED':     return 'text-[#F04438]';
      case 'REVERSED':   return 'text-[#6366F1]';
      default:           return 'text-[#51575B]';
    }
  }

  getStatusBg(status: string): string {
    switch (status) {
      case 'SUCCESSFUL': return 'bg-[#ECFDF5]';
      case 'PENDING':    return 'bg-[#FFFBEB]';
      case 'FAILED':     return 'bg-[#FFF1F2]';
      case 'REVERSED':   return 'bg-[#EEF2FF]';
      default:           return 'bg-[#F3F4F6]';
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