import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

interface FailedDisbursementRecord {
  applicationDate: string;
  applicationTime: string;
  customerName: string;
  customerEmail: string;
  initials: string;
  loanId: string;
  amount: string;
  tenor: string;
  product: string;
  reason: string;
}

@Component({
  selector: 'app-failed-disbursements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './failed-disbursements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FailedDisbursementsComponent {
  private readonly router = inject(Router);

  rowsPerPage = signal(5);
  currentPage = signal(1);
  readonly rowsPerPageOptions = [5, 10, 20, 50];

  readonly columns = ['Application Date', 'Customer Details', 'Amount & Tenor', 'Loan ID', 'Product', 'Reason'];

  readonly allLoans: FailedDisbursementRecord[] = [
    { applicationDate: 'Aug 29, 2024,', applicationTime: '3:52:12 PM GMT', customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amount: '₦80,010.00', tenor: 'For 12 months', product: 'Credit Wallet', reason: 'Incomplete KYC' },
    { applicationDate: 'Aug 29, 2024,', applicationTime: '3:52:12 PM GMT', customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amount: '₦80,010.00', tenor: 'For 12 months', product: 'Credit Wallet', reason: 'Pending Verification' },
    { applicationDate: 'Aug 29, 2024,', applicationTime: '3:52:12 PM GMT', customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amount: '₦80,010.00', tenor: 'For 12 months', product: 'Credit Wallet', reason: 'Document Review Required' },
    { applicationDate: 'Aug 29, 2024,', applicationTime: '3:52:12 PM GMT', customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amount: '₦80,010.00', tenor: 'For 12 months', product: 'Credit Wallet', reason: 'Identity Confirmation Needed' },
    { applicationDate: 'Aug 29, 2024,', applicationTime: '3:52:12 PM GMT', customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amount: '₦80,010.00', tenor: 'For 12 months', product: 'Credit Wallet', reason: 'Verification Failed' },
    { applicationDate: 'Aug 29, 2024,', applicationTime: '3:52:12 PM GMT', customerName: 'Jesulademi Ajimosun', customerEmail: 'jesulademi.ajimosun@princepsfinance.com', initials: 'JA', loanId: 'CW321CA', amount: '₦80,010.00', tenor: 'For 12 months', product: 'Credit Wallet', reason: 'Awaiting Additional Information' },
    { applicationDate: 'Sep 01, 2024,', applicationTime: '10:15:00 AM GMT', customerName: 'Adaeze Okonkwo',     customerEmail: 'adaeze.okonkwo@princepsfinance.com',     initials: 'AO', loanId: 'CW322CB', amount: '₦50,000.00', tenor: 'For 6 months',  product: 'Credit Lite',   reason: 'Invalid Bank Account' },
    { applicationDate: 'Sep 02, 2024,', applicationTime: '08:30:00 AM GMT', customerName: 'Chidi Nwosu',        customerEmail: 'chidi.nwosu@princepsfinance.com',        initials: 'CN', loanId: 'CW323CC', amount: '₦120,000.00', tenor: 'For 24 months', product: 'Credit Rite',   reason: 'BVN Mismatch' },
    { applicationDate: 'Sep 03, 2024,', applicationTime: '02:00:00 PM GMT', customerName: 'Ngozi Eze',          customerEmail: 'ngozi.eze@princepsfinance.com',          initials: 'NE', loanId: 'CW324CD', amount: '₦200,000.00', tenor: 'For 12 months', product: 'Corper Wallet', reason: 'Insufficient Wallet Balance' },
    { applicationDate: 'Sep 04, 2024,', applicationTime: '11:45:00 AM GMT', customerName: 'Emeka Obi',          customerEmail: 'emeka.obi@princepsfinance.com',          initials: 'EO', loanId: 'CW325CE', amount: '₦75,000.00', tenor: 'For 9 months',  product: 'Credit Wallet', reason: 'Account Frozen' },
  ];

  get totalRecords(): number { return this.allLoans.length; }

  get pagedLoans(): FailedDisbursementRecord[] {
    const start = (this.currentPage() - 1) * this.rowsPerPage();
    return this.allLoans.slice(start, start + this.rowsPerPage());
  }

  get startRecord(): number { return (this.currentPage() - 1) * this.rowsPerPage() + 1; }
  get endRecord(): number   { return Math.min(this.currentPage() * this.rowsPerPage(), this.totalRecords); }
  get totalPages(): number  { return Math.ceil(this.totalRecords / this.rowsPerPage()); }

  onRowsPerPageChange(value: string): void { this.rowsPerPage.set(Number(value)); this.currentPage.set(1); }
  prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages) this.currentPage.update(p => p + 1); }

  goBack(): void { this.router.navigate(['/loans']); }
}