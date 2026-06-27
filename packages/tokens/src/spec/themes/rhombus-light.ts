import type { SemanticTokenName } from '../../types';
import { slate, violet, green, amber, red } from '../primitives';

export const rhombusLight: Record<SemanticTokenName, string> = {
  '--bg':           slate[50],
  '--bg-subtle':    slate[100],
  '--surface-0':    '#ffffff',
  '--surface-1':    slate[100],
  '--surface-2':    slate[200],
  '--surface-3':    slate[300],

  '--text-primary':   slate[900],
  '--text-secondary': slate[600],
  // slate[500] keeps muted distinct from secondary while clearing WCAG AA
  // (4.5:1) on --bg / --surface-0; slate[400] failed (~2.4:1).
  '--text-muted':     slate[500],
  '--text-disabled':  slate[300],
  '--text-accent':    violet[600],
  '--text-on-accent': '#ffffff',

  '--border':        slate[200],
  '--border-strong': slate[400],
  '--border-accent': violet[200],

  // Two-layer focus: --focus-border is the sharp 1px outline,
  // --focus-ring is the soft glow halo painted as box-shadow.
  '--focus-ring':   'rgb(124 58 237 / 0.22)',
  '--focus-border': violet[600],

  '--error':    red[600],
  '--error-bg': red[50],

  '--btn-primary-bg':    violet[600],
  '--btn-primary-text':  '#ffffff',
  '--btn-primary-hover': violet[700],

  '--nav-active-bg':   violet[50],
  '--nav-active-text': violet[700],

  '--switch-track-off': slate[300],
  '--switch-track-on':  violet[600],

  '--tooltip-bg':   slate[900],
  '--tooltip-text': '#ffffff',

  // Toast — tinted bg + readable on-tint text, one pair per severity.
  // "info" is neutral slate (no blue primitive in the palette).
  '--toast-info-bg':      slate[100],
  '--toast-info-text':    slate[700],
  // Status/toast text sits on its own tinted 50-step bg; the 600 steps missed
  // AA (~3.1:1), the 700 steps clear it (≥4.5:1).
  '--toast-success-bg':   green[50],
  '--toast-success-text': green[700],
  '--toast-warning-bg':   amber[50],
  '--toast-warning-text': amber[700],
  '--toast-error-bg':     red[50],
  '--toast-error-text':   red[700],

  '--shadow-sm':           '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--shadow-md':           '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  '--shadow-lg':           '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  '--shadow-xl':           '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '--shadow-btn-primary':  '0 1px 2px 0 rgb(124 58 237 / 0.25)',

  // Font families — CONTRACT aliases over the font-family-* primitives,
  // so consumers can write var(--font-sans) instead of var(--font-family-sans).
  '--font-sans':  'var(--font-family-sans)',
  '--font-mono':  'var(--font-family-mono)',
  '--font-prose': 'var(--font-family-prose)',

  '--status-draft-bg':        amber[50],
  '--status-draft-text':      amber[700],
  '--status-published-bg':    green[50],
  '--status-published-text':  green[700],
  '--status-scheduled-bg':    violet[50],
  '--status-scheduled-text':  violet[600],
  '--status-archived-bg':     slate[100],
  // slate[600] (not slate[500]): slate-500 on slate-100 is ~3.65:1 and fails
  // WCAG AA for small text (exposed by <rhombus-tag>'s 12px archived pill);
  // slate-600 clears it (~5.3:1). Only deepens the colour — improves the chip's
  // archived/danger variant too.
  '--status-archived-text':   slate[600],

  // Ink — theme-invariant inverse surface. IDENTICAL to the dark pack: a
  // constant near-black surface with light text (~17:1, AAA), so decorative UI
  // (code mockups, inverted callouts) stays dark in both themes.
  '--ink-surface':    slate[900],
  '--ink-on-surface': slate[50],

  // Code / syntax highlighting — one hue per lexical role, each AA (≥4.5:1) on
  // --surface-0 (#ffffff). Drawn from the brand palette so code reads as native.
  '--code-keyword':     violet[700],
  '--code-string':      green[700],
  '--code-function':    amber[700],
  '--code-number':      red[700],
  '--code-comment':     slate[500],
  '--code-punctuation': slate[600],
};
