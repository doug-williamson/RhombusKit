import type { SemanticTokenName } from '../../types';
import { slate, violet, green, amber, red } from '../primitives';

export const rhombusDark: Record<SemanticTokenName, string> = {
  '--bg':           slate[950],
  '--bg-subtle':    slate[900],
  '--surface-0':    slate[900],
  '--surface-1':    slate[800],
  '--surface-2':    slate[700],
  '--surface-3':    slate[600],

  '--text-primary':   slate[50],
  '--text-secondary': slate[300],
  // slate[400] clears WCAG AA (4.5:1) on the dark surfaces; slate[500] failed
  // (~3.1:1) while staying distinct from secondary (slate[300]).
  '--text-muted':     slate[400],
  '--text-disabled':  slate[600],
  '--text-accent':    violet[400],
  '--text-on-accent': '#ffffff',

  '--border':        slate[700],
  '--border-strong': slate[500],
  '--border-accent': 'rgb(167 139 250 / 0.40)',

  // Two-layer focus: --focus-border is the sharp 1px outline,
  // --focus-ring is the soft glow halo painted as box-shadow.
  '--focus-ring':   'rgb(167 139 250 / 0.28)',
  '--focus-border': violet[400],

  '--error':    red[500],
  '--error-bg': '#2a0a0a',

  // violet[600] as the filled-button fill: white label clears AA (5.7:1);
  // violet[500] failed (4.23:1). Hover deepens to violet[700] (still AA) rather
  // than lightening, which would drop white below AA. On-surface accent text
  // (text/outlined buttons, links) uses --text-accent (violet[400]) instead.
  '--btn-primary-bg':    violet[600],
  '--btn-primary-text':  '#ffffff',
  '--btn-primary-hover': violet[700],

  '--nav-active-bg':   'rgb(167 139 250 / 0.14)',
  '--nav-active-text': slate[50],

  '--switch-track-off': slate[600],
  '--switch-track-on':  violet[500],

  '--tooltip-bg':   slate[700],
  '--tooltip-text': '#ffffff',

  // Toast — deep tinted bg + bright on-tint text, matching the --status-* dark
  // pattern. "info" is neutral slate (no blue primitive in the palette).
  '--toast-info-bg':      slate[800],
  '--toast-info-text':    slate[200],
  '--toast-success-bg':   '#002a0f',
  '--toast-success-text': green[500],
  '--toast-warning-bg':   '#2a1f00',
  '--toast-warning-text': amber[500],
  '--toast-error-bg':     '#2a0a0a',
  '--toast-error-text':   red[500],

  '--shadow-sm':           '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  '--shadow-md':           '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  '--shadow-lg':           '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  '--shadow-xl':           '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  '--shadow-btn-primary':  '0 1px 2px 0 rgb(0 0 0 / 0.4)',

  // Font families — CONTRACT aliases over the font-family-* primitives,
  // so consumers can write var(--font-sans) instead of var(--font-family-sans).
  '--font-sans':  'var(--font-family-sans)',
  '--font-mono':  'var(--font-family-mono)',
  '--font-prose': 'var(--font-family-prose)',

  '--status-draft-bg':        '#2a1f00',
  '--status-draft-text':      amber[500],
  '--status-published-bg':    '#002a0f',
  '--status-published-text':  green[500],
  '--status-scheduled-bg':    '#1a0a3a',
  '--status-scheduled-text':  violet[400],
  '--status-archived-bg':     slate[800],
  '--status-archived-text':   slate[400],

  // Code / syntax highlighting — brighter palette steps so each role is AA
  // (≥4.5:1) on --surface-0 (slate[900]); mirrors the light theme's roles.
  '--code-keyword':     violet[300],
  '--code-string':      green[500],
  '--code-function':    amber[500],
  '--code-number':      red[500],
  '--code-comment':     slate[400],
  '--code-punctuation': slate[300],
};
