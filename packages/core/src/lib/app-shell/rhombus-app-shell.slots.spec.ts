import { setupAppShell } from './rhombus-app-shell.spec-helpers';

/**
 * Slot API: always-on slots render; presence-gated slots (`[shellNavFooter]`,
 * `[shellAuthSlot]`, `[shellAside]`, `[shellFooter]`) render their region only
 * when something is projected; and the aside toggles the 2-/3-column layout via
 * `--with-aside`.
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

  it('omits the footer region when nothing is projected', () => {
    const { fixture, el } = setupAppShell(); // showFooter defaults off
    fixture.detectChanges();

    expect(el.querySelector('.rhombus-app-shell__footer')).toBeNull();
    expect(el.querySelector('.host-footer')).toBeNull();
  });

  it('renders the footer pinned below the scroll region (after .__body, in .__content)', () => {
    const { fixture, host, el } = setupAppShell();
    host.showFooter.set(true);
    fixture.detectChanges();

    const footer = el.querySelector('.rhombus-app-shell__footer');
    expect(footer).toBeTruthy();
    expect(el.querySelector('.host-footer')).toBeTruthy();

    // The footer is a sibling of the scrolling body, inside the content region —
    // so it pins below the scroll area rather than scrolling with it.
    const content = el.querySelector('.rhombus-app-shell__content');
    const body = el.querySelector('.rhombus-app-shell__body');
    expect(footer?.parentElement).toBe(content);
    expect(body?.nextElementSibling).toBe(footer);
  });

  it('renders the footer in bottom navMode too (above the bottom-nav)', () => {
    const { fixture, host, el } = setupAppShell();
    host.navMode.set('bottom');
    host.showBottomNav.set(true);
    host.showFooter.set(true);
    fixture.detectChanges();

    expect(el.querySelector('.rhombus-app-shell__footer')).toBeTruthy();
    expect(el.querySelector('.rhombus-app-shell__bottom-nav')).toBeTruthy();
  });

  it('lets a consumer mount a footer using only [shellFooter] (no private __ class)', () => {
    const { fixture, host, el } = setupAppShell();
    host.showFooter.set(true);
    fixture.detectChanges();

    // The done-when criterion: the host projects via the public marker directive
    // alone — it never references a private `rhombus-app-shell__*` class.
    const projected = el.querySelector('.host-footer');
    expect(projected?.getAttribute('shellFooter')).toBe('');
  });
});
