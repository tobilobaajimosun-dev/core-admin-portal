import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';
import {
  CustomerDetailResponse,
  CustomerFinancialSummaryResponse,
  CustomerListParams,
  CustomerListResponse,
  CustomerLoanListParams,
  CustomerNeedsActionParams,
  CustomerLoanListResponse,
  CustomerTransactionListParams,
  CustomerTransactionListResponse,
  CustomerMetricsResponse,
  CustomerNeedsActionListResponse,
  CustomerActivityListParams,
  CustomerActivityListResponse,
  CustomerUpdateResponse,
  CustomerUpdatePayload,
  CustomerToggleSuspensionPayload,
  CustomerToggleSuspensionResponse,
  CustomerNeedsActionResolutionResponse,  
} from '@core/interfaces/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  getCustomers(
    params: CustomerListParams = {}
  ): Observable<CustomerListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<CustomerListResponse>(
      `${this.apiBaseUrl}/api/v1/customers/get-all-customers?${urlParams}`
    );
  }

  getCustomerById(id: string): Observable<CustomerDetailResponse> {
    return this.httpClient.get<CustomerDetailResponse>(
      `${this.apiBaseUrl}/api/v1/customers/${id}`
    );
  }

  getFinancialSummary(customerId: string): Observable<CustomerFinancialSummaryResponse> {
    return this.httpClient.get<CustomerFinancialSummaryResponse>(
      `${this.apiBaseUrl}/api/v1/customers/financial-summary/${customerId}`
    );
  }

  getCustomerMetrics(): Observable<CustomerMetricsResponse> {
  return this.httpClient.get<CustomerMetricsResponse>(
    `${this.apiBaseUrl}/api/v1/customers/customer-metrics`
  );
}

  getCustomerLoans(
  customerId: string,
  params: CustomerLoanListParams = {}
): Observable<CustomerLoanListResponse> {
  const urlParams = buildURLSearchParams(params);
  return this.httpClient.get<CustomerLoanListResponse>(
    `${this.apiBaseUrl}/api/v1/customers/view-customer-loan-application/${customerId}?${urlParams}`
  );
}

exportCustomerLoans(
  customerId: string,
  params: Omit<CustomerLoanListParams, 'page' | 'limit'> = {}
): Observable<HttpResponse<Blob>> {
  const urlParams = buildURLSearchParams({ ...params, export: true });
  return this.httpClient.get(
    `${this.apiBaseUrl}/api/v1/customers/view-customer-loan-application/${customerId}?${urlParams}`,
    { responseType: 'blob', observe: 'response' }
  );
}

getCustomerTransactions(
  customerId: string,
  params: CustomerTransactionListParams = {}
): Observable<CustomerTransactionListResponse> {
  const urlParams = buildURLSearchParams(params);
  return this.httpClient.get<CustomerTransactionListResponse>(
    `${this.apiBaseUrl}/api/v1/customers/view-customer-transactions/${customerId}?${urlParams}`
  );
}

exportCustomerTransactions(
  customerId: string,
  params: CustomerTransactionListParams = {}
): Observable<HttpResponse<Blob>> {
  const urlParams = buildURLSearchParams(params);
  return this.httpClient.get(
    `${this.apiBaseUrl}/api/v1/customers/view-customer-transactions/${customerId}?${urlParams}`,
    { responseType: 'blob', observe: 'response' }
  );
}

getNeedsAttention(
  params: CustomerNeedsActionParams = {}
): Observable<CustomerNeedsActionListResponse> {
  const urlParams = buildURLSearchParams(params);
  return this.httpClient.get<CustomerNeedsActionListResponse>(
    `${this.apiBaseUrl}/api/v1/customers/needs-actions?${urlParams}`
  );
}

toggleCustomerSuspension(
  customerId: string,
  payload: CustomerToggleSuspensionPayload
): Observable<CustomerToggleSuspensionResponse> {
  return this.httpClient.patch<CustomerToggleSuspensionResponse>(
    `${this.apiBaseUrl}/api/v1/customers/toggle-suspension/${customerId}`,
    payload
  );
}

getCustomerRecentActivity(
  customerId: string,
  params: CustomerActivityListParams = {}
): Observable<CustomerActivityListResponse> {
  const urlParams = buildURLSearchParams(params);
  return this.httpClient.get<CustomerActivityListResponse>(
    `${this.apiBaseUrl}/api/v1/customers/recent-activity/${customerId}?${urlParams}`
  );
}

exportCustomerActivity(
  customerId: string,
  params: CustomerActivityListParams = {}
): Observable<HttpResponse<Blob>> {
  const urlParams = buildURLSearchParams(params);
  return this.httpClient.get(
    `${this.apiBaseUrl}/api/v1/customers/recent-activity/${customerId}?${urlParams}`,
    { responseType: 'blob', observe: 'response' }
  );
}

exportCustomers(params: CustomerListParams = {}): Observable<HttpResponse<Blob>> {
  const urlParams = buildURLSearchParams(params);
  return this.httpClient.get(
    `${this.apiBaseUrl}/api/v1/customers/export?${urlParams}`,
    { responseType: 'blob', observe: 'response' }
  );
}

updateCustomer(
  customerId: string,
  payload: CustomerUpdatePayload
): Observable<CustomerUpdateResponse> {
  return this.httpClient.put<CustomerUpdateResponse>(
    `${this.apiBaseUrl}/api/v1/customers/${customerId}`,
    payload
  );
}

performNeedsActionResolution(customerId: string): Observable<CustomerNeedsActionResolutionResponse> {
  return this.httpClient.post<CustomerNeedsActionResolutionResponse>(
    `${this.apiBaseUrl}/api/v1/customers/needs-actions/${customerId}/perform-action`,
    {}
  );
}
}