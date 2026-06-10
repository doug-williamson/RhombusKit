import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TitleStrategy, provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { RhombusTitleStrategy } from './shared/rhombus-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(appRoutes),
    { provide: TitleStrategy, useClass: RhombusTitleStrategy },
  ],
};
