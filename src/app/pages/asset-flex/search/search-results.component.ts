import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomerService } from '../shared/services/customer.service';
import { LoanService } from '../shared/services/loan.service';
import { VendorService } from '../shared/services/vendor.service';
import { Customer } from '../shared/models/customer.model';
import { Loan } from '../shared/models/loan.model';
import { Vendor } from '../shared/models/vendor.model';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { CategoryChipComponent } from '../shared/components/category-chip/category-chip.component';
import { NairaPipe } from '../shared/pipes/naira.pipe';
import { statusTone } from '../shared/utils/status-tone';
import { fetchAllPages } from '@pages/asset-flex/shared/utils/fetch-all-pages';

@Component({
  selector: 'app-search-results',
  imports: [DatePipe, RouterLink, StatusBadgeComponent, CategoryChipComponent, NairaPipe],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent {
  private readonly customerService = inject(CustomerService);
  private readonly loanService = inject(LoanService);
  private readonly vendorService = inject(VendorService);

  /** Bound from ?q via withComponentInputBinding. */
  readonly q = input<string>('');

  protected readonly statusTone = statusTone;
  private readonly allCustomers = signal<Customer[]>([]);
  private readonly allLoans = signal<Loan[]>([]);
  private readonly allVendors = signal<Vendor[]>([]);

  private readonly needle = computed(() => this.q().trim().toLowerCase());

  protected readonly customers = computed(() => {
    const n = this.needle();
    if (!n) return [];
    return this.allCustomers().filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(n) ||
        (c.email ?? '').toLowerCase().includes(n) ||
        (c.internalCustomerId ?? '').toLowerCase().includes(n),
    );
  });
  protected readonly loans = computed(() => {
    const n = this.needle();
    if (!n) return [];
    return this.allLoans().filter(
      (l) =>
        l.loanReference.toLowerCase().includes(n) ||
        (l.itemDescription ?? '').toLowerCase().includes(n) ||
        `${l.customer?.firstName ?? ''} ${l.customer?.lastName ?? ''}`.toLowerCase().includes(n) ||
        (l.vendor?.businessName ?? '').toLowerCase().includes(n),
    );
  });
  protected readonly vendors = computed(() => {
    const n = this.needle();
    if (!n) return [];
    return this.allVendors().filter(
      (v) => v.businessName.toLowerCase().includes(n) || (v.industry ?? '').toLowerCase().includes(n),
    );
  });

  protected readonly total = computed(() => this.customers().length + this.loans().length + this.vendors().length);
  protected fullName(c: Customer): string {
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email;
  }
  protected initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  constructor() {
    // Load the datasets once; filtering happens client-side as `q` changes.
    fetchAllPages((page) => this.customerService.list({ page, limit: 100 })).subscribe({
      next: (rows) => this.allCustomers.set(rows),
      error: () => this.allCustomers.set([]),
    });
    fetchAllPages((page) => this.loanService.list({ page, limit: 100 })).subscribe({
      next: (rows) => this.allLoans.set(rows),
      error: () => this.allLoans.set([]),
    });
    fetchAllPages((page) => this.vendorService.list({ page, limit: 100 })).subscribe({
      next: (rows) => this.allVendors.set(rows),
      error: () => this.allVendors.set([]),
    });
  }
}
