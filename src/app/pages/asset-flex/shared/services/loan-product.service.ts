import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@pages/asset-flex/shared/models/generic.model';
import {
  CaltosCatalogItem,
  CreateLoanProductPayload,
  LoanProduct,
  ProviderRule,
  UpdateLoanProductPayload,
} from '../models/loan-product.model';

const assetFlexApiBaseUrl = import.meta.env['NG_APP_ASSET_FLEX_API_URL'] || 'https://asset-flex-api.princeps.cloud';

export interface LinkedPaymentMethod {
  id?: string;
  provider_code?: string;
  payment_type?: string;
  collection_method?: string;
  is_required?: boolean;
  priority_order?: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class LoanProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${assetFlexApiBaseUrl}/api/v1/loan-products`;

  list(): Observable<ApiResponse<LoanProduct[]>> {
    return this.http.get<ApiResponse<LoanProduct[]>>(this.base);
  }

  getOne(id: string): Observable<ApiResponse<LoanProduct>> {
    return this.http.get<ApiResponse<LoanProduct>>(`${this.base}/${id}`);
  }

  create(payload: CreateLoanProductPayload): Observable<ApiResponse<LoanProduct>> {
    return this.http.post<ApiResponse<LoanProduct>>(this.base, payload);
  }

  update(id: string, payload: UpdateLoanProductPayload): Observable<ApiResponse<LoanProduct>> {
    return this.http.patch<ApiResponse<LoanProduct>>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }

  setAutoDisburse(id: string, autoDisburse: boolean): Observable<ApiResponse<LoanProduct>> {
    return this.http.patch<ApiResponse<LoanProduct>>(`${this.base}/${id}/auto-disburse`, { autoDisburse });
  }

  caltosCatalog(): Observable<ApiResponse<CaltosCatalogItem[]>> {
    // The catalog endpoint returns a bare array (not the standard { data } envelope),
    // so normalise both shapes into ApiResponse.data for consistent consumption.
    return this.http
      .get<ApiResponse<CaltosCatalogItem[]> | CaltosCatalogItem[]>(`${this.base}/caltos-catalog`)
      .pipe(
        map((res) => {
          const data = Array.isArray(res) ? res : (res?.data ?? []);
          return { status: 'success', message: 'OK', data };
        }),
      );
  }

  listPaymentMethods(id: string): Observable<ApiResponse<LinkedPaymentMethod[]>> {
    return this.http.get<ApiResponse<LinkedPaymentMethod[]>>(`${this.base}/${id}/payment-methods`);
  }

  addPaymentMethod(id: string, rule: ProviderRule): Observable<ApiResponse<LinkedPaymentMethod>> {
    return this.http.post<ApiResponse<LinkedPaymentMethod>>(`${this.base}/${id}/payment-methods`, rule);
  }

  removePaymentMethod(id: string, methodId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/payment-methods/${methodId}`);
  }
}
