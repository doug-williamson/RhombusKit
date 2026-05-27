// @rhombuskit/material-preset
//
// Bridges Angular Material's --mat-sys-* M3 system tokens to @rhombuskit/tokens
// CONTRACT names, so RhombusKit theme switches flow through to every Material
// component automatically. The actual bridge is CSS/SCSS (see ./styles/) —
// the TypeScript export below is a version sentinel so consumers can assert
// compatibility programmatically.
//
// Phase 2 coverage: button, badge, card, chip. Coverage grows with each
// RhombusKit phase.

export const RHOMBUS_MATERIAL_PRESET_VERSION = '0.1.0';
