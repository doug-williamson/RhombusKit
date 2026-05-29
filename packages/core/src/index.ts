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

// Phase 3b — data table. Hybrid column API (config + cellTemplate escape
// hatch), array = client-side / DataSource = server-side, distinct loading and
// empty paths. Row selection deferred.
export { RhombusDataTableComponent } from './lib/data-table/rhombus-data-table.component';
export { RhombusEmptyStateDirective } from './lib/data-table/rhombus-empty-state.directive';
export type {
  ColumnDef,
  SortState,
  PageState,
} from './lib/data-table/data-table.types';

// Phase 3b — overflow menu + confirm dialog. The overflow menu is a MatMenu
// wrapper driven by a config array with callback-per-item dispatch. The confirm
// service wraps MatDialog and returns Observable<boolean>; its rendered dialog
// component (RhombusConfirmDialogComponent) is intentionally NOT exported —
// consumers only ever use the service.
export { RhombusOverflowMenuComponent } from './lib/overflow-menu/rhombus-overflow-menu.component';
export type { OverflowMenuItem } from './lib/overflow-menu/overflow-menu.types';

export { RhombusConfirmService } from './lib/confirm-dialog/rhombus-confirm.service';
export type { ConfirmConfig } from './lib/confirm-dialog/confirm-dialog.types';

// 0.2.0 — theme controls. Both driven by RhombusThemeService from
// @rhombuskit/theme-engine. The toggle is a three-state cycle icon button
// (light → dark → system); the menu exposes the same three options as discrete
// items so any preference is one click away.
export { RhombusThemeToggleComponent } from './lib/theme-toggle/rhombus-theme-toggle.component';
export { RhombusThemeMenuComponent } from './lib/theme-toggle/rhombus-theme-menu.component';
