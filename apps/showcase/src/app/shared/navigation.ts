/**
 * Single source of truth for the showcase's navigation. Consumed by the app
 * shell sidebar (`app.component`) and the Cmd-K command palette so the two can
 * never drift.
 */
export interface NavItem {
  path: string;
  label: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Get started',
    items: [
      { path: '/', label: 'Home' },
      { path: '/roadmap', label: 'Roadmap' },
      { path: '/migrate', label: 'Migrate from Material' },
      { path: '/theming', label: 'Theming' },
      { path: '/tokens', label: 'Design tokens' },
      { path: '/themes', label: 'Themes' },
      { path: '/motion', label: 'Motion' },
      { path: '/accessibility', label: 'Accessibility' },
    ],
  },
  {
    label: 'Primitives',
    items: [
      { path: '/components/button', label: 'Button' },
      { path: '/components/badge', label: 'Badge' },
      { path: '/components/card', label: 'Card' },
      { path: '/components/chip', label: 'Chip' },
      { path: '/components/icon', label: 'Icon' },
    ],
  },
  {
    label: 'Forms',
    items: [
      { path: '/components/checkbox', label: 'Checkbox' },
      { path: '/components/radio', label: 'Radio Group' },
      { path: '/components/switch', label: 'Switch' },
      { path: '/components/input', label: 'Input' },
      { path: '/components/textarea', label: 'Textarea' },
      { path: '/components/select', label: 'Select' },
    ],
  },
  {
    label: 'Data & overlays',
    items: [
      { path: '/components/data-table', label: 'Data Table' },
      { path: '/components/overflow-menu', label: 'Overflow Menu' },
      { path: '/components/tooltip', label: 'Tooltip' },
      { path: '/components/toast', label: 'Toast' },
      { path: '/components/dialog', label: 'Dialog' },
      { path: '/components/confirm-dialog', label: 'Confirm Dialog' },
    ],
  },
  {
    label: 'Navigation',
    items: [
      { path: '/components/tabs', label: 'Tabs' },
      { path: '/components/menu', label: 'Menu' },
      { path: '/components/popover', label: 'Popover' },
      { path: '/components/bottom-nav', label: 'Bottom nav' },
      { path: '/components/nav-list', label: 'Nav List' },
      { path: '/components/breadcrumbs', label: 'Breadcrumbs' },
      { path: '/components/pagination', label: 'Pagination' },
    ],
  },
  {
    label: 'Status & layout',
    items: [
      { path: '/components/progress', label: 'Progress' },
      { path: '/components/avatar', label: 'Avatar' },
      { path: '/components/alert', label: 'Alert' },
    ],
  },
  {
    label: 'Layout & theming',
    items: [
      { path: '/components/app-shell', label: 'App Shell' },
      { path: '/components/theme-toggle', label: 'Theme Controls' },
    ],
  },
  {
    label: 'Content',
    items: [
      { path: '/components/page-header', label: 'Page Header' },
      { path: '/components/empty-state', label: 'Empty State' },
      { path: '/components/code-block', label: 'Code Block' },
    ],
  },
];

/** Flattened page list with each item's group label, for search. */
export const NAV_COMMANDS: (NavItem & { group: string })[] = NAV_GROUPS.flatMap(
  (g) => g.items.map((i) => ({ ...i, group: g.label }))
);
