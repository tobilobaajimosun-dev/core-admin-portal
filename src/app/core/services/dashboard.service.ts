import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';
import {
  DashboardCardParams,
  DashboardCardsResponse,
  DailyPerformanceResponse,
  RecentLoansParams,
  RecentLoansResponse,
  TransactionsParams,
  TransactionsResponse,
} from '@core/interfaces/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient  = inject(HttpClient);

  getDashboardCards(
    params: DashboardCardParams = {}
  ): Observable<DashboardCardsResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<DashboardCardsResponse>(
      `${this.apiBaseUrl}/api/v1/dashboard?${urlParams}`
    );
  }

  getDailyPerformance(): Observable<DailyPerformanceResponse> {
    return this.httpClient.get<DailyPerformanceResponse>(
      `${this.apiBaseUrl}/api/v1/customers/admin-dashboard/daily-performance`
    );
  }

  getRecentLoanApplications(
    params: RecentLoansParams = {}
  ): Observable<RecentLoansResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<RecentLoansResponse>(
      `${this.apiBaseUrl}/api/v1/customers/recent-loan-application?${urlParams}`
    );
  }

  getTransactionHistories(
    params: TransactionsParams = {}
  ): Observable<TransactionsResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<TransactionsResponse>(
      `${this.apiBaseUrl}/api/v1/customers/list-transaction-histories?${urlParams}`
    );
  }
}