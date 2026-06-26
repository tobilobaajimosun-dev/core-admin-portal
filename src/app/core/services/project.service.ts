import { inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs/operators';
import {
  HttpBackend,
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import {
  FileMetadata,
  PresignedUrlResponse,
  ROUTEMODULES,
} from '@core/interfaces/generic.model';
import { Observable, from, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class MainService {
  apiBaseUrl = import.meta.env['NG_APP_API_URL'] || '';
  uploadProgress = signal(0);
  private httpClient = inject(HttpClient);
  private httpBackend = inject(HttpBackend);
  private httpClientBypassInterceptors = new HttpClient(this.httpBackend);
    
  // ─── File upload ───

  generatePresignedUrl(metaData: FileMetadata): Observable<PresignedUrlResponse> {
    return this.httpClient.post<PresignedUrlResponse>(
      `${this.apiBaseUrl}/api/v1/generate-presigned-url`,
      metaData
    );
  }

  uploadFileToPresignedUrl(file: File, presignedUrl: string): Observable<any> {
    return from(file.arrayBuffer()).pipe(
      switchMap((buffer) => {
        const request = new HttpRequest('PUT', presignedUrl, buffer, {
          reportProgress: true,
          headers: new HttpHeaders({ 'Content-Type': file.type }),
        });
        return this.httpClientBypassInterceptors.request(request);
      })
    );
  }

  private getEventMessage(event: HttpEvent<any>, file: File): string {
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading file "${file.name}" of size ${file.size}.`;
      case HttpEventType.UploadProgress: {
        const percentDone = event.total
          ? Math.round((100 * event.loaded) / event.total)
          : 0;
        this.uploadProgress.set(percentDone);
        return `File "${file.name}" is ${percentDone}% uploaded.`;
      }
      case HttpEventType.Response:
        return `File "${file.name}" was completely uploaded!`;
      default:
        return `File "${file.name}" surprising upload event: ${event.type}.`;
    }
  }

}