import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { RhombusAppShellComponent } from './rhombus-app-shell.component';
import { RhombusShellNavFooterDirective } from './rhombus-shell-nav-footer.directive';
import { RhombusShellAuthDirective } from './rhombus-shell-auth.directive';
import { RhombusShellAsideDirective } from './rhombus-shell-aside.directive';
import { RhombusShellBottomNavDirective } from './rhombus-shell-bottom-nav.directive';
import { RhombusShellFooterDirective } from './rhombus-shell-footer.directive';

/**
 * Shared fixtures for the `<rhombus-app-shell>` contract specs.
 *
 * jsdom has no layout engine and no real `matchMedia`, so the responsive contract
 * is driven through a {@link FakeBreakpointObserver}: it records the exact media
 * queries the shell observes (overlay first, optional rail second) and lets a spec
 * flip the matched query without reconstructing the query strings by hand. Router
 * coupling is faked the same way so `closeOnNavigate` can be exercised without a
 * real router. All assertions read the shell's own `rhombus-app-shell__*` markers
 * and the `data-mode` / `data-open` state hooks — never Material internals.
 */

/** The viewport band a spec wants the shell to see. */
type Regime = 'mobile' | 'rail' | 'desktop';

/**
 * Stand-in for CDK's `BreakpointObserver`. A spec sets the desired {@link Regime};
 * each `observe()` call maps that regime onto *its own* queries (the shell passes
 * `[overlay]` or `[overlay, rail]`, overlay first), so specs stay decoupled from
 * the exact px strings. Backed by a `BehaviorSubject`, so a subscription created at
 * any time (including a re-subscribe after an input change re-runs the effect)
 * immediately reflects the current regime — no shared mutable state to clobber.
 */
export class FakeBreakpointObserver {
  private readonly regime$ = new BehaviorSubject<Regime>('desktop');

  observe(value: string | readonly string[]): Observable<BreakpointState> {
    const queries = (Array.isArray(value) ? value : [value]) as string[];
    const [overlay, rail] = queries;
    return this.regime$.pipe(
      map((regime) => {
        const breakpoints: Record<string, boolean> = {};
        for (const q of queries) breakpoints[q] = false;
        if (regime === 'mobile' && overlay) breakpoints[overlay] = true;
        if (regime === 'rail' && rail) breakpoints[rail] = true;
        return { matches: regime !== 'desktop', breakpoints };
      }),
    );
  }

  isMatched(): boolean {
    return false;
  }

  /** Viewport below the mobile breakpoint → overlay drawer. */
  emitMobile(): void {
    this.regime$.next('mobile');
  }

  /** Tablet icon-rail band (only meaningful when the shell observes a rail query). */
  emitRail(): void {
    this.regime$.next('rail');
  }

  /** Desktop → full side nav. */
  emitDesktop(): void {
    this.regime$.next('desktop');
  }
}

/** Stand-in for `Router` exposing only the `events` stream the shell subscribes to. */
export class FakeRouter {
  readonly events = new Subject<NavigationEnd>();
  private navId = 0;

  emitNavigationEnd(url = '/x'): void {
    this.navId += 1;
    this.events.next(new NavigationEnd(this.navId, url, url));
  }
}

/**
 * Host exercising the full slot API. Structural inputs and slot-presence toggles
 * are writable signals; the gated slots are wrapped in host-side `@if` so flipping
 * a signal + `detectChanges()` adds/removes the projected marker and the shell's
 * `contentChild()` query reacts. Brand / nav / header-actions / default content
 * are always projected.
 */
@Component({
  selector: 'rk-app-shell-host',
  standalone: true,
  imports: [
    RhombusAppShellComponent,
    RhombusShellNavFooterDirective,
    RhombusShellAuthDirective,
    RhombusShellAsideDirective,
    RhombusShellBottomNavDirective,
    RhombusShellFooterDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-app-shell
      [mobileBreakpoint]="mobileBreakpoint()"
      [iconRail]="iconRail()"
      [closeOnNavigate]="closeOnNavigate()"
      [hasNav]="hasNav()"
      [navMode]="navMode()"
      [frame]="frame()"
    >
      <div shellBrand class="host-brand">Acme</div>
      <nav shellNav class="host-nav">Nav items</nav>
      @if (showNavFooter()) {
        <div shellNavFooter class="host-nav-footer">Sign out</div>
      }
      <div shellHeaderActions class="host-actions">Actions</div>
      @if (showAuth()) {
        <div shellAuthSlot class="host-auth">Avatar</div>
      }
      @if (showAside()) {
        <aside shellAside class="host-aside">On this page</aside>
      }
      @if (showBottomNav()) {
        <div shellBottomNav class="host-bottom-nav">Bottom nav</div>
      }
      <p class="host-main">Main content</p>
      @if (showFooter()) {
        <footer shellFooter class="host-footer">Footer content</footer>
      }
    </rhombus-app-shell>
  `,
})
export class AppShellHostComponent {
  readonly mobileBreakpoint = signal(767);
  readonly iconRail = signal(false);
  readonly closeOnNavigate = signal(true);
  readonly hasNav = signal(true);
  readonly showNavFooter = signal(true);
  readonly showAuth = signal(false);
  readonly showAside = signal(false);
  readonly navMode = signal<'sidenav' | 'bottom'>('sidenav');
  readonly frame = signal<'fill' | 'phone'>('fill');
  readonly showBottomNav = signal(false);
  readonly showFooter = signal(false);
}

export interface AppShellSetup {
  fixture: ComponentFixture<AppShellHostComponent>;
  host: AppShellHostComponent;
  el: HTMLElement;
  bpo: FakeBreakpointObserver;
  router: FakeRouter;
}

/** Configure TestBed with the fakes and create the host fixture (no initial CD). */
export function setupAppShell(): AppShellSetup {
  const bpo = new FakeBreakpointObserver();
  const router = new FakeRouter();
  TestBed.configureTestingModule({
    providers: [
      provideNoopAnimations(),
      { provide: BreakpointObserver, useValue: bpo },
      { provide: Router, useValue: router },
    ],
  });
  const fixture = TestBed.createComponent(AppShellHostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    bpo,
    router,
  };
}

/** The shell's `<mat-sidenav>` element — carries the `data-*` and rail markers. */
export function sidenavEl(el: HTMLElement): HTMLElement {
  const node = el.querySelector('mat-sidenav');
  if (!node) throw new Error('mat-sidenav not found');
  return node as HTMLElement;
}

/** The toolbar hamburger — only rendered in overlay (mobile) mode; throws otherwise. */
export function navToggle(el: HTMLElement): HTMLButtonElement {
  const btn = el.querySelector<HTMLButtonElement>('.rhombus-app-shell__nav-toggle');
  if (!btn) throw new Error('nav toggle not rendered (expected in overlay mode)');
  return btn;
}

export const ICON_RAIL_CLASS = 'rhombus-app-shell__sidenav--icon-rail';
