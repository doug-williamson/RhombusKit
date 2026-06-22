import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { RhombusIconRegistry } from './rhombus-icon-registry';

/**
 * A name → inline-SVG-literal map — the shape consumed by
 * {@link provideRhombusIcons}. Identical to a Material `addSvgIconLiteral` map,
 * so an existing Material icon SVG map ports across unchanged.
 */
export type RhombusIconSet = Record<string, string>;

/**
 * Register an icon set with the app's {@link RhombusIconRegistry} so
 * `<rhombus-icon name="…">` can render each entry as an inline SVG.
 *
 * Callable more than once (e.g. a base set plus a feature set); later
 * registrations merge into — and override — earlier ones. Register only static,
 * trusted, bundled SVG strings (see {@link RhombusIconRegistry}).
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [
 *     provideRhombusIcons({
 *       edit: '<svg viewBox="0 0 24 24" fill="currentColor">…</svg>',
 *       delete: '<svg viewBox="0 0 24 24" fill="currentColor">…</svg>',
 *     }),
 *   ],
 * });
 * ```
 */
export function provideRhombusIcons(
  icons: RhombusIconSet
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      inject(RhombusIconRegistry).register(icons);
    }),
  ]);
}
