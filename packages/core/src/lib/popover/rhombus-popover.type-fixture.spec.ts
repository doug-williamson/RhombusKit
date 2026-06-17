import { RhombusPopoverComponent } from './rhombus-popover.component';

/**
 * Type-only fixture: pins the public input/output surface. The @ts-expect-error
 * lines are validated by `tsc --noEmit -p packages/core/tsconfig.spec.json`;
 * Jest transpiles in isolation and does not type-check, so the it() is a no-op.
 */
describe('rhombus-popover input surface (type fixture)', () => {
  it('exposes position, offset, panelWidth, ariaLabel, opened, closed', () => {
    const c = {} as RhombusPopoverComponent;
    void c.position;
    void c.offset;
    void c.panelWidth;
    void c.ariaLabel;
    void c.opened;
    void c.closed;
    // @ts-expect-error the width input is named panelWidth, not width
    void c.width;
    expect(true).toBe(true);
  });
});
