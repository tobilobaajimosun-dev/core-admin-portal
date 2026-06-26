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
import { WalletStore }           from '@core/store/wallet.store';
import { WalletRaw, WalletDateRange } from '@core/interfaces/wallet.model';

interface CheckboxOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-wallets-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PsPaginationComponent,
    PsEmptyComponent,
    PsSvgIconComponent,
    DropdownComponent,
  ],
  templateUrl: './wallets-table.component.html',
})
export class WalletsTableComponent implements OnInit {
  readonly store              = inject(WalletStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router     = inject(Router);
  currentPage = signal(1);

  skeletonRows = new Array(8);
  columns      = ['Date & Time', 'Customer Details', 'Wallet ID', 'Status', 'Balance', 'Total Funded', ''];

  activeStatus    = signal<string>('');
  activeDateRange = signal<string>('');
  searchQuery     = signal<string>('');

  pendingStatus = signal<string>('');
  pendingDate   = signal<string>('');

  statusOptions: CheckboxOption[] = [
    { label: 'Active',   value: 'ACTIVE'   },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Frozen',   value: 'FROZEN'   },
  ];

  dateOptions: { label: string; value: WalletDateRange }[] = [
    { label: 'Today',        value: 'today'        },
    { label: 'Yesterday',    value: 'yesterday'    },
    { label: 'Last 7 Days',  value: 'last_7_days'  },
    { label: 'Last 30 Days', value: 'last_30_days' },
    { label: 'Custom range', value: 'custom'       },
  ];

  wallets = computed(() => this.store.wallets());

  hasActiveFilters = computed(() =>
    !!this.searchQuery()    ||
    !!this.activeStatus()   ||
    !!this.activeDateRange()
  );

  bannerLabel = computed(() => {
    if (this.searchQuery()) return this.searchQuery();
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
    this.store.fetchWallets({ page: 1, limit: 10 });

    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.store.setSearch(query);
      });
  }

  onSearchChange(query: string): void { this.searchQuery.set(query); }
  clearSearch(): void { this.searchQuery.set(''); }

  applyStatusFilter(): void {
    const next = this.pendingStatus();
    this.activeStatus.set(next);
    this._clearOthersExcept('status');
    this.store.fetchWallets({ page: 1, limit: this.store.currentLimit(), status: next || undefined });
  }

  applyDateFilter(): void {
    const next = this.pendingDate() as WalletDateRange;
    this.activeDateRange.set(next);
    this._clearOthersExcept('date');
    if (next) {
      this.store.setTimeframe(next);
    } else {
      this.store.fetchWallets({ page: 1, limit: this.store.currentLimit() });
    }
  }

  toggleStatus(value: string): void { this.pendingStatus.set(this.pendingStatus() === value ? '' : value); }
  toggleDate(value: string):   void { this.pendingDate.set(this.pendingDate() === value ? '' : value); }

  clearFilters(): void {
    this.searchQuery.set('');
    this.activeStatus.set('');
    this.activeDateRange.set('');
    this.pendingStatus.set('');
    this.pendingDate.set('');
    this.store.fetchWallets({ page: 1, limit: 10 });
  }

  private _clearOthersExcept(keep: 'status' | 'date'): void {
    if (keep !== 'status') { this.activeStatus.set('');    this.pendingStatus.set(''); }
    if (keep !== 'date')   { this.activeDateRange.set(''); this.pendingDate.set('');   }
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
      case 'ACTIVE':   return 'text-[#12B76A]';
      case 'INACTIVE': return 'text-[#F59E0B]';
      case 'FROZEN':   return 'text-[#F04438]';
      default:         return 'text-[#51575B]';
    }
  }

  getStatusBg(status: string): string {
    switch (status) {
      case 'ACTIVE':   return 'bg-[#ECFDF5]';
      case 'INACTIVE': return 'bg-[#FFFBEB]';
      case 'FROZEN':   return 'bg-[#FFF1F2]';
      default:         return 'bg-[#F3F4F6]';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  formatAmount(amount: number): string {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }

  viewWallet(wallet: WalletRaw): void {
    this.router.navigate(['/wallets', wallet.id]);
  }
}