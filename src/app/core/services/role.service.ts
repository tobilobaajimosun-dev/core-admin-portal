import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateRolePayload,
  DeleteRoleResponse,
  RoleListConfig,
  RoleListResponse,
  RoleResponse,
  UpdateRolePayload,
} from '@core/interfaces/role.model';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  createRole(payload: CreateRolePayload): Observable<RoleResponse> {
    return this.httpClient.post<RoleResponse>(
      `${this.apiBaseUrl}/api/v1/roles`,
      payload
    );
  }
  
  getAllRoles(params: RoleListConfig = {
    page: 1,
    limit: 10
  }): Observable<RoleListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<RoleListResponse>(
      `${this.apiBaseUrl}/api/v1/roles?${urlParams}`
    );
  }

  getRoleById(id: string): Observable<RoleResponse> {
    return this.httpClient.get<RoleResponse>(
      `${this.apiBaseUrl}/api/v1/roles/${id}`
    );
  }

  updateRole(id: string, payload: UpdateRolePayload): Observable<RoleResponse> {
    return this.httpClient.patch<RoleResponse>(
      `${this.apiBaseUrl}/api/v1/roles/${id}`,
      payload
    );
  }

  deleteRole(id: string): Observable<DeleteRoleResponse> {
    return this.httpClient.delete<DeleteRoleResponse>(
      `${this.apiBaseUrl}/api/v1/roles/${id}`
    );
  }
}