import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe }    from '@angular/common';
import { ActivatedRoute, Router }    from '@angular/router';
import { PsSvgIconComponent }        from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { LoanStore }                 from '@core/store/loan.store';
import { LoanAboutComponent }        from './components/loan-about/loan-about.component';
import { LoanScheduleComponent }     from './components/loan-schedule/loan-schedule.component';
import { LoanLiquidationComponent }  from './components/loan-liquidation/loan-liquidation.component';
import { LoanDocumentsComponent }    from './components/loan-documents/loan-documents.component';
import { SendNotificationModalComponent }    from '@shared/components/modals/send-notification-modal/send-notification-modal.component';
import { PsModalService }  from '@pcsl-ui/ui/ps-modal/ps-modal.service';

export type LoanTabValue = 'about' | 'schedule' | 'liquidation' | 'documents';

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
  private readonly route  = inject(ActivatedRoute);
  private readonly modalService = inject(PsModalService);

  readonly store           = inject(LoanStore); 
  readonly loan      = this.store.loanDetailHeaderView;
  readonly isLoading = this.store.loanDetailLoading;
  readonly error     = this.store.loanDetailError;

  showPhone = signal(false);
  phoneCopied = signal(false);

  showEmail = signal(false);
  emailCopied = signal(false);

  activeTab = signal<LoanTabValue>('about');

  tabs: { value: LoanTabValue; label: string; icon: string }[] = [
    { value: 'about',       label: 'About loan',    icon: 'profile-icon'      },
    { value: 'schedule',    label: 'Schedule',       icon: 'loan-icon'        },
    { value: 'liquidation', label: 'Liquidation',    icon: 'transactions-icon'},
    { value: 'documents',   label: 'Loan Documents', icon: 'transactions-icon'},
  ];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.store.fetchLoanDetail(id);
  }

  getInitials(): string {
    const name = this.loan()?.customerName ?? '';
    return name.split(' ').map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  goBack(): void { this.router.navigate(['/loans']); }

 openSendNotificationModal(): void {
  const loan = this.loan();
  if (!loan) return;

  this.modalService.open(SendNotificationModalComponent, {
    data: {
      customerId:    loan.customerId,
      customerName:  loan.customerName,
      customerEmail: loan.customerEmail,
    },
    maxWidth:   '560px',
    isCentered: true,
  });
}

 emailCustomer(): void {
    this.showEmail.set(true);
  }

  async copyEmail(): Promise<void> {
    const loan = this.loan();
    if (!loan?.customerEmail) return;

    try {
      await navigator.clipboard.writeText(loan.customerEmail);
      this.emailCopied.set(true);
      setTimeout(() => {
        this.emailCopied.set(false);
        this.showEmail.set(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy email', err);
    }
  }

  callCustomer(): void {
    this.showPhone.set(true);
  }
  
async copyPhone(): Promise<void> {
  const loan = this.loan();
  if (!loan?.customerPhone) return;

  try {
    await navigator.clipboard.writeText(loan.customerPhone);
    this.phoneCopied.set(true);
    setTimeout(() => {
      this.phoneCopied.set(false);
      this.showPhone.set(false);
    }, 1500);
  } catch (err) {
    console.error('Failed to copy phone number', err);
  }
}
}