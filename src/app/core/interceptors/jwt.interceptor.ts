import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  Observable,
  switchMap,
  throwError,
  filter,
  take,
  finalize,
  BehaviorSubject
} from 'rxjs';
import { LoaderService } from '@core/services/loader.service';
import { AuthStore } from '@core/store/auth.store';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';
import { AuthService } from '@core/services/auth.service';
import { CUSTOM_ERROR_MESSAGE, SILENT_ERROR, SKIP_INTERCEPTOR, SKIP_LOADER } from './token';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);
  const toaster = inject(PsToastService);

  // 1. Early Exit: Skip everything if requested
  if (request.context.get(SKIP_INTERCEPTOR)) {
    return next(request);
  }

  // 2. Loader Management
  const shouldShowLoader = !request.context.get(SKIP_LOADER);
  if (shouldShowLoader) {
    loaderService.show();
  }

  // 3. Token Injection Helper
  const addToken = (req: HttpRequest<unknown>, token: string) => {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  };

  // 4. Attach Token if Available
  const token = authService.getToken() || authStore.token();
  if (authStore.isLoggedIn() && token) {
    request = addToken(request, token);
  }

 // 5. 401 Handling Logic 
const handle401Error = (
  req: HttpRequest<unknown>,
  nextFn: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshAccessToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        const newToken = response['accessToken'] as string;
        refreshTokenSubject.next(newToken);
        return nextFn(addToken(req, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authStore.logOut();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((newToken) => nextFn(addToken(req, newToken!)))
    );
  }
};

  // 6. General Error UI Logic
  const handleOtherErrors = (error: HttpErrorResponse) => {

    // Check for silent error handling to avoid showing toasts
    if (request.context.get(SILENT_ERROR)) {
      return; // EXIT: Do not show any toast
    }

    // Check for custom error message to display instead of default error message from server
    const customMessage = request.context.get(CUSTOM_ERROR_MESSAGE);

    // Determine the error message to display
    const errorMessage = customMessage || error.error?.message || error.statusText || 'Unknown error';

    switch (error.status) {
      case HttpStatusCode.BadRequest:
      case HttpStatusCode.Forbidden:
      case HttpStatusCode.UnprocessableEntity:
        toaster.error(errorMessage);
        break;
      case HttpStatusCode.NotFound:
        toaster.error('The requested resource was not found. Please contact support if the issue persists.');
        break;
      case HttpStatusCode.InternalServerError:
        toaster.error('Server error. Please try again later.');
        break;
      default:
        if (error.status !== 0) toaster.error(errorMessage);
    }
  };

  return next(request).pipe(
    catchError((error) => {
      // Handle 401s specifically
      if (
        error instanceof HttpErrorResponse &&
        error.status === HttpStatusCode.Unauthorized &&
        !request.url.includes('/refresh-token')
      ) {
        return handle401Error(request, next);
      }

      // Handle other UI errors
      if (error instanceof HttpErrorResponse) {
        handleOtherErrors(error);
      }

      // Re-throw so the component knows it failed
      return throwError(() => error);
    }),
    finalize(() => {
      if (shouldShowLoader) {
        loaderService.hide();
      }
    })
  );
};