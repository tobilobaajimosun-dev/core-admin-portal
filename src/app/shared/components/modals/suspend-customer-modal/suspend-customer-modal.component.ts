import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { PsSelectModule } from '@pcsl-ui/ui/ps-select/ps-select.module';
import { SuccessNotificationModalComponent } from '../success-notification-modal/success-notification-modal.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';

export interface SuspendCustomerData {
  customerName: string;
  onSuspend: (reason: string, customReason?: string) => void;
}

@Component({
  selector: 'app-suspend-customer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PsSelectModule],
  templateUrl: './suspend-customer-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuspendCustomerModalComponent extends PsModalComponent implements OnInit {
  private modalService = inject(PsModalService);

  modalData: SuspendCustomerData = {
    customerName: '',
    onSuspend: () => {},
  };

  readonly reasons = [
    'Suspected fraud',
    'KYC issues',
    'Suspicious activity',
    'Policy violation',
    'User request',
    'Other',
  ];

  selectedReason = signal('');
  customReason   = signal('');

  isOther = computed(() => this.selectedReason() === 'Other');

  canSuspend = computed(() => {
    const reason = this.selectedReason();
    if (!reason) return false;
    if (reason === 'Other') return this.customReason().trim().length > 0;
    return true;
  });

   ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
    }
  }

  onReasonChange(value: string | number | Record<string, unknown> | null): void {
    if (typeof value === 'string') {
      this.selectedReason.set(value);
      this.customReason.set('');
    }
  }

  suspend(): void {
    if (!this.canSuspend()) return;
    this.modalData.onSuspend(
      this.selectedReason(),
      this.isOther() ? this.customReason() : undefined
    );

    this.close(); // close suspend modal

    this.modalService.open(SuccessNotificationModalComponent, {
      data: {
        iconSrc: 'icons/suspend.svg',
        title: 'Customer suspended!',
        description: 'The customer has been suspended successfully.',
        doneLabel: 'Done',
      },
    });
  }

  done(): void {
    this.close();
  }

}