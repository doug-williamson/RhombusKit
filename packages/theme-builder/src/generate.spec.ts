import { build, buildRamp, deepTint, overrideAccent, overrideNeutral, ownedTokens } from './generate';
import { ThemeAAError } from './errors';
import { BASE, RAMPS, L_ACCENT_CURVE, CHROMA_ENV, RUNGS, CONTRACT_KEYS } from './constants';
import { validateThemeAA } from './validate';
import { normalizeHex, toOKLCH } from './color-math';

describe('build — byte-identical default', () => {
  it('reproduces the shipped packs exactly with no seed', () => {
    const t = build();
    expect(t.light).toEqual(BASE.light);
    expect(t.dark).toEqual(BASE.dark);
  });

  it('reproduces the shipped packs for the canonical violet seed (verbatim short-circuit)', () => {
    const t = build({ accent: '#7c3aed' });
    expect(t.light).toEqual(BASE.light);
    expect(t.dark).toEqual(BASE.dark);
  });

  it('does not throw and reports no warnings for the default', () => {
    expect(build().report.warnings).toEqual([]);
  });
});

describe('override recipes reproduce the shipped packs from verbatim ramps', () => {
  it('accent recipes with the violet ramp reproduce the base accent tokens', () => {
    const light = { ...BASE.light };
    overrideAccent(light, RAMPS.violet, 'light');
    expect(light).toEqual(BASE.light);
    const dark = { ...BASE.dark } as Record<string, string>;
    overrideAccent(dark as never, RAMPS.violet, 'dark');
    const baseCopy = { ...BASE.dark } as Record<string, string>;
    // Two dark accent backgrounds are deliberately SOLID deep-tints for a custom theme
    // (measurable by a raw-channel guard) rather than the built-in's bespoke #1a0a3a /
    // translucent alpha: --status-scheduled-bg and --nav-active-bg. Every OTHER dark accent
    // token must match the shipped pack exactly.
    for (const key of ['--status-scheduled-bg', '--nav-active-bg']) {
      expect(dark[key]).toMatch(/^#[0-9a-f]{6}$/); // solid hex, not alpha/bespoke
      delete dark[key];
      delete baseCopy[key];
    }
    expect(dark).toEqual(baseCopy);
  });

  it('neutral recipes with the slate ramp reproduce the base neutral tokens', () => {
    const light = { ...BASE.light };
    overrideNeutral(light, RAMPS.slate, 'light');
    expect(light).toEqual(BASE.light);
    const dark = { ...BASE.dark };
    overrideNeutral(dark, RAMPS.slate, 'dark');
    expect(dark).toEqual(BASE.dark);
  });
});

describe('recipe-table completeness (drift guard)', () => {
  // --ink-surface/--ink-on-surface are slate rungs but deliberately theme-invariant, never seed-tied.
  const INVARIANT = new Set(['--ink-surface', '--ink-on-surface']);

  it.each(['light', 'dark'] as const)(
    'every %s base token equal to a violet/slate rung is owned by a recipe (guards future pack drift)',
    (mode) => {
      const violetVals = new Set(RUNGS.map((r) => RAMPS.violet[r]));
      const slateVals = new Set(RUNGS.map((r) => RAMPS.slate[r]));
      const { accent, neutral } = ownedTokens(mode);
      for (const key of CONTRACT_KEYS) {
        if (INVARIANT.has(key)) continue;
        const value = BASE[mode][key];
        if (violetVals.has(value)) expect(accent.has(key)).toBe(true);
        if (slateVals.has(value)) expect(neutral.has(key)).toBe(true);
      }
    },
  );
});

describe('buildRamp', () => {
  it('pins the exact seed hex when its lightness aligns with a rung (< 0.02)', () => {
    // violet[600] sits exactly on L_ACCENT_CURVE[600], so it is pinned verbatim.
    const ramp = buildRamp('#7c3aed', L_ACCENT_CURVE, CHROMA_ENV);
    expect(ramp[600]).toBe('#7c3aed');
  });

  it('synthesizes (does not pin) when the seed lightness is off-rung', () => {
    // #16a34a's L (~0.627) is ~0.021 from the nearest rung — just outside tolerance,
    // so every rung is computed on the ladder rather than pinned.
    const ramp = buildRamp('#16a34a', L_ACCENT_CURVE, CHROMA_ENV);
    expect(normalizeHex(ramp[500])).not.toBe('#16a34a');
    expect(ramp[500]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('produces an in-gamut hex at every rung', () => {
    const ramp = buildRamp('#0d9488', L_ACCENT_CURVE, CHROMA_ENV);
    for (const r of RUNGS) expect(ramp[r]).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('deepTint', () => {
  it('produces a dark, in-gamut tint of the hue', () => {
    const tint = deepTint('#16a34a');
    expect(tint).toMatch(/^#[0-9a-f]{6}$/);
    expect(toOKLCH(tint).L).toBeLessThan(0.3);
  });
});

describe('AA safety — the nudge is load-bearing, the gate goes red', () => {
  it('emits an AA-clean light+dark theme for a saturated green accent', () => {
    const t = build({ accent: '#16a34a' });
    expect(validateThemeAA(t.light).ok).toBe(true);
    expect(validateThemeAA(t.dark).ok).toBe(true);
  });

  it('THROWS on the same green seed when the nudge is disabled (red seam)', () => {
    expect(() => build({ accent: '#16a34a' }, { nudge: false })).toThrow(ThemeAAError);
  });

  it('the thrown failure is the accent text pair the nudge exists to rescue', () => {
    let err: ThemeAAError | undefined;
    try {
      build({ accent: '#16a34a' }, { nudge: false });
    } catch (e) {
      err = e as ThemeAAError;
    }
    expect(err).toBeInstanceOf(ThemeAAError);
    expect(err!.failures.some((f) => f.fg === '--text-accent')).toBe(true);
  });
});

describe('corpus — every real brand seed yields an AA-clean theme', () => {
  const SEEDS = [
    '#7c3aed', '#2563eb', '#0d9488', '#16a34a', '#dc2626', '#ea580c',
    '#db2777', '#9333ea', '#0891b2', '#4f46e5', '#65a30d', '#e11d48',
  ];
  it.each(SEEDS)('%s → light and dark both clear AA', (accent) => {
    const t = build({ accent });
    expect(validateThemeAA(t.light).ok).toBe(true);
    expect(validateThemeAA(t.dark).ok).toBe(true);
  });
});

describe('fidelity is a warning, never a rejection', () => {
  it('accepts a pale pastel accent, AA-clean, with a fidelity warning', () => {
    const t = build({ accent: '#a7f3d0' });
    expect(validateThemeAA(t.light).ok).toBe(true);
    expect(t.report.warnings.length).toBeGreaterThan(0);
  });
});

describe('custom neutral', () => {
  it('tints the surfaces and still clears AA', () => {
    const t = build({ neutral: '#78716c' }); // warm stone
    expect(t.light['--bg']).not.toBe(BASE.light['--bg']);
    expect(validateThemeAA(t.light).ok).toBe(true);
    expect(validateThemeAA(t.dark).ok).toBe(true);
  });
});

describe('seed validation, naming and options', () => {
  it('throws on an unparseable accent or neutral', () => {
    expect(() => build({ accent: 'not-a-colour' })).toThrow(/Invalid accent/);
    expect(() => build({ neutral: 'nope' })).toThrow(/Invalid neutral/);
  });

  it('warns (does not throw) for a near-neutral accent with very low chroma', () => {
    const t = build({ accent: '#9aa0a6' });
    expect(validateThemeAA(t.light).ok).toBe(true);
    expect(t.report.warnings.some((w) => /low chroma|close to neutral/i.test(w))).toBe(true);
  });

  it('derives a hue name for the default and a custom accent', () => {
    expect(build().name).toBe('rhombus');
    expect(build({ accent: '#16a34a' }).name).toBe('green');
    expect(build({ accent: '#16a34a', name: 'forest', label: 'Forest' }).label).toBe('Forest');
  });

  it('accepts and clamps vividness without breaking AA', () => {
    for (const vividness of [0.5, 1.5, 3, 0]) {
      const t = build({ accent: '#2563eb', vividness });
      expect(validateThemeAA(t.light).ok).toBe(true);
      expect(validateThemeAA(t.dark).ok).toBe(true);
    }
  });
});
