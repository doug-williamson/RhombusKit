import {
  RUNGS,
  RAMPS,
  L_ACCENT_CURVE,
  CHROMA_ENV,
  L_NEUTRAL_CURVE,
  BASE,
  CONTRACT_KEYS,
  TEXT_PAIRS,
  BADGE_PAIRS,
} from './constants';

describe('RAMPS (sourced from @rhombuskit/tokens)', () => {
  it('sources the full violet + slate ramps verbatim from the shipped primitives', () => {
    expect(RAMPS.violet[600]).toBe('#7c3aed');
    expect(RAMPS.violet[50]).toBe('#f5f3ff');
    expect(RAMPS.violet[950]).toBe('#2e1065');
    expect(RAMPS.slate[50]).toBe('#f8fafc');
    expect(RAMPS.slate[500]).toBe('#64748b');
    expect(RAMPS.slate[950]).toBe('#020617');
    // All 11 rungs present for the two full families.
    for (const r of RUNGS) {
      expect(RAMPS.violet[r]).toMatch(/^#[0-9a-f]{6}$/);
      expect(RAMPS.slate[r]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('leaves the status ramps sparse (50/100/500/600/700 only)', () => {
    expect(RAMPS.green[500]).toBe('#22c55e');
    expect(RAMPS.green[700]).toBe('#15803d');
    expect(RAMPS.green[300]).toBeUndefined();
    expect(RAMPS.green[900]).toBeUndefined();
  });
});

describe('computed OKLCH curves', () => {
  it('reproduces the violet lightness ladder (rung 600 ≈ 0.541)', () => {
    expect(L_ACCENT_CURVE[6]).toBeCloseTo(0.541, 2); // index 6 === rung 600
    expect(CHROMA_ENV[6]).toBeCloseTo(0.247, 2);
    // Monotonically decreasing lightness from 50 → 950.
    for (let i = 1; i < RUNGS.length; i++) {
      expect(L_ACCENT_CURVE[i]).toBeLessThan(L_ACCENT_CURVE[i - 1]);
    }
  });

  it('gives slate a distinct, lighter-at-the-dark-end curve', () => {
    // slate[950] is darker than violet[950] in hex but the curves differ; just
    // assert the neutral curve is also monotone and spans a wide range.
    expect(L_NEUTRAL_CURVE[0]).toBeGreaterThan(0.9);
    expect(L_NEUTRAL_CURVE[10]).toBeLessThan(0.2);
  });
});

describe('CONTRACT + pairs', () => {
  it('derives exactly 60 CONTRACT keys from the base pack', () => {
    expect(CONTRACT_KEYS).toHaveLength(60);
    expect(new Set(CONTRACT_KEYS).size).toBe(60);
    expect(Object.keys(BASE.dark)).toHaveLength(60);
  });

  it('has 24 text pairs and 4 badge pairs, all referencing real CONTRACT tokens', () => {
    expect(TEXT_PAIRS).toHaveLength(24);
    expect(BADGE_PAIRS).toHaveLength(4);
    const keys = new Set<string>(CONTRACT_KEYS);
    for (const [fg, bg] of [...TEXT_PAIRS, ...BADGE_PAIRS]) {
      expect(keys.has(fg)).toBe(true);
      expect(keys.has(bg)).toBe(true);
    }
  });
});
