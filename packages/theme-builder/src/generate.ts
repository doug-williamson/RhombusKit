// The generator. Spreads the shipped base pack and overrides only the seed-affected family's
// tokens (the community-theme precedent), then rescues any sub-AA pair with a bounded, load-bearing
// nudge and re-validates — returning an AA-clean theme or throwing. A bare build() (or the canonical
// #7c3aed / #64748b seeds) reproduces the shipped packs byte-for-byte via the verbatim short-circuit.
import type { SemanticTokenName } from '@rhombuskit/tokens';
import {
  toOKLCH,
  parseColor,
  normalizeHex,
  gamutClampToSrgb,
  contrastRatio,
} from './color-math';
import {
  RUNGS,
  RAMPS,
  L_ACCENT_CURVE,
  CHROMA_ENV,
  L_NEUTRAL_CURVE,
  C_NEUTRAL_CAP,
  BASE,
  TEXT_PAIRS,
  BADGE_PAIRS,
  type Rung,
  type FullRamp,
} from './constants';
import { validateThemeAA, solidify } from './validate';
import { ThemeAAError } from './errors';
import type { ThemeSeed, GeneratedTheme, BuildOptions } from './types';

const CANON_ACCENT = '#7c3aed';
const CANON_NEUTRAL = '#64748b';

type Rec = Record<SemanticTokenName, string>;
type Provenance = Partial<Record<SemanticTokenName, { ramp: FullRamp; idx: number }>>;

const alpha = (hex: string, a: string): string => {
  const p = parseColor(hex)!;
  return `rgb(${p[0]} ${p[1]} ${p[2]} / ${a})`;
};

/** A dark, hue-preserving tint for the one dark background no ramp step can supply. */
export function deepTint(hex: string): string {
  return gamutClampToSrgb(0.2, 0.07, toOKLCH(hex).H);
}

type Recipe = { rung: Rung } | { fn: (r: FullRamp) => string };

// Accent-family recipes — the ~14 tokens that recolour with the brand seed (from rhombus-*.ts).
const ACCENT: Record<'light' | 'dark', Partial<Record<SemanticTokenName, Recipe>>> = {
  light: {
    '--text-accent': { rung: 600 },
    '--border-accent': { rung: 200 },
    '--focus-ring': { fn: (r) => alpha(r[600], '0.22') },
    '--focus-border': { rung: 600 },
    '--btn-primary-bg': { rung: 600 },
    '--btn-primary-hover': { rung: 700 },
    '--nav-active-bg': { rung: 50 },
    '--nav-active-text': { rung: 700 },
    '--switch-track-on': { rung: 600 },
    '--shadow-btn-primary': { fn: (r) => `0 1px 2px 0 ${alpha(r[600], '0.25')}` },
    '--status-scheduled-bg': { rung: 50 },
    '--status-scheduled-text': { rung: 600 },
    '--code-keyword': { rung: 700 },
  },
  dark: {
    '--text-accent': { rung: 400 },
    '--border-accent': { fn: (r) => alpha(r[400], '0.40') },
    '--focus-ring': { fn: (r) => alpha(r[400], '0.28') },
    '--focus-border': { rung: 400 },
    '--btn-primary-bg': { rung: 600 },
    '--btn-primary-hover': { rung: 700 },
    '--nav-active-bg': { fn: (r) => alpha(r[400], '0.14') },
    '--switch-track-on': { rung: 500 },
    '--status-scheduled-bg': { fn: (r) => deepTint(r[600]) },
    '--status-scheduled-text': { rung: 400 },
    '--code-keyword': { rung: 300 },
  },
};

// Neutral-family recipes — the surfaces/text/borders that recolour with the neutral seed.
const NEUTRAL: Record<'light' | 'dark', Partial<Record<SemanticTokenName, Recipe>>> = {
  light: {
    '--bg': { rung: 50 },
    '--bg-subtle': { rung: 100 },
    '--surface-1': { rung: 100 },
    '--surface-2': { rung: 200 },
    '--surface-3': { rung: 300 },
    '--text-primary': { rung: 900 },
    '--text-secondary': { rung: 600 },
    '--text-muted': { rung: 500 },
    '--text-disabled': { rung: 300 },
    '--border': { rung: 200 },
    '--border-strong': { rung: 400 },
    '--switch-track-off': { rung: 300 },
    '--tooltip-bg': { rung: 900 },
    '--toast-info-bg': { rung: 100 },
    '--toast-info-text': { rung: 700 },
    '--status-archived-bg': { rung: 100 },
    '--status-archived-text': { rung: 600 },
    '--code-comment': { rung: 500 },
    '--code-punctuation': { rung: 600 },
  },
  dark: {
    '--bg': { rung: 950 },
    '--bg-subtle': { rung: 900 },
    '--surface-0': { rung: 900 },
    '--surface-1': { rung: 800 },
    '--surface-2': { rung: 700 },
    '--surface-3': { rung: 600 },
    '--text-primary': { rung: 50 },
    '--text-secondary': { rung: 300 },
    '--text-muted': { rung: 400 },
    '--text-disabled': { rung: 600 },
    '--border': { rung: 700 },
    '--border-strong': { rung: 500 },
    '--switch-track-off': { rung: 600 },
    '--tooltip-bg': { rung: 700 },
    '--toast-info-bg': { rung: 800 },
    '--toast-info-text': { rung: 200 },
    '--status-archived-bg': { rung: 800 },
    '--status-archived-text': { rung: 400 },
    '--code-comment': { rung: 400 },
    '--code-punctuation': { rung: 300 },
    '--nav-active-text': { rung: 50 },
  },
};

function applyTable(
  rec: Rec,
  ramp: FullRamp,
  table: Partial<Record<SemanticTokenName, Recipe>>,
  prov?: Provenance,
): void {
  for (const key of Object.keys(table) as SemanticTokenName[]) {
    const recipe = table[key]!;
    if ('rung' in recipe) {
      rec[key] = ramp[recipe.rung];
      if (prov) prov[key] = { ramp, idx: RUNGS.indexOf(recipe.rung) };
    } else {
      rec[key] = recipe.fn(ramp);
    }
  }
}

export function overrideAccent(rec: Rec, ramp: FullRamp, mode: 'light' | 'dark', prov?: Provenance): void {
  applyTable(rec, ramp, ACCENT[mode], prov);
}

export function overrideNeutral(rec: Rec, ramp: FullRamp, mode: 'light' | 'dark', prov?: Provenance): void {
  applyTable(rec, ramp, NEUTRAL[mode], prov);
}

function anchorOf(curve: readonly number[], L: number): number {
  let best = 0;
  for (let i = 1; i < curve.length; i++) {
    if (Math.abs(curve[i] - L) < Math.abs(curve[best] - L)) best = i;
  }
  return best;
}

/** Synthesize an 11-rung ramp from a seed: fixed lightness ladder, seed hue + scaled chroma. */
export function buildRamp(
  seedHex: string,
  Lcurve: readonly number[],
  Cenv: readonly number[],
  cap?: readonly number[],
  vividness = 1,
): FullRamp {
  const { L: Ls, C: Cs, H: Hs } = toOKLCH(seedHex);
  const anchor = anchorOf(Lcurve, Ls);
  const kC = Cs / (Cenv[anchor] || 1e-6);
  const ramp = {} as FullRamp;
  for (let i = 0; i < RUNGS.length; i++) {
    const Li = Lcurve[i];
    let Ci = Cenv[i] * kC * vividness;
    if (cap) Ci = Math.min(Ci, cap[i]);
    ramp[RUNGS[i]] =
      i === anchor && Math.abs(Li - Ls) < 0.02 ? seedHex : gamutClampToSrgb(Li, Ci, Hs);
  }
  return ramp;
}

/** Bounded on-ramp nudge: step a failing foreground darker (light) / lighter (dark), clamp at ends. */
function nudgeFailing(rec: Rec, mode: 'light' | 'dark', prov: Provenance, budget: number): void {
  const dir = mode === 'light' ? 1 : -1;
  const bg = rec['--bg'];
  for (const [pairs, min] of [
    [TEXT_PAIRS, 4.5],
    [BADGE_PAIRS, 3],
  ] as const) {
    for (const [fgTok, bgTok] of pairs) {
      const p = prov[fgTok];
      if (!p) continue; // only plain-rung overridden foregrounds are nudge-able
      for (let k = 0; k < budget; k++) {
        const fg = solidify(rec[fgTok], bg);
        const bgVal = solidify(rec[bgTok], bg);
        const ratio = fg && bgVal ? contrastRatio(fg, bgVal) : null;
        if (ratio === null || ratio >= min) break;
        const idx = p.idx + dir;
        if (idx < 0 || idx >= RUNGS.length) break; // clamped — ramp exhausted
        p.idx = idx;
        rec[fgTok] = p.ramp[RUNGS[idx]];
      }
    }
  }
}

const HUE_NAMES: [number, string][] = [
  [15, 'red'], [45, 'orange'], [70, 'amber'], [95, 'yellow'], [135, 'lime'],
  [165, 'green'], [195, 'teal'], [225, 'cyan'], [265, 'blue'], [295, 'indigo'],
  [330, 'violet'], [350, 'magenta'], [360, 'red'],
];
const hueName = (h: number): string => HUE_NAMES.find(([max]) => h < max)?.[1] ?? 'custom';

const clampVividness = (v: number | undefined): number =>
  v === undefined ? 1 : Math.min(1.5, Math.max(0.5, v));

/** Generate a complete, AA-clean light + dark theme from a few seed colours. */
export function build(seed: ThemeSeed = {}, opts: BuildOptions = {}): GeneratedTheme {
  const nudge = opts.nudge !== false;
  const vividness = clampVividness(seed.vividness);
  const warnings: string[] = [];

  const accentHex = seed.accent === undefined ? CANON_ACCENT : normalizeHex(seed.accent);
  if (accentHex === null) throw new Error(`Invalid accent colour: "${seed.accent}"`);
  const neutralHex = seed.neutral === undefined ? CANON_NEUTRAL : normalizeHex(seed.neutral);
  if (neutralHex === null) throw new Error(`Invalid neutral colour: "${seed.neutral}"`);

  const accentCustom = accentHex !== CANON_ACCENT;
  const neutralCustom = neutralHex !== CANON_NEUTRAL;

  const light = { ...BASE.light };
  const dark = { ...BASE.dark };
  const provLight: Provenance = {};
  const provDark: Provenance = {};

  if (accentCustom) {
    const A = buildRamp(accentHex, L_ACCENT_CURVE, CHROMA_ENV, undefined, vividness);
    overrideAccent(light, A, 'light', provLight);
    overrideAccent(dark, A, 'dark', provDark);
    const { L: Ls, C: Cs } = toOKLCH(accentHex);
    const drift = Math.abs(RUNGS.indexOf(600) - anchorOf(L_ACCENT_CURVE, Ls));
    if (drift > 2) {
      warnings.push(
        `Accent ${accentHex} sits ${drift} rungs from the accessible accent lightness; it was adjusted to meet contrast, so the rendered accent is darker/lighter than the seed.`,
      );
    }
    if (Cs < 0.04) {
      warnings.push(`Accent ${accentHex} has very low chroma and will read close to neutral.`);
    }
  }

  if (neutralCustom) {
    const N = buildRamp(neutralHex, L_NEUTRAL_CURVE, C_NEUTRAL_CAP, C_NEUTRAL_CAP, vividness);
    overrideNeutral(light, N, 'light', provLight);
    overrideNeutral(dark, N, 'dark', provDark);
  }

  for (const [rec, mode, prov] of [
    [light, 'light', provLight],
    [dark, 'dark', provDark],
  ] as const) {
    if (nudge) nudgeFailing(rec, mode, prov, 2);
    const result = validateThemeAA(rec);
    if (!result.ok) throw new ThemeAAError(mode, result.failures);
  }

  const name = seed.name ?? (accentCustom ? hueName(toOKLCH(accentHex).H) : 'rhombus');
  const label = seed.label ?? name.charAt(0).toUpperCase() + name.slice(1);
  return { name, label, light, dark, report: { warnings } };
}
