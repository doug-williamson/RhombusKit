// Frozen inputs, all derived from @rhombuskit/tokens so they cannot drift from the shipped packs:
//   - RAMPS: the palette ladders (violet/slate full; green/amber/red sparse).
//   - L_*_CURVE / CHROMA_ENV: OKLCH lightness/chroma ladders computed from violet/slate.
//   - BASE: the shipped light/dark packs a generated theme spreads and overrides.
//   - CONTRACT_KEYS / TEXT_PAIRS / BADGE_PAIRS: the 60-name contract + the AA pair sets.
import { tokens } from '@rhombuskit/tokens';
import type { SemanticTokenName } from '@rhombuskit/tokens';
import { toOKLCH } from './color-math';

export const RUNGS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Rung = (typeof RUNGS)[number];
export type Ramp = Partial<Record<Rung, string>>;
export type FullRamp = Record<Rung, string>;

const prim = tokens.primitives as Record<string, string>;
function sourceRamp(family: string): Ramp {
  const ramp: Ramp = {};
  for (const step of RUNGS) {
    const value = prim[`${family}-${step}`];
    if (value) ramp[step] = value;
  }
  return ramp;
}

export const RAMPS = {
  violet: sourceRamp('violet') as FullRamp,
  slate: sourceRamp('slate') as FullRamp,
  green: sourceRamp('green'),
  amber: sourceRamp('amber'),
  red: sourceRamp('red'),
} as const;

/** OKLCH lightness/chroma ladders — the fixed curves ramp synthesis pins to. */
export const L_ACCENT_CURVE = RUNGS.map((r) => toOKLCH(RAMPS.violet[r]).L);
export const CHROMA_ENV = RUNGS.map((r) => toOKLCH(RAMPS.violet[r]).C);
export const L_NEUTRAL_CURVE = RUNGS.map((r) => toOKLCH(RAMPS.slate[r]).L);
/** Slate's own per-rung chroma, used as the ceiling so a tinted neutral stays neutral. */
export const C_NEUTRAL_CAP = RUNGS.map((r) => toOKLCH(RAMPS.slate[r]).C);

export const WHITE = '#ffffff';
export const INK = { surface: '#0f172a', on: '#f8fafc' } as const;

/** The shipped packs — the byte-identical base a generated theme overrides. */
export const BASE = {
  light: tokens.themes['rhombus-light'] as Record<SemanticTokenName, string>,
  dark: tokens.themes['rhombus-dark'] as Record<SemanticTokenName, string>,
} as const;

/** The 60 CONTRACT names, derived from the base pack (CONTRACT is not a runtime export). */
export const CONTRACT_KEYS = Object.keys(BASE.light) as SemanticTokenName[];

/** Body/UI text pairs @ 4.5:1 — transcribed 1:1 from community-themes.spec.ts:19-44. */
export const TEXT_PAIRS: [SemanticTokenName, SemanticTokenName][] = [
  ['--text-primary', '--bg'],
  ['--text-primary', '--surface-0'],
  ['--text-primary', '--surface-1'],
  ['--text-primary', '--surface-2'],
  ['--text-secondary', '--bg'],
  ['--text-secondary', '--surface-0'],
  ['--text-muted', '--bg'],
  ['--text-muted', '--surface-0'],
  ['--text-accent', '--bg'],
  ['--text-accent', '--surface-0'],
  ['--btn-primary-text', '--btn-primary-bg'],
  ['--text-on-accent', '--btn-primary-bg'],
  ['--nav-active-text', '--nav-active-bg'],
  ['--tooltip-text', '--tooltip-bg'],
  ['--toast-info-text', '--toast-info-bg'],
  ['--toast-success-text', '--toast-success-bg'],
  ['--toast-warning-text', '--toast-warning-bg'],
  ['--toast-error-text', '--toast-error-bg'],
  ['--code-keyword', '--surface-0'],
  ['--code-string', '--surface-0'],
  ['--code-function', '--surface-0'],
  ['--code-number', '--surface-0'],
  ['--code-comment', '--surface-0'],
  ['--code-punctuation', '--surface-0'],
];

/** Status badges @ 3:1 (large-text/UI-component threshold) — community-themes.spec.ts:48-53. */
export const BADGE_PAIRS: [SemanticTokenName, SemanticTokenName][] = [
  ['--status-draft-text', '--status-draft-bg'],
  ['--status-published-text', '--status-published-bg'],
  ['--status-scheduled-text', '--status-scheduled-bg'],
  ['--status-archived-text', '--status-archived-bg'],
];
