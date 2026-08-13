import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginatedSearchParams } from '@pages/asset-flex/shared/models/generic.model';
import {
  RejectVendorKycPayload,
  UpdateVendorStatusPayload,
  Vendor,
  VendorDocument,
} from '../models/vendor.model';

const assetFlexApiBaseUrl = import.meta.env['NG_APP_ASSET_FLEX_API_URL'] || 'https://asset-flex-api.princeps.cloud';

export interface OnboardVendorPayload {
  business_name: string;
  contact_email: string;
  password: string;
  contact_phone: string;
  settlement_bank_code: string;
  settlement_account_number: string;
  settlement_account_name: string;
  webhook_url?: string;
  platform_fee_percentage?: number;
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${assetFlexApiBaseUrl}/api/v1/admin/vendors`;
  private readonly onboardUrl = `${assetFlexApiBaseUrl}/api/v1/vendors/onboard`;

  /** POST /api/v1/vendors/onboard — self-service or admin vendor creation.
   * Live-verified: despite the swagger doc claiming a minimal snake_case
   * response, it actually returns the full camelCase Vendor record (plus
   * a passwordHash field we ignore), so no getOne(id) follow-up is needed. */
  onboard(payload: OnboardVendorPayload): Observable<ApiResponse<Vendor>> {
    return this.http.post<ApiResponse<Vendor>>(this.onboardUrl, payload);
  }

  /** GET /api/v1/admin/vendors — params: status, search, page, limit. */
  list(params: PaginatedSearchParams = {}, context?: HttpContext): Observable<PaginatedResponse<Vendor>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return this.http.get<PaginatedResponse<Vendor>>(this.base, { params: httpParams, context });
  }

  getOne(id: string): Observable<ApiResponse<Vendor>> {
    return this.http.get<ApiResponse<Vendor>>(`${this.base}/${id}`);
  }

  getDocuments(id: string): Observable<ApiResponse<VendorDocument[]>> {
    return this.http.get<ApiResponse<VendorDocument[]>>(`${this.base}/${id}/documents`);
  }

  approve(id: string): Observable<ApiResponse<Vendor>> {
    return this.http.post<ApiResponse<Vendor>>(`${this.base}/${id}/approve`, {});
  }

  rejectKyc(id: string, payload: RejectVendorKycPayload): Observable<ApiResponse<Vendor>> {
    return this.http.post<ApiResponse<Vendor>>(`${this.base}/${id}/kyc/reject`, payload);
  }

  blacklist(id: string): Observable<ApiResponse<Vendor>> {
    return this.http.post<ApiResponse<Vendor>>(`${this.base}/${id}/blacklist`, {});
  }

  updateStatus(id: string, payload: UpdateVendorStatusPayload): Observable<ApiResponse<Vendor>> {
    return this.http.patch<ApiResponse<Vendor>>(`${this.base}/${id}/status`, payload);
  }

  assignProducts(id: string, loanProductIds: string[]): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/${id}/assign-products`, {
      loan_product_ids: loanProductIds,
    });
  }
}

