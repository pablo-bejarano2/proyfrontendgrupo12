import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

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
    provideHttpClient(), provideCharts(withDefaultRegisterables()),
  ]
};
