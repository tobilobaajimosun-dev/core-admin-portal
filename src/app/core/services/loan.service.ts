import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LoanListParams,
  LoanListResponse,
  LoanMetricsResponse,
  FailedDisbursementListParams,
  FailedDisbursementListResponse,
  RepaymentDueListResponse,
  RepaymentDueListParams,
  LoanDetailResponse,
} from '@core/interfaces/loan.model';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  getLoans(params: LoanListParams = { page: 1, limit: 10 }): Observable<LoanListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<LoanListResponse>(
      `${this.apiBaseUrl}/api/v1/loan-applications/fetch-paginated-loan-applications?${urlParams}`
    );
  }

  getLoanMetrics(): Observable<LoanMetricsResponse> {
    return this.httpClient.get<LoanMetricsResponse>(
      `${this.apiBaseUrl}/api/v1/loan-applications/loan-metrics`
    );
  }

  getFailedDisbursements(
    params: FailedDisbursementListParams = { page: 1, limit: 10 }
  ): Observable<FailedDisbursementListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<FailedDisbursementListResponse>(
      `${this.apiBaseUrl}/api/v1/loan-applications/failed-disbursements?${urlParams}`
    );
  }

  getRepaymentsDueToday(
    params: RepaymentDueListParams = { page: 1, limit: 10 }
  ): Observable<RepaymentDueListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<RepaymentDueListResponse>(
      `${this.apiBaseUrl}/api/v1/loan-applications/repayments-due-today?${urlParams}`
    );
  }

  getLoanById(id: string): Observable<LoanDetailResponse> {
    return this.httpClient.get<LoanDetailResponse>(
      `${this.apiBaseUrl}/api/v1/loan-applications/${id}`
    );
  }

  // ── Export ──────────────────────────────────────────────────────────────
  // Note: this endpoint only supports page, limit, search, status, start_date,
  // end_date — no custom_range/tenor/product/min_amount/max_amount.
  getLoanExport(
    params: Pick<LoanListParams, 'page' | 'limit' | 'search' | 'status' | 'start_date' | 'end_date'> = {}
  ): Observable<HttpResponse<Blob>> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get(
      `${this.apiBaseUrl}/api/v1/loan-applications/export?${urlParams}`,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }
}