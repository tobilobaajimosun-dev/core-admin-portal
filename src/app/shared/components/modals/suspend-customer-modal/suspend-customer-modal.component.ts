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
import { CustomerStore } from '@core/store/customer.store';

export interface SuspendCustomerData {
  customerId:   string;
  customerName: string;
  onSuccess?:   () => void; // optional hook, e.g. navigate away from detail page
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
  private store        = inject(CustomerStore);

  modalData: SuspendCustomerData = {
    customerId:   '',
    customerName: '',
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
  isSubmitting   = signal(false);
  submitError    = signal<string | null>(null);

  isOther = computed(() => this.selectedReason() === 'Other');

  canSuspend = computed(() => {
    if (this.isSubmitting()) return false;
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

    this.isSubmitting.set(true);
    this.submitError.set(null);

 this.store.suspendCustomer(
  this.modalData.customerId,
  () => {
    this.isSubmitting.set(false);
    this.close();

    this.modalService.open(SuccessNotificationModalComponent, {
      data: {
        iconSrc: 'icons/suspend.svg',
        title: 'Customer suspended!',
        description: 'The customer has been suspended successfully.',
        doneLabel: 'Done',
        onDone: () => {
          this.modalData.onSuccess?.();
        },
      },
    });
  },
  (message) => {
    this.isSubmitting.set(false);
    this.submitError.set(message);
  }
);
  }

done(): void {
  this.close();
  this.data?.onDone?.();
}
}