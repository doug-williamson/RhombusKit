import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Brand suffix appended to every per-route page title. */
const BRAND = 'RhombusKit';

/**
 * Formats the browser tab title as `"<route title> · RhombusKit"`, falling back
 * to plain `"RhombusKit"` for routes that declare no `title` (e.g. home). Routes
 * set their page name via the standard Angular `title` property (see
 * `app.routes.ts`); this strategy only handles the formatting + branding.
 */
@Injectable({ providedIn: 'root' })
export class RhombusTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(pageTitle ? `${pageTitle} · ${BRAND}` : BRAND);
  }
}
