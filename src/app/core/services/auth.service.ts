import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LocalStorageService } from './storage';
import { HttpClient } from '@angular/common/http';
import {
  ForgotPasswordPayload,
  LoggedInUser,
  LoginCredentials,
  LoginResponse,
  ResendOtpPayload,
  ResetPasswordResponse,
  ResetPasswordPayload,
  verifyOtpResponse,
  UpdatePasswordPayload,
  UpdatePasswordResponse,
} from '@core/interfaces/auth.model';
import { DynamicObjectType } from '@core/interfaces/generic.model';
import { empty } from '@shared/utils/check-types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';

  private readonly storageService = inject(LocalStorageService);
  private readonly http = inject(HttpClient);

  clearSession(): void {
    try {
      this.storageService.clear();
    } catch (error) { }
  }

  setSession(params: { accessToken: string; user: LoggedInUser }): void {
    if (empty(params)) {
      throw new Error('setSession received invalid parameters');
    }
    this.storageService.setUser(params.user);
    this.storageService.setToken(params.accessToken);
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }

  setToken(token: string): void {
    if (!token) return;
    this.storageService.setToken(token);
  }

  logUserIn(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/api/v1/auth/login`, credentials)
      .pipe(
        tap((response) => {
          const token = response?.data?.accessToken;
          if (token) this.setToken(token);
        })
      );
  }

  verifyOtpCode(userId: string, otp: string): Observable<verifyOtpResponse> {
    return this.http.post<verifyOtpResponse>(
      `${this.apiBaseUrl}/api/v1/${userId}/verify-two-factor-authentication`,
      { otp }
    );
  }

  refreshAccessToken(): Observable<DynamicObjectType> {
    return this.http
      .post<DynamicObjectType>(`${this.apiBaseUrl}/api/v1/refresh-token`, {})
      .pipe(
        tap((response) => {
          const token = response['accessToken'];
          if (token) this.setToken(token);
        })
      );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(
      `${this.apiBaseUrl}/api/v1/auth/forgot-password`,
      payload
    );
  }

  resendOtp(payload: ResendOtpPayload): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(
      `${this.apiBaseUrl}/api/v1/auth/resend-otp`,
      payload
    );
  }

  resetPassword(payload: ResetPasswordPayload): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(
      `${this.apiBaseUrl}/api/v1/auth/reset-password`,
      payload
    );
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<UpdatePasswordResponse> {
    return this.http.patch<UpdatePasswordResponse>(
      `${this.apiBaseUrl}/api/v1/admins/update-password`,
      payload
    );
  }
}