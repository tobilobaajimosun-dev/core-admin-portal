import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AppPreferenceService } from '@core/services/app-preference.service';

export const appChosenGuard: CanMatchFn = () => {
  const router = inject(Router);
  const appPreference = inject(AppPreferenceService);

  if (appPreference.getActiveApp()) {
    return true;
  }

  return router.createUrlTree(['/select-app']);
};
