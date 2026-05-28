// @rhombuskit/core — public surface
// New exports are added per phase. Keep this barrel flat; no namespace
// objects, no re-exports of internal types.

export { RhombusButtonComponent } from './lib/button/rhombus-button.component';
export type {
  ButtonVariant,
  ButtonSize,
  ButtonAppearance,
} from './lib/button/rhombus-button.component';

export { RhombusBadgeDirective } from './lib/badge/rhombus-badge.directive';
export type { BadgeVariant } from './lib/badge/rhombus-badge.directive';

export { RhombusCardComponent } from './lib/card/rhombus-card.component';
export type {
  CardVariant,
  CardPadding,
} from './lib/card/rhombus-card.component';

export { RhombusChipDirective } from './lib/chip/rhombus-chip.directive';
export type { ChipVariant } from './lib/chip/rhombus-chip.directive';
export { RhombusChipGroupDirective } from './lib/chip/rhombus-chip-group.directive';
export type { ChipGroupSelection } from './lib/chip/rhombus-chip-group.directive';

// Phase 3a — form primitives. Each component inlines its own
// <mat-form-field>; shared styling ships via @rhombuskit/core/scss.
export { RhombusInputComponent } from './lib/input/rhombus-input.component';
export type { InputType } from './lib/input/rhombus-input.component';

export { RhombusTextareaComponent } from './lib/textarea/rhombus-textarea.component';

export { RhombusSelectComponent } from './lib/select/rhombus-select.component';
export type {
  SelectOption,
  SelectOptionGroup,
} from './lib/select/rhombus-select.component';

export type {
  FormFieldAppearance,
  FormFieldSize,
} from './lib/form-field/form-field.types';
