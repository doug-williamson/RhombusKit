import { setupAppShell } from './rhombus-app-shell.spec-helpers';

/**
 * Specs for the additive bottom-nav mode (`navMode='bottom'` / `frame='phone'`).
 * The default `navMode='sidenav'` / `frame='fill'` path is unchanged and covered
 * by the existing slots / responsive / scroll / no-nav suites; the first case
 * here is a regression guard that the default still renders the sidenav and no
 * bottom-nav region.
 */
describe('rhombus-app-shell bottom-nav mode', () => {
  it("renders the sidenav by default (navMode='sidenav')", () => {
    const { fixture } = setupAppShell();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-sidenav')).not.toBeNull();
    expect(el.querySelector('.rhombus-app-shell__bottom-nav')).toBeNull();
  });

  it("navMode='bottom' hides the sidenav + hamburger and renders the bottom-nav slot", () => {
    const { fixture, host, bpo } = setupAppShell();
    host.navMode.set('bottom');
    host.showBottomNav.set(true);
    bpo.emitMobile();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-sidenav')).toBeNull();
    expect(el.querySelector('.rhombus-app-shell__nav-toggle')).toBeNull();
    const bottom = el.querySelector('.rhombus-app-shell__bottom-nav');
    expect(bottom).not.toBeNull();
    expect(bottom?.textContent).toContain('Bottom nav');
  });

  it("frame='phone' adds the phone-frame host class", () => {
    const { fixture, host } = setupAppShell();
    host.frame.set('phone');
    fixture.detectChanges();
    const shellEl = (fixture.nativeElement as HTMLElement).querySelector('rhombus-app-shell')!;
    expect(shellEl.classList.contains('rhombus-app-shell--phone')).toBe(true);
  });
});
