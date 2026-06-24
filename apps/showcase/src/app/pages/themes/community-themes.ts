import { tokens } from '@rhombuskit/tokens';

/**
 * A community theme is a token map over the 58 CONTRACT names — no code, no
 * selectors. Contributing one is a token-only change validated in CI for both
 * CONTRACT completeness AND WCAG AA contrast (see community-themes.spec.ts), so
 * it's the lowest-barrier first contribution that still can't dilute the
 * contract or ship an inaccessible palette.
 */
export interface CommunityTheme {
  slug: string;
  label: string;
  author: string;
  mode: 'light' | 'dark';
  /** Full map over the 58 CONTRACT token names. */
  values: Record<string, string>;
}

const LIGHT = tokens.themes['rhombus-light'] as Record<string, string>;

// "Teal" — recolours the violet accent family to teal while keeping
// RhombusKit's accessible neutral + text scale. Example community theme.
const teal: CommunityTheme = {
  slug: 'teal',
  label: 'Teal',
  author: 'RhombusKit',
  mode: 'light',
  values: {
    ...LIGHT,
    '--text-accent': '#0f766e',
    '--border-accent': '#99f6e4',
    '--focus-border': '#0f766e',
    '--focus-ring': 'rgb(15 118 110 / 0.22)',
    '--btn-primary-bg': '#0f766e',
    '--btn-primary-hover': '#115e59',
    '--nav-active-bg': '#f0fdfa',
    '--nav-active-text': '#0f766e',
    '--switch-track-on': '#0f766e',
    '--shadow-btn-primary': '0 1px 2px 0 rgb(15 118 110 / 0.25)',
    '--status-scheduled-bg': '#f0fdfa',
    '--status-scheduled-text': '#0f766e',
    '--code-keyword': '#0f766e',
  },
};

export const COMMUNITY_THEMES: CommunityTheme[] = [teal];
