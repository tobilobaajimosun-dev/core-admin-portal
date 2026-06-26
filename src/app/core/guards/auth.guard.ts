import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthStore } from '@core/store/auth.store';

type AuthGuardOptions = {
  requiresAuthentication: boolean;
};

const defaultAuthGuardOptions = (): AuthGuardOptions => ({
  requiresAuthentication: true,
});

export const authGuard = (options: AuthGuardOptions = defaultAuthGuardOptions()): CanMatchFn => {
  return (_: Route, segments: UrlSegment[]) => {
    const router = inject(Router);
    const authStore = inject(AuthStore);

    const redirectUrl = segments.map((segment) => segment.path).join('/');
    authStore.updateReturnUrl(redirectUrl);

    if (options.requiresAuthentication === authStore.isLoggedIn()) {
      return true;
    }

    return options.requiresAuthentication
      ? router.createUrlTree(['/login'], {
          queryParams: { redirectUrl: segments.map((s) => s.path).join('/') },
        })
      : router.createUrlTree(['/']);
  };
};