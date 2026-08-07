import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@pages/asset-flex/shared/models/generic.model';
import { MarkSettledPayload, MarkSettledResult, Settlement, T1CutoffResult } from '../models/settlement.model';

const assetFlexApiBaseUrl = import.meta.env['NG_APP_ASSET_FLEX_API_URL'] || 'https://asset-flex-api.princeps.cloud';

@Injectable({ providedIn: 'root' })
export class SettlementService {
  private readonly http = inject(HttpClient);
  private readonly base = `${assetFlexApiBaseUrl}/api/v1/admin/settlements`;

  list(status?: string): Observable<ApiResponse<Settlement[]>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<Settlement[]>>(this.base, { params });
  }

  markSettled(payload: MarkSettledPayload): Observable<ApiResponse<MarkSettledResult>> {
    return this.http.post<ApiResponse<MarkSettledResult>>(`${this.base}/mark-settled`, payload);
  }

  triggerT1Cutoff(): Observable<ApiResponse<T1CutoffResult>> {
    return this.http.post<ApiResponse<T1CutoffResult>>(`${this.base}/trigger-t1-cutoff`, {});
  }
}
