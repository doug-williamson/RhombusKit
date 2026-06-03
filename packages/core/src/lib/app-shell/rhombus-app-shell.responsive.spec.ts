import {
  ICON_RAIL_CLASS,
  navToggle,
  setupAppShell,
  sidenavEl,
} from './rhombus-app-shell.spec-helpers';

/**
 * Responsive contract, driven through the faked `BreakpointObserver`. State is read
 * from the sidenav's `data-mode` / `data-open` hooks (bound to the shell's signals,
 * so they're deterministic regardless of Material's drawer animation) and the
 * `--icon-rail` modifier class.
 */
describe('rhombus-app-shell responsive contract', () => {
  it('desktop → side mode, open, no icon rail', () => {
    const { fixture, el, bpo } = setupAppShell();
    fixture.detectChanges();
    bpo.emitDesktop();
    fixture.detectChanges();

    const sidenav = sidenavEl(el);
    expect(sidenav.getAttribute('data-mode')).toBe('side');
    expect(sidenav.getAttribute('data-open')).toBe('true');
    expect(sidenav.classList.contains(ICON_RAIL_CLASS)).toBe(false);
  });

  it('at/below mobileBreakpoint → overlay mode, closed by default', () => {
    const { fixture, host, el, bpo } = setupAppShell();
    host.mobileBreakpoint.set(767);
    fixture.detectChanges();
    bpo.emitMobile();
    fixture.detectChanges();

    const sidenav = sidenavEl(el);
    expect(sidenav.getAttribute('data-mode')).toBe('over');
    expect(sidenav.getAttribute('data-open')).toBe('false');
  });

  it('iconRail enabled + in band → persistent side rail with the rail modifier', () => {
    const { fixture, host, el, bpo } = setupAppShell();
    host.iconRail.set(true);
    fixture.detectChanges();
    bpo.emitRail();
    fixture.detectChanges();

    const sidenav = sidenavEl(el);
    expect(sidenav.getAttribute('data-mode')).toBe('side');
    expect(sidenav.getAttribute('data-open')).toBe('true');
    expect(sidenav.classList.contains(ICON_RAIL_CLASS)).toBe(true);
  });

  it('iconRail disabled → tablet stays full side nav (no rail band observed)', () => {
    const { fixture, host, el, bpo } = setupAppShell();
    host.iconRail.set(false);
    fixture.detectChanges();
    bpo.emitDesktop();
    fixture.detectChanges();

    const sidenav = sidenavEl(el);
    expect(sidenav.getAttribute('data-mode')).toBe('side');
    expect(sidenav.classList.contains(ICON_RAIL_CLASS)).toBe(false);
  });

  it('closeOnNavigate closes the overlay drawer on navigation', () => {
    const { fixture, host, el, bpo, router } = setupAppShell();
    host.mobileBreakpoint.set(767);
    fixture.detectChanges();
    bpo.emitMobile();
    fixture.detectChanges();

    // Open the overlay via the toolbar hamburger (only rendered in overlay mode).
    navToggle(el).click();
    fixture.detectChanges();
    expect(sidenavEl(el).getAttribute('data-open')).toBe('true');

    router.emitNavigationEnd();
    fixture.detectChanges();
    expect(sidenavEl(el).getAttribute('data-open')).toBe('false');
  });

  it('closeOnNavigate=false leaves the drawer open across navigation', () => {
    const { fixture, host, el, bpo, router } = setupAppShell();
    host.mobileBreakpoint.set(767);
    host.closeOnNavigate.set(false);
    fixture.detectChanges();
    bpo.emitMobile();
    fixture.detectChanges();

    navToggle(el).click();
    fixture.detectChanges();
    expect(sidenavEl(el).getAttribute('data-open')).toBe('true');

    router.emitNavigationEnd();
    fixture.detectChanges();
    expect(sidenavEl(el).getAttribute('data-open')).toBe('true');
  });

  it('a repeated same-breakpoint emit does not clobber a manual toggle', () => {
    const { fixture, host, el, bpo } = setupAppShell();
    host.mobileBreakpoint.set(767);
    fixture.detectChanges();
    bpo.emitMobile();
    fixture.detectChanges();

    navToggle(el).click();
    fixture.detectChanges();
    expect(sidenavEl(el).getAttribute('data-open')).toBe('true');

    // Same breakpoint re-emits (e.g. an orientation jitter): the guard must not
    // force the drawer back to its default closed state.
    bpo.emitMobile();
    fixture.detectChanges();
    expect(sidenavEl(el).getAttribute('data-open')).toBe('true');
  });
});
