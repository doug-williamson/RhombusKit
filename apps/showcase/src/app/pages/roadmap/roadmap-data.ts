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
    // Pack 3 — Dashboard & surfaces (v1.13): the current release train.
    now: [
      {
        title: 'Skeleton',
        detail:
          'Pure-CSS shimmer placeholder blocks for text, avatars, and cards while async content loads — decorative by default, or an announced role="status" busy region. Material ships no equivalent.',
        tag: 'v1.13',
      },
      {
        title: 'Stat / Metric card',
        detail:
          'A KPI tile — label, large value, and a delta pill whose arrow (trend) and colour (sentiment) are decoupled, so an inverted metric like churn keeps its true direction — built to sit inside Card.',
        tag: 'v1.13',
      },
      {
        title: 'Sheet / Drawer',
        detail:
          'An edge-anchored modal slide-over (left, right, or bottom) on CDK dialog + overlay — focus trap, scrim, and a CSS-only slide with no @angular/animations. Replaces MatBottomSheet.',
        tag: 'v1.13',
      },
    ],
    // Pack 4 — Rich interaction (v1.14): the next train.
    next: [
      {
        title: 'Stepper',
        detail:
          'Wizard-style sequential steps with linear gating and per-step validation — a common migration blocker.',
        tag: 'v1.14',
      },
      {
        title: 'Drag-and-drop list',
        detail:
          'A keyboard-accessible wrapper over CDK drag-and-drop for reorderable lists, with move buttons and live-region announcements.',
        tag: 'v1.14',
      },
      {
        title: 'Carousel',
        detail:
          'A swipeable slide carousel with autoplay, pagination, and keyboard navigation — for galleries and onboarding tours, beyond anything Material ships.',
        tag: 'v1.14',
      },
    ],
    // The app-level Composite tier — community-shaped. Requests and upvotes move
    // items up; each links to a prefilled proposal. (Packs 3 & 4 have graduated
    // to Shipping now / Up next above.)
    considering: [
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
