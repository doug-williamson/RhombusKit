import { InjectionToken } from '@angular/core';
import type { RhombusDensity } from './density.types';

/**
 * The bootstrap density level.
 *
 * Caller-trusted: no runtime validation, matching the stance `RHOMBUS_THEME_CONFIG`
 * already takes. The factory default means an app that never calls
 * `provideRhombusDensity()` resolves `'default'` — but note that nothing
 * *constructs* the service in that case, so no attribute is written at all and
 * the generated `:root` values apply unchanged.
 */
export const RHOMBUS_DENSITY = new InjectionToken<RhombusDensity>('RHOMBUS_DENSITY', {
  providedIn: 'root',
  factory: () => 'default',
});
