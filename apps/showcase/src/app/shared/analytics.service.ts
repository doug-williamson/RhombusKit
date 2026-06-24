import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { GOATCOUNTER_ENDPOINT } from './analytics.config';

interface GoatCounter {
  count?: (vars: { path?: string; title?: string; event?: boolean }) => void;
  no_onload?: boolean;
}

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

/**
 * Privacy-friendly, cookieless analytics via GoatCounter.
 *
 * It is a complete no-op on the server (SSG prerender) and whenever
 * {@link GOATCOUNTER_ENDPOINT} is unset, so the showcase ships analytics-ready
 * without sending anything until it's configured. Page views are counted per
 * SPA navigation; {@link event} records custom events (e.g. feedback clicks).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private enabled = false;

  /** Load the GoatCounter script (browser only) and count SPA page views. */
  init(): void {
    if (this.enabled || !isPlatformBrowser(this.platformId) || !GOATCOUNTER_ENDPOINT) {
      return;
    }
    this.enabled = true;

    const win = this.document.defaultView;
    if (win) {
      // Count manually on every navigation (including the first) so SPA route
      // changes register; disable the script's own onload counter to avoid
      // double-counting the initial page.
      win.goatcounter = { no_onload: true };
    }

    const script = this.document.createElement('script');
    script.async = true;
    script.dataset['goatcounter'] = GOATCOUNTER_ENDPOINT;
    script.src = '//gc.zgo.at/count.js';
    this.document.head.appendChild(script);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.count({ path: e.urlAfterRedirects }));
  }

  /** Record a custom event. Safe to call anytime; no-ops when disabled. */
  event(name: string, title?: string): void {
    this.count({ path: name, title: title ?? name, event: true });
  }

  private count(vars: { path?: string; title?: string; event?: boolean }): void {
    if (!this.enabled || !isPlatformBrowser(this.platformId)) {
      return;
    }
    this.document.defaultView?.goatcounter?.count?.(vars);
  }
}
