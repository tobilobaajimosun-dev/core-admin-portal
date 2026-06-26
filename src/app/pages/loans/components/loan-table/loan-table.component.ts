import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { LoanStore } from '@core/store/loan.store';
import { LoanDateRange, LoanView } from '@core/interfaces/loan.model';

interface FilterOption {
  label: string;
  value: string;
}

interface ActiveFilter {
  type: 'applicationDate' | 'tenor' | 'status' | 'product' | 'amount';
  title: string;
  selected: string | null;
  options: FilterOption[];
  open: boolean;
}

@Component({
  selector: 'app-loan-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PsSvgIconComponent, PsEmptyComponent, PsPaginationComponent, DropdownComponent],
  templateUrl: './loan-table.component.html',
  styleUrl: './loan-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanTableComponent implements OnInit {
  readonly store = inject(LoanStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  currentPage = signal(1);

  searchQuery = signal('');

  loans = computed<LoanView[]>(() => this.store.loanViews());

  readonly filters: ActiveFilter[] = [
    {
      type: 'applicationDate', title: 'By Application Date', selected: null, open: false,
      options: [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Week', value: 'this_week' },
        { label: 'This Month', value: 'this_month' },
        { label: 'Past 3 months', value: 'past_3_months' },
        { label: 'Past 6 months', value: 'past_6_months' },
        { label: 'This year', value: 'this_year' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      type: 'tenor', title: 'By Tenor', selected: null, open: false,
      options: [
        { label: '1 month', value: '1' }, { label: '3 months', value: '3' },
        { label: '6 months', value: '6' }, { label: '9 months', value: '9' },
        { label: '12 months', value: '12' }, { label: 'Custom range', value: 'custom' },
      ],
    },
    {
      type: 'status', title: 'By Status', selected: null, open: false,
      options: [
        { label: 'New', value: 'NEW' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Failed', value: 'FAILED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
    },
    {
      type: 'product', title: 'By Product', selected: null, open: false,
      options: [
        { label: 'Credit Lite', value: 'Credit Lite' }, { label: 'Credit Rite', value: 'Credit Rite' },
        { label: 'Corper Wallet', value: 'Corper Wallet' }, { label: 'Credit Wallet', value: 'Credit Wallet' },
      ],
    },
    {
      type: 'amount', title: 'By Loan Amount', selected: null, open: false,
      options: [
        { label: '₦1,000 - ₦100,000', value: '1000_100000' },
        { label: '₦200,000 - ₦500,000', value: '200000_500000' },
        { label: '₦500,000 - ₦1m', value: '500000_1000000' },
        { label: '₦1m - 10m+', value: '1000000_10000000' },
      ],
    },
  ];

  readonly filterLabels: Record<string, string> = {
    applicationDate: 'Application Date',
    tenor: 'Tenor',
    status: 'Status',
    product: 'Product',
    amount: 'Amount',
  };

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1),
    debounceTime(400),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchLoans({ page: 1, limit: 10 });

    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.store.setSearch(query);
      });
  }

  onSearch(value: string): void { this.searchQuery.set(value); }

  toggleFilter(index: number): void {
    this.filters.forEach((f, i) => { if (i !== index) f.open = false; });
    this.filters[index].open = !this.filters[index].open;
  }

  selectFilterOption(filterIndex: number, value: string): void {
    const f = this.filters[filterIndex];
    f.selected = f.selected === value ? null : value;
  }

  closeAllFilters(): void { this.filters.forEach(f => (f.open = false)); }

  applyFilter(filterIndex: number): void {
    const filter = this.filters[filterIndex];
    filter.open = false;

    // Clear other filters so only one is active at a time, matching the
    // mutual-exclusivity pattern used on the customers table.
    this.filters.forEach((f, i) => { if (i !== filterIndex) f.selected = null; });
    this.searchQuery.set('');

    const value = filter.selected;

    switch (filter.type) {
      case 'applicationDate': {
        if (!value || value === 'custom') {
          this.store.fetchLoans({ page: 1, limit: this.store.currentLimit() });
          return;
        }
        this.store.setTimeframe(value as LoanDateRange);
        return;
      }
      case 'tenor': {
        this.store.setTenor(value ?? '');
        return;
      }
      case 'status': {
        this.store.setStatus(value ?? '');
        return;
      }
      case 'product': {
        this.store.setProduct(value ?? '');
        return;
      }
      case 'amount': {
        if (!value) {
          this.store.setAmountRange(null, null);
          return;
        }
        const [min, max] = value.split('_').map(Number);
        this.store.setAmountRange(min, max);
        return;
      }
    }
  }

  clearFilters(): void {
    this.filters.forEach(filter => { filter.selected = null; filter.open = false; });
    this.searchQuery.set('');
    this.store.fetchLoans({ page: 1, limit: 10 });
  }

  onPageChange(page: number): void { 
    this.store.setPage(page); 
    this.currentPage.set(page); 
  }
  onPageSizeChange(size: number): void {
     this.store.setPageSize(size);
     this.currentPage.set(1); 
    }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'Completed': 'bg-[#ECFDF5] text-[#12B76A]',
      'New':       'bg-[#EFF8FF] text-[#00B3FF]',
      'Failed':    'bg-[#FFF1F2] text-[#F04438]',
      'Cancelled': 'bg-[#F3F4F6] text-[#51575B]',
      'Active':    'bg-[#ECFDF5] text-[#12B76A]',
      'Pending':   'bg-[#FFFBEB] text-[#F59E0B]',
    };
    return map[status] ?? 'bg-[#F3F4F6] text-[#51575B]';
  }

  viewLoan(loan: LoanView): void {
    this.router.navigate(['/loans', loan.id]);
  }
}