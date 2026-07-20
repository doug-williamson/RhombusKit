import {
  DOCUMENT,
  Injectable,
  effect,
  inject,
  signal,
  type WritableSignal,
} from '@angular/core';
import { RHOMBUS_DENSITY } from './rhombus-density.tokens';
import type { RhombusDensity } from './density.types';

/** The attribute density is published on. Public so tests and docs share one spelling. */
export const DENSITY_ATTRIBUTE = 'data-density';

/**
 * Writes the app-wide density level onto `<html>` as `data-density`.
 *
 * Constructed **eagerly** by `provideRhombusDensity()`'s environment
 * initializer — not lazily on first `inject()`. A `providedIn: 'root'` service
 * that nobody injects is never built, and there is no density UI component
 * whose rendering would construct it by accident, so without the initializer
 * every level would be a silent no-op.
 *
 * Runs on the **server** as well as the browser, deliberately. Unlike the theme
 * preference — a per-user localStorage value, unknowable at prerender, which is
 * why theming needs a pre-paint init script — density is a bootstrap constant
 * supplied through DI, so the correct value is already known at prerender time.
 * Writing it through the injected document bakes it into the emitted HTML, so a
 * static build paints at the right density and the browser's identical write on
 * hydration is a no-op. An `isPlatformBrowser` guard here would trade that for a
 * hydration-time layout shift, which is why there is none.
 */
@Injectable({ providedIn: 'root' })
export class RhombusDensityService {
  /**
   * The DOM to write to. Injected, never the `document` global — this service
   * runs during prerender, where that global does not exist and where writes to
   * the injected document are what get serialised into the emitted HTML.
   */
  private readonly document = inject(DOCUMENT);

  /** Live density level. Writable: set it to switch at runtime. */
  readonly density: WritableSignal<RhombusDensity> = signal(inject(RHOMBUS_DENSITY));

  constructor() {
    // Synchronous first write. Effects flush on a scheduler whose ordering
    // relative to SSR serialisation is not contractual, so the initial value is
    // applied eagerly here; the effect below carries only later changes.
    this.apply(this.density());
    effect(() => this.apply(this.density()));
  }

  private apply(level: RhombusDensity): void {
    this.document.documentElement.setAttribute(DENSITY_ATTRIBUTE, level);
  }
}
