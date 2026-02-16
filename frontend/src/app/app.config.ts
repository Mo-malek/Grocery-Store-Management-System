import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { JwtInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimations(),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
};
