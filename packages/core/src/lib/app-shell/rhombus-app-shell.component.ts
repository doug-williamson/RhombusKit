import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RhombusShellNavFooterDirective } from './rhombus-shell-nav-footer.directive';
import { RhombusShellAuthDirective } from './rhombus-shell-auth.directive';
import { RhombusShellAsideDirective } from './rhombus-shell-aside.directive';

/** Viewport width (px) at/below which the nav drawer becomes an overlay. */
const DEFAULT_MOBILE_BREAKPOINT = 767;
/** Lower bound of the desktop band — above this the full sidenav always shows. */
const DESKTOP_MIN_PX = 1024;

/**
 * `<rhombus-app-shell>` — a slotted application layout primitive. A full-width
 * top app bar (`mat-toolbar`) sits above a `mat-sidenav-container`: the toolbar
 * carries brand + header actions, the sidenav holds navigation, and the content
 * area holds the routed view plus an optional right-rail aside. It owns
 * *structure* only — it renders no nav items, no brand, no theme control, and
 * references no route; every product concern is a projected slot.
 *
 * Slots: `[shellBrand]`, `[shellHeaderActions]`, `[shellAuthSlot]` (presence-
 * gated) in the top bar; `[shellNav]`, `[shellNavFooter]` (presence-gated) in
 * the sidenav; `[shellAside]` (presence-gated) and the default content slot in
 * the content area.
 *
 * Responsive contract, driven by {@link mobileBreakpoint} and {@link iconRail}:
 * - viewport ≤ `mobileBreakpoint` → overlay drawer (`mode="over"`), closed by
 *   default; the toolbar hamburger toggles it.
 * - `iconRail` enabled, viewport in `(mobileBreakpoint, 1024)` → a persistent
 *   narrow side rail (`mode="side"`, open) carrying the
 *   `rhombus-app-shell__sidenav--icon-rail` modifier. The shell sets the rail
 *   width only; hiding nav labels in the rail is the consumer's responsibility.
 * - viewport ≥ 1024 → full side nav (`mode="side"`, open).
 *
 * Set `hasNav` to false for bare routes (sign-up, 404, marketing): the drawer is
 * omitted and the content spans full width, while the toolbar chrome is retained.
 *
 * Consumer-overridable CSS custom properties (with their defaults):
 * `--rhombus-app-shell-sidenav-width` (220px), `--rhombus-app-shell-aside-width`
 * (240px).
 */
@Component({
  selector: 'rhombus-app-shell',
  standalone: true,
  imports: [MatSidenavModule, MatToolbarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-app-shell.component.scss',
  template: `
    <mat-toolbar class="rhombus-app-shell__toolbar">
      @if (hasNav() && isMobile()) {
        <button
          type="button"
          class="rhombus-app-shell__nav-toggle"
          aria-label="Toggle navigation"
          (click)="toggleSidenav()"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3 6h18M3 12h18M3 18h18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      }
      <div class="rhombus-app-shell__brand">
        <ng-content select="[shellBrand]" />
      </div>
      <span class="rhombus-app-shell__spacer"></span>
      <ng-content select="[shellHeaderActions]" />
      @if (hasAuth()) {
        <ng-content select="[shellAuthSlot]" />
      }
    </mat-toolbar>

    <mat-sidenav-container class="rhombus-app-shell__container">
      @if (hasNav()) {
        <mat-sidenav
          class="rhombus-app-shell__sidenav"
          [class.rhombus-app-shell__sidenav--icon-rail]="isIconRailActive()"
          [mode]="sidenavMode()"
          [attr.data-mode]="sidenavMode()"
          [opened]="sidenavOpen()"
          [attr.data-open]="sidenavOpen()"
          (openedChange)="sidenavOpen.set($event)"
        >
          <div class="rhombus-app-shell__nav">
            <div class="rhombus-app-shell__nav-body">
              <ng-content select="[shellNav]" />
            </div>
            @if (hasNavFooter()) {
              <div class="rhombus-app-shell__nav-footer">
                <ng-content select="[shellNavFooter]" />
              </div>
            }
          </div>
        </mat-sidenav>
      }

      <mat-sidenav-content class="rhombus-app-shell__content">
        <div
          class="rhombus-app-shell__body"
          [class.rhombus-app-shell__body--with-aside]="hasAside()"
        >
          <main class="rhombus-app-shell__main">
            <ng-content />
          </main>
          @if (hasAside()) {
            <aside class="rhombus-app-shell__aside">
              <ng-content select="[shellAside]" />
            </aside>
          }
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class RhombusAppShellComponent {
  /** Viewport width (px) at/below which the nav drawer collapses to an overlay. */
  readonly mobileBreakpoint = input<number>(DEFAULT_MOBILE_BREAKPOINT);
  /** Enable the persistent narrow icon rail on tablet widths. */
  readonly iconRail = input<boolean>(false);
  /** Close the overlay drawer on each in-app navigation. */
  readonly closeOnNavigate = input<boolean>(true);
  /**
   * When false, the nav drawer is omitted entirely (bare-route layout) and the
   * content spans full width; the toolbar chrome (brand, header actions, auth)
   * still renders. Bind from route data in the consumer.
   */
  readonly hasNav = input<boolean>(true);

  protected readonly isMobile = signal(false);
  protected readonly isIconRailActive = signal(false);
  protected readonly sidenavOpen = signal(false);

  /**
   * Guards the manual toggle: once initialized, the breakpoint observer only
   * forces the drawer open/closed on an *actual* mobile/rail change, so a
   * re-emission of the same breakpoint can't clobber a user's manual toggle.
   */
  private mobileInitialized = false;

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  private readonly navFooterRef = contentChild(RhombusShellNavFooterDirective);
  private readonly authRef = contentChild(RhombusShellAuthDirective);
  private readonly asideRef = contentChild(RhombusShellAsideDirective);

  protected readonly hasNavFooter = computed(() => !!this.navFooterRef());
  protected readonly hasAuth = computed(() => !!this.authRef());
  protected readonly hasAside = computed(() => !!this.asideRef());

  /** The rail is a persistent side drawer; only the overlay (mobile) uses 'over'. */
  protected readonly sidenavMode = computed<'over' | 'side'>(() =>
    this.isMobile() ? 'over' : 'side',
  );

  constructor() {
    effect((onCleanup) => {
      const maxPx = this.mobileBreakpoint();
      const overlayBp = `(max-width: ${maxPx}.98px)`;
      const railBp = `(min-width: ${maxPx + 1}px) and (max-width: ${DESKTOP_MIN_PX - 1}.98px)`;
      const useRail = this.iconRail() && maxPx + 1 < DESKTOP_MIN_PX;
      const queries = useRail ? [overlayBp, railBp] : [overlayBp];
      const sub = this.breakpointObserver.observe(queries).subscribe((state) => {
        const mobile = !!state.breakpoints[overlayBp];
        const rail = useRail ? !!state.breakpoints[railBp] : false;
        const mobileChanged = mobile !== this.isMobile();
        const railChanged = rail !== this.isIconRailActive();
        this.isMobile.set(mobile);
        this.isIconRailActive.set(rail);
        if (!this.mobileInitialized || mobileChanged || railChanged) {
          this.mobileInitialized = true;
          // Overlay (mobile) starts closed; rail and desktop start open.
          this.sidenavOpen.set(!mobile);
        }
      });
      onCleanup(() => sub.unsubscribe());
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        // The rail is persistent, so only the overlay drawer closes on navigate.
        if (this.closeOnNavigate() && this.isMobile()) {
          this.sidenavOpen.set(false);
        }
      });
  }

  protected toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }
}
