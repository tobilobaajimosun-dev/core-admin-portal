import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TransactionListParams,
  TransactionListResponse,
  TransactionDetailResponse,
  TransactionMetricsResponse,
  TransactionActionResponse,
  TransactionRefundPayload,
  TransactionReceiptResponse
} from '@core/interfaces/transaction.model';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  getTransactions(
    params: TransactionListParams = { page: 1, limit: 10 }
  ): Observable<TransactionListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<TransactionListResponse>(
      `${this.apiBaseUrl}/api/v1/transactions/fetch-paginated-transactions?${urlParams}`
    );
  }

  getTransactionById(id: string): Observable<TransactionDetailResponse> {
    return this.httpClient.get<TransactionDetailResponse>(
      `${this.apiBaseUrl}/api/v1/transactions/${id}`
    );
  }

  getTransactionMetrics(params: { start_date?: string; end_date?: string; }): Observable<TransactionMetricsResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<TransactionMetricsResponse>(
      `${this.apiBaseUrl}/api/v1/transactions/metrics?${urlParams}`
    );
  }

  getTransactionExport(
    params: TransactionListParams = {}
  ): Observable<HttpResponse<Blob>> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get(
      `${this.apiBaseUrl}/api/v1/transactions/export?${urlParams}`,
      { responseType: 'blob', observe: 'response' }
    );
  }


  getTransactionReceipt(id: string): Observable<TransactionReceiptResponse> {
  return this.httpClient .get<TransactionReceiptResponse>(
    `${this.apiBaseUrl}/api/v1/transactions/${id}/receipt`
  );
}

  retryTransaction(id: string): Observable<TransactionActionResponse> {
    return this.httpClient.post<TransactionActionResponse>(
      `${this.apiBaseUrl}/api/v1/transactions/${id}/requery`,
      {}
    );
  }

  refundTransaction(
    payload: TransactionRefundPayload
  ): Observable<TransactionActionResponse> {
    return this.httpClient.post<TransactionActionResponse>(
      `${this.apiBaseUrl}/api/v1/transactions/refund`,
      payload
    );
  }
}