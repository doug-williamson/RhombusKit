// Hand-authored — do not generate this file.
// When adding a new semantic token: add to CONTRACT, add values to every theme pack,
// rerun the generator. The build will type-fail if a pack is missing the name.

export const CONTRACT = [
  // Backgrounds
  '--bg',
  '--bg-subtle',
  '--surface-0',
  '--surface-1',
  '--surface-2',
  '--surface-3',

  // Text
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--text-disabled',
  '--text-accent',
  '--text-on-accent',

  // Borders
  '--border',
  '--border-strong',
  '--border-accent',

  // Focus (two-layer: solid outline + soft glow halo)
  '--focus-ring',
  '--focus-border',

  // Buttons
  '--btn-primary-bg',
  '--btn-primary-text',
  '--btn-primary-hover',

  // Nav
  '--nav-active-bg',
  '--nav-active-text',

  // Shadows
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--shadow-xl',
  '--shadow-btn-primary',

  // Status
  '--status-draft-bg',
  '--status-draft-text',
  '--status-published-bg',
  '--status-published-text',
  '--status-scheduled-bg',
  '--status-scheduled-text',
  '--status-archived-bg',
  '--status-archived-text',
] as const;

export type SemanticTokenName = (typeof CONTRACT)[number];

export interface ThemePack {
  name: string;
  values: Record<SemanticTokenName, string>;
}
