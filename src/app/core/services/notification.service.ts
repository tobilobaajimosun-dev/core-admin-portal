import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildURLSearchParams } from '@pcsl-ui/utils/strings';
import {
  NotificationMetricsParams,
  NotificationMetricsResponse,
  NotificationHistoryParams,
  NotificationHistoryListResponse,
  NotificationTemplateParams,
  NotificationTemplateListResponse,
  NotificationTemplateUpsertPayload,
  NotificationTemplateUpsertResponse,
  NotificationSendResponse,
  NotificationSendPayload 
} from '@core/interfaces/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  private readonly httpClient = inject(HttpClient);

  getMetrics(
    params: NotificationMetricsParams = {}
  ): Observable<NotificationMetricsResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<NotificationMetricsResponse>(
      `${this.apiBaseUrl}/api/v1/notifications/metrics?${urlParams}`
    );
  }

    getHistory(
    params: NotificationHistoryParams = {}
  ): Observable<NotificationHistoryListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<NotificationHistoryListResponse>(
      `${this.apiBaseUrl}/api/v1/notifications/history?${urlParams}`
    );
  }

   getTemplates(
    params: NotificationTemplateParams = {}
  ): Observable<NotificationTemplateListResponse> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get<NotificationTemplateListResponse>(
      `${this.apiBaseUrl}/api/v1/notifications/templates?${urlParams}`
    );
  }

  createTemplate(
    payload: NotificationTemplateUpsertPayload
  ): Observable<NotificationTemplateUpsertResponse> {
    return this.httpClient.post<NotificationTemplateUpsertResponse>(
      `${this.apiBaseUrl}/api/v1/notifications/templates`,
      payload
    );
  }

 sendNotification(
  payload: NotificationSendPayload
): Observable<NotificationSendResponse> {
  return this.httpClient.post<NotificationSendResponse>(
    `${this.apiBaseUrl}/api/v1/notifications/send`,
    payload
  );
}

  exportHistory(
    params: NotificationHistoryParams = {}
  ): Observable<HttpResponse<Blob>> {
    const urlParams = buildURLSearchParams(params);
    return this.httpClient.get(
      `${this.apiBaseUrl}/api/v1/notifications/history/export?${urlParams}`,
      { responseType: 'blob', observe: 'response' }
    );
  }

}