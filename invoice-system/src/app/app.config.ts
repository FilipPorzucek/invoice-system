import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

import { routes } from './app.routes';
import { authInterceptor } from './features/auth/auth.interceptor';

export function httpTranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

const SofPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),provideAnimationsAsync(), providePrimeNG({
            theme: {
                preset: SofPreset,
                options: {
                    darkModeSelector: '.app-dark-mode'
                }
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