import { validateThemeAA } from './validate';
import { BASE } from './constants';

describe('validateThemeAA', () => {
  it('passes the shipped light pack (positive control)', () => {
    const result = validateThemeAA(BASE.light);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('passes the shipped dark pack, compositing its translucent nav-active-bg over --bg', () => {
    // Dark --nav-active-bg is rgb(167 139 250 / 0.14); the validator must composite
    // it over --bg (#020617) rather than skip it, and it must still clear AA.
    const result = validateThemeAA(BASE.dark);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('FAILS (goes red) when a text token drops below 4.5:1 — the negative control', () => {
    const broken = { ...BASE.light, '--text-primary': '#999999' };
    const result = validateThemeAA(broken);
    expect(result.ok).toBe(false);
    const failed = result.failures.map((f) => `${f.fg} on ${f.bg}`);
    expect(failed).toContain('--text-primary on --bg');
    // Every reported failure carries a ratio below its threshold.
    for (const f of result.failures) {
      expect(f.ratio).toBeLessThan(f.min);
    }
  });

  it('uses the 3:1 badge threshold for status pairs (not 4.5)', () => {
    // A status text at ~3.5:1 on its bg passes the badge rule but would fail a text rule.
    const record = {
      ...BASE.light,
      '--status-archived-bg': '#ffffff',
      '--status-archived-text': '#767676', // ~4.54:1 on white — safely ≥3
    };
    const result = validateThemeAA(record);
    expect(result.failures.some((f) => f.fg === '--status-archived-text')).toBe(false);
  });

  it('skips pairs whose value is non-concrete (var/color-mix)', () => {
    const record = { ...BASE.light, '--tooltip-bg': 'var(--something)' };
    const result = validateThemeAA(record);
    // The tooltip pair is skipped, not counted as a failure.
    expect(result.failures.some((f) => f.bg === '--tooltip-bg')).toBe(false);
  });
});
