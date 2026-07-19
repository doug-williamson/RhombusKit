// Components whose showcase pages are scanned by the axe color-contrast gate in
// BOTH themes on every PR. Mirrors the COMPONENTS list in
// apps/showcase-e2e/tests/contrast.spec.ts — keep the two in sync (the spec is
// the source of truth; this drives the honest coverage table on /accessibility).
// Verified by a11y-coverage.spec.ts: every slug here must be a real component route.
export interface CoveredComponent {
  slug: string;
  label: string;
}

export const CONTRAST_VERIFIED: CoveredComponent[] = [
  { slug: 'button', label: 'Button' },
  { slug: 'badge', label: 'Badge' },
  { slug: 'card', label: 'Card' },
  { slug: 'chip', label: 'Chip' },
  { slug: 'divider', label: 'Divider' },
  { slug: 'checkbox', label: 'Checkbox' },
  { slug: 'radio', label: 'Radio Group' },
  { slug: 'segmented', label: 'Segmented' },
  { slug: 'switch', label: 'Switch' },
  { slug: 'slider', label: 'Slider' },
  { slug: 'input', label: 'Input' },
  { slug: 'textarea', label: 'Textarea' },
  { slug: 'select', label: 'Select' },
  { slug: 'autocomplete', label: 'Autocomplete' },
  { slug: 'selection-list', label: 'Selection List' },
  { slug: 'number-input', label: 'Number Input' },
  { slug: 'date-picker', label: 'Date Picker' },
  { slug: 'date-range-picker', label: 'Date Range Picker' },
  { slug: 'data-table', label: 'Data Table' },
  { slug: 'overflow-menu', label: 'Overflow Menu' },
  { slug: 'tooltip', label: 'Tooltip' },
  { slug: 'toast', label: 'Toast' },
  { slug: 'dialog', label: 'Dialog' },
  { slug: 'confirm-dialog', label: 'Confirm Dialog' },
  { slug: 'sheet', label: 'Sheet' },
  { slug: 'tabs', label: 'Tabs' },
  { slug: 'menu', label: 'Menu' },
  { slug: 'breadcrumbs', label: 'Breadcrumbs' },
  { slug: 'pagination', label: 'Pagination' },
  { slug: 'progress', label: 'Progress' },
  { slug: 'skeleton', label: 'Skeleton' },
  { slug: 'stat', label: 'Stat' },
  { slug: 'avatar', label: 'Avatar' },
  { slug: 'alert', label: 'Alert' },
  { slug: 'theme-toggle', label: 'Theme Controls' },
  { slug: 'app-shell', label: 'App Shell' },
  { slug: 'page-header', label: 'Page Header' },
  { slug: 'empty-state', label: 'Empty State' },
  { slug: 'code-block', label: 'Code Block' },
  { slug: 'accordion', label: 'Accordion' },
  { slug: 'stepper', label: 'Stepper' },
];
