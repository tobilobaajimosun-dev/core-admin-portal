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
    PsPaginationComponent,
    PsEmptyComponent,
    PsSvgIconComponent,
    DropdownComponent,
  ],
  templateUrl: './customers-table.component.html',
})
export class CustomersTableComponent implements OnInit {
  private readonly router      = inject(Router);
  readonly store                = inject(CustomerStore);
  private readonly modalService = inject(PsModalService);
  private readonly destroyRef  = inject(DestroyRef);
  currentPage = signal(1);

  skeletonRows = new Array(8);
  columns      = ['Name', 'Phone Number', 'KYC Status', 'Loan Status', 'Date registered', ''];

  activeKycFilter  = signal<string>('');
  activeLoanFilter = signal<string>('');
  activeDateFilter = signal<string>('');
  searchQuery      = signal<string>('');

  kycOptions: FilterOption[] = [
    { label: 'Active',   value: 'ACTIVE'   },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  loanOptions: FilterOption[] = [
    { label: 'New',                 value: 'NEW'                 },
    { label: 'Disbursed',           value: 'DISBURSED'           },
    { label: 'Processing/Pending',  value: 'PROCESSING/PENDING'  },
    { label: 'Cancelled/Failed',    value: 'CANCELLED/FAILED'    },
    { label: 'Completed',           value: 'COMPLETED'           },
  ];

  dateOptions: { label: string; value: CustomerCustomRange }[] = [
    { label: 'Today',        value: 'today'       },
    { label: 'Yesterday',    value: 'yesterday'   },
    { label: 'Past 7 days',  value: 'past_7_days' },
    { label: 'This month',   value: 'this_month'  },
  ];

  // ── Customers ────────────────────────
  customers = computed(() => this.store.customers());

  // ── Banner ─────────────────────────────────────────────────────────────────
  hasActiveFilters = computed(() =>
    !!this.searchQuery()      ||
    !!this.activeKycFilter()  ||
    !!this.activeLoanFilter() ||
    !!this.activeDateFilter()
  );

  bannerLabel = computed(() => {
    if (this.searchQuery()) return this.searchQuery();

    const kyc = this.activeKycFilter();
    if (kyc) return this.kycOptions.find(o => o.value === kyc)?.label ?? kyc;

    const loan = this.activeLoanFilter();
    if (loan) return this.loanOptions.find(o => o.value === loan)?.label ?? loan;

    const date = this.activeDateFilter();
    if (date) return this.dateOptions.find(o => o.value === date)?.label ?? date;

    return '';
  });

  bannerPrefix = computed(() =>
    this.searchQuery() ? 'Displaying search result:' : 'Displaying filtered result:'
  );

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1), // ignore the initial '' emission on subscribe
    debounceTime(400),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchCustomers({ page: 1, limit: 10 });

    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.store.setSearch(query);
      });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onKycFilterChange(option: FilterOption): void {
    // Selecting a new filter clears the other groups, and re-selecting the
    // same option toggles it off.
    const next = this.activeKycFilter() === option.value ? '' : option.value;
    this.activeKycFilter.set(next);
    this.activeLoanFilter.set('');
    this.activeDateFilter.set('');
    this.searchQuery.set('');

    this.store.fetchCustomers({
      page: 1,
      limit: this.store.currentLimit(),
      kyc_status: next || undefined,
    });
  }

  onLoanFilterChange(option: FilterOption): void {
    const next = this.activeLoanFilter() === option.value ? '' : option.value;
    this.activeLoanFilter.set(next);
    this.activeKycFilter.set('');
    this.activeDateFilter.set('');
    this.searchQuery.set('');

    this.store.fetchCustomers({
      page: 1,
      limit: this.store.currentLimit(),
      loan_status: next || undefined,
    });
  }

  setDateFilter(opt: { label: string; value: CustomerCustomRange }): void {
    const next = this.activeDateFilter() === opt.value ? '' : opt.value;
    this.activeDateFilter.set(next);
    this.activeKycFilter.set('');
    this.activeLoanFilter.set('');
    this.searchQuery.set('');

    if (next) {
      this.store.setTimeframe(opt.value);
    } else {
      this.store.fetchCustomers({ page: 1, limit: this.store.currentLimit() });
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.activeKycFilter.set('');
    this.activeLoanFilter.set('');
    this.activeDateFilter.set('');
    this.store.fetchCustomers({ page: 1, limit: 10 });
  }

  onPageChange(page: number):     void {
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
  // ── Helpers ────────────────────────────────────────────────────────────────
  getInitials(f: string, l: string): string {
    return `${(f ?? ' ').charAt(0)}${(l ?? ' ').charAt(0)}`.toUpperCase();
  }

  getKycStatus(customer: CustomerRaw): string {
    if (customer.is_bvn_verified) return 'Active';
    return 'Inactive';
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