import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@pages/asset-flex/shared/models/generic.model';
import { IdentityProvider, UtilityProvider } from '../models/provider.model';

const assetFlexApiBaseUrl = import.meta.env['NG_APP_ASSET_FLEX_API_URL'] || 'https://asset-flex-api.princeps.cloud';

@Injectable({ providedIn: 'root' })
export class IdentityProviderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${assetFlexApiBaseUrl}/api/v1/admin/identity-providers`;

  list(): Observable<ApiResponse<IdentityProvider[]>> {
    return this.http.get<ApiResponse<IdentityProvider[]>>(this.base);
  }

  setDefault(code: string): Observable<ApiResponse<IdentityProvider>> {
    return this.http.patch<ApiResponse<IdentityProvider>>(`${this.base}/${code}/set-default`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class UtilityProviderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${assetFlexApiBaseUrl}/api/v1/admin/utilities/providers`;

  list(): Observable<ApiResponse<UtilityProvider[]>> {
    return this.http.get<ApiResponse<UtilityProvider[]>>(this.base);
  }

  setDefault(code: string): Observable<ApiResponse<UtilityProvider>> {
    return this.http.patch<ApiResponse<UtilityProvider>>(`${this.base}/${code}/set-default`, {});
  }
}
