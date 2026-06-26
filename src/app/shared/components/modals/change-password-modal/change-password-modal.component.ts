import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthStore } from '@core/store/auth.store';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { mismatch: true }
    : null;
};

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PsSvgIconComponent],
  templateUrl: './change-password-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordModalComponent extends PsModalComponent {
  private fb = inject(NonNullableFormBuilder);
  private authStore = inject(AuthStore);

  showOld = false;
  showNew = false;
  showConfirm = false;

  changePasswordForm = this.fb.group(
    {
      oldPassword:     ['', [Validators.required]],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  get formControls() {
    return this.changePasswordForm.controls;
  }

 handleChangePassword(): void {
  if (this.changePasswordForm.invalid) {
    Object.values(this.formControls).forEach((control) => {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: true });
    });
    return;
  }

  const { oldPassword, newPassword } = this.changePasswordForm.getRawValue();

  this.authStore.changePassword({
    currentPassword: oldPassword,
    newPassword,
  });

  this.close();
}
}