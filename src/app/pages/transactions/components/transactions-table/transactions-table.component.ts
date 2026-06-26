import { Component, signal, computed, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsEmptyComponent }      from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsSvgIconComponent }    from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { DropdownComponent }     from '@shared/components/dropdown/dropdown.component';
import { TransactionStore }      from '@core/store/transaction.store';
import { TransactionRaw, TransactionDateRange } from '@core/interfaces/transaction.model';

interface CheckboxOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PsPaginationComponent,
    PsEmptyComponent,
    PsSvgIconComponent,
    DropdownComponent,
  ],
  templateUrl: './transactions-table.component.html',
})
export class TransactionsTableComponent implements OnInit {
  readonly store         = inject(TransactionStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router      = inject(Router);
  currentPage = signal(1);

  skeletonRows = new Array(8);
  columns      = ['Date & Time', 'Customer Details', 'Reference ID', 'Transaction Type', 'Category', 'Status', 'Amount', ''];

  activeType     = signal<string>('');
  activeCategory = signal<string>('');
  activeStatus   = signal<string>('');
  activeDateRange = signal<string>('');
  searchQuery    = signal<string>('');

  pendingType     = signal<string>('');
  pendingCategory = signal<string>('');
  pendingStatus   = signal<string>('');
  pendingDate     = signal<string>('');

  typeOptions: CheckboxOption[] = [
    { label: 'Credit', value: 'CREDIT' },
    { label: 'Debit',  value: 'DEBIT'  },
  ];

  categoryOptions: CheckboxOption[] = [
    { label: 'Airtime',           value: 'Airtime'           },
    { label: 'Data Subscription', value: 'Data Subscription' },
    { label: 'Electricity',       value: 'Electricity'       },
    { label: 'TV Subscription',   value: 'TV Subscription'   },
    { label: 'Wallet Funding',    value: 'Wallet Funding'    },
    { label: 'Transfer',          value: 'Transfer'          },
  ];

  statusOptions: CheckboxOption[] = [
    { label: 'Successful', value: 'SUCCESSFUL' },
    { label: 'Pending',    value: 'PENDING'    },
    { label: 'Failed',     value: 'FAILED'     },
    { label: 'Reversed',   value: 'REVERSED'   },
  ];

  dateOptions: { label: string; value: TransactionDateRange }[] = [
    { label: 'Today',        value: 'today'       },
    { label: 'Yesterday',    value: 'yesterday'   },
    { label: 'Last 7 Days',  value: 'last_7_days' },
    { label: 'Last 30 Days', value: 'last_30_days'},
    { label: 'Custom range', value: 'custom'      },
  ];

  transactions = computed(() => this.store.transactions());

  hasActiveFilters = computed(() =>
    !!this.searchQuery()    ||
    !!this.activeType()     ||
    !!this.activeCategory() ||
    !!this.activeStatus()   ||
    !!this.activeDateRange()
  );

  bannerLabel = computed(() => {
    if (this.searchQuery()) return this.searchQuery();
    const type = this.activeType();
    if (type) return this.typeOptions.find(o => o.value === type)?.label ?? type;
    const category = this.activeCategory();
    if (category) return this.categoryOptions.find(o => o.value === category)?.label ?? category;
    const status = this.activeStatus();
    if (status) return this.statusOptions.find(o => o.value === status)?.label ?? status;
    const dateRange = this.activeDateRange();
    if (dateRange) return this.dateOptions.find(o => o.value === dateRange)?.label ?? dateRange;
    return '';
  });

  bannerPrefix = computed(() =>
    this.searchQuery() ? 'Displaying search result:' : 'Displaying filtered result:'
  );

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1),
    debounceTime(400),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchTransactions({ page: 1, limit: 10 });

    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.store.setSearch(query);
      });
  }

  onSearchChange(query: string): void { this.searchQuery.set(query); }
  clearSearch(): void { this.searchQuery.set(''); }

  applyTypeFilter(): void {
    const next = this.pendingType();
    this.activeType.set(next);
    this._clearOthersExcept('type');
    this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit(), type: next || undefined });
  }

  applyCategoryFilter(): void {
    const next = this.pendingCategory();
    this.activeCategory.set(next);
    this._clearOthersExcept('category');
    this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit(), category: next || undefined });
  }

  applyStatusFilter(): void {
    const next = this.pendingStatus();
    this.activeStatus.set(next);
    this._clearOthersExcept('status');
    this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit(), status: next || undefined });
  }

  applyDateFilter(): void {
    const next = this.pendingDate() as TransactionDateRange;
    this.activeDateRange.set(next);
    this._clearOthersExcept('date');
    if (next) {
      this.store.setTimeframe(next);
    } else {
      this.store.fetchTransactions({ page: 1, limit: this.store.currentLimit() });
    }
  }

  toggleType(value: string):     void { this.pendingType.set(this.pendingType() === value ? '' : value); }
  toggleCategory(value: string): void { this.pendingCategory.set(this.pendingCategory() === value ? '' : value); }
  toggleStatus(value: string):   void { this.pendingStatus.set(this.pendingStatus() === value ? '' : value); }
  toggleDate(value: string):     void { this.pendingDate.set(this.pendingDate() === value ? '' : value); }

  clearFilters(): void {
    this.searchQuery.set('');
    this.activeType.set('');
    this.activeCategory.set('');
    this.activeStatus.set('');
    this.activeDateRange.set('');
    this.pendingType.set('');
    this.pendingCategory.set('');
    this.pendingStatus.set('');
    this.pendingDate.set('');
    this.store.fetchTransactions({ page: 1, limit: 10 });
  }

  private _clearOthersExcept(keep: 'type' | 'category' | 'status' | 'date'): void {
    if (keep !== 'type')     { this.activeType.set('');      this.pendingType.set('');     }
    if (keep !== 'category') { this.activeCategory.set('');  this.pendingCategory.set(''); }
    if (keep !== 'status')   { this.activeStatus.set('');    this.pendingStatus.set('');   }
    if (keep !== 'date')     { this.activeDateRange.set(''); this.pendingDate.set('');     }
    this.searchQuery.set('');
  }

  onPageChange(page: number):     void {
     this.currentPage.set(page); 
     this.store.setPage(page); 
    }
  onPageSizeChange(size: number): void {
     this.currentPage.set(1); 
     this.store.setPageSize(size); 
    }

  // ── Helpers ────────────────────────────────────────────────────────────────
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
    state: { customer: transaction.customer }
  });
}
}