// The public roadmap, rendered at /roadmap. Hand-curated for now; a launch-time
// GitHub Action can regenerate this file from a Projects board + top-voted
// Discussions so it never goes stale. Tie items to release trains, never dates.
// "Considering" is explicitly community-shaped — upvotes/requests move things up.

const REPO = 'https://github.com/doug-williamson/RhombusKit';

/** Prefilled new-component proposal link for a community-requested component. */
function requestComponentUrl(name: string): string {
  const params = new URLSearchParams({
    template: '3-new-component-proposal.yml',
    title: `[Component]: ${name}`,
    labels: 'new-component,needs-triage',
    name,
  });
  return `${REPO}/issues/new?${params.toString()}`;
}

export interface RoadmapItem {
  title: string;
  detail: string;
  /** Optional outbound link (an issue, a discussion, or a prefilled request). */
  link?: { label: string; url: string };
}

export interface Roadmap {
  now: RoadmapItem[];
  next: RoadmapItem[];
  considering: RoadmapItem[];
}

export const ROADMAP: Roadmap = {
  now: [
    {
      title: 'Motion: exit animations',
      detail:
        'Extend the motion foundation beyond enter-only — overlay/popover exit transitions and Tier 2 component motion.',
    },
    {
      title: 'Icon migration follow-ups',
      detail: 'Finish the mat-icon → rhombus-icon migration across consumers.',
    },
  ],
  next: [
    {
      title: 'Date range picker',
      detail:
        'Two-field start/end calendar with range highlighting — extends the single-date Date Picker shipped in v1.9 to close the last Datepicker migration gap.',
    },
  ],
  considering: [
    {
      title: 'Slider',
      detail: 'Numeric / range control — requested by Material migrators.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Slider') },
    },
    {
      title: 'Stepper',
      detail: 'Wizard-style sequential steps — a common migration blocker.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Stepper') },
    },
    {
      title: 'Autocomplete',
      detail: 'Type-ahead filtering input — beyond the fixed-list Select.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Autocomplete') },
    },
    {
      title: 'Skeleton',
      detail:
        'Shimmer placeholder blocks for text, avatars, and cards while async content loads — a dashboard staple Material has no equivalent for.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Skeleton') },
    },
    {
      title: 'Segmented control',
      detail:
        'A connected group of mutually-exclusive toggle buttons for inline view or unit switching — replaces the Material button-toggle.',
      link: {
        label: 'Request / upvote',
        url: requestComponentUrl('Segmented control / Button toggle'),
      },
    },
    {
      title: 'Sheet / Drawer',
      detail:
        'An edge-anchored slide-over panel (left, right, or bottom) with focus trap and scrim — a standalone drawer beyond the app-shell sidenav.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Sheet / Drawer') },
    },
    {
      title: 'Selection list',
      detail:
        'An inline single- or multi-select list (role=listbox) plus a persistent action list — the mat-list slice the sidebar Nav List leaves open.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Selection list') },
    },
    {
      title: 'Number stepper',
      detail:
        'A compact numeric input with increment/decrement buttons and min/max/step clamping for fast touch entry — Material ships no spinbox.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Number stepper') },
    },
    {
      title: 'Divider',
      detail:
        'A semantic horizontal or vertical rule with inset and orientation variants — replaces mat-divider.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Divider') },
    },
    {
      title: 'Stat / Metric card',
      detail:
        'A KPI tile — label, large value, and an up/down delta — composed inside Card for dashboard headers.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Stat / Metric card') },
    },
    {
      title: 'Drag-and-drop list',
      detail:
        'A keyboard-accessible wrapper over CDK drag-and-drop for reorderable lists, with move affordances and live-region announcements.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Drag-and-drop list') },
    },
    {
      title: 'Carousel',
      detail:
        'A swipeable slide carousel with autoplay, pagination, and keyboard navigation — for galleries and onboarding tours, beyond anything Material ships.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Carousel') },
    },
    {
      title: 'Your idea here',
      detail:
        'This column is shaped by what the community requests and upvotes. Tell us what you need next.',
      link: { label: 'Suggest a feature', url: `${REPO}/issues/new/choose` },
    },
  ],
};
