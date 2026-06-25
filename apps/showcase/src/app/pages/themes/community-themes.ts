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
const DARK = tokens.themes['rhombus-dark'] as Record<string, string>;

// "Teal Light" — recolours the violet accent family to teal while keeping
// RhombusKit's accessible neutral + text scale. Example community theme: start
// from a built-in pack and override only the accent-family tokens.
const tealLight: CommunityTheme = {
  slug: 'teal-light',
  label: 'Teal Light',
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

// "Teal Dark" — the dark counterpart. Same recolour over the built-in DARK pack,
// but accents brighten for legibility on dark surfaces: light-teal accent text,
// a teal-700 fill that still clears AA against its white label, and solid (not
// translucent) paired bg/text for the nav + status-scheduled chips so the
// contrast guard — which measures the colour, not the alpha — sees a real ratio.
const tealDark: CommunityTheme = {
  slug: 'teal-dark',
  label: 'Teal Dark',
  author: 'RhombusKit',
  mode: 'dark',
  values: {
    ...DARK,
    '--text-accent': '#2dd4bf', // teal-400 — clears AA on --bg/--surface-0
    '--border-accent': 'rgb(45 212 191 / 0.40)',
    '--focus-border': '#2dd4bf',
    '--focus-ring': 'rgb(45 212 191 / 0.28)',
    '--btn-primary-bg': '#0f766e', // teal-700 — white label clears AA (5.5:1)
    '--btn-primary-hover': '#115e59',
    '--nav-active-bg': '#042f2e', // teal-950, solid
    '--nav-active-text': '#5eead4', // teal-300
    '--switch-track-on': '#14b8a6', // teal-500
    '--status-scheduled-bg': '#042f2e',
    '--status-scheduled-text': '#5eead4',
    '--code-keyword': '#5eead4', // teal-300 on --surface-0
  },
};

export const COMMUNITY_THEMES: CommunityTheme[] = [tealLight, tealDark];
