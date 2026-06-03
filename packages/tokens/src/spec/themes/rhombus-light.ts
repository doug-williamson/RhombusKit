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
  '--text-muted':     slate[400],
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
  '--status-draft-text':      amber[600],
  '--status-published-bg':    green[50],
  '--status-published-text':  green[600],
  '--status-scheduled-bg':    violet[50],
  '--status-scheduled-text':  violet[600],
  '--status-archived-bg':     slate[100],
  '--status-archived-text':   slate[500],
};
