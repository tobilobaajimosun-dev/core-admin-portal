import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PsSvgIconComponent }    from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { DropdownComponent }     from '@shared/components/dropdown/dropdown.component';
import { CustomerStore }         from '@core/store/customer.store';

@Component({
  selector: 'app-customer-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, PsSvgIconComponent, PsPaginationComponent, DropdownComponent],
  templateUrl: './customer-loans.component.html',
})
export class CustomerLoansComponent implements OnInit {
  customerId = input.required<string>();

  private readonly store = inject(CustomerStore);

  readonly loans      = this.store.customerLoans;
  readonly total      = this.store.customerLoansTotal;
  readonly totalPages = this.store.customerLoansTotalPages;
  readonly isLoading  = this.store.isLoadingLoans;
  readonly error      = this.store.loansError;

  columns = ['Loan ID', 'Amount & Tenor', 'Loan Status', 'Disbursement Date', 'Next Payment Due Date', 'Repaid', 'Product'];

  readonly skeletonRows = new Array(5);

  activeLoanStatus = signal('');
  activeTenor      = signal('');
  activeDisbDate   = signal('');
  searchQuery      = signal('');

  loanStatusOptions = ['Active', 'Completed', 'Pending', 'Rejected'];
  tenorOptions      = ['1–3 months', '3–6 months', '6–9 months', '10–12 months', '> 12 months'];
  disbDateOptions   = ['Newest first', 'Oldest first', 'This week', 'This month', 'This year'];

  hasActiveFilters = computed(() =>
    !!this.activeLoanStatus() || !!this.activeTenor() || !!this.activeDisbDate() || !!this.searchQuery()
  );

  ngOnInit(): void {
    this.store.fetchCustomerLoans({ customerId: this.customerId(), params: { page: 1, limit: 10 } });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.store.setLoanSearch(this.customerId(), value);
  }

  onLoanStatusChange(status: string): void {
    const next = this.activeLoanStatus() === status ? '' : status;
    this.activeLoanStatus.set(next);
    this.store.setLoanStatusFilter(this.customerId(), next);
  }

  clearFilters(): void {
    this.activeLoanStatus.set('');
    this.activeTenor.set('');
    this.activeDisbDate.set('');
    this.searchQuery.set('');
    this.store.fetchCustomerLoans({ customerId: this.customerId(), params: { page: 1, limit: 10 } });
  }

  onPageChange(page: number): void {
    this.store.setLoanPage(this.customerId(), page);
  }

  onPageSizeChange(size: number): void {
    this.store.setLoanPageSize(this.customerId(), size);
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Active:    'bg-[#ECFDF5] text-[#12B76A]',
      Completed: 'bg-[#EFF6FF] text-[#3B82F6]',
      Pending:   'bg-[#FEF3C7] text-[#F59E0B]',
      Rejected:  'bg-[#FFF1F2] text-[#F04438]',
    };
    return map[s] ?? 'bg-[#F3F4F6] text-[#51575B]';
  }
}