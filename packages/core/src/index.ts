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

// Tag — bespoke inline status/label pill (Draft / Published / Scheduled /
// Archived + generic info/success/warning/error). No Material, no new tokens:
// themed from the existing --status-* and --toast-* contract pairs. Distinct
// from the overlay Badge and the selectable Chip.
export { RhombusTagComponent } from './lib/tag/rhombus-tag.component';
export type { TagVariant, TagSize } from './lib/tag/rhombus-tag.component';

// Divider — a bespoke role=separator rule (horizontal / vertical, inset, accent,
// and labelled text-divider variants). No Material, no new tokens: the rule is
// drawn from the existing --border / --border-accent contract tokens. Replaces
// mat-divider.
export { RhombusDividerComponent } from './lib/divider/rhombus-divider.component';
export type { DividerOrientation } from './lib/divider/rhombus-divider.component';

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

export { RhombusDatePickerComponent } from './lib/date-picker/rhombus-date-picker.component';

// Date range picker — two-field start/end calendar over mat-date-range-input.
// Public value is a { start, end } pair of ISO strings (a typed FormGroup for
// [control]), mirrored to a private Date group via the internal mirrorControl
// helper (sharing the Date Picker's isoToDate/dateToIso). Closes the last
// Datepicker migration gap.
export { RhombusDateRangePickerComponent } from './lib/date-range-picker/rhombus-date-range-picker.component';
export type {
  DateRange,
  DateRangeControl,
} from './lib/date-range-picker/rhombus-date-range-picker.component';

// Autocomplete — a type-ahead combobox over mat-autocomplete: an options array
// filtered client-side by the built-in label-substring filterWith (or null +
// queryChange for server-side search), with loading and themed no-results states.
// Free-text by default (requireSelection=false), so the bound control holds a
// picked T or the typed string (FormControl<T | string | null>); reuses the
// internal mirrorControl helper. Unlike Select (a fixed-list dropdown) it filters
// as you type; unlike a plain Input it offers a curated suggestion list.
export { RhombusAutocompleteComponent } from './lib/autocomplete/rhombus-autocomplete.component';
export type {
  AutocompleteOption,
  AutocompleteFilterFn,
  AutocompleteDisplayFn,
} from './lib/autocomplete/rhombus-autocomplete.component';

// Selection list — a data-driven list over @angular/material/list in two modes:
// a multi/single-select listbox (mat-selection-list; value is always T[], D6) or
// an action-button list (mat-action-list). Options-array API; [control] binds
// Material's native CVA directly, or [(value)] for lightweight use. Distinct from
// Nav List (navigation via anchors/routerLink — a listbox can't hold interactive
// children) and from Select (a collapsed dropdown vs an always-visible list). The
// selected tint reuses the --nav-active-* contract pair.
export { RhombusSelectionListComponent } from './lib/selection-list/rhombus-selection-list.component';
export type {
  SelectionListOption,
  SelectionListMode,
} from './lib/selection-list/selection-list.types';

// Number input — a numeric spinbox: mat-form-field chrome + a bespoke ± / step /
// clamp / keyboard layer over a native <input type=number> (an implicit ARIA
// spinbutton). [control]/[(value)] control model via the internal mirrorControl
// helper; min/max/step/largeStep, clamp-on-blur, and inline ± glyphs. Exposes no
// new public type (reuses FormFieldAppearance/FormFieldSize). Distinct from Slider
// (a draggable bounded range) and a plain Input type=number (unbounded free text).
export { RhombusNumberInputComponent } from './lib/number-input/rhombus-number-input.component';

export type {
  FormFieldAppearance,
  FormFieldSize,
} from './lib/form-field/form-field.types';

// Marker projected as the error subscript of the form primitives above
// (replaces the pre-1.0 `slot="error"` convention).
export { RhombusErrorDirective } from './lib/form-field/rhombus-error.directive';

// Tag input — editable free-text chip editor (type + Enter to add, × to remove)
// bound to a string[]. Inlines <mat-chip-grid> + matChipInput and themes each
// tag via the [rhombusChip] bridge; same control model as the form primitives
// above (`[control]` for reactive forms, `[(tags)]` otherwise). The editor
// counterpart to the selection-oriented [rhombusChipGroup].
export { RhombusTagInputComponent } from './lib/tag-input/rhombus-tag-input.component';

// Selection control. Wraps <mat-checkbox>; same control model as the form
// primitives above (`[control]` for reactive forms, `[(checked)]` otherwise).
export { RhombusCheckboxComponent } from './lib/checkbox/rhombus-checkbox.component';

// Radio group. Wraps <mat-radio-group>; options-array API like select,
// `[control]` / `[(value)]` control model.
export { RhombusRadioGroupComponent } from './lib/radio/rhombus-radio-group.component';
export type { RadioOption } from './lib/radio/rhombus-radio-group.component';

// Segmented control. Wraps <mat-button-toggle-group>; options-array API, single
// or multiple selection, [control]/[(value)] model. The active segment uses the
// --nav-active-* contract pair (its first reuse outside nav-list). For inline
// view/unit switching — distinct from Radio (a form input) and Chip (removable
// filters). Replaces the Material button-toggle.
export { RhombusSegmentedComponent } from './lib/segmented/rhombus-segmented.component';
export type {
  SegmentOption,
  SegmentedSize,
} from './lib/segmented/rhombus-segmented.component';

// Switch. Wraps <mat-slide-toggle>; same control model as checkbox. Track colour
// is driven by the --switch-track-on/off contract tokens.
export { RhombusSwitchComponent } from './lib/switch/rhombus-switch.component';

// Slider. Wraps <mat-slider>; single value or a {start, end} range, with the
// [control]/[(value)] (and rangeControl/[(rangeValue)]) control model. Active
// track/handle read --text-accent; the value bubble borrows --tooltip-*. Range
// reactive-forms mode uses the internal mirrorControl helper to bind a
// FormControl<SliderRange> to Material's two thumbs.
export { RhombusSliderComponent } from './lib/slider/rhombus-slider.component';
export type { SliderRange } from './lib/slider/rhombus-slider.component';

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
export { RhombusShellFooterDirective } from './lib/app-shell/rhombus-shell-footer.directive';

// Accordion — a hand-rolled disclosure stack (native button headers + region
// bodies, full APG keyboard), single- or multi-expand. Project header content
// via the title/description inputs or the marker directives; body is the default
// slot. Themed off the contract — no Material expansion-panel underneath.
export { RhombusAccordionComponent } from './lib/accordion/rhombus-accordion.component';
export { RhombusAccordionPanelComponent } from './lib/accordion/rhombus-accordion-panel.component';
export { RhombusAccordionTitleDirective } from './lib/accordion/rhombus-accordion-title.directive';
export { RhombusAccordionDescriptionDirective } from './lib/accordion/rhombus-accordion-description.directive';

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

// Nav list — persistent, vertical, sectioned sidebar navigation for the
// app-shell [shellNav] slot (or any "link in bio" column). Router items
// self-highlight (routerLinkActive + aria-current="page"); href items support an
// external target + a manual `active` flag. First real consumer of the
// --nav-active-bg / --nav-active-text contract tokens.
export { RhombusNavListComponent } from './lib/nav-list/rhombus-nav-list.component';
export type {
  RhombusNavItem,
  RhombusNavSection,
} from './lib/nav-list/nav-list.types';

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

// Skeleton — a pure-CSS loading placeholder (bespoke, no Material, no new
// tokens). Renders a --surface-2 block with an optional compositor-only shimmer,
// dropped under prefers-reduced-motion (never blank). Decorative by default
// (aria-hidden); pass a label for a role=status busy region. Distinct from
// Progress (an indeterminate spinner/bar for a discrete wait) and Empty State
// (genuinely no data): Skeleton mimics the *shape* of content that's still loading.
export { RhombusSkeletonComponent } from './lib/skeleton/rhombus-skeleton.component';
export type { SkeletonVariant } from './lib/skeleton/rhombus-skeleton.component';

// Stat — a display-only KPI tile (bespoke, no Material, no new tokens) built to
// sit inside a Card. Two decoupled knobs (D8): `trend` drives the arrow, and
// `sentiment` drives the colour — so an inverted metric (falling churn) keeps a
// down arrow in a positive colour. Direction is conveyed three ways (colour +
// labelled arrow + visually-hidden phrase), never colour alone. Uses <dl>/<dt>/<dd>.
export { RhombusStatComponent } from './lib/stat/rhombus-stat.component';
export type {
  StatTrend,
  StatSentiment,
  StatSize,
} from './lib/stat/rhombus-stat.component';

// Sheet / Drawer — a modal edge slide-over opened imperatively via
// RhombusSheetService, built on @angular/cdk/dialog + overlay (NOT MatDialog).
// The RhombusSheetRef owns the CSS-only exit animation (D9). Boundary: a Sheet
// is a *temporary* modal panel (scrim + focus-trap) anchored to an edge — use
// the App Shell sidenav for a *persistent* layout frame, a Dialog for a centred
// modal, and a Popover for a small, non-modal, trigger-anchored panel.
export { RhombusSheetService } from './lib/sheet/rhombus-sheet.service';
export {
  RhombusSheetRef,
  RHOMBUS_SHEET_DATA,
} from './lib/sheet/rhombus-sheet-ref';
export { RhombusSheetComponent } from './lib/sheet/rhombus-sheet.component';
export { RhombusSheetActionsDirective } from './lib/sheet/rhombus-sheet-actions.directive';
export { RhombusSheetCloseDirective } from './lib/sheet/rhombus-sheet-close.directive';
export type {
  RhombusSheetConfig,
  SheetSide,
  SheetSize,
} from './lib/sheet/sheet.types';

// Stepper — an accessible wizard that *extends* CdkStepper (D10): the CDK
// supplies linear gating, stepControl validation, and roving-focus keyboard,
// while the chrome (role=tablist headers + role=tabpanel content, manual
// activation, horizontal + vertical) is themed off the contract — no
// @angular/material, no --mat-sys-*, no new peer. Boundary: a Stepper is a
// *sequential* flow that gates progress step-to-step — use Tabs for peer
// sections visited in any order, and an Accordion for independent collapsible
// disclosure.
export { RhombusStepperComponent } from './lib/stepper/rhombus-stepper.component';
export { RhombusStepComponent } from './lib/stepper/rhombus-step.component';
export { RhombusStepLabelDirective } from './lib/stepper/rhombus-step-label.directive';
export {
  RhombusStepperNextDirective,
  RhombusStepperPreviousDirective,
} from './lib/stepper/rhombus-stepper-buttons.directive';
export type {
  StepperOrientation,
  StepperLabelPosition,
  RhombusStepState,
} from './lib/stepper/stepper.types';

// Reorder list — a keyboard-first reorderable list. @angular/cdk/drag-drop gives
// the pointer drag, but cdkDrag is invisible to assistive tech, so the component
// *is* the keyboard grab-mode (space to pick up, arrows to move, escape to
// cancel) + LiveAnnouncer layer — plus explicit move buttons. `reordered` fires
// once per committed reorder. Boundary: a Reorder list *changes the order* of
// items — use a Nav list to navigate between destinations, and the Data table's
// sort headers to sort a grid by a column.
export { RhombusReorderListComponent } from './lib/reorder-list/rhombus-reorder-list.component';
export { RhombusReorderItemDirective } from './lib/reorder-list/rhombus-reorder-item.directive';
export type { RhombusReorderItemContext } from './lib/reorder-list/rhombus-reorder-item.directive';
export { RhombusReorderEmptyDirective } from './lib/reorder-list/rhombus-reorder-empty.directive';
export type {
  ReorderEvent,
  ReorderListOrientation,
  ReorderAnnounceContext,
} from './lib/reorder-list/reorder-list.types';
