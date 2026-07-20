import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankListResponse } from '@core/interfaces/bank.model';

@Injectable({ providedIn: 'root' })
export class BankService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  getBanks(): Observable<BankListResponse> {
    return this.httpClient.get<BankListResponse>(
      `${this.apiBaseUrl}/api/v1/banks`
    );
  }
}