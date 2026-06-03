import { setupAppShell } from './rhombus-app-shell.spec-helpers';

/**
 * Bare-route layout: `hasNav=false` omits the nav drawer entirely while the
 * toolbar chrome (brand, header actions) and the default content keep rendering.
 * With no drawer there is nothing to toggle, so the overlay hamburger never
 * appears even in the mobile regime.
 */
describe('rhombus-app-shell hasNav', () => {
  it('renders the nav drawer by default (hasNav defaults true)', () => {
    const { fixture, el } = setupAppShell();
    fixture.detectChanges();

    expect(el.querySelector('mat-sidenav')).toBeTruthy();
    expect(el.querySelector('.host-nav')).toBeTruthy();
  });

  it('hasNav=false omits the drawer but keeps the toolbar chrome and content', () => {
    const { fixture, host, el } = setupAppShell();
    host.hasNav.set(false);
    fixture.detectChanges();

    expect(el.querySelector('mat-sidenav')).toBeNull();
    expect(el.querySelector('.host-nav')).toBeNull();

    expect(el.querySelector('.rhombus-app-shell__toolbar')).toBeTruthy();
    expect(el.querySelector('.host-brand')).toBeTruthy();
    expect(el.querySelector('.host-actions')).toBeTruthy();
    expect(el.querySelector('.host-main')).toBeTruthy();
  });

  it('hasNav=false renders no hamburger even in the mobile regime', () => {
    const { fixture, host, bpo, el } = setupAppShell();
    host.hasNav.set(false);
    fixture.detectChanges();
    bpo.emitMobile();
    fixture.detectChanges();

    expect(el.querySelector('.rhombus-app-shell__nav-toggle')).toBeNull();
  });
});
