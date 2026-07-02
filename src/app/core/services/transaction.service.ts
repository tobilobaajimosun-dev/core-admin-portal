import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TransactionListParams,
  TransactionListResponse,
  TransactionDetailResponse,
  TransactionMetricsResponse
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
}