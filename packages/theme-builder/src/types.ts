import type { SemanticTokenName } from '@rhombuskit/tokens';

/** A few seed colours in. See the spec for the derivation. */
export interface ThemeSeed {
  /** Brand accent hex. Omitted OR === #7c3aed → shipped violet verbatim. */
  accent?: string;
  /** Neutral/surface base hex. Omitted OR === #64748b (slate-500) → shipped slate verbatim. */
  neutral?: string;
  /** Registry id (default: the OKLCH hue name of the accent, e.g. "indigo"). */
  name?: string;
  /** Human label (default: Title-Case of name). */
  label?: string;
  /** Chroma-envelope multiplier for generated ramps (default 1, clamped [0.5, 1.5]). */
  vividness?: number;
}

/** A complete light + dark theme over the 60-token CONTRACT, plus a fidelity report. */
export interface GeneratedTheme {
  name: string;
  label: string;
  light: Record<SemanticTokenName, string>;
  dark: Record<SemanticTokenName, string>;
  report: { warnings: string[] };
}

export interface BuildOptions {
  /** Disable the AA-rescue nudge. Only for the red-gate test — a green seed then throws. */
  nudge?: boolean;
}

/**
 * Structural match for `@rhombuskit/theme-engine`'s `RegisteredTheme` — declared locally so this
 * package stays free of an Angular/theme-engine dependency. Assignable to `provideRhombusThemes()`.
 */
export interface RegisteredThemeMeta {
  name: string;
  label: string;
  mode: 'light' | 'dark';
  palette: string;
}
