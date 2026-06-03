import { setupAppShell } from './rhombus-app-shell.spec-helpers';

/**
 * Slot API: always-on slots render; presence-gated slots (`[shellNavFooter]`,
 * `[shellAuthSlot]`, `[shellAside]`) render their region only when something is
 * projected; and the aside toggles the 2-/3-column layout via `--with-aside`.
 */
describe('rhombus-app-shell slots', () => {
  it('renders brand, nav, header actions, default content, and the nav footer', () => {
    const { fixture, el } = setupAppShell(); // showNavFooter defaults on
    fixture.detectChanges();

    expect(el.querySelector('.host-brand')).toBeTruthy();
    expect(el.querySelector('.host-nav')).toBeTruthy();
    expect(el.querySelector('.host-actions')).toBeTruthy();
    expect(el.querySelector('.host-main')).toBeTruthy();
    expect(el.querySelector('.rhombus-app-shell__nav-footer')).toBeTruthy();
    expect(el.querySelector('.host-nav-footer')).toBeTruthy();
  });

  it('omits the nav-footer region when nothing is projected', () => {
    const { fixture, host, el } = setupAppShell();
    host.showNavFooter.set(false);
    fixture.detectChanges();

    expect(el.querySelector('.rhombus-app-shell__nav-footer')).toBeNull();
  });

  it('renders the auth slot only when projected', () => {
    const { fixture, host, el } = setupAppShell(); // showAuth defaults off
    fixture.detectChanges();
    expect(el.querySelector('.host-auth')).toBeNull();

    host.showAuth.set(true);
    fixture.detectChanges();
    expect(el.querySelector('.host-auth')).toBeTruthy();
  });

  it('aside absent → 2-column: no aside region, no --with-aside', () => {
    const { fixture, el } = setupAppShell(); // showAside defaults off
    fixture.detectChanges();

    expect(el.querySelector('.rhombus-app-shell__aside')).toBeNull();
    expect(el.querySelector('.rhombus-app-shell__body--with-aside')).toBeNull();
  });

  it('aside present → 3-column: aside region rendered with --with-aside', () => {
    const { fixture, host, el } = setupAppShell();
    host.showAside.set(true);
    fixture.detectChanges();

    expect(el.querySelector('.rhombus-app-shell__aside')).toBeTruthy();
    expect(el.querySelector('.host-aside')).toBeTruthy();
    expect(el.querySelector('.rhombus-app-shell__body--with-aside')).toBeTruthy();
  });
});
