/**
* Copyright (c) 2024 Princeps Credit Systems Limited
*
* This code is the property of Princeps Credit Systems Limited. Unauthorized copying,
* sharing, or use of this code, via any medium, is strictly prohibited
* without express permission from Princeps Credit Systems Limited.
*
* @author     Michael Ashefor
* @license    Proprietary
* @version    1.0.0
* @link       https://www.princepscreditsystemslimited.com
*/

import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, TimeoutError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor that handles server errors.
 *
 * @param request The request object.
 * @param next The next interceptor in the chain.
 *
 * @returns The next Observable.
 */
export const serverErrorInterceptor: HttpInterceptorFn = (request, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    // const messageService = inject(NzMessageService);

    return next(request).pipe(
        catchError((error: Error) => {
            if (error instanceof HttpErrorResponse) {
              if ([HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden].includes(error.status)) {
                const currentUrl = router.url;
                const isAuthPage = currentUrl.startsWith('/login') || currentUrl.startsWith('/otp-page');
                const queryParams = isAuthPage ? {} : { redirectUrl: currentUrl };
                router.navigate(['/login'], { queryParams }).then(() => {
                  authService.clearSession();
                });
              } else if (error.status === HttpStatusCode.BadRequest) {
                // messageService.error(error.error.message);
              }  else if ([HttpStatusCode.NotFound, HttpStatusCode.InternalServerError].includes(error.status)) {
                router.navigateByUrl('/error', {skipLocationChange: true});
              }
              return throwError(() => error);
            } else if (error instanceof TimeoutError) {
              return throwError(() => 'Request Timed out');
            }
            return throwError(() => 'Unknown error');
        }),
    );
};
