import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore } from '@core/store/auth.store';
import { PsSvgIconComponent } from '@pcsl-ui/ui/ps-svg-icon/ps-svg-icon.component';
import { ResetPasswordModalComponent } from '@shared/components/modals/reset-password/reset-password.component';
import { PsModalService } from '@pcsl-ui/ui/ps-modal/ps-modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, PsSvgIconComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly modalService = inject(PsModalService);
  private readonly activatedRoute = inject(ActivatedRoute);
  readonly authStore = inject(AuthStore);

  showPassword = false;
  currentYear = new Date().getFullYear();

  loginForm = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  logInSuccess = computed(() => this.authStore.logInSuccess());

  private readonly redirectUrl =
    this.activatedRoute.snapshot.queryParamMap.get('redirectUrl') ?? undefined;

  get formControls() {
    return this.loginForm.controls;
  }

  logUserIn(): void {
    if (this.loginForm.invalid) {
      Object.values(this.formControls).forEach((ctrl) => {
        ctrl.markAsDirty();
        ctrl.markAsTouched();
        ctrl.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.authStore.login({
      email,
      password,
      redirectUrl: this.redirectUrl,
    });
  }

  openResetPasswordModal(): void {
    this.modalService.open(ResetPasswordModalComponent, {
      maxWidth: '483px',
      isCentered: true,
    });
  }
}