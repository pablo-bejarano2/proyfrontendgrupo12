import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { TokenInterceptorService } from './services/token-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), // proveedores de animaciones requeridas
    provideToastr({
      tapToDismiss: true,
      progressBar: true,
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }), // proveedores de Toastr
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService, // Interceptor para agregar el token a las pet
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
