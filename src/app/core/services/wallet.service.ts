import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';
import {
  WalletMetricsResponse,
  WalletListParams,
  WalletListResponse,
  WalletDetailResponse,
  WalletAdjustParams,
  WalletAdjustResponse,
  WalletStatusUpdateParams,
  WalletStatusUpdateResponse,
  TopFundedWalletsResponse,
} from '@core/interfaces/wallet.model';


@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  getWalletMetrics(params: { start_date?: string; end_date?: string; }): Observable<WalletMetricsResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<WalletMetricsResponse>(
      `${this.apiBaseUrl}/api/v1/wallets/metrics?${urlParams}`
    );
  }

  getWallets(params: WalletListParams = {}): Observable<WalletListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<WalletListResponse>(
      `${this.apiBaseUrl}/api/v1/wallets/fetch-paginated-wallets?${urlParams}`
    );
  }

  exportWallets(params: WalletListParams = {}): Observable<HttpResponse<Blob>> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get(
      `${this.apiBaseUrl}/api/v1/wallets/export?${urlParams}`,
      { responseType: 'blob', observe: 'response' }
    );
  }

  getWalletById(id: string): Observable<WalletDetailResponse> {
  return this.httpClient.get<WalletDetailResponse>(
    `${this.apiBaseUrl}/api/v1/wallets/${id}`
  );
}

adjustWalletBalance(id: string, params: WalletAdjustParams): Observable<WalletAdjustResponse> {
  return this.httpClient.post<WalletAdjustResponse>(
    `${this.apiBaseUrl}/api/v1/wallets/${id}/adjust`,
    params
  );
}

updateWalletStatus(id: string, params: WalletStatusUpdateParams): Observable<WalletStatusUpdateResponse> {
  return this.httpClient.patch<WalletStatusUpdateResponse>(
    `${this.apiBaseUrl}/api/v1/wallets/${id}/status`,
    params
  );
}

getTopFundedWallets(): Observable<TopFundedWalletsResponse> {
  return this.httpClient.get<TopFundedWalletsResponse>(
    `${this.apiBaseUrl}/api/v1/wallets/top-five-wallets`
  );
}
}