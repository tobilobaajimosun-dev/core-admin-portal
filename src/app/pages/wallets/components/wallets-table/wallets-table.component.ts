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
import { WalletStore }           from '@core/store/wallet.store';
import { WalletRaw, WalletDateRange } from '@core/interfaces/wallet.model';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-wallets-table',
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
  templateUrl: './wallets-table.component.html',
})
export class WalletsTableComponent implements OnInit {
  readonly store              = inject(WalletStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router     = inject(Router);
  private readonly fb         = inject(NonNullableFormBuilder);

  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<DropdownComponent>;

  currentPage = signal(1);

  skeletonRows = new Array(8);
  columns      = ['Date & Time', 'Customer Details', 'Wallet ID', 'Status', 'Balance', 'Total Funded', ''];

  searchQuery = signal<string>('');

  // ── Filter definitions ──────────────────────────────────────────────────
  readonly filterDefs: { type: 'status' | 'date'; label: string; options: FilterOption[]; supportsCustomRange?: boolean }[] = [
    {
      type: 'status',
      label: 'Wallet Status',
      options: [
        { label: 'Active',   value: 'ACTIVE'   },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Frozen',   value: 'FROZEN'   },
      ],
    },
    {
      type: 'date',
      label: 'Date Created',
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
  selectedValues: string[] = this.filterDefs.map(() => '');
  appliedValues:  string[] = this.filterDefs.map(() => '');
  showCustomRange: boolean[] = this.filterDefs.map(() => false);

  customRangeForms = this.filterDefs.map(() =>
    this.fb.group({ start_date: [''], end_date: [''] })
  );

  // ── Computed ────────────────────────────────────────────────────────────
  wallets = computed(() => this.store.wallets());

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
    this.appliedValues  = this.appliedValues.map((_, idx)  => idx === i ? value : '');
    this.selectedValues = this.selectedValues.map((_, idx) => idx === i ? value : '');
    this.showCustomRange = this.showCustomRange.map((_, idx) => idx === i ? this.showCustomRange[idx] : false);
    this.customRangeForms.forEach((f, idx) => { if (idx !== i) f.reset(); });
    this.searchQuery.set('');

    const def = this.filterDefs[i];

    switch (def.type) {
      case 'status':
        this.store.fetchWallets({ page: 1, limit: this.store.currentLimit(), status: value || undefined });
        return;

      case 'date': {
        if (!value || value === 'custom_range') {
          if (value === 'custom_range') {
            const { start_date, end_date } = this.customRangeForms[i].getRawValue();
            // wire up custom date range store call here if needed
          }
          this.store.fetchWallets({ page: 1, limit: this.store.currentLimit() });
          return;
        }
        this.store.setTimeframe(value as WalletDateRange);
        return;
      }
    }
  }

  exportWallets(): void {
    this.store.exportWallets({
      page: this.store.currentPage(),
      limit: this.store.currentLimit(),
      search: this.searchQuery() || undefined,
      status: this.appliedValues[0] || undefined,
    });
  }

  clearFilter(i: number): void {
    this.appliedValues[i]  = '';
    this.selectedValues[i] = '';
    this.showCustomRange[i] = false;
    this.customRangeForms[i].reset();
    this.store.fetchWallets({ page: 1, limit: this.store.currentLimit() });
  }

  clearFilters(): void {
    this.appliedValues   = this.filterDefs.map(() => '');
    this.selectedValues  = this.filterDefs.map(() => '');
    this.showCustomRange = this.filterDefs.map(() => false);
    this.customRangeForms.forEach(f => f.reset());
    this.searchQuery.set('');
    this.store.fetchWallets({ page: 1, limit: 10 });
  }

  // ── Search ───────────────────────────────────────────────────────────────
  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1), debounceTime(400), distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchWallets({ page: 1, limit: 10 });
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
  getInitials(f?: string | null, l?: string | null): string {
    return `${(f ?? ' ').charAt(0)}${(l ?? ' ').charAt(0)}`.toUpperCase();
  }

  getStatusColor(status?: string | null): string {
    switch (status) {
      case 'ACTIVE':   return 'text-[#12B76A]';
      case 'INACTIVE': return 'text-[#F59E0B]';
      case 'FROZEN':   return 'text-[#F04438]';
      default:         return 'text-[#51575B]';
    }
  }

  getStatusBg(status?: string | null): string {
    switch (status) {
      case 'ACTIVE':   return 'bg-[#ECFDF5]';
      case 'INACTIVE': return 'bg-[#FFFBEB]';
      case 'FROZEN':   return 'bg-[#FFF1F2]';
      default:         return 'bg-[#F3F4F6]';
    }
  }

  getStatusLabel(status?: string | null): string {
    if (!status) return 'Unknown';
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  // TODO: totalFunded isn't on the raw API payload yet — showing '—'
  // until backend confirms the source field (see wallet.model.ts).
  formatAmount(amount?: number | null): string {
    if (amount === undefined || amount === null) return '—';
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }

  getWalletId(wallet: WalletRaw): string {
    return wallet.public_id ?? wallet.account_number ?? wallet.id;
  }

  viewWallet(wallet: WalletRaw): void {
    this.router.navigate(['/wallets', wallet.id]);
  }
}