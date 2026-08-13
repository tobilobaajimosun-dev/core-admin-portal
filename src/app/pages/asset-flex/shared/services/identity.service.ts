import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@pages/asset-flex/shared/models/generic.model';

const assetFlexApiBaseUrl = import.meta.env['NG_APP_ASSET_FLEX_API_URL'] || 'https://asset-flex-api.princeps.cloud';

export interface Bank {
  bank_code: string;
  name: string;
}

/**
 * Shape actually observed live from `/api/v1/identity/*` — differs from the
 * swagger doc, which claims a `matched: boolean` and a nested `data.data`.
 * In practice there's no `matched` field at all; success/failure is only
 * `status`, with `errorMessage`/`rawResponse` on failure and (per the docs
 * example, unconfirmed live since the sandbox provider keys are invalid in
 * this environment) an identity-detail object under `data` on success.
 */
export interface IdentityVerifyResult {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  errorMessage?: string | null;
  providerCode?: string;
  rawResponse?: Record<string, unknown> | null;
  /** Present on SUCCESS (provider-specific fields), or `{ session_id }` while PENDING. */
  data?: Record<string, unknown> | null;
}

/** Live identity/utility endpoints — bank list, account name resolution, and
 * BVN/NIN verification (`/api/v1/identity/*`, `/api/v1/utilities/*`). All
 * public, no auth required. */
@Injectable({ providedIn: 'root' })
export class IdentityService {
  private readonly http = inject(HttpClient);
  private readonly base = `${assetFlexApiBaseUrl}/api/v1`;

  listBanks(): Observable<ApiResponse<Bank[]>> {
    return this.http.get<ApiResponse<Bank[]>>(`${this.base}/utilities/banks`);
  }

  verifyAccount(accountNumber: string, bankCode: string): Observable<ApiResponse<IdentityVerifyResult>> {
    return this.http.post<ApiResponse<IdentityVerifyResult>>(`${this.base}/identity/account/verify`, {
      account_number: accountNumber,
      bank_code: bankCode,
    });
  }

  /** First call with just `bvn`. If the result comes back PENDING, a
   * `session_id` is in `data.data.session_id` — resubmit with the OTP the
   * vendor received and that session_id to complete the Mono consent flow. */
  verifyBvn(bvn: string, otp?: string, sessionId?: string): Observable<ApiResponse<IdentityVerifyResult>> {
    return this.http.post<ApiResponse<IdentityVerifyResult>>(`${this.base}/identity/bvn/verify`, {
      bvn,
      ...(otp ? { otp } : {}),
      ...(sessionId ? { session_id: sessionId } : {}),
    });
  }

  verifyNin(nin: string): Observable<ApiResponse<IdentityVerifyResult>> {
    return this.http.post<ApiResponse<IdentityVerifyResult>>(`${this.base}/identity/nin/verify`, { nin });
  }
}
