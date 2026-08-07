import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { AuthStore } from '@core/store/auth.store';
import { AuthService } from '@core/services/auth.service';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { statusTone } from '../shared/utils/status-tone';
import { formatLabel } from '../shared/utils/format';
import { applyServerErrors } from '../shared/utils/apply-server-errors';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const next = group.get('new_password')?.value;
  const confirm = group.get('confirm_new_password')?.value;
  return next && confirm && next !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(PsToastService);
  protected readonly authStore = inject(AuthStore);

  protected readonly statusTone = statusTone;
  protected readonly roleLabel = formatLabel;
  protected readonly saving = signal(false);

  protected readonly user = computed(() => this.authStore.user());
  protected readonly fullName = computed(() => {
    const u = this.user();
    return u ? `${u.first_name} ${u.last_name}`.trim() : '—';
  });

  protected readonly form = this.fb.nonNullable.group(
    {
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_new_password: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  protected errorFor(control: 'current_password' | 'new_password' | 'confirm_new_password'): string | null {
    const ctrl = this.form.controls[control];
    if (control === 'confirm_new_password' && this.form.hasError('mismatch') && ctrl.touched) {
      return 'Passwords do not match.';
    }
    if (!ctrl.touched || ctrl.valid) return null;
    if (ctrl.hasError('server')) return ctrl.getError('server');
    if (ctrl.hasError('required')) return 'This field is required.';
    if (ctrl.hasError('minlength')) return 'Must be at least 8 characters.';
    return 'This field is invalid.';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.auth
      .updatePassword({
        currentPassword: v.current_password,
        newPassword: v.new_password,
      })
      .subscribe({
        next: () => {
          this.toast.success('Password changed successfully.');
          this.form.reset({ current_password: '', new_password: '', confirm_new_password: '' });
          this.saving.set(false);
        },
        error: (err) => {
          const msg = applyServerErrors(this.form, err);
          if (msg) this.toast.error(msg);
          this.saving.set(false);
        },
      });
  }
}
