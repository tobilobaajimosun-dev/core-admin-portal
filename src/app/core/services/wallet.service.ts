import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WalletMetricsResponse } from '@core/interfaces/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  getWalletMetrics(): Observable<WalletMetricsResponse> {
    return this.httpClient.get<WalletMetricsResponse>(
      `${this.apiBaseUrl}/api/v1/wallets/metrics`
    );
  }
}