import { ApplicationConfig, importProvidersFrom, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from '@core/interceptors/jwt.interceptor';
import { demoModeInterceptor } from '@core/interceptors/demo-mode.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([demoModeInterceptor, jwtInterceptor])
    ),
    importProvidersFrom(OverlayModule),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ]
};