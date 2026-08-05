import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';

export interface UpdateInfoModalData {
  firstname: string;
  lastname: string;
  hasPendingImageChange?: boolean;
  onConfirm: (values: { firstname: string; lastname: string }) => void;
}

@Component({
  selector: 'app-update-info-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-info-modal.component.html',
  styleUrl: './update-info-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UpdateInfoModalComponent extends PsModalComponent implements OnInit {

  private fb = inject(NonNullableFormBuilder);

  private originalFirstname = '';
  private originalLastname  = '';
  private hasPendingImageChange = false;

  updateForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname:  ['', Validators.required],
  });

  get formControls(): { [key: string]: any } {
    return this.updateForm.controls;
  }

  private get modalData(): UpdateInfoModalData {
    return this.data as UpdateInfoModalData;
  }

  ngOnInit(): void {
    const firstname = this.modalData?.firstname ?? '';
    const lastname  = this.modalData?.lastname  ?? '';

    this.originalFirstname = firstname;
    this.originalLastname  = lastname;
    this.hasPendingImageChange = this.modalData?.hasPendingImageChange ?? false;

    this.updateForm.patchValue({ firstname, lastname });
  }

  hasChanges(): boolean {
    const { firstname, lastname } = this.updateForm.getRawValue();
    const nameChanged =
      firstname.trim() !== this.originalFirstname.trim() ||
      lastname.trim()  !== this.originalLastname.trim();

    return nameChanged || this.hasPendingImageChange;
  }

  handleSave(): void {
    // Name fields are still required/valid even if only the image changed,
    // so keep this check — it just won't block on "no changes" anymore.
    if (this.updateForm.invalid || !this.hasChanges()) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const { firstname, lastname } = this.updateForm.getRawValue();

    this.modalData?.onConfirm?.({
      firstname: firstname.trim(),
      lastname:  lastname.trim(),
    });

    this.close();
  }
}