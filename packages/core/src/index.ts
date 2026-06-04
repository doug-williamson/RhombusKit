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

// Marker projected as the error subscript of the form primitives above
// (replaces the pre-1.0 `slot="error"` convention).
export { RhombusErrorDirective } from './lib/form-field/rhombus-error.directive';

// Selection control. Wraps <mat-checkbox>; same control model as the form
// primitives above (`[control]` for reactive forms, `[(checked)]` otherwise).
export { RhombusCheckboxComponent } from './lib/checkbox/rhombus-checkbox.component';

// Radio group. Wraps <mat-radio-group>; options-array API like select,
// `[control]` / `[(value)]` control model.
export { RhombusRadioGroupComponent } from './lib/radio/rhombus-radio-group.component';
export type { RadioOption } from './lib/radio/rhombus-radio-group.component';

// Switch. Wraps <mat-slide-toggle>; same control model as checkbox. Track colour
// is driven by the --switch-track-on/off contract tokens.
export { RhombusSwitchComponent } from './lib/switch/rhombus-switch.component';

// Tooltip. Directive composing MatTooltip via hostDirectives (badge pattern);
// surface themed via --tooltip-bg/text.
export { RhombusTooltipDirective } from './lib/tooltip/rhombus-tooltip.directive';

// Toast. Service wrapping MatSnackBar + the CDK LiveAnnouncer (mirrors the
// confirm service). Severity colours come from the --toast-<variant>-* tokens.
export { RhombusToastService } from './lib/toast/rhombus-toast.service';
export type {
  ToastConfig,
  ToastVariant,
  RhombusToastRef,
} from './lib/toast/toast.types';

// Phase 3b — data table. Hybrid column API (config + cellTemplate escape
// hatch), array = client-side / DataSource = server-side, distinct loading and
// empty paths. Row selection deferred.
export { RhombusDataTableComponent } from './lib/data-table/rhombus-data-table.component';
export { RhombusEmptyStateDirective } from './lib/data-table/rhombus-empty-state.directive';
export type {
  ColumnDef,
  DataColumn,
  DisplayColumn,
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

// Dialog. Generic <rhombus-dialog> chrome (title + body + [rhombusDialogActions]
// footer) plus RhombusDialogService — a MatDialog wrapper applying the library's
// defaults and returning a leak-free RhombusDialogRef. The confirm service rides
// this service.
export { RhombusDialogComponent } from './lib/dialog/rhombus-dialog.component';
export { RhombusDialogActionsDirective } from './lib/dialog/rhombus-dialog-actions.directive';
export { RhombusDialogService } from './lib/dialog/rhombus-dialog.service';
export type {
  RhombusDialogConfig,
  RhombusDialogRef,
} from './lib/dialog/dialog.types';

// Confirm service — a danger/default confirmation preset over RhombusDialogService,
// returning Observable<boolean> (backdrop/Escape → false). Its rendered dialog
// component (RhombusConfirmDialogComponent) is intentionally NOT exported.
export { RhombusConfirmService } from './lib/confirm-dialog/rhombus-confirm.service';
export type { ConfirmConfig } from './lib/confirm-dialog/confirm-dialog.types';

// Navigation group.
// Tabs — decoration directive on <mat-tab-group> (chip-group pattern); keeps
// Material's @ContentChildren(MatTab) query intact, themes the ink bar via
// --text-accent, and re-emits selection as (tabChange).
export { RhombusTabGroupDirective } from './lib/tabs/rhombus-tab-group.directive';

// 0.2.0 — theme controls. Both driven by RhombusThemeService from
// @rhombuskit/theme-engine. The toggle is a three-state cycle icon button
// (light → dark → system); the menu exposes the same three options as discrete
// items so any preference is one click away.
export { RhombusThemeToggleComponent } from './lib/theme-toggle/rhombus-theme-toggle.component';
export { RhombusThemeMenuComponent } from './lib/theme-toggle/rhombus-theme-menu.component';

// 0.x — app shell. A slotted layout primitive (mat-sidenav-container +
// mat-toolbar): header / collapsible sidenav / content / optional aside, with a
// responsive overlay↔rail↔side contract. Structure only — consumers project
// brand, nav, header actions, auth, and aside content via the marker directives.
export { RhombusAppShellComponent } from './lib/app-shell/rhombus-app-shell.component';
export { RhombusShellNavFooterDirective } from './lib/app-shell/rhombus-shell-nav-footer.directive';
export { RhombusShellAuthDirective } from './lib/app-shell/rhombus-shell-auth.directive';
export { RhombusShellAsideDirective } from './lib/app-shell/rhombus-shell-aside.directive';

// 1.0 — content composites. Leaf components ported from FolioKit. page-header
// composes [rhombusChip] for its badge; code-block lazily + optionally loads
// highlight.js (degrades to plain code); empty-state composes rhombus-button for
// its CTA. None export a public type.
export { RhombusPageHeaderComponent } from './lib/page-header/rhombus-page-header.component';
export { RhombusCodeBlockComponent } from './lib/code-block/rhombus-code-block.component';
// Element block — distinct from the data-table [rhombusEmptyState] attribute
// directive exported above; the element may nest inside that directive.
export { RhombusEmptyStateComponent } from './lib/empty-state/rhombus-empty-state.component';
