import {
  ChangeDetectionStrategy, Component, DestroyRef, inject,
  OnInit, signal, computed, ViewChildren, QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsRadioComponent } from '@pcsl-ui/ui/ps-radio/ps-radio.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { LoanStore } from '@core/store/loan.store';
import { LoanDateRange, LoanView } from '@core/interfaces/loan.model';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDef {
  type: 'applicationDate' | 'tenor' | 'status' | 'product' | 'amount';
  label: string;
  options: FilterOption[];
  supportsCustomRange?: boolean;
}

@Component({
  selector: 'app-loan-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PsSvgIconComponent,
    PsEmptyComponent,
    PsPaginationComponent,
    PsRadioComponent,
    DropdownComponent,
  ],
  templateUrl: './loan-table.component.html',
  styleUrl: './loan-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanTableComponent implements OnInit {
  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<DropdownComponent>;
  readonly store = inject(LoanStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  currentPage = signal(1);
  searchQuery = signal('');
  loans = computed<LoanView[]>(() => this.store.loanViews());

  // ── Base filter definitions (static options; product options are merged in dynamically) ──
  readonly baseFilterDefs: FilterDef[] = [
    {
      type: 'applicationDate',
      label: 'Application Date',
      supportsCustomRange: true,
      options: [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Week', value: 'this_week' },
        { label: 'This Month', value: 'this_month' },
        { label: 'Past 3 months', value: 'past_3_months' },
        { label: 'Past 6 months', value: 'past_6_months' },
        { label: 'This year', value: 'this_year' },
        { label: 'Custom range', value: 'custom_range' },
      ],
    },
    {
      type: 'tenor',
      label: 'Tenor',
      supportsCustomRange: true,
      options: [
        { label: '1 month', value: '1' },
        { label: '3 months', value: '3' },
        { label: '6 months', value: '6' },
        { label: '9 months', value: '9' },
        { label: '12 months', value: '12' },
        { label: 'Custom range', value: 'custom_range' },
      ],
    },
    {
      type: 'status',
      label: 'Status',
      options: [
        { label: 'New', value: 'NEW' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Processing', value: 'PROCESSING' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Disbursed', value: 'DISBURSED' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Failed', value: 'FAILED' },
      ],
    },
    {
      type: 'product',
      label: 'Product',
      options: [], 
    },
    {
      type: 'amount',
      label: 'Amount',
      options: [
        { label: '₦1,000 – ₦100,000', value: '1000_100000' },
        { label: '₦200,000 – ₦500,000', value: '200000_500000' },
        { label: '₦500,000 – ₦1m', value: '500000_1000000' },
        { label: '₦1m – ₦10m+', value: '1000000_10000000' },
      ],
    },
  ];

  // ── Live filter definitions (product options merged in from the store) ─────
  readonly filterDefs = computed<FilterDef[]>(() =>
    this.baseFilterDefs.map(def =>
      def.type === 'product'
        ? {
            ...def,
            options: this.store.products().map(p => ({ label: p.title, value: p.id })),
          }
        : def
    )
  );

  // ── Per-filter state ──────────────────────────────────────────────────────
  // selectedValues[i] is the radio-bound value for baseFilterDefs[i]
  selectedValues: string[] = this.baseFilterDefs.map(() => '');
  // appliedValues[i] is what was last confirmed via "Apply filter"
  appliedValues: string[] = this.baseFilterDefs.map(() => '');
  showCustomRange: boolean[] = this.baseFilterDefs.map(() => false);

  customRangeForms = this.baseFilterDefs.map(() =>
    this.fb.group({ start_date: [''], end_date: [''] })
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  get activeFilterIndex(): number {
    return this.appliedValues.findIndex(v => !!v);
  }

  isFilterActive(i: number): boolean {
    return !!this.appliedValues[i];
  }

  filterDisplayLabel(i: number): string {
    const applied = this.appliedValues[i];
    const def = this.filterDefs()[i];
    if (!applied) return def.label;
    const opt = def.options.find(o => o.value === applied);
    return opt ? `${def.label}: ${opt.label}` : def.label;
  }

  onRadioChange(i: number, value: string): void {
    this.selectedValues[i] = value;
    this.showCustomRange[i] = value === 'custom_range';
    if (value !== 'custom_range') this.customRangeForms[i].reset();
  }

  applyFilter(i: number, dropdown: DropdownComponent): void {
    dropdown.close();
    const value = this.selectedValues[i];

    // Enforce single active filter — clear all others
    this.appliedValues = this.appliedValues.map((_, idx) => idx === i ? value : '');
    this.selectedValues = this.selectedValues.map((_, idx) => idx === i ? value : '');
    this.showCustomRange = this.showCustomRange.map((_, idx) => idx === i ? this.showCustomRange[idx] : false);
    this.customRangeForms.forEach((f, idx) => { if (idx !== i) f.reset(); });
    this.searchQuery.set('');

    const def = this.baseFilterDefs[i];

    switch (def.type) {
      case 'applicationDate': {
        if (value === 'custom_range') {
          const { start_date, end_date } = this.customRangeForms[i].getRawValue();
          this.store.fetchLoans({
            page: 1,
            limit: this.store.currentLimit(),
            custom_range: 'custom',
            start_date: start_date || undefined,
            end_date: end_date || undefined,
          });
          return;
        }
        if (!value) {
          this.store.fetchLoans({ page: 1, limit: this.store.currentLimit() });
          return;
        }
        this.store.setTimeframe(value as LoanDateRange);
        return;
      }
      case 'tenor':{
          if (value === 'custom_range') {
          const { start_date, end_date } = this.customRangeForms[i].getRawValue();
          this.store.fetchLoans({
            page: 1,
            limit: this.store.currentLimit(),
            custom_range: 'custom',
            start_date: start_date || undefined,
            end_date: end_date || undefined,
          });
          return;
        }
        if (!value) {
          this.store.fetchLoans({ page: 1, limit: this.store.currentLimit() });
          return;
        }
        this.store.setTenor(value as LoanDateRange);
        return;
      }
      case 'status':
        this.store.setStatus(value ?? '');
        return;
      case 'product':
        this.store.setProduct(value ?? '');
        return;
      case 'amount': {
        if (!value) { this.store.setAmountRange(null, null); return; }
        const [min, max] = value.split('_').map(Number);
        this.store.setAmountRange(min, max);
        return;
      }
    }
  }

  exportLoans(): void {
    this.store.exportLoans();
  }

  clearFilter(i: number): void {
    this.appliedValues[i] = '';
    this.selectedValues[i] = '';
    this.showCustomRange[i] = false;
    this.customRangeForms[i].reset();
    this.store.fetchLoans({ page: 1, limit: this.store.currentLimit() });
  }

  clearAllFilters(): void {
    this.appliedValues = this.baseFilterDefs.map(() => '');
    this.selectedValues = this.baseFilterDefs.map(() => '');
    this.showCustomRange = this.baseFilterDefs.map(() => false);
    this.customRangeForms.forEach(f => f.reset());
    this.searchQuery.set('');
    this.store.fetchLoans({ page: 1, limit: 10 });
  }

  closeOtherDropdowns(currentIndex: number): void {
    this.filterDropdowns.forEach((dropdown: DropdownComponent, i: number) => {
      if (i !== currentIndex) dropdown.close();
    });
  }
  // ── Search ────────────────────────────────────────────────────────────────
  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1), debounceTime(400), distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchLoans({ page: 1, limit: 10 });
    this.store.fetchLoanProducts();
    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => this.store.setSearch(query));
  }

  onSearch(value: string): void { this.searchQuery.set(value); }

  // ── Pagination ────────────────────────────────────────────────────────────
  onPageChange(page: number): void { this.store.setPage(page); this.currentPage.set(page); }
  onPageSizeChange(size: number): void { this.store.setPageSize(size); this.currentPage.set(1); }

  // ── Status badge ──────────────────────────────────────────────────────────
  statusClass(status: string): string {
    const map: Record<string, string> = {
      'Completed': 'bg-[#ECFDF5] text-[#12B76A]',
      'New': 'bg-[#EFF8FF] text-[#00B3FF]',
      'Failed': 'bg-[#FFF1F2] text-[#F04438]',
      'Cancelled': 'bg-[#F3F4F6] text-[#51575B]',
      'Active': 'bg-[#ECFDF5] text-[#12B76A]',
      'Pending': 'bg-[#FFFBEB] text-[#F59E0B]',
    };
    return map[status] ?? 'bg-[#F3F4F6] text-[#51575B]';
  }

  viewLoan(loan: LoanView): void { this.router.navigate(['/loans', loan.id]); }
}