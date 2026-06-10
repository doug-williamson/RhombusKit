import { setupAppShell } from './rhombus-app-shell.spec-helpers';

/**
 * The shell scrolls an internal container (`mat-sidenav-content`), so the
 * router's window-based `scrollPositionRestoration` can't reach it. The shell
 * resets that container to the top itself — but only on a *path* change, so an
 * in-page `?tab=` switch (a query-only navigation) keeps the reading position.
 *
 * jsdom has no scroll engine, so we assert behaviourally: spy on the content
 * element's `scrollTo` and check whether navigation invokes it.
 */
function contentEl(el: HTMLElement): HTMLElement {
  const node = el.querySelector('mat-sidenav-content');
  if (!node) throw new Error('mat-sidenav-content not found');
  return node as HTMLElement;
}

describe('rhombus-app-shell scroll reset on navigation', () => {
  it('scrolls the content region to the top when the path changes', () => {
    const { fixture, el, router } = setupAppShell();
    fixture.detectChanges();
    const content = contentEl(el);
    content.scrollTo = jest.fn();

    router.emitNavigationEnd('/components/button');
    router.emitNavigationEnd('/components/badge');

    expect(content.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 });
  });

  it('does not reset on a query-only change (a ?tab= switch)', () => {
    const { fixture, el, router } = setupAppShell();
    fixture.detectChanges();
    const content = contentEl(el);

    // Establish the current path first, then start spying.
    router.emitNavigationEnd('/components/button');
    content.scrollTo = jest.fn();

    router.emitNavigationEnd('/components/button?tab=examples');
    router.emitNavigationEnd('/components/button?tab=api');

    expect(content.scrollTo).not.toHaveBeenCalled();
  });

  it('does not reset on a fragment-only change (an in-page anchor)', () => {
    const { fixture, el, router } = setupAppShell();
    fixture.detectChanges();
    const content = contentEl(el);

    router.emitNavigationEnd('/theming');
    content.scrollTo = jest.fn();

    router.emitNavigationEnd('/theming#tokens');

    expect(content.scrollTo).not.toHaveBeenCalled();
  });
});
