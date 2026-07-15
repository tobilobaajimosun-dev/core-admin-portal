import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { SendNotificationModalComponent } from '@shared/components/modals/send-notification-modal/send-notification-modal.component';
import { LoanDocumentsComponent } from '../loan-documents/loan-documents.component';
import {
  LoanDetailHeaderView,
  LoanDetailAbout,
  LoanDetailDocument,
  LoanDetailGeneratedLetter,
  LoanDetailLogEntry,
} from '@core/interfaces/loan.model';

const STATUS_LABELS: Record<string, string> = {
  NEW:       'New',
  PENDING:   'Processing',
  CANCELLED: 'Cancelled',
  FAILED:    'Failed',
  ACTIVE:    'Active',
  COMPLETED: 'Completed',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  NEW:       'bg-[#D7ECFF] text-[#1041B7]',
  PENDING:   'bg-[#FFFBEB] text-[#D97706]',
  CANCELLED: 'bg-[#FEF2F2] text-[#DC2626]',
};

@Component({
  selector: 'app-loan-application-summary',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, PsSvgIconComponent, LoanDocumentsComponent],
  templateUrl: './loan-application-summary.component.html',
})
export class LoanApplicationSummaryComponent {
  private readonly router       = inject(Router);
  private readonly modalService = inject(PsModalService);

  @Input({ required: true }) loan!: LoanDetailHeaderView;
  @Input() about:             LoanDetailAbout | null = null;
  @Input() documents:         LoanDetailDocument[] = [];
  @Input() generatedLetters:  LoanDetailGeneratedLetter[] = [];
  @Input() logs:              LoanDetailLogEntry[] = [];

  showEmail   = signal(false);
  emailCopied = signal(false);
  showPhone   = signal(false);
  phoneCopied = signal(false);

  get statusLabel(): string {
    return STATUS_LABELS[this.loan.status] ?? this.loan.status;
  }

  get statusBadgeClass(): string {
    return STATUS_BADGE_CLASSES[this.loan.status] ?? 'bg-gray-100 text-gray-600';
  }

  // Bank-account holder name — swap in a real field if/when the API exposes one.
  get accountName(): string {
    return this.loan.customerName;
  }

  getInitials(): string {
    return this.loan.customerName
      .split(' ')
      .map(p => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/loans']);
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

  emailCustomer(): void { this.showEmail.set(true); }

  async copyEmail(): Promise<void> {
    if (!this.loan.customerEmail) return;

    const success = await this.copyToClipboard(this.loan.customerEmail);
    if (success) {
      this.emailCopied.set(true);
      setTimeout(() => { this.emailCopied.set(false); this.showEmail.set(false); }, 1500);
    }
  }

  callCustomer(): void { this.showPhone.set(true); }

  async copyPhone(): Promise<void> {
    if (!this.loan.customerPhone) return;

    const success = await this.copyToClipboard(this.loan.customerPhone);
    if (success) {
      this.phoneCopied.set(true);
      setTimeout(() => { this.phoneCopied.set(false); this.showPhone.set(false); }, 1500);
    }
  }

  openSendNotificationModal(): void {
    this.modalService.open(SendNotificationModalComponent, {
      data: {
        customerId:    this.loan.customerId,
        customerName:  this.loan.customerName,
        customerEmail: this.loan.customerEmail,
      },
      maxWidth:   '560px',
      isCentered: true,
    });
  }
}