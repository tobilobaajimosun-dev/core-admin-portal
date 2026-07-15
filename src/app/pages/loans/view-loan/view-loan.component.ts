import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { LoanStore } from '@core/store/loan.store';
import { LoanAboutComponent } from './components/loan-about/loan-about.component';
import { LoanScheduleComponent } from './components/loan-schedule/loan-schedule.component';
import { LoanLiquidationComponent } from './components/loan-liquidation/loan-liquidation.component';
import { LoanDocumentsComponent } from './components/loan-documents/loan-documents.component';
import { SendNotificationModalComponent } from '@shared/components/modals/send-notification-modal/send-notification-modal.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { LoanApplicationSummaryComponent } from './components/loan-application-summary/loan-application-summary.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ViewLoanSkeletonComponent } from "./components/view-loan-skeleton/view-loan-skeleton.component";


export type LoanTabValue = 'about' | 'schedule' | 'liquidation' | 'documents';

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  PENDING: 'Processing',
  ACTIVE: 'Disbursed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  NEW: 'text-[#1041B7] bg-[#D7ECFF]',
  PENDING: 'text-[#D97706] bg-[#FFFBEB]',
  ACTIVE: 'text-[#059669] bg-[#ECFDF5]',
  COMPLETED: 'text-[#059669] bg-[#ECFDF5]',
  CANCELLED: 'text-[#DC2626] bg-[#FEF2F2]',
  FAILED: 'text-[#DC2626] bg-[#FEF2F2]',
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
    LoanApplicationSummaryComponent,
    ViewLoanSkeletonComponent
  ],
  templateUrl: './view-loan.component.html',
})

export class ViewLoanComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(PsModalService);

  readonly store = inject(LoanStore);
  readonly loan = this.store.loanDetailHeaderView;
  readonly isLoading = this.store.loanDetailLoading;
  readonly error = this.store.loanDetailError;

  showPhone = signal(false);
  phoneCopied = signal(false);

  showEmail = signal(false);
  emailCopied = signal(false);

  activeTab = signal<LoanTabValue>('about');

  tabs: { value: LoanTabValue; label: string; icon: string }[] = [
    { value: 'about', label: 'About loan', icon: 'profile-icon' },
    { value: 'schedule', label: 'Schedule', icon: 'loan-icon' },
    { value: 'liquidation', label: 'Liquidation', icon: 'transactions-icon' },
    { value: 'documents', label: 'Loan Documents', icon: 'transactions-icon' },
  ];

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap) => {
        const id = params.get('id');
        if (id) this.store.fetchLoanDetail(id);
      });
  }

  readonly isSummaryView = computed(() => {
    const status = this.loan()?.status;
    return status === 'NEW' || status === 'PENDING' || status === 'PROCESSING' || status === 'FAILED' || status === 'CANCELLED';
  });


  getInitials(): string {
    const name = this.loan()?.customerName ?? '';
    return name.split(' ').map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  get statusLabel(): string {
    const status = this.loan()?.status ?? '';
    return STATUS_LABELS[status] ?? status;
  }

  get statusBadgeClass(): string {
    const status = this.loan()?.status ?? '';
    return STATUS_BADGE_CLASSES[status] ?? 'text-[#51575B] bg-gray-100';
  }
  goBack(): void { this.router.navigate(['/loans']); }

  openSendNotificationModal(): void {
    const loan = this.loan();
    if (!loan) return;

    this.modalService.open(SendNotificationModalComponent, {
      data: {
        customerId: loan.customerId,
        customerName: loan.customerName,
        customerEmail: loan.customerEmail,
      },
      maxWidth: '560px',
      isCentered: true,
    });
  }

  emailCustomer(): void {
    this.showEmail.set(true);
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Clipboard API failed', err);
      }
    }

    // Fallback for non-secure contexts (e.g. http:// test environments)
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.error('Fallback copy failed', err);
      return false;
    }
  }

  async copyEmail(): Promise<void> {
    const loan = this.loan();
    if (!loan?.customerEmail) return;

    const success = await this.copyToClipboard(loan.customerEmail);
    if (success) {
      this.emailCopied.set(true);
      setTimeout(() => {
        this.emailCopied.set(false);
        this.showEmail.set(false);
      }, 1500);
    }
  }

  callCustomer(): void {
    this.showPhone.set(true);
  }

  async copyPhone(): Promise<void> {
    const loan = this.loan();
    if (!loan?.customerPhone) return;

    const success = await this.copyToClipboard(loan.customerPhone);
    if (success) {
      this.phoneCopied.set(true);
      setTimeout(() => {
        this.phoneCopied.set(false);
        this.showPhone.set(false);
      }, 1500);
    }
  }
}