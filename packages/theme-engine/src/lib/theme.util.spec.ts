import { formatSystem, paletteOf, parsePreference } from './theme.util';

describe('paletteOf', () => {
  it('strips a trailing -light/-dark', () => {
    expect(paletteOf('rhombus-light')).toBe('rhombus');
    expect(paletteOf('community-teal-dark')).toBe('community-teal');
  });

  it('leaves a name without a light/dark suffix unchanged', () => {
    expect(paletteOf('aurora-night')).toBe('aurora-night');
  });
});

describe('parsePreference', () => {
  it('treats a concrete theme name as concrete', () => {
    expect(parsePreference('rhombus-dark')).toEqual({ kind: 'concrete' });
    expect(parsePreference('community-teal-light')).toEqual({ kind: 'concrete' });
  });

  it('treats bare "system" as system with no palette', () => {
    expect(parsePreference('system')).toEqual({ kind: 'system' });
  });

  it('parses the palette out of "system:<palette>"', () => {
    expect(parsePreference('system:teal')).toEqual({ kind: 'system', palette: 'teal' });
    expect(parsePreference('system:community-teal')).toEqual({
      kind: 'system',
      palette: 'community-teal',
    });
  });
});

describe('formatSystem', () => {
  it('returns bare "system" for the built-in palette', () => {
    expect(formatSystem('rhombus', 'rhombus')).toBe('system');
  });

  it('encodes the palette for a non-built-in palette', () => {
    expect(formatSystem('teal', 'rhombus')).toBe('system:teal');
  });
});
