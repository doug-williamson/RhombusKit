import {
  parseColor,
  relativeLuminance,
  contrastRatio,
  alphaComposite,
  toOKLCH,
  fromOKLCH,
  gamutClampToSrgb,
} from './color-math';

describe('parseColor', () => {
  it('parses 3-digit hex', () => {
    expect(parseColor('#fff')).toEqual([255, 255, 255, 1]);
    expect(parseColor('#000')).toEqual([0, 0, 0, 1]);
  });

  it('parses 6-digit hex', () => {
    expect(parseColor('#7c3aed')).toEqual([124, 58, 237, 1]);
    expect(parseColor('#F8FAFC')).toEqual([248, 250, 252, 1]);
  });

  it('parses 8-digit hex with alpha', () => {
    expect(parseColor('#00000080')).toEqual([0, 0, 0, 128 / 255]);
  });

  it('parses space-separated rgb() with slash alpha', () => {
    expect(parseColor('rgb(124 58 237 / 0.22)')).toEqual([124, 58, 237, 0.22]);
    expect(parseColor('rgb(167 139 250 / 0.14)')).toEqual([167, 139, 250, 0.14]);
  });

  it('parses comma-separated rgba()', () => {
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual([0, 0, 0, 0.5]);
    expect(parseColor('rgb(15, 23, 42)')).toEqual([15, 23, 42, 1]);
  });

  it('returns null for non-concrete colours', () => {
    expect(parseColor('var(--bg)')).toBeNull();
    expect(parseColor('color-mix(in srgb, red, blue)')).toBeNull();
    expect(parseColor('rebeccapurple')).toBeNull();
    expect(parseColor('')).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 5);
    expect(relativeLuminance([0, 0, 0])).toBeCloseTo(0, 5);
  });

  it('weights green most heavily (0.7152)', () => {
    expect(relativeLuminance([0, 255, 0])).toBeCloseTo(0.7152, 4);
    expect(relativeLuminance([255, 0, 0])).toBeCloseTo(0.2126, 4);
    expect(relativeLuminance([0, 0, 255])).toBeCloseTo(0.0722, 4);
  });
});

describe('contrastRatio', () => {
  it('is exactly 21 for white on black', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 4);
  });

  it('is 1 for a colour on itself', () => {
    expect(contrastRatio('#7c3aed', '#7c3aed')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#7c3aed', '#f8fafc')).toBeCloseTo(
      contrastRatio('#f8fafc', '#7c3aed')!,
      6,
    );
  });

  it('returns null when either side is non-concrete', () => {
    expect(contrastRatio('var(--x)', '#fff')).toBeNull();
    expect(contrastRatio('#fff', 'color-mix(in srgb, red, blue)')).toBeNull();
  });
});

describe('alphaComposite', () => {
  it('composites a translucent foreground over a solid background', () => {
    // Verified value: rgb(167 139 250 / 0.14) over #0f172a → (36,39,71) = #242747.
    expect(alphaComposite('rgb(167 139 250 / 0.14)', '#0f172a')).toBe('#242747');
  });

  it('returns the foreground unchanged when it is opaque', () => {
    expect(alphaComposite('#7c3aed', '#ffffff')).toBe('#7c3aed');
  });
});

describe('toOKLCH / fromOKLCH', () => {
  it('maps white and black to the lightness extremes', () => {
    expect(toOKLCH('#ffffff').L).toBeCloseTo(1, 3);
    expect(toOKLCH('#ffffff').C).toBeCloseTo(0, 3);
    expect(toOKLCH('#000000').L).toBeCloseTo(0, 3);
  });

  it('gives a near-zero chroma for pure grey', () => {
    expect(toOKLCH('#808080').C).toBeLessThan(0.002);
  });

  it('matches the known OKLCH of the brand violet #7c3aed', () => {
    const { L, C, H } = toOKLCH('#7c3aed');
    expect(L).toBeCloseTo(0.541, 2);
    expect(C).toBeCloseTo(0.247, 2);
    expect(H).toBeCloseTo(293.0, 0);
  });

  it('round-trips in-gamut hexes exactly (hex → OKLCH → hex)', () => {
    for (const hex of ['#7c3aed', '#16a34a', '#f8fafc', '#0f172a', '#64748b', '#dc2626']) {
      const { L, C, H } = toOKLCH(hex);
      expect(fromOKLCH(L, C, H)).toBe(hex);
    }
  });
});

describe('gamutClampToSrgb', () => {
  it('leaves an in-gamut colour unchanged', () => {
    const { L, C, H } = toOKLCH('#7c3aed');
    expect(gamutClampToSrgb(L, C, H)).toBe('#7c3aed');
  });

  it('reduces chroma until an out-of-gamut request produces a valid hex', () => {
    const hex = gamutClampToSrgb(0.55, 0.4, 293); // far outside sRGB
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    const [r, g, b] = parseColor(hex)!;
    for (const ch of [r, g, b]) {
      expect(ch).toBeGreaterThanOrEqual(0);
      expect(ch).toBeLessThanOrEqual(255);
    }
  });
});
