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

// Menu — a MatMenu wrapper driven by a config array with callback-per-item
// dispatch; the trigger is whatever you project (pass [iconButton] for the round
// preset). overflow-menu is the icon-button preset of this component.
export { RhombusMenuComponent } from './lib/menu/rhombus-menu.component';
export type { MenuItem } from './lib/menu/menu.types';
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

// Breadcrumbs — bespoke accessible trail (<nav aria-label><ol>); linked entries
// are routerLink anchors, the last is the current page (aria-current="page").
export { RhombusBreadcrumbsComponent } from './lib/breadcrumbs/rhombus-breadcrumbs.component';
export type { BreadcrumbItem } from './lib/breadcrumbs/rhombus-breadcrumbs.component';

// Pagination — standalone MatPaginator wrapper; emits the same PageState as the
// data table (exported above), so consumers never import Material's PageEvent.
export { RhombusPaginationComponent } from './lib/pagination/rhombus-pagination.component';

// Status & layout group.
// Progress indicators — thin MatProgressSpinner / MatProgressBar wrappers; the
// active arc/bar use --text-accent (bridged).
export { RhombusSpinnerComponent } from './lib/spinner/rhombus-spinner.component';
export { RhombusProgressBarComponent } from './lib/progress-bar/rhombus-progress-bar.component';

// Avatar — bespoke; renders the src image (alt = name) or initials derived from
// name (role="img", aria-label = name). Size sm/md/lg.
export { RhombusAvatarComponent } from './lib/avatar/rhombus-avatar.component';
export type { AvatarSize } from './lib/avatar/rhombus-avatar.component';

// Alert — bespoke persistent severity banner (distinct from the transient toast).
// Reuses the shared --toast-<variant>-* tokens; severity is conveyed by colour +
// a visually-hidden prefix (not colour-only). Optional title + dismiss.
export { RhombusAlertComponent } from './lib/alert/rhombus-alert.component';
export type { AlertVariant } from './lib/alert/rhombus-alert.component';

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
export { RhombusShellBottomNavDirective } from './lib/app-shell/rhombus-shell-bottom-nav.directive';

// Popover — a CDK-Overlay panel hosting arbitrary projected content, attached to
// any element via [rhombusPopoverTriggerFor]. Use [rhombusPopoverClose] on inner
// controls to dismiss. Fills the gap RhombusMenu (menu-items only) leaves.
export { RhombusPopoverComponent } from './lib/popover/rhombus-popover.component';
export type { RhombusPopoverPosition } from './lib/popover/rhombus-popover.component';
export { RhombusPopoverTriggerDirective } from './lib/popover/rhombus-popover-trigger.directive';
export { RhombusPopoverCloseDirective } from './lib/popover/rhombus-popover-close.directive';

// Bottom navigation — a Material-style bottom tab bar for mobile-first shells.
// Router-driven by default (routerLinkActive); pass activeId/activeChange for
// controlled, non-router usage.
export { RhombusBottomNavComponent } from './lib/bottom-nav/rhombus-bottom-nav.component';
export type {
  RhombusBottomNavItem,
  BottomNavIndicator,
} from './lib/bottom-nav/rhombus-bottom-nav.component';

// 1.0 — content composites. Leaf components ported from FolioKit. page-header
// composes [rhombusChip] for its badge; code-block lazily + optionally loads
// highlight.js (degrades to plain code); empty-state composes rhombus-button for
// its CTA. None export a public type.
export { RhombusPageHeaderComponent } from './lib/page-header/rhombus-page-header.component';
export { RhombusCodeBlockComponent } from './lib/code-block/rhombus-code-block.component';
// Element block — distinct from the data-table [rhombusEmptyState] attribute
// directive exported above; the element may nest inside that directive.
export { RhombusEmptyStateComponent } from './lib/empty-state/rhombus-empty-state.component';

// Icon — registry-backed inline-SVG primitive. Renders any icon registered via
// provideRhombusIcons() (a name → SVG-literal map, same shape as a Material
// addSvgIconLiteral map) plus the library's built-in glyphs, as a currentColor
// SVG; unknown names fall back to <mat-icon> (font). Size sm/md/lg or px.
export { RhombusIconComponent } from './lib/icon/rhombus-icon.component';
export type { RhombusIconSize } from './lib/icon/rhombus-icon.component';
export { RhombusIconRegistry } from './lib/icon/rhombus-icon-registry';
export { provideRhombusIcons } from './lib/icon/rhombus-icon.providers';
export type { RhombusIconSet } from './lib/icon/rhombus-icon.providers';
