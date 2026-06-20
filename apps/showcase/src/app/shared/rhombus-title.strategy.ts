import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Brand suffix appended to every per-route page title. */
const BRAND = 'RhombusKit';

/** Site-wide default description, used on routes without a `title` (e.g. home). */
const DEFAULT_DESCRIPTION =
  'RhombusKit — accessible, signal-based Angular components over Angular Material, ' +
  'themed by a frozen design-token contract. Light/dark themes with WCAG 2.1 AA verified in CI.';

/**
 * Formats the browser tab title as `"<route title> · RhombusKit"` (falling back
 * to plain `"RhombusKit"` for routes that declare no `title`) and keeps the
 * meta description + Open Graph / Twitter title and description in sync per
 * route. Routes set their page name via the standard Angular `title` property
 * (see `app.routes.ts`); the static OG defaults live in `index.html`.
 */
@Injectable({ providedIn: 'root' })
export class RhombusTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    const fullTitle = pageTitle ? `${pageTitle} · ${BRAND}` : BRAND;
    this.title.setTitle(fullTitle);

    const description = pageTitle
      ? `${pageTitle} — ${BRAND}: accessible, token-themed Angular components. ` +
        'Usage, live examples, and a full API reference.'
      : DEFAULT_DESCRIPTION;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
