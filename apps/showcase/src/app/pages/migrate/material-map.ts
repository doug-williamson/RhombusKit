// Angular Material / CDK → RhombusKit migration map, powering the gap-finder on
// /migrate. Web-researched against material.angular.dev (Angular v21 line) and
// the @rhombuskit/core surface. "full" = a direct RhombusKit equivalent;
// "partial" = covered differently / with caveats; "gap" = no first-party
// RhombusKit equivalent yet (a "request this" target). A gap never blocks
// migration: RhombusKit is built over Material, so keep importing the
// underlying @angular/material or @angular/cdk piece while you migrate the rest.

export type MatchKind = 'full' | 'partial' | 'gap';

export interface MigrationRow {
  /** Material/CDK feature name. */
  material: string;
  /** Primary selector/class being replaced (used in prefilled issue links). */
  api: string;
  /** Source package. */
  pkg: 'material' | 'cdk';
  /** RhombusKit equivalent, or '' for a gap. */
  rk: string;
  match: MatchKind;
  /** One line: what maps, what differs, or why it's a gap. */
  note: string;
}

export const MATERIAL_MAP: MigrationRow[] = [
  // ── Angular Material (visible components) ──────────────────────────────────
  { material: 'Autocomplete', api: 'mat-autocomplete', pkg: 'material', rk: 'Autocomplete', match: 'full', note: 'rhombus-autocomplete is a type-ahead combobox: options-array with client-side filterWith (or null + queryChange for server-side search), free-text by default, loading and no-results states, and the [control] model.' },
  { material: 'Badge', api: 'matBadge', pkg: 'material', rk: 'Badge', match: 'full', note: 'rhombus-badge is a direct count/status overlay equivalent.' },
  { material: 'Bottom Sheet', api: 'MatBottomSheet', pkg: 'material', rk: 'Sheet', match: 'full', note: 'RhombusSheetService opens an edge-anchored modal slide-over (side="bottom" for the bottom-sheet case, or left/right drawers) on @angular/cdk/dialog + overlay — scrim, focus-trap, focus-restore — with a CSS-only slide and no @angular/animations.' },
  { material: 'Button', api: 'matButton', pkg: 'material', rk: 'Button', match: 'full', note: 'Covers the button variants; verify FAB/mini-FAB styling.' },
  { material: 'Button Toggle', api: 'mat-button-toggle', pkg: 'material', rk: 'Segmented', match: 'full', note: 'rhombus-segmented is a connected single- or multi-select toggle-button group (options-array API) for inline view/unit switching — distinct from Radio Group (a form input) and Chip (removable filters).' },
  { material: 'Card', api: 'mat-card', pkg: 'material', rk: 'Card', match: 'full', note: 'rhombus-card is a direct content-surface equivalent.' },
  { material: 'Checkbox', api: 'mat-checkbox', pkg: 'material', rk: 'Checkbox', match: 'full', note: 'Binary + indeterminate, form-bound.' },
  { material: 'Chips', api: 'mat-chip', pkg: 'material', rk: 'Chip', match: 'partial', note: 'Display/filter/selection chips map; chip-grid text entry is not covered.' },
  { material: 'Datepicker', api: 'mat-datepicker', pkg: 'material', rk: 'Date Picker', match: 'full', note: 'rhombus-date-picker covers single-date selection (ISO string), and rhombus-date-range-picker covers start/end range selection (ISO {start, end} pair).' },
  { material: 'Dialog', api: 'MatDialog', pkg: 'material', rk: 'Dialog', match: 'full', note: 'RhombusDialogService + Confirm Dialog wrap MatDialog.' },
  { material: 'Divider', api: 'mat-divider', pkg: 'material', rk: 'Divider', match: 'full', note: 'rhombus-divider — role=separator rule; horizontal/vertical, inset, accent, and labelled text-divider variants.' },
  { material: 'Expansion Panel / Accordion', api: 'mat-expansion-panel', pkg: 'material', rk: 'Accordion', match: 'full', note: 'rhombus-accordion + rhombus-accordion-panel cover single/multi-expand collapsible sections.' },
  { material: 'Form Field', api: 'mat-form-field', pkg: 'material', rk: 'Input', match: 'full', note: 'Form-field wrapper provides label/hint/error/affixes around Input/Textarea/Select.' },
  { material: 'Grid List', api: 'mat-grid-list', pkg: 'material', rk: '', match: 'gap', note: 'No tile grid-layout component.' },
  { material: 'Icon', api: 'mat-icon', pkg: 'material', rk: 'Icon', match: 'full', note: 'rhombus-icon (registry + mat-icon fallback).' },
  { material: 'Input', api: 'matInput', pkg: 'material', rk: 'Input', match: 'full', note: 'rhombusInput + Textarea replace matInput on native controls.' },
  { material: 'List', api: 'mat-list', pkg: 'material', rk: 'Selection List', match: 'partial', note: 'rhombus-selection-list covers the selection listbox (mat-selection-list) and action list (mat-action-list); Nav List covers navigation lists. A plain display / definition list stays Material.' },
  { material: 'Menu', api: 'mat-menu', pkg: 'material', rk: 'Menu', match: 'full', note: 'Menu (+ Overflow Menu) provide the triggered floating choice panel.' },
  { material: 'Paginator', api: 'mat-paginator', pkg: 'material', rk: 'Pagination', match: 'full', note: 'Covers paged-data navigation; verify page-size selector parity.' },
  { material: 'Progress Bar', api: 'mat-progress-bar', pkg: 'material', rk: 'Progress', match: 'full', note: 'Progress ships a determinate/indeterminate bar.' },
  { material: 'Progress Spinner', api: 'mat-progress-spinner', pkg: 'material', rk: 'Progress', match: 'full', note: 'Progress ships a spinner.' },
  { material: 'Radio Button', api: 'mat-radio-group', pkg: 'material', rk: 'Radio Group', match: 'full', note: 'rhombus-radio-group is a direct single-selection equivalent.' },
  { material: 'Select', api: 'mat-select', pkg: 'material', rk: 'Select', match: 'full', note: 'Single/multi option selection in a form field.' },
  { material: 'Sidenav', api: 'mat-sidenav', pkg: 'material', rk: 'App Shell', match: 'partial', note: 'App Shell covers a persistent collapsible sidenav layout; a modal edge drawer (over="true") maps to Sheet. Neither is a standalone unstyled sidenav primitive.' },
  { material: 'Slide Toggle', api: 'mat-slide-toggle', pkg: 'material', rk: 'Switch', match: 'full', note: 'rhombus-switch is a direct boolean on/off equivalent.' },
  { material: 'Slider', api: 'mat-slider', pkg: 'material', rk: 'Slider', match: 'full', note: 'rhombus-slider wraps mat-slider with single-value and {start, end} range modes, min/max/step/discrete/tick marks, and the [control]/[(value)] control model.' },
  { material: 'Snack Bar', api: 'MatSnackBar', pkg: 'material', rk: 'Toast', match: 'full', note: 'RhombusToastService wraps MatSnackBar.' },
  { material: 'Sort Header', api: 'matSort', pkg: 'material', rk: 'Data Table', match: 'full', note: 'Data Table provides controlled sortable column headers.' },
  { material: 'Stepper', api: 'mat-stepper', pkg: 'material', rk: '', match: 'gap', note: 'No wizard/stepper component.' },
  { material: 'Table', api: 'mat-table', pkg: 'material', rk: 'Data Table', match: 'full', note: 'Replaces mat-table with sort + responsive hints; verify advanced cell/footer templating.' },
  { material: 'Tabs', api: 'mat-tab-group', pkg: 'material', rk: 'Tabs', match: 'full', note: 'rhombusTabGroup wraps MatTabs.' },
  { material: 'Timepicker', api: 'mat-timepicker', pkg: 'material', rk: '', match: 'gap', note: 'No time-of-day selection component.' },
  { material: 'Toolbar', api: 'mat-toolbar', pkg: 'material', rk: 'App Shell', match: 'partial', note: 'App Shell top-bar + Page Header cover header use, but no standalone toolbar/footer container.' },
  { material: 'Tooltip', api: 'matTooltip', pkg: 'material', rk: 'Tooltip', match: 'full', note: 'rhombusTooltip is a direct hover/focus tooltip equivalent.' },
  { material: 'Tree', api: 'mat-tree', pkg: 'material', rk: '', match: 'gap', note: 'No hierarchical tree-view component.' },

  // ── Angular CDK (utilities / primitives) ───────────────────────────────────
  { material: 'Drag and Drop', api: 'cdkDrag', pkg: 'cdk', rk: '', match: 'gap', note: 'No drag/drop wrapper — use @angular/cdk directly.' },
  { material: 'Overlay', api: 'OverlayModule', pkg: 'cdk', rk: 'Popover', match: 'partial', note: 'Used internally (Popover/Menu/Tooltip/Dialog); no general positioning service is exposed.' },
  { material: 'Portal', api: 'CdkPortal', pkg: 'cdk', rk: '', match: 'gap', note: 'Low-level primitive; not re-exported.' },
  { material: 'Tree (CDK)', api: 'cdk-tree', pkg: 'cdk', rk: '', match: 'gap', note: 'Unstyled tree primitive; no RhombusKit tree.' },
  { material: 'Table (CDK)', api: 'cdk-table', pkg: 'cdk', rk: 'Data Table', match: 'partial', note: 'Data Table covers the styled case, not an unstyled fully-custom primitive.' },
  { material: 'Accordion (CDK)', api: 'CdkAccordion', pkg: 'cdk', rk: 'Accordion', match: 'partial', note: 'rhombus-accordion is a styled, opinionated accordion, not the unstyled CDK behaviour primitive.' },
  { material: 'Stepper (CDK)', api: 'CdkStepper', pkg: 'cdk', rk: '', match: 'gap', note: 'No stepper logic/component.' },
  { material: 'Dialog (CDK)', api: 'CdkDialog', pkg: 'cdk', rk: 'Dialog', match: 'partial', note: 'RhombusDialogService (centred) and RhombusSheetService (edge slide-over) both build on the CDK dialog, but are opinionated wrappers, not the low-level primitive.' },
  { material: 'Menu (CDK)', api: 'cdkMenu', pkg: 'cdk', rk: 'Menu', match: 'partial', note: 'Covers triggered menus, not the full WAI-ARIA menubar/context-menu surface.' },
  { material: 'Listbox (CDK)', api: 'cdkListbox', pkg: 'cdk', rk: 'Select', match: 'partial', note: 'Select covers dropdown choice, not a standalone inline listbox primitive.' },
  { material: 'A11y (CDK)', api: 'A11yModule', pkg: 'cdk', rk: '', match: 'gap', note: 'FocusTrap/LiveAnnouncer/FocusMonitor — used internally, not re-exported.' },
  { material: 'Scrolling / Virtual Scroll (CDK)', api: 'cdk-virtual-scroll-viewport', pkg: 'cdk', rk: '', match: 'gap', note: 'No virtual-scroll wrapper — use @angular/cdk directly.' },
  { material: 'Layout / BreakpointObserver (CDK)', api: 'BreakpointObserver', pkg: 'cdk', rk: '', match: 'gap', note: 'Responsive utility; Data Table/App Shell handle responsiveness internally.' },
  { material: 'Text Field / autosize (CDK)', api: 'cdkTextareaAutosize', pkg: 'cdk', rk: '', match: 'gap', note: 'Autosize/autofill utility not wrapped.' },
  { material: 'Clipboard (CDK)', api: 'cdkCopyToClipboard', pkg: 'cdk', rk: 'Code Block', match: 'partial', note: 'Code Block has a copy action; no general clipboard directive.' },
  { material: 'Observers (CDK)', api: 'cdkObserveContent', pkg: 'cdk', rk: '', match: 'gap', note: 'DOM-mutation utility; not wrapped.' },
  { material: 'Platform (CDK)', api: 'Platform', pkg: 'cdk', rk: '', match: 'gap', note: 'Runtime detection utility; not exposed.' },
  { material: 'Bidi / Directionality (CDK)', api: 'Directionality', pkg: 'cdk', rk: '', match: 'gap', note: 'Directionality utility; not wrapped.' },
  { material: 'Coercion (CDK)', api: 'coerceBooleanProperty', pkg: 'cdk', rk: '', match: 'gap', note: 'Helper functions; signal inputs supersede these internally.' },
  { material: 'Collections (CDK)', api: 'SelectionModel', pkg: 'cdk', rk: '', match: 'gap', note: 'DataSource/SelectionModel; Data Table uses its own data inputs.' },
];

export interface CompareRow {
  feature: string;
  rhombuskit: string;
  material: string;
  primeng: string;
  taiga: string;
  spartan: string;
}

// Web-researched (Nov 2025), kept deliberately fair — see the note under the
// table on /migrate. RhombusKit leads on a11y-in-CI and the token contract;
// it is honestly behind on component count and is newer / smaller-backed.
export const COMPARISON: CompareRow[] = [
  {
    feature: 'Accessibility',
    rhombuskit: 'WCAG 2.1 AA verified in CI',
    material: 'No blanket conformance claim',
    primeng: 'AA stated; challenged in practice',
    taiga: 'No published WCAG level',
    spartan: 'No published WCAG level',
  },
  {
    feature: 'Theming',
    rhombuskit: 'Frozen design-token CONTRACT, CI-guarded',
    material: 'Material 3 Sass + --mat-sys-* vars',
    primeng: 'Token presets + CSS vars',
    taiga: 'CSS variables',
    spartan: 'Tailwind (you own the styles)',
  },
  {
    feature: 'Signals / standalone',
    rhombuskit: 'Signal-based, standalone',
    material: 'Zoneless default; API not signal-first',
    primeng: 'Initial zoneless; rewrite is separate',
    taiga: 'Standalone, signals-friendly',
    spartan: 'Signals-native (headless)',
  },
  {
    feature: 'Components',
    rhombuskit: '~43',
    material: '~35 + CDK',
    primeng: '80+',
    taiga: '130+',
    spartan: '55+',
  },
  {
    feature: 'License',
    rhombuskit: 'MIT',
    material: 'MIT (Google)',
    primeng: 'MIT; LTS paywalled',
    taiga: 'Apache 2.0',
    spartan: 'MIT',
  },
  {
    feature: 'Backing',
    rhombuskit: 'Independent open source',
    material: 'Google Angular team',
    primeng: 'PrimeTek (commercial)',
    taiga: 'T-Bank-origin team',
    spartan: 'Community + sponsors',
  },
];
