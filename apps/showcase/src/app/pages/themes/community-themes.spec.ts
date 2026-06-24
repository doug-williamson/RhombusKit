import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { COMMUNITY_THEMES } from './community-themes';

// The CONTRACT is the single source of truth for which tokens a theme must set.
const CONTRACT: string[] = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../../../packages/tokens/contract.snapshot.json'),
    'utf8',
  ),
);

// Body-text pairs that must clear WCAG AA for normal text (4.5:1). (Only pairs
// both sides of which are concrete colours; var()/shadow tokens are skipped.)
const TEXT_PAIRS: [string, string][] = [
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

// Status badges are compact UI / large-text elements; AA's threshold for those
// is 3:1 (the bundled light theme's muted "archived" badge sits at ~4.34:1).
const BADGE_PAIRS: [string, string][] = [
  ['--status-draft-text', '--status-draft-bg'],
  ['--status-published-text', '--status-published-bg'],
  ['--status-scheduled-text', '--status-scheduled-bg'],
  ['--status-archived-text', '--status-archived-bg'],
];

function parseColor(c: string): [number, number, number] | null {
  const s = c.trim();
  let m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) {
    const h = m[1];
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) {
    const h = m[1];
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  m = /^rgba?\(\s*([0-9.]+)[\s,]+([0-9.]+)[\s,]+([0-9.]+)/i.exec(s);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return null; // var(), color-mix, etc. — not contrast-checkable
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg: string, bg: string): number | null {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return null;
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe('community themes', () => {
  const contractSet = new Set(CONTRACT);

  for (const theme of COMMUNITY_THEMES) {
    describe(`"${theme.label}" (${theme.slug})`, () => {
      const keys = Object.keys(theme.values);

      it('sets exactly the CONTRACT tokens — no missing, no unknown', () => {
        const missing = CONTRACT.filter((t) => !(t in theme.values));
        const unknown = keys.filter((k) => !contractSet.has(k));
        expect({ missing, unknown }).toEqual({ missing: [], unknown: [] });
      });

      it('has a non-empty string value for every token', () => {
        const empty = keys.filter((k) => typeof theme.values[k] !== 'string' || !theme.values[k].trim());
        expect(empty).toEqual([]);
      });

      it('clears WCAG AA contrast (4.5:1 body text, 3:1 status badges)', () => {
        const check = (pairs: [string, string][], min: number) =>
          pairs
            .map(([fg, bg]) => ({
              pair: `${fg} on ${bg}`,
              ratio: contrastRatio(theme.values[fg], theme.values[bg]),
              min,
            }))
            .filter((r) => r.ratio !== null && r.ratio < r.min)
            .map((r) => `${r.pair} = ${r.ratio!.toFixed(2)}:1 (needs ${r.min}:1)`);

        const failures = [...check(TEXT_PAIRS, 4.5), ...check(BADGE_PAIRS, 3)];
        expect(failures).toEqual([]);
      });
    });
  }
});
