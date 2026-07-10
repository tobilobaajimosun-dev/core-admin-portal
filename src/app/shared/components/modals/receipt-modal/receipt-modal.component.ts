import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { TransactionStore } from '@core/store/transaction.store';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './receipt-modal.component.html',
})
export class ReceiptModalComponent {
  readonly modalService = inject(PsModalService);
  readonly store        = inject(TransactionStore); 

  receipt      = () => this.store.receipt();
  isLoading    = () => this.store.isLoadingReceipt();

  isSuccess(status: string | undefined): boolean {
    return !!status && status.toUpperCase().startsWith('SUCCESS');
  }

  statusBadgeClass(status: string): string {
    if (this.isSuccess(status)) return 'bg-[#ECFDF5] text-[#059669]';
    if (status?.toUpperCase() === 'FAILED') return 'bg-[#FEF2F2] text-[#DC2626]';
    if (status?.toUpperCase() === 'PENDING') return 'bg-[#FFFBEB] text-[#D97706]';
    return 'bg-gray-100 text-gray-600';
  }

  // Turns "token", "master_type" -> "Token", "Master Type"
  formatLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Keys we don't want repeated in the details list because
  // they're already shown elsewhere in the header/footer.
  private readonly hiddenKeys = new Set(['receipt_id', 'provider']);

  detailEntries(details: Record<string, string | number> | null) {
    if (!details) return [];
    return Object.entries(details).filter(([key]) => !this.hiddenKeys.has(key));
  }

  print(): void {
    window.print();
  }

  close(): void {
    this.modalService.close();
  }
}