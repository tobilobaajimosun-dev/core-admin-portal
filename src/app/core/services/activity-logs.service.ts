import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActivityLog,
  ActivityLogPagination,
  ListActivityLogsConfig,
} from '@core/interfaces/activity-logs.model';

export interface ActivityLogsResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data: {
    items:      ActivityLog[];
    pagination: ActivityLogPagination;
  };
  responseCode: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityLogsService {
  private http       = inject(HttpClient);
  private apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';

  fetchActivityLogs(
    listConfig: ListActivityLogsConfig
  ): Observable<ActivityLogsResponse> {
    // Strip undefined keys so they don't appear as empty query params
    const params = Object.fromEntries(
      Object.entries(listConfig).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ) as Record<string, string | number>;

    return this.http.get<ActivityLogsResponse>(
      `${this.apiBaseUrl}/api/v1/admin-logs`,
      { params }
    );
  }
}