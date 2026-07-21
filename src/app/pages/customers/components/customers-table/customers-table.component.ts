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
import { CustomerStore }         from '@core/store/customer.store';
import { CustomerCustomRange, CustomerRaw } from '@core/interfaces/customer.model';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { SuspendCustomerModalComponent } from '@shared/components/modals/suspend-customer-modal/suspend-customer-modal.component';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-customers-table',
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
  templateUrl: './customers-table.component.html',
})
export class CustomersTableComponent implements OnInit {
  private readonly router      = inject(Router);
  readonly store                = inject(CustomerStore);
  private readonly modalService = inject(PsModalService);
  private readonly destroyRef  = inject(DestroyRef);
  private readonly fb          = inject(NonNullableFormBuilder);

  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<DropdownComponent>;

  currentPage = signal(1);
  skeletonRows = new Array(8);
  columns      = ['Name', 'Phone Number', 'KYC Status', 'Loan Status', 'Date registered', ''];

  searchQuery = signal<string>('');

  // ── Filter definitions ──────────────────────────────────────────────────
  readonly filterDefs: {
    type: 'kyc' | 'loan' | 'date';
    label: string;
    options: FilterOption[];
    supportsCustomRange?: boolean;
  }[] = [
    {
      type: 'kyc',
      label: 'KYC Status',
      options: [
        { label: 'Active',   value: 'ACTIVE'   },
        { label: 'Inactive', value: 'INACTIVE' },
      ],
    },
    {
      type: 'loan',
      label: 'Loan Status',
      options: [
        { label: 'New',                value: 'NEW'                },
        { label: 'Disbursed',          value: 'DISBURSED'          },
        { label: 'Processing/Pending', value: 'PROCESSING/PENDING' },
        { label: 'Cancelled/Failed',   value: 'CANCELLED/FAILED'   },
        { label: 'Completed',          value: 'COMPLETED'          },
      ],
    },
    {
      type: 'date',
      label: 'Date registered',
      supportsCustomRange: true,
      options: [
        { label: 'Today',        value: 'today'        },
        { label: 'Yesterday',    value: 'yesterday'     },
        { label: 'Past 7 days',  value: 'past_7_days'   },
        { label: 'This month',   value: 'this_month'    },
        { label: 'Custom range', value: 'custom_range'  },
      ],
    },
  ];

  // ── Per-filter state ────────────────────────────────────────────────────
  appliedValues = signal<string[]>(this.filterDefs.map(() => ''));
  selectedValues: string[] = this.filterDefs.map(() => '');
  showCustomRange: boolean[] = this.filterDefs.map(() => false);

  private appliedCustomRange: { start_date?: string; end_date?: string } = {};

  customRangeForms = this.filterDefs.map(() =>
    this.fb.group({ start_date: [''], end_date: [''] })
  );

  // ── Customers ────────────────────────
  customers = computed(() => this.store.customers());

  // ── Banner / chips ───────────────────────────────────────────────────────
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

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1),
    debounceTime(400),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchCustomers({ page: 1, limit: 10 });

    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.currentPage.set(1);
        this.store.fetchCustomers({
          page: 1,
          limit: this.store.currentLimit(),
          search: query || undefined,
        });
      });
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

  // ── Actions ────────────────────────────────────────────────────────────────
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  applyFilter(i: number, dropdown: DropdownComponent): void {
    dropdown.close();
    const value = this.selectedValues[i];
    const def = this.filterDefs[i];

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
    this.applyFilters();
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

    this.applyFilters();
  }

  clearFilters(): void {
    this.appliedValues.set(this.filterDefs.map(() => ''));
    this.selectedValues = this.filterDefs.map(() => '');
    this.showCustomRange = this.filterDefs.map(() => false);
    this.customRangeForms.forEach(f => f.reset());
    this.appliedCustomRange = {};
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.store.fetchCustomers({ page: 1, limit: 10 });
  }

  // Builds one combined fetch out of every currently-applied filter.
  private applyFilters(): void {
    this.currentPage.set(1);
    const params: Record<string, unknown> = {
      page: 1,
      limit: this.store.currentLimit(),
    };

    this.filterDefs.forEach((def, idx) => {
      const value = this.appliedValues()[idx];
      if (!value) return;

      switch (def.type) {
        case 'kyc':
          params['kyc_status'] = value;
          break;
        case 'loan':
          params['loan_status'] = value;
          break;
        case 'date':
          if (value === 'custom_range') {
            params['custom_range'] = 'custom';
            params['start_date'] = this.appliedCustomRange.start_date;
            params['end_date'] = this.appliedCustomRange.end_date;
          } else {
            params['custom_range'] = value as CustomerCustomRange;
          }
          break;
      }
    });

    this.store.fetchCustomers(params as any);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.store.setPage(page);
  }

  onPageSizeChange(size: number): void {
    this.currentPage.set(1);
    this.store.setPageSize(size);
  }

  viewCustomer(customer: CustomerRaw): void {
    this.router.navigate(['/users', customer.id]);
  }

  viewLoanHistory(customer: CustomerRaw): void {
    this.router.navigate(['/users', customer.id], { queryParams: { tab: 'loans' } });
  }

  toggleSuspension(customer: CustomerRaw): void {
    this.modalService.open(SuspendCustomerModalComponent, {
      data: {
        customerId:   customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        isSuspended:  customer.is_suspended ?? false,
      },
      maxWidth:   '560px',
      isCentered: true,
    });
  }

  exportCustomers(): void {
    this.store.exportCustomers(this.store.listConfig());
  }

  // ── Display helpers ──────────────────────────────────────────────────────
  getInitials(f: string, l: string): string {
    return `${(f ?? ' ').charAt(0)}${(l ?? ' ').charAt(0)}`.toUpperCase();
  }

  getKycStatus(customer: CustomerRaw): string {
    return customer.is_bvn_verified ? 'Active' : 'Inactive';
  }

  getKycColor(status: string): string {
    return status === 'Active' ? 'text-[#12B76A]' : 'text-[#51575B]';
  }

  getKycBg(status: string): string {
    return status === 'Active' ? 'bg-[#ECFDF5]' : 'bg-[#F3F4F6]';
  }

  getLoanStatus(customer: CustomerRaw): string {
    return customer.has_loan ? 'Active' : 'Inactive';
  }

  getLoanColor(status: string): string {
    return status === 'Active' ? 'text-[#12B76A]' : 'text-[#F04438]';
  }

  getLoanBg(status: string): string {
    return status === 'Active' ? 'bg-[#ECFDF5]' : 'bg-[#FFF1F2]';
  }
}