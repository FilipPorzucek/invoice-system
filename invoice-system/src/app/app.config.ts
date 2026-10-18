import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { authInterceptor } from './features/auth/auth.interceptor';

export function httpTranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),provideAnimationsAsync(), providePrimeNG({
            theme: {
                preset: Aura
            }
        }),
       provideHttpClient(withInterceptors([authInterceptor])),
       provideTranslateService({
         defaultLanguage: 'pl',
         loader: {
           provide: TranslateLoader,
           useFactory: httpTranslateLoaderFactory,
           deps: [HttpClient]
         }
       }),
       provideAppInitializer(() => inject(TranslateService).use('pl'))
  ]
};