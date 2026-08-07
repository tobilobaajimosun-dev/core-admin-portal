import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@pages/asset-flex/shared/models/generic.model';
import { CreateRolePayload, Role, UpdateRolePayload } from '../models/role.model';

const assetFlexApiBaseUrl = import.meta.env['NG_APP_ASSET_FLEX_API_URL'] || 'https://asset-flex-api.princeps.cloud';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly base = `${assetFlexApiBaseUrl}/api/v1/admin/roles`;

  list(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.base);
  }

  create(payload: CreateRolePayload): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.base, payload);
  }

  update(id: string, payload: UpdateRolePayload): Observable<ApiResponse<Role>> {
    return this.http.patch<ApiResponse<Role>>(`${this.base}/${id}`, payload);
  }
}
