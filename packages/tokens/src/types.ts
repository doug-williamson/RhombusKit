// Hand-authored — do not generate this file.
// When adding a new semantic token: add to CONTRACT, add values to every theme pack,
// rerun the generator. The build will type-fail if a pack is missing the name.
//
// STABILITY (frozen at 1.0): the token NAMES below are part of the public API.
// They are APPEND-ONLY within a major version — renaming or removing a name is a
// breaking change requiring a major bump. The generated CSS *values* are NOT
// covered by semver (only the names are). This is enforced by
// `tools/verify-tokens.mjs` against the committed `contract.snapshot.json`;
// an intentional change is recorded with `--update-snapshot`.
//
// Consumers extend the system with their OWN tokens/themes via ThemeRegistry
// augmentation + provideRhombusTheme({ light, dark }) — that is the sanctioned
// extensibility path, not a change to this CONTRACT.

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

  // Error
  '--error',
  '--error-bg',

  // Buttons
  '--btn-primary-bg',
  '--btn-primary-text',
  '--btn-primary-hover',

  // Nav
  '--nav-active-bg',
  '--nav-active-text',

  // Switch / slide-toggle track (independent of button colours so a toggle
  // reads as a toggle, not a button)
  '--switch-track-off',
  '--switch-track-on',

  // Tooltip (inverse overlay surface — dark on light themes, light on dark)
  '--tooltip-bg',
  '--tooltip-text',

  // Toast (transient snackbar; one tinted bg/text pair per severity, selected
  // by the panelClass the toast service applies)
  '--toast-info-bg',
  '--toast-info-text',
  '--toast-success-bg',
  '--toast-success-text',
  '--toast-warning-bg',
  '--toast-warning-text',
  '--toast-error-bg',
  '--toast-error-text',

  // Shadows
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--shadow-xl',
  '--shadow-btn-primary',

  // Font families (CONTRACT aliases of font-family-* primitives)
  '--font-sans',
  '--font-mono',
  '--font-prose',

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
