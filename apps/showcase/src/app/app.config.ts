import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TitleStrategy, provideRouter } from '@angular/router';
import { provideRhombusDensity, provideRhombusIcons } from '@rhombuskit/core';
import { provideRhombusThemes } from '@rhombuskit/theme-engine';
import { appRoutes } from './app.routes';
import { COMMUNITY_REGISTERED_THEMES } from './pages/themes/community-themes';
import { RhombusTitleStrategy } from './shared/rhombus-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(appRoutes),
    { provide: TitleStrategy, useClass: RhombusTitleStrategy },
    // Register the community presets so the theme menu reflects them, mode/palette
    // switching works, and the choice persists across reload (Phase 5). Their CSS
    // is injected app-wide in AppComponent.
    provideRhombusThemes(...COMMUNITY_REGISTERED_THEMES),
    // Sample icon set demonstrated on the Icon page. currentColor + no width/
    // height so <rhombus-icon> drives colour and size.
    provideRhombusIcons({
      rhombus:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 22 12 12 22 2 12Z" /></svg>',
      heart:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.5C.5 8 2.5 4.5 6 4.5c2 0 3.3 1 4 2.2.7-1.2 2-2.2 4-2.2 3.5 0 5.5 3.5 4 7-2.5 4.6-10 9.5-10 9.5z" /></svg>',
    }),
    // Passing 'default' explicitly is documentation-by-example: the provider is
    // eager and writes through the injected DOCUMENT, so every prerendered page
    // now emits data-density="default" on <html> — the /density page reflects it
    // and the geometry baseline observes it.
    provideRhombusDensity('default'),
  ],
};
