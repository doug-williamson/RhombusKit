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
      title: 'Public contribution flywheel',
      detail:
        'In-app feedback, the Angular Material migration gap-finder, llms.txt for AI assistants, and this roadmap — making RhombusKit easy to shape.',
    },
    {
      title: 'Community launch',
      detail:
        'Opening the project for public issues, discussions, and pull requests, with guided issue forms and a contribution guide.',
      link: { label: 'How to contribute', url: `${REPO}/blob/main/CONTRIBUTING.md` },
    },
  ],
  next: [
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
  considering: [
    {
      title: 'Datepicker',
      detail: 'A top Angular Material migration gap — no calendar date-selection component yet.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Datepicker') },
    },
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
      title: 'Expansion panel / Accordion',
      detail: 'Collapsible detail panels — frequently requested by migrators.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Expansion panel / Accordion') },
    },
    {
      title: 'Autocomplete',
      detail: 'Type-ahead filtering input — beyond the fixed-list Select.',
      link: { label: 'Request / upvote', url: requestComponentUrl('Autocomplete') },
    },
    {
      title: 'Your idea here',
      detail:
        'This column is shaped by what the community requests and upvotes. Tell us what you need next.',
      link: { label: 'Suggest a feature', url: `${REPO}/issues/new/choose` },
    },
  ],
};
