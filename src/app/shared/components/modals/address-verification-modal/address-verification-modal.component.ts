import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';
import { CustomerStore } from '@core/store/customer.store';
import { CustomerIssue } from '@core/interfaces/customer.model';
import { SendNotificationModalComponent } from '@shared/components/modals/send-notification-modal/send-notification-modal.component';
import {
  issueToLabel,
  issueNeedsNotification,
  issueNeedsCompleteAction,
} from '@shared/utils/customer-issue.utils';

export interface AddressVerificationData {
  customerId:       string;
  customerName:     string;
  customerEmail:    string;
  issue:            CustomerIssue;
  stateOfResidence: string;
  streetAddress:    string;
  localGovernment:  string;
  nearestLandmark:  string;
  documentImageUrl: string;
  onSent?:          () => void;
}

@Component({
  selector: 'app-address-verification-modal',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './address-verification-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressVerificationModalComponent extends PsModalComponent implements OnInit {
  private readonly modalService  = inject(PsModalService);
  private readonly customerStore = inject(CustomerStore);
  private readonly toast         = inject(PsToastService);

  modalData: AddressVerificationData = {
    customerId:       '',
    customerName:     '',
    customerEmail:    '',
    issue:            'INCOMPLETE_ACCOUNT_REGISTRATION',
    stateOfResidence: '',
    streetAddress:    '',
    localGovernment:  '',
    nearestLandmark:  '-',
    documentImageUrl: '',
  };

  kycLabel           = computed(() => issueToLabel(this.modalData.issue));
  showSendAction      = computed(() => issueNeedsNotification(this.modalData.issue));
  showCompleteAction = computed(() => issueNeedsCompleteAction(this.modalData.issue));

  ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
    }
  }

  openSendNotificationModal(): void {
    const { customerId, customerName, customerEmail, onSent } = this.modalData;
    this.close();
    this.modalService.open(SendNotificationModalComponent, {
      data: {
        customerId,
        customerName,
        customerEmail,
        onSend: () => onSent?.(),
      },
      maxWidth:   '560px',
      isCentered: true,
    });
  }

  completeAction(): void {
    this.customerStore.performNeedsActionResolution(
      this.modalData.customerId,
      (message) => {
        this.toast.success(message);
        this.modalData.onSent?.();
        this.close();
      },
      (message) => this.toast.error(message)
    );
  }
}