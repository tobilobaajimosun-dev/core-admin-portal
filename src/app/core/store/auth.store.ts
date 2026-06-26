import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  LoggedInUser,
  verifyOtpResponse,
} from '@core/interfaces/auth.model';
import { DynamicObjectType } from '@core/interfaces/generic.model';
import { AuthService } from '@core/services/auth.service';
import { LocalStorageService } from '@core/services/storage';
import { empty } from '@pcsl-ui/utils/check-types';
import { tapResponse } from '@ngrx/operators';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

type AuthState = {
  isEnabled: boolean;
  isEnabledOrg: boolean;
  isDeactivating: boolean;
  isLoggedIn: boolean;
  logInSuccess: boolean;
  user: LoggedInUser | null;
  action: string;
  toggleAction: string;
  accessToken: string;
  message: string;
  toggleMessage: string;
  token: string;
  expires_in: number;
  loading: boolean;
  redirectUrl: string;
  errors: DynamicObjectType;
};

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  isDeactivating: false,
  logInSuccess: false,
  isEnabled: false,
  isEnabledOrg: false,
  user: null,
  token: '',
  accessToken: '',
  action: '',
  toggleAction: '',
  message: '',
  toggleMessage: '',
  expires_in: 0,
  loading: false,
  errors: {},
  redirectUrl: '/',
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState<AuthState>(initialAuthState),

  withMethods(
    (
      store,
      service = inject(AuthService),
      toast = inject(PsToastService),
      router = inject(Router),
      storage = inject(LocalStorageService)
    ) => {
      const hasPermission = (permission: string): boolean => {
        const permissions = store.user()?.permissions;
        if (!permissions) return false;
        return permissions.includes(permission);
      };

      const updateReturnUrl = (url: string) => {
        patchState(store, { redirectUrl: url });
      };

      const login = rxMethod<{
        email: string;
        password: string;
        redirectUrl?: string;
      }>(
        pipe(
          switchMap((params) =>
            service.logUserIn(params).pipe(
              tapResponse({
                next: (response) => {
                  const user = response.data.user;
                  const token = response.data.accessToken;

                  patchState(store, {
                    isLoggedIn: true,
                    user,
                    token,
                    accessToken: token,
                    logInSuccess: true,
                  });

                  service.setSession({ accessToken: token, user });

                  const redirectUrl = !empty(store.redirectUrl())
                    ? store.redirectUrl()
                    : !empty(params.redirectUrl)
                      ? params.redirectUrl
                      : '';

                  if (!empty(redirectUrl) && redirectUrl !== 'error') {
                    router.navigateByUrl(redirectUrl!);
                  } else {
                    router.navigate(['/home']);
                  }
                },
                error: (error) => {
                  console.error('Login error:', error);

                  let errorMessage = 'Login failed. Please try again.';
                  let errors = {};

                  if (error instanceof HttpErrorResponse) {
                    // Handle validation errors (422)
                    if (error.status === HttpStatusCode.UnprocessableEntity) {
                      errors = error.error?.errors || {};
                      errorMessage =
                        error.error?.message ||
                        'Please check your input and try again.';
                    }
                    // Handle unauthorized (401)
                    else if (error.status === HttpStatusCode.Unauthorized) {
                      errorMessage = 'Invalid email or password.';
                    }
                    // Handle server errors (500)
                    else if (error.status >= 500) {
                      errorMessage = 'Server error. Please try again later.';
                    }
                    // Handle network errors
                    else if (error.status === 0) {
                      errorMessage =
                        'Network error. Please check your connection.';
                    } else {
                      errorMessage = error.error?.message || errorMessage;
                    }
                  }
                  // Handle errors from fetchUserWithToken (which returns a Promise)
                  else if (error instanceof Error) {
                    errorMessage = 'Failed to fetch user profile. Please try again.';
                  }

                  patchState(store, {
                    ...initialAuthState,
                    errors,
                    message: errorMessage,
                    loading: false,
                  });

                  toast.error(errorMessage);
                },
              })
            )
          )
        )
      );

      const refreshAccessToken = rxMethod(
        pipe(
          switchMap(() =>
            service.refreshAccessToken().pipe(
              tapResponse({
                next: (response) => {
                  const user = store.user()!;
                  const token = response['accessToken'];
                  patchState(store, { token, accessToken: token });
                  service.setSession({ accessToken: token, user });
                },
                error: (error) => {
                  if (error instanceof HttpErrorResponse) {
                    if (error.status === HttpStatusCode.UnprocessableEntity) {
                      patchState(store, { errors: error.error });
                    }
                  }
                },
              })
            )
          )
        )
      );

      const updateAccessToken = (accessToken: string) => {
        patchState(store, { token: accessToken, accessToken });
      };

      const logOut = () => {
        patchState(store, { ...initialAuthState });
        service.clearSession();
        const currentUrl = window.location.pathname + window.location.search;
        const isAuthPage =
          currentUrl.startsWith('/login') || currentUrl.startsWith('/otp-page');
        window.location.replace(
          isAuthPage
            ? '/login'
            : `/login?redirectUrl=${encodeURIComponent(currentUrl)}`
        );
      };

      const changePassword = rxMethod<{ currentPassword: string; newPassword: string }>(
        pipe(
          switchMap((payload) =>
            service.updatePassword(payload).pipe(
              tapResponse({
                next: () => {
                  toast.success('Password changed successfully');
                },
                error: (error) => {
                  let errorMessage = 'Failed to change password. Please try again.';
                  if (error instanceof HttpErrorResponse) {
                    if (error.status === HttpStatusCode.Unauthorized) {
                      errorMessage = 'Current password is incorrect.';
                    } else if (error.status === HttpStatusCode.UnprocessableEntity) {
                      errorMessage = error.error?.message || 'Invalid input.';
                    } else if (error.status >= 500) {
                      errorMessage = 'Server error. Please try again later.';
                    } else {
                      errorMessage = error.error?.message || errorMessage;
                    }
                  }
                  toast.error(errorMessage);
                },
              })
            )
          )
        )
      );

      return {
        hasPermission,
        login,
        logOut,
        updateReturnUrl,
        updateAccessToken,
        refreshAccessToken,
        changePassword
      };
    }
  ),

  withHooks({
    onInit: (store) => {
      const storage = inject(LocalStorageService);
      const token = storage.getToken();
      const user = storage.getUser();

      if (token && user) {

        patchState(store, {
          isLoggedIn: true,
          user,
          token,
          accessToken: token,
        });
      }
    },
  })
);