import {
  DOCUMENT,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type EnvironmentProviders,
} from '@angular/core';
import { RHOMBUS_DENSITY } from './rhombus-density.tokens';
import { RhombusDensityService } from './rhombus-density.service';
import type { RhombusDensity } from './density.types';

/**
 * Set the app-wide density once at bootstrap.
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideRhombusDensity('compact')],
 * });
 * ```
 *
 * Omit it entirely and the app is byte-identical to before: no attribute is
 * written, so no `[data-density]` block matches and the generated `:root` values
 * apply unchanged.
 *
 * Register it in `bootstrapApplication`'s providers. Registering it in a route's
 * providers does **not** work — density is one attribute on `<html>`, so there
 * is nothing per-route about it — and a dev-mode warning fires if you try. To
 * scope density to a subtree, set the `data-density` attribute yourself.
 *
 * **Material-backed components additionally require the opt-in bridge mixin**,
 * which is where their geometry is wired:
 *
 * ```scss
 * :root { @include rhombus.material-bridge(); }
 * ```
 *
 * Without it, `provideRhombusDensity()` still moves RhombusKit's own bespoke
 * components but no-ops on every Material-backed one.
 */
export function provideRhombusDensity(mode: RhombusDensity): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: RHOMBUS_DENSITY, useValue: mode },
    // RhombusDensityService is providedIn:'root', and Angular builds root
    // services LAZILY. Without this initializer nothing ever injects it, the
    // attribute is never written, and every level is a silent no-op. The
    // initializer runs when the environment injector is created — on the server
    // too, so prerendered HTML carries the level.
    //
    // provideEnvironmentInitializer, not the raw ENVIRONMENT_INITIALIZER token,
    // which is deprecated from v19.
    provideEnvironmentInitializer(() => {
      const service = inject(RhombusDensityService);
      if (isDevMode()) {
        if (inject(RHOMBUS_DENSITY) !== service.density()) {
          // The same failure class as an inert provider, recurring at a
          // different scope: registered somewhere its token can never reach the
          // root service. inject(RHOMBUS_DENSITY) resolves in the injector where
          // the provider was registered; service.density() came from the root
          // injector, so a mismatch IS the silently-ignored case.
          console.warn(
            '[RhombusKit] provideRhombusDensity() was registered in a child ' +
              'injector (a route, or a lazily-created environment injector) ' +
              'and has been ignored. Register it at bootstrap, or scope ' +
              'density to a subtree with the data-density attribute.'
          );
        }
        warnOnMaterialDensity(inject(DOCUMENT));
      }
    }),
  ]);
}

/**
 * One-shot coexistence probe. `--mat-checkbox-state-layer-size` is emitted by
 * `mat.theme((density: N))` only when `N !== 0`, and RhombusKit declares that
 * name nowhere, so a non-empty value at the document root proves a Material
 * density scale is active alongside ours — with no false positives by
 * construction. Dev-mode only: one `getComputedStyle` read at app init.
 */
function warnOnMaterialDensity(doc: Document): void {
  // Injected DOCUMENT, never the `document` global: this runs at prerender too.
  //
  // Note what `defaultView` does and does not tell you here. Under
  // @angular/platform-server the document comes from domino, which DOES set
  // `document.defaultView` and DOES provide `getComputedStyle` — but its
  // implementation returns the element's inline style declaration, so the probe
  // reads '' and the function falls out at the `!probe` check below. So this is
  // a capability check, not a server/browser discriminator: it costs one cheap
  // read on the server and correctly reports nothing, because a stylesheet-based
  // Material density scale is not observable there in the first place.
  const view = doc.defaultView;
  if (typeof view?.getComputedStyle !== 'function') return;
  const probe = view
    .getComputedStyle(doc.documentElement)
    .getPropertyValue('--mat-checkbox-state-layer-size')
    .trim();
  if (!probe) return;
  console.warn(
    '[RhombusKit] A Material density scale (mat.theme((density: …)) or ' +
      'mat.all-component-densities()) is active alongside ' +
      'provideRhombusDensity(). The two emit competing values for the same ' +
      'components. Remove the Material density and use provideRhombusDensity() ' +
      'alone. See ' +
      'https://github.com/doug-williamson/RhombusKit/blob/main/docs/theming.md#migrating-from-mat-density'
  );
}
