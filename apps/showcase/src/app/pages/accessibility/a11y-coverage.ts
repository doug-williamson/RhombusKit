// Components whose showcase pages are scanned by the axe color-contrast gate in
// BOTH themes on every PR. This is the SINGLE SOURCE OF TRUTH for that set:
// apps/showcase-e2e/tests/contrast.spec.ts derives its scanned COMPONENTS from
// this list, and the /accessibility page renders its coverage table from it — so
// the scan and the table can never drift. accessibility-page.component.spec.ts
// asserts this stays EXACTLY the set of real /components/* routes, so adding a
// component page forces adding it here (or the gate goes red).
export interface CoveredComponent {
  slug: string;
  label: string;
}

export const CONTRAST_VERIFIED: CoveredComponent[] = [
  { slug: 'button', label: 'Button' },
  { slug: 'badge', label: 'Badge' },
  { slug: 'card', label: 'Card' },
  { slug: 'chip', label: 'Chip' },
  { slug: 'tag', label: 'Tag' },
  { slug: 'icon', label: 'Icon' },
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
  { slug: 'tag-input', label: 'Tag Input' },
  { slug: 'data-table', label: 'Data Table' },
  { slug: 'overflow-menu', label: 'Overflow Menu' },
  { slug: 'tooltip', label: 'Tooltip' },
  { slug: 'toast', label: 'Toast' },
  { slug: 'dialog', label: 'Dialog' },
  { slug: 'confirm-dialog', label: 'Confirm Dialog' },
  { slug: 'sheet', label: 'Sheet' },
  { slug: 'tabs', label: 'Tabs' },
  { slug: 'menu', label: 'Menu' },
  { slug: 'popover', label: 'Popover' },
  { slug: 'bottom-nav', label: 'Bottom Nav' },
  { slug: 'nav-list', label: 'Nav List' },
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
  { slug: 'reorder-list', label: 'Reorder List' },
  { slug: 'carousel', label: 'Carousel' },
];
