import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '@pages/asset-flex/shared/models/generic.model';
import { Loan, UpdateLoanStatusPayload } from '../models/loan.model';

const assetFlexApiBaseUrl = import.meta.env['NG_APP_ASSET_FLEX_API_URL'] || 'https://asset-flex-api.princeps.cloud';

export interface LoanListParams {
  vendor_id?: string;
  customer_id?: string;
  status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly http = inject(HttpClient);
  private readonly base = `${assetFlexApiBaseUrl}/api/v1/admin/loans`;

  list(params: LoanListParams = {}): Observable<PaginatedResponse<Loan>> {
    let httpParams = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') httpParams = httpParams.set(k, String(v));
    }
    return this.http.get<PaginatedResponse<Loan>>(this.base, { params: httpParams });
  }

  getOne(id: string): Observable<ApiResponse<Loan>> {
    return this.http.get<ApiResponse<Loan>>(`${this.base}/${id}`);
  }

  updateStatus(id: string, payload: UpdateLoanStatusPayload): Observable<ApiResponse<Loan>> {
    return this.http.patch<ApiResponse<Loan>>(`${this.base}/${id}/status`, payload);
  }
}
