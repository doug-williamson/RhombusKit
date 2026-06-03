import { RhombusAppShellComponent } from './rhombus-app-shell.component';

/**
 * Type-only fixture: proves the shell exposes exactly the four structural inputs
 * and that every evicted FolioKit product flag is gone from the type. The
 * `@ts-expect-error` lines are validated by the dedicated type-check pass
 * (`tsc --noEmit -p packages/core/tsconfig.spec.json`) — Jest transpiles specs in
 * isolation (`isolatedModules`) and does not type-check, so this `it()` only keeps
 * the runner happy; `c` is an empty object and every access is a harmless no-op.
 */
describe('rhombus-app-shell input surface (type fixture)', () => {
  it('exposes only structural inputs; product flags are gone from the type', () => {
    const c = {} as RhombusAppShellComponent;

    // Structural inputs exist.
    void c.mobileBreakpoint;
    void c.iconRail;
    void c.closeOnNavigate;
    void c.hasNav;

    // @ts-expect-error showAuth was a FolioKit product flag, now slot-presence gated
    void c.showAuth;
    // @ts-expect-error showNewPostButton was evicted to a projected header action
    void c.showNewPostButton;
    // @ts-expect-error showRouteTitle was dead config and is evicted
    void c.showRouteTitle;
    // @ts-expect-error features: PlanFeatures was evicted — no plan tiers in the shell
    void c.features;

    expect(true).toBe(true);
  });
});
