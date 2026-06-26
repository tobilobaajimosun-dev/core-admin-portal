import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PsModalComponent } from '@pcsl-ui/ui/ps-modal/ps-modal.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { animate, style, transition, trigger } from '@angular/animations';
import { AuthService } from '@core/services/auth.service';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export type ResetStep = 'email' | 'otp' | 'new-password';
export type OtpState = 'empty' | 'filling' | 'success' | 'error';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOtpInputModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(16px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class ResetPasswordModalComponent extends PsModalComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(PsToastService);

  // ── Step & OTP state ────────────────────────────────────────────────────────
  readonly step = signal<ResetStep>('email');
  readonly otpState = signal<OtpState>('empty');
  readonly resendCountdown = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  /** Captured after email step so OTP & reset steps can reuse it */
  private capturedEmail = '';
  /** OTP entered by the user — carried forward to the reset step */
  private capturedOtp = '';
  /** Expected OTP returned by the API in forgotPassword / resendOtp response */
  private expectedOtp = '';

  otpValue = '';
  readonly otpLength = 6;
  readonly otpConfig = {
    length: this.otpLength,
    allowNumbersOnly: true,
    disableAutoFocus: false,
    containerClass: 'otp-container',
    inputClass: 'otp-input',
  };

  private resendTimer?: ReturnType<typeof setInterval>;

  // ── Forms ───────────────────────────────────────────────────────────────────

  readonly emailForm = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly newPasswordForm = inject(NonNullableFormBuilder).group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  get emailControl() {
    return this.emailForm.get('email');
  }

  get passwordControl() {
    return this.newPasswordForm.get('password');
  }

  get confirmPasswordControl() {
    return this.newPasswordForm.get('confirmPassword');
  }

  get passwordsDoNotMatch(): boolean {
    return (
      this.newPasswordForm.hasError('passwordMismatch') &&
      !!this.confirmPasswordControl?.touched
    );
  }

  // ─────────────────────────────────────────────
  //  STEP 1 — Email: send OTP
  // ─────────────────────────────────────────────

  handleSendCode(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.getRawValue().email;
    this.isLoading.set(true);

    this.authService.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.capturedEmail = email;
        this.expectedOtp = response.data?.otp ?? '';
        this.toast.success(response.message ?? 'OTP sent to your email.');
        this.step.set('otp');
        this.startResendCountdown();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        const message = error.error?.message ?? 'Failed to send reset code. Please try again.';
        this.toast.error(message);
      },
    });
  }

  // ─────────────────────────────────────────────
  //  STEP 2 — OTP verification
  // ─────────────────────────────────────────────

  onOtpChange(value: string): void {
    this.otpValue = value;

    if (!value || value.length === 0) {
      this.otpState.set('empty');
    } else if (value.length < this.otpLength) {
      this.otpState.set('filling');
    } else {
      // Validate against the OTP the API returned
      if (value === this.expectedOtp) {
        this.capturedOtp = value;
        this.otpState.set('success');
        setTimeout(() => this.step.set('new-password'), 600);
      } else {
        this.otpState.set('error');
      }
    }
  }

  resendCode(): void {
    if (this.resendCountdown() > 0 || !this.capturedEmail) return;

    this.authService.resendOtp({ email: this.capturedEmail }).subscribe({
      next: (response) => {
        this.expectedOtp = response.data?.otp ?? '';
        this.toast.success(response.message ?? 'OTP resent successfully.');
        this.startResendCountdown();
      },
      error: (error: HttpErrorResponse) => {
        const message = error.error?.message ?? 'Failed to resend OTP. Please try again.';
        this.toast.error(message);
      },
    });
  }

  private startResendCountdown(seconds = 30): void {
    clearInterval(this.resendTimer);
    this.resendCountdown.set(seconds);

    this.resendTimer = setInterval(() => {
      const remaining = this.resendCountdown();
      if (remaining > 0) {
        this.resendCountdown.update((v) => v - 1);
      } else {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  backToEmail(): void {
    this.otpValue = '';
    this.capturedOtp = '';
    this.expectedOtp = '';
    this.otpState.set('empty');
    this.step.set('email');
    clearInterval(this.resendTimer);
    this.resendCountdown.set(0);
  }

  // ─────────────────────────────────────────────
  //  STEP 3 — New password
  // ─────────────────────────────────────────────

  handleResetPassword(): void {
    if (this.newPasswordForm.invalid) {
      this.newPasswordForm.markAllAsTouched();
      return;
    }

    const { password } = this.newPasswordForm.getRawValue();
    this.isLoading.set(true);

    this.authService
      .resetPassword({
        email: this.capturedEmail,
        otp: this.capturedOtp,
        password,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.toast.success(response.message ?? 'Password reset successfully.');
          this.close();
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          const message = error.error?.message ?? 'Failed to reset password. Please try again.';
          this.toast.error(message);
          // OTP may have been wrong — send user back to OTP step
          this.otpState.set('error');
          this.otpValue = '';
          this.capturedOtp = '';
          this.step.set('otp');
        },
      });
  }

  backToOtp(): void {
    this.newPasswordForm.reset();
    this.step.set('otp');
  }

  // ─────────────────────────────────────────────
  //  Lifecycle
  // ─────────────────────────────────────────────

  ngOnDestroy(): void {
    clearInterval(this.resendTimer);
  }
}

// ─── Validator ───────────────────────────────────────────────────────────────


const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};