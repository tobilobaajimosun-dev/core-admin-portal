import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { CustomerStore } from '@core/store/customer.store';

@Component({
  selector: 'app-customer-transactions',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent, DropdownComponent, PsPaginationComponent],
  templateUrl: './customer-transactions.component.html',
})
export class CustomerTransactionsComponent implements OnInit {
  customerId = input.required<string>();
  
private readonly store = inject(CustomerStore);

  readonly transactions = this.store.customerTransactions;
  readonly total        = this.store.customerTransactionsTotal;
  readonly isLoading    = this.store.isLoadingTransactions;
  readonly error        = this.store.transactionsError;
  readonly isExporting   = this.store.isExportingTransactions;

  columns = ['Reference', 'Amount', 'Type', 'Detail', 'Status', 'Date'];

  readonly skeletonRows = new Array(5);

  activeStatus    = signal('');
  activeType      = signal('');
  activeDateRange = signal('');
  searchQuery     = signal('');

  statusOptions = ['SUCCESSFUL', 'PENDING', 'FAILED'];
  typeOptions   = ['DEBIT', 'loan'];
  dateOptions   = ['Newest first', 'Oldest first', 'This week', 'This month', 'This year'];

  hasActiveFilters = computed(() =>
    !!this.activeStatus() || !!this.activeType() || !!this.activeDateRange() || !!this.searchQuery()
  );
    readonly currentLimit = computed(() => this.store.transactionListConfig().limit ?? 10);

currentPage = signal(1)

  ngOnInit(): void {
    this.store.fetchCustomerTransactions({
      customerId: this.customerId(),
      params: { page: 1, limit: 10 },
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.store.setTransactionSearch(this.customerId(), value);
  }

  onStatusChange(status: string): void {
    const next = this.activeStatus() === status ? '' : status;
    this.activeStatus.set(next);
    this.store.setTransactionStatusFilter(this.customerId(), next);
  }

  onTypeChange(type: string): void {
    const next = this.activeType() === type ? '' : type;
    this.activeType.set(next);
    this.store.setTransactionTypeFilter(this.customerId(), next);
  }

  clearFilters(): void {
    this.activeStatus.set('');
    this.activeType.set('');
    this.activeDateRange.set('');
    this.searchQuery.set('');
    this.store.fetchCustomerTransactions({
      customerId: this.customerId(),
      params: { page: 1, limit: 10 },
    });
  }

    exportTransactions(): void {
    this.store.exportCustomerTransactions(this.customerId());
  }

  onPageChange(page: number): void {
    this.store.setTransactionPage(this.customerId(), page);
  }

  onPageSizeChange(size: number): void {
    this.store.setTransactionPageSize(this.customerId(), size);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      SUCCESSFUL: 'bg-[#ECFDF5] text-[#12B76A]',
      PENDING:    'bg-[#FEF3C7] text-[#F59E0B]',
      FAILED:     'bg-[#FFF1F2] text-[#F04438]',
    };
    return map[status?.toUpperCase()] ?? 'bg-[#F3F4F6] text-[#51575B]';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      CREDIT: 'text-[#12B76A]',
      DEBIT:  'text-[#F04438]',
    };
    return map[type?.toUpperCase()] ?? 'text-[#131719]';
  }
}