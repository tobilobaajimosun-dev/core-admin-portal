import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LoanListParams,
  LoanListResponse,
} from '@core/interfaces/loan.model';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  getLoans(
    params: LoanListParams = { page: 1, limit: 10 }
  ): Observable<LoanListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<LoanListResponse>(
      `${this.apiBaseUrl}/api/v1/loan-applications/fetch-paginated-loan-applications?${urlParams}`
    );
  }
}