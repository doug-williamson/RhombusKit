import type { SemanticTokenName } from '../../types';
import { slate, violet, green, amber } from '../primitives';

export const rhombusDark: Record<SemanticTokenName, string> = {
  '--bg':           slate[950],
  '--surface-0':    slate[900],
  '--surface-1':    slate[800],
  '--surface-2':    slate[700],
  '--surface-3':    slate[600],

  '--text-primary':   slate[50],
  '--text-secondary': slate[300],
  '--text-muted':     slate[500],
  '--text-accent':    violet[400],
  '--text-on-accent': '#ffffff',

  '--border':        slate[700],
  '--border-strong': slate[500],

  '--focus-ring':        violet[400],
  '--focus-ring-offset': slate[900],

  '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',

  '--status-draft-bg':        '#2a1f00',
  '--status-draft-text':      amber[500],
  '--status-published-bg':    '#002a0f',
  '--status-published-text':  green[500],
  '--status-scheduled-bg':    '#1a0a3a',
  '--status-scheduled-text':  violet[400],
  '--status-archived-bg':     slate[800],
  '--status-archived-text':   slate[400],
};
