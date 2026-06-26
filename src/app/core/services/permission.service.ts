import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreatePermissionPayload,
  GroupedPermissionResponse,
  PermissionListConfig,
  PermissionListResponse,
  PermissionResponse,
} from '@core/interfaces/permission.model';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  createPermission(payload: CreatePermissionPayload): Observable<PermissionResponse> {
    return this.httpClient.post<PermissionResponse>(
      `${this.apiBaseUrl}/api/v1/permissions`,
      payload
    );
  }

  getAllPermissions(params: PermissionListConfig = {}): Observable<PermissionListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<PermissionListResponse>(
      `${this.apiBaseUrl}/api/v1/permissions?${urlParams}`
    );
  }

  getGroupedPermissions(): Observable<GroupedPermissionResponse> {
    return this.httpClient.get<GroupedPermissionResponse>(
      `${this.apiBaseUrl}/api/v1/permissions/grouped`
    );
  }
}