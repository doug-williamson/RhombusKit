import { CONTRACT } from './types';
import type { SemanticTokenName } from './types';
import { rhombusLight } from './spec/themes/rhombus-light';
import { rhombusDark } from './spec/themes/rhombus-dark';

const NAMES: string[] = [...CONTRACT];

const THEME_PACKS: Record<string, Record<SemanticTokenName, string>> = {
  light: rhombusLight,
  dark: rhombusDark,
};

describe('token CONTRACT', () => {
  it('has no duplicate token names', () => {
    expect(new Set(NAMES).size).toBe(NAMES.length);
  });

  it('every token name is a kebab-case CSS custom property', () => {
    for (const name of NAMES) {
      expect(name).toMatch(/^--[a-z][a-z0-9-]*$/);
    }
  });

  it('includes the full toast severity family', () => {
    for (const variant of ['info', 'success', 'warning', 'error'] as const) {
      expect(NAMES).toContain(`--toast-${variant}-bg`);
      expect(NAMES).toContain(`--toast-${variant}-text`);
    }
  });

  for (const [name, pack] of Object.entries(THEME_PACKS)) {
    describe(`${name} theme pack`, () => {
      it('defines a value for exactly the CONTRACT tokens (no missing, no extra)', () => {
        expect(Object.keys(pack).sort()).toEqual(NAMES.slice().sort());
      });

      it('has no empty values', () => {
        for (const value of Object.values(pack)) {
          expect(value.trim()).not.toBe('');
        }
      });
    });
  }
});
