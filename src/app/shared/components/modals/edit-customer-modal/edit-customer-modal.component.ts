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
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';
import { SuccessNotificationModalComponent } from '../success-notification-modal/success-notification-modal.component';

export interface EditCustomerData {
  firstName:   string;
  lastName:    string;
  email:       string;
  phoneNumber: string;
  gender:      string;
  workType:    string;
  workplace:   string;
  onSave: (updated: EditCustomerPayload) => void;
}

export interface EditCustomerPayload {
  firstName: string;
  lastName:  string;
  gender:    string;
  workType:  string;
  workplace: string;
}

@Component({
  selector: 'app-edit-customer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PsSelectModule],
  templateUrl: './edit-customer-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCustomerModalComponent extends PsModalComponent implements OnInit {
  private readonly modalService = inject(PsModalService);

  modalData: EditCustomerData = {
    firstName:   '',
    lastName:    '',
    email:       '',
    phoneNumber: '',
    gender:      '',
    workType:    '',
    workplace:   '',
    onSave:      () => {},
  };

  firstName = signal('');
  lastName  = signal('');
  gender    = signal('');
  workType  = signal('');
  workplace = signal('');

  readonly genderOptions: string[] = ['Male', 'Female'];

  readonly workTypeOptions: string[] = [
    'Corp Member',
    'Government Worker',
    'Paramilitary worker',
    'Private sector worker',
    'Entrepreneur',
  ];

  canSave = computed(() =>
    this.firstName().trim().length > 0 &&
    this.lastName().trim().length > 0 &&
    this.gender().length > 0 &&
    this.workType().length > 0
  );

  ngOnInit(): void {
    if (this.data) {
      this.modalData = { ...this.modalData, ...this.data };
      this.firstName.set(this.modalData.firstName);
      this.lastName.set(this.modalData.lastName);
      this.gender.set(this.modalData.gender);
      this.workType.set(this.modalData.workType);
      this.workplace.set(this.modalData.workplace);
    }
  }

  onGenderChange(value: string | number | Record<string, unknown> | null): void {
    if (typeof value === 'string') this.gender.set(value);
  }

  onWorkTypeChange(value: string | number | Record<string, unknown> | null): void {
    if (typeof value === 'string') this.workType.set(value);
  }

  save(): void {
    if (!this.canSave()) return;
    this.modalData.onSave({
      firstName: this.firstName(),
      lastName:  this.lastName(),
      gender:    this.gender(),
      workType:  this.workType(),
      workplace: this.workplace(),
    });

    this.close();

    this.modalService.open(SuccessNotificationModalComponent, {
      data: {
        iconSrc: 'icons/success-check.svg',
        title: "User's details updated!",
        description: 'The user details have been updated successfully.',
        doneLabel: 'Done',
      },
    });
  }
}