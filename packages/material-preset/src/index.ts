// @rhombuskit/material-preset
//
// Bridges Angular Material's --mat-sys-* M3 system tokens to @rhombuskit/tokens
// CONTRACT names, so RhombusKit theme switches flow through to every Material
// component automatically. The actual bridge is CSS/SCSS (see ./styles/) —
// opt in by including the `material-bridge()` mixin at the element that carries
// `data-theme`. The TypeScript export below is a version sentinel so consumers
// can assert compatibility programmatically.

export const RHOMBUS_MATERIAL_PRESET_VERSION = '0.2.0';
