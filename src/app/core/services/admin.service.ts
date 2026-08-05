import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminListParams,
  AdminListResponse,
  AdminResponse,
  CreateAdminPayload,
  UpdateAdminPayload,
} from '@core/interfaces/admin.model';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  createAdmin(payload: CreateAdminPayload): Observable<AdminResponse> {
    return this.httpClient.post<AdminResponse>(
      `${this.apiBaseUrl}/api/v1/admins`, payload);
  }

getAllAdmins(params: AdminListParams = {}): Observable<AdminListResponse> {
  const urlParams = buildURLSearchParams(params);
  return this.httpClient.get<AdminListResponse>(
    `${this.apiBaseUrl}/api/v1/admins?${urlParams}`
  );
}

  getAdminById(id: string): Observable<AdminResponse> {
    return this.httpClient.get<AdminResponse>(
      `${this.apiBaseUrl}/api/v1/admins/${id}`
    );
  }
  
  updateAdmin(id: string, payload: UpdateAdminPayload): Observable<AdminResponse> {
  return this.httpClient.put<AdminResponse>(
    `${this.apiBaseUrl}/api/v1/admins/${id}`,
    payload
  );
}

  deleteAdmin(id: string): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.apiBaseUrl}/api/v1/admins/${id}`
    );
  }
}