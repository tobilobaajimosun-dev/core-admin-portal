import { Component, signal, inject } from '@angular/core';
import { CommonModule, DatePipe }    from '@angular/common';
import { Router }                    from '@angular/router';
import { PsSvgIconComponent }        from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { LoanAboutComponent }        from './components/loan-about/loan-about.component';
import { LoanScheduleComponent }     from './components/loan-schedule/loan-schedule.component';
import { LoanLiquidationComponent }  from './components/loan-liquidation/loan-liquidation.component';
import { LoanDocumentsComponent }    from './components/loan-documents/loan-documents.component';

export type LoanTabValue = 'about' | 'schedule' | 'liquidation' | 'documents';

// ── Hardcoded mock loan ──────────────────────────────────────────────────────
export const MOCK_LOAN = {
  id:                   'CW409489',
  borrowerId:           'CW47839',
  customerName:         'Ademilua Josephine Tayo',
  customerEmail:        'a.jesjos@gmail.com',
  customerPhone:        '+234 654 743 2112',
  customerAvatar:       '',
  walletType:           'Credit Wallet',
  isNew:                true,

  // Header summary stats
  amountRequested:      80_000,
  amountDisbursed:      50_000,
  outstandingBalance:   20_000,
  totalRepaid:          30_000,
  interestRate:         '12% pa',
  applicationDate:      new Date('2025-06-06'),
  dueDate:              new Date('2026-06-06'),
  tenor:                '12 months',
};

@Component({
  selector: 'app-view-loan',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    PsSvgIconComponent,
    LoanAboutComponent,
    LoanScheduleComponent,
    LoanLiquidationComponent,
    LoanDocumentsComponent,
  ],
  templateUrl: './view-loan.component.html',
})
export class ViewLoanComponent {
  private readonly router = inject(Router);

  readonly loan = MOCK_LOAN;

  activeTab = signal<LoanTabValue>('about');

  tabs: { value: LoanTabValue; label: string; icon: string }[] = [
    { value: 'about',       label: 'About loan',    icon: 'profile-icon'      },
    { value: 'schedule',    label: 'Schedule',       icon: 'loan-icon' },
    { value: 'liquidation', label: 'Liquidation',    icon: 'transactions-icon'       },
    { value: 'documents',   label: 'Loan Documents', icon: 'transactions-icon'         },
  ];

  getInitials(): string {
    return this.loan.customerName
      .split(' ')
      .map(p => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  goBack(): void { this.router.navigate(['/loans']); }

  emailCustomer(): void { console.log('Email customer'); }
  callCustomer():  void { console.log('Call customer'); }
  sendPushNote():  void { console.log('Send push notification'); }
}