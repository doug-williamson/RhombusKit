// The AA gate. Runs the 24 text pairs @ 4.5:1 + 4 badge pairs @ 3:1 over a finished theme
// record, compositing any translucent value over the record's own --bg first so alpha can
// never pass (or fail) vacuously. Returns every failing pair — this is the object proven
// red-capable by the negative-control test and run by the generator on its own output.
import type { SemanticTokenName } from '@rhombuskit/tokens';
import { contrastRatio, parseColor, alphaComposite } from './color-math';
import { TEXT_PAIRS, BADGE_PAIRS } from './constants';

export interface ThemeAAFailure {
  fg: SemanticTokenName;
  bg: SemanticTokenName;
  ratio: number;
  min: number;
}

export interface ThemeAAResult {
  ok: boolean;
  failures: ThemeAAFailure[];
}

type ThemeRecord = Partial<Record<SemanticTokenName, string>>;

/** Resolve a token to a solid, measurable colour: composite translucency over --bg. */
export function solidify(value: string | undefined, bg: string): string | undefined {
  if (value === undefined) return undefined;
  const parsed = parseColor(value);
  if (parsed && parsed[3] < 1) return alphaComposite(value, bg);
  return value;
}

export function validateThemeAA(record: ThemeRecord): ThemeAAResult {
  const bg = record['--bg'] ?? '#ffffff';
  const failures: ThemeAAFailure[] = [];

  const check = (pairs: [SemanticTokenName, SemanticTokenName][], min: number): void => {
    for (const [fgTok, bgTok] of pairs) {
      const fg = solidify(record[fgTok], bg);
      const bgVal = solidify(record[bgTok], bg);
      if (fg === undefined || bgVal === undefined) continue;
      const ratio = contrastRatio(fg, bgVal);
      if (ratio === null) continue; // non-concrete → not contrast-checkable
      if (ratio < min) failures.push({ fg: fgTok, bg: bgTok, ratio, min });
    }
  };

  check(TEXT_PAIRS, 4.5);
  check(BADGE_PAIRS, 3);

  return { ok: failures.length === 0, failures };
}
