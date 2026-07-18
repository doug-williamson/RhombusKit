// The public roadmap, rendered at /roadmap. Hand-curated for now; a launch-time
// GitHub Action can regenerate this file from a Projects board + top-voted
// Discussions so it never goes stale. Tie items to release trains, never dates.
//
// Two parallel tracks:
//   • Components  — the component library, shipped in themed release-train "packs".
//   • Foundations — non-component system depth, theming, and DX/tooling.
// Each track has its own Now / Next / Considering. "Considering" is explicitly
// community-shaped — upvotes/requests move things up.

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
  /** Optional short chip: a release train (e.g. "v1.11") or a category ("Composite"). */
  tag?: string;
  /** Optional outbound link (an issue, a discussion, or a prefilled request). */
  link?: { label: string; url: string };
}

export interface RoadmapTrack {
  now: RoadmapItem[];
  next: RoadmapItem[];
  considering: RoadmapItem[];
}

export interface Roadmap {
  components: RoadmapTrack;
  foundations: RoadmapTrack;
}

export const ROADMAP: Roadmap = {
  components: {
    // Pack 1 — Parity primitives (v1.11): the thinnest wrappers that close the
    // last-cited Material parity gaps.
    now: [
      {
        title: 'Divider',
        detail:
          'A semantic horizontal or vertical rule with inset, accent, and labelled text-divider variants — replaces mat-divider.',
        tag: 'v1.11',
      },
      {
        title: 'Slider',
        detail:
          'Numeric single-value and {start, end} range control (min/max/step, discrete, tick marks) — wraps mat-slider.',
        tag: 'v1.11',
      },
      {
        title: 'Date range picker',
        detail:
          'Two-field start/end calendar with range highlighting and an ISO {start, end} value — closes the last Datepicker migration gap.',
        tag: 'v1.11',
      },
      {
        title: 'Segmented control',
        detail:
          'A connected group of mutually-exclusive toggle buttons for inline view or unit switching — replaces the Material button-toggle.',
        tag: 'v1.11',
      },
    ],
    // Pack 2 — Selection & entry (v1.12): richer input beyond the fixed-list Select.
    next: [
      {
        title: 'Autocomplete',
        detail:
          'Type-ahead filtering input with client-side or async filtering and a themed no-results state — beyond the fixed-list Select.',
        tag: 'v1.12',
      },
      {
        title: 'Selection list',
        detail:
          'An inline single- or multi-select list (role=listbox) plus a persistent action list — the mat-list slice the sidebar Nav List leaves open.',
        tag: 'v1.12',
      },
      {
        title: 'Number input',
        detail:
          'A compact numeric spinbox with increment/decrement buttons and min/max/step clamping for fast touch entry — Material ships no spinbox.',
        tag: 'v1.12',
      },
    ],
    // Pack 3 (v1.13, Dashboard & surfaces) + Pack 4 (v1.14, Rich interaction),
    // then the app-level Composite tier. All community-shaped.
    considering: [
      {
        title: 'Skeleton',
        detail:
          'Shimmer placeholder blocks for text, avatars, and cards while async content loads — a dashboard staple Material has no equivalent for.',
        tag: 'v1.13',
        link: { label: 'Request / upvote', url: requestComponentUrl('Skeleton') },
      },
      {
        title: 'Stat / Metric card',
        detail:
          'A KPI tile — label, large value, and an up/down delta — composed inside Card for dashboard headers.',
        tag: 'v1.13',
        link: { label: 'Request / upvote', url: requestComponentUrl('Stat / Metric card') },
      },
      {
        title: 'Sheet / Drawer',
        detail:
          'An edge-anchored slide-over panel (left, right, or bottom) with focus trap and scrim — a standalone drawer beyond the app-shell sidenav.',
        tag: 'v1.13',
        link: { label: 'Request / upvote', url: requestComponentUrl('Sheet / Drawer') },
      },
      {
        title: 'Stepper',
        detail:
          'Wizard-style sequential steps with linear gating and per-step validation — a common migration blocker.',
        tag: 'v1.14',
        link: { label: 'Request / upvote', url: requestComponentUrl('Stepper') },
      },
      {
        title: 'Drag-and-drop list',
        detail:
          'A keyboard-accessible wrapper over CDK drag-and-drop for reorderable lists, with move buttons and live-region announcements.',
        tag: 'v1.14',
        link: { label: 'Request / upvote', url: requestComponentUrl('Drag-and-drop list') },
      },
      {
        title: 'Carousel',
        detail:
          'A swipeable slide carousel with autoplay, pagination, and keyboard navigation — for galleries and onboarding tours, beyond anything Material ships.',
        tag: 'v1.14',
        link: { label: 'Request / upvote', url: requestComponentUrl('Carousel') },
      },
      {
        title: 'Command palette',
        detail:
          'A ⌘K quick-action / navigation overlay with fuzzy search — an app-level composite the showcase already dogfoods.',
        tag: 'Composite',
        link: { label: 'Request / upvote', url: requestComponentUrl('Command palette') },
      },
      {
        title: 'Tree / virtual scroll',
        detail:
          'A nested, keyboard-navigable tree and a virtualised long-list for large data sets.',
        tag: 'Composite',
        link: { label: 'Request / upvote', url: requestComponentUrl('Tree / virtual scroll') },
      },
      {
        title: 'Calendar / scheduler',
        detail:
          'A month/week calendar surface for scheduling and event display — beyond the date pickers.',
        tag: 'Composite',
        link: { label: 'Request / upvote', url: requestComponentUrl('Calendar / scheduler') },
      },
      {
        title: 'Data-viz primitives',
        detail:
          'Sparklines and small charts that pair with the Stat card for dashboards — themed off the token contract.',
        tag: 'Composite',
        link: { label: 'Request / upvote', url: requestComponentUrl('Data-viz primitives') },
      },
      {
        title: 'Your idea here',
        detail:
          'This column is shaped by what the community requests and upvotes. Tell us what you need next.',
        link: { label: 'Suggest a feature', url: `${REPO}/issues/new/choose` },
      },
    ],
  },
  foundations: {
    // System depth and DX that advance in parallel with the component packs.
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
        title: 'Density modes',
        detail:
          'Compact / comfortable density scales across components — the highest-leverage gap enterprise Material migrators hit right after parity.',
      },
    ],
    considering: [
      {
        title: 'Theme registry',
        detail:
          'Make custom and community themes first-class — registered, reflected, and persisted in the theme controls.',
      },
      {
        title: 'Theme builder',
        detail:
          'A visual generator that emits a token-override theme from a few seed colours, validated for AA contrast.',
      },
      {
        title: 'High-contrast theme',
        detail: 'A built-in high-contrast theme pack for low-vision and forced-colors users.',
      },
      {
        title: 'RTL & logical properties',
        detail:
          'A full right-to-left pass — logical properties and dir-aware layout across every component.',
      },
      {
        title: 'DX toolkit',
        detail:
          'ng-generate schematics for scaffolding, StackBlitz starters, VS Code snippets, and visual-regression + bundle-size CI.',
      },
      {
        title: 'MCP docs server',
        detail:
          'A Model Context Protocol server exposing the component and token docs to AI coding tools.',
        link: { label: 'Track #93', url: `${REPO}/issues/93` },
      },
      {
        title: 'Figma UI kit',
        detail: 'A Figma library mirroring the components and the token contract for designers.',
        link: { label: 'Track #94', url: `${REPO}/issues/94` },
      },
    ],
  },
};
