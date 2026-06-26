import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

export interface AddressVerificationData {
  customerName:     string;
  stateOfResidence: string;
  streetAddress:    string;
  localGovernment:  string;
  nearestLandmark:  string;
  documentImageUrl: string;
  kycLabel:         string;
  onApprove:        () => void;
  onReject:         (reason: string) => void;
}

@Component({
  selector: 'app-address-verification-modal',
  standalone: true,
  imports: [CommonModule, PsSvgIconComponent],
  templateUrl: './address-verification-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressVerificationModalComponent extends PsModalComponent implements OnInit {

  modalData: AddressVerificationData = {
    customerName:     '',
    stateOfResidence: '',
    streetAddress:    '',
    localGovernment:  '',
    nearestLandmark:  '-',
    documentImageUrl: '',
    kycLabel:         'Address Verification',
    onApprove:        () => {},
    onReject:         () => {},
  };

  selectedReason      = signal('');
  rejectDropdownOpen  = signal(false);

  rejectReasons = [
    'Image is blurry',
    'Image is counterfeit',
    'Wrong image attached',
  ];

   ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
    }
  }

  toggleRejectDropdown(): void {
    this.rejectDropdownOpen.update(v => !v);
  }

  selectRejectReason(reason: string): void {
    this.selectedReason.set(reason);
    this.rejectDropdownOpen.set(false);
    this.modalData.onReject(reason);
    this.close();
  }

  approve(): void {
    this.modalData.onApprove();
    this.close();
  }
}