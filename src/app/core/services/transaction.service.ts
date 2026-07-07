import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TransactionListParams,
  TransactionListResponse,
  TransactionDetailResponse,
  TransactionMetricsResponse,
  TransactionActionResponse 
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

getTransactionMetrics(): Observable<TransactionMetricsResponse> {
  return this.httpClient.get<TransactionMetricsResponse>(
    `${this.apiBaseUrl}/api/v1/transactions/metrics`
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

getTransactionReceipt(id: string): Observable<HttpResponse<Blob>> {
  return this.httpClient.get(
    `${this.apiBaseUrl}/api/v1/transactions/${id}/receipt`,
    { responseType: 'blob', observe: 'response' }
  );
}

retryTransaction(id: string): Observable<TransactionActionResponse> {
  return this.httpClient.post<TransactionActionResponse>(
    `${this.apiBaseUrl}/api/v1/transactions/${id}/retry`,
    {}
  );
}

refundTransaction(id: string): Observable<TransactionActionResponse> {
  return this.httpClient.post<TransactionActionResponse>(
    `${this.apiBaseUrl}/api/v1/transactions/${id}/refund`,
    {}
  );
}
}