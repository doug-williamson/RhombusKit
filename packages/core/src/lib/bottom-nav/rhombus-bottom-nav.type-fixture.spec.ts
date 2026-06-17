// packages/core/src/lib/bottom-nav/rhombus-bottom-nav.type-fixture.spec.ts
import { RhombusBottomNavComponent } from './rhombus-bottom-nav.component';

describe('rhombus-bottom-nav input surface (type fixture)', () => {
  it('exposes items, activeId, indicator, ariaLabel, activeChange', () => {
    const c = {} as RhombusBottomNavComponent;
    void c.items;
    void c.activeId;
    void c.indicator;
    void c.ariaLabel;
    void c.activeChange;
    // @ts-expect-error there is no `active` input — it is `activeId`
    void c.active;
    expect(true).toBe(true);
  });
});
