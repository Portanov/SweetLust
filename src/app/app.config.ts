import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { MyPreset } from './assets/themes/my_theme';
import { provideHttpClient } from '@angular/common/http';
import { authInterceptor } from './assets/interceptors/auth/auth.interceptor';
import { withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { provideLucideIcons, LucidePanelLeftOpen, LucidePanelLeftClose } from '@lucide/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor])),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: MyPreset,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng'
          },
          darkModeSelector: false || 'none'
        }
      }
    }),
    provideAnimationsAsync(),
    provideAnimations(),
    provideRouter(routes),
    MessageService,
    ConfirmationService,
    provideLucideIcons(
      LucidePanelLeftOpen,
      LucidePanelLeftClose,
    ),
  ]
};
