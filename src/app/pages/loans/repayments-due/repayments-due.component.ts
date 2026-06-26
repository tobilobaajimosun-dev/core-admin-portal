import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

interface RepaymentRecord {
  customerName: string;
  customerEmail: string;
  initials: string;
  loanId: string;
  amountDue: string;
  product: string;
  dueDate: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface RepaymentFilter {
  type: string;
  label: string;
  selected: string | null;
  options: FilterOption[];
  open: boolean;
}

@Component({
  selector: 'app-repayments-due',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repayments-due.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepaymentsDueComponent {
  private readonly router = inject(Router);

  searchQuery = signal('');
  rowsPerPage = signal(5);
  currentPage = signal(1);
  readonly rowsPerPageOptions = [5, 10, 20, 50];

  readonly columns = ['Customer Details', 'Amount Due', 'Loan ID', 'Product', 'Due Date'];

  readonly totalAmountDue = '₦1,240,000';

  readonly filters: RepaymentFilter[] = [
    {
      type: 'product', label: 'All Products', selected: null, open: false,
      options: [
        { label: 'Credit Lite',   value: 'Credit Lite'   },
        { label: 'Credit Rite',   value: 'Credit Rite'   },
        { label: 'Corper Wallet', value: 'Corper Wallet' },
        { label: 'Credit Wallet', value: 'Credit Wallet' },
      ],
    },
    {
      type: 'status', label: 'All Statuses', selected: null, open: false,
      options: [
        { label: 'Active',   value: 'Active'   },
        { label: 'Overdue',  value: 'Overdue'  },
        { label: 'Pending',  value: 'Pending'  },
      ],
    },
    {
      type: 'amount', label: 'Due amount Range', selected: null, open: false,
      options: [
        { label: '₦1,000 - ₦100,000',    value: '1000_100000'    },
        { label: '₦100,000 - ₦500,000',  value: '100000_500000'  },
        { label: '₦500,000 - ₦1m',       value: '500000_1m'      },
        { label: '₦1m+',                 value: '1m_plus'        },
      ],
    },
  ];

  readonly allLoans: RepaymentRecord[] = [
    { customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amountDue: '₦80,010.00', product: 'Credit Wallet', dueDate: 'Aug 29, 2024,' },
    { customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amountDue: '₦80,010.00', product: 'Credit Wallet', dueDate: 'Aug 29, 2024,' },
    { customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amountDue: '₦80,010.00', product: 'Credit Wallet', dueDate: 'Aug 29, 2024,' },
    { customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amountDue: '₦80,010.00', product: 'Credit Wallet', dueDate: 'Aug 29, 2024,' },
    { customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amountDue: '₦80,010.00', product: 'Credit Wallet', dueDate: 'Aug 29, 2024,' },
    { customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amountDue: '₦80,010.00', product: 'Credit Wallet', dueDate: 'Aug 29, 2024,' },
    { customerName: 'Adaeze Okonkwo',      customerEmail: 'adaeze.okonkwo@princepsfinance.com',      initials: 'AO', loanId: 'CW322CB', amountDue: '₦50,000.00',  product: 'Credit Lite',   dueDate: 'Sep 01, 2024,' },
    { customerName: 'Chidi Nwosu',         customerEmail: 'chidi.nwosu@princepsfinance.com',         initials: 'CN', loanId: 'CW323CC', amountDue: '₦120,000.00', product: 'Credit Rite',   dueDate: 'Sep 02, 2024,' },
    { customerName: 'Ngozi Eze',           customerEmail: 'ngozi.eze@princepsfinance.com',           initials: 'NE', loanId: 'CW324CD', amountDue: '₦200,000.00', product: 'Corper Wallet', dueDate: 'Sep 03, 2024,' },
    { customerName: 'Emeka Obi',           customerEmail: 'emeka.obi@princepsfinance.com',           initials: 'EO', loanId: 'CW325CE', amountDue: '₦75,000.00',  product: 'Credit Wallet', dueDate: 'Sep 04, 2024,' },
  ];

  get filteredLoans(): RepaymentRecord[] {
    const search = this.searchQuery().toLowerCase();
    return this.allLoans.filter(loan =>
      !search ||
      loan.customerName.toLowerCase().includes(search) ||
      loan.customerEmail.toLowerCase().includes(search) ||
      loan.loanId.toLowerCase().includes(search)
    );
  }

  get totalRecords(): number  { return this.filteredLoans.length; }

  get pagedLoans(): RepaymentRecord[] {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.filteredLoans.slice(start, start + this.rowsPerPage());
  }

  get startRecord(): number { return (this.currentPage() - 1) * this.rowsPerPage() + 1; }
  get endRecord(): number   { return Math.min(this.currentPage() * this.rowsPerPage(), this.totalRecords); }
  get totalPages(): number  { return Math.ceil(this.totalRecords / this.rowsPerPage()); }

  onSearch(value: string): void { this.searchQuery.set(value); this.currentPage.set(1); }
  onRowsPerPageChange(value: string): void { this.rowsPerPage.set(Number(value)); this.currentPage.set(1); }
  prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages) this.currentPage.update(p => p + 1); }

  toggleFilter(index: number): void {
    this.filters.forEach((filter, index) => { if (index) filter.open = false; });
    this.filters[index].open = !this.filters[index].open;
  }

  selectOption(filterIndex: number, value: string): void {
    const filter = this.filters[filterIndex];
    filter.selected = filter.selected === value ? null : value;
  }

  applyFilter(filterIndex: number): void {
    this.filters[filterIndex].open = false;
    this.currentPage.set(1);
  }

  goBack(): void { this.router.navigate(['/loans']); }
}