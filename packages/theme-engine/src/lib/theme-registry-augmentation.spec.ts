import { provideRhombusTheme } from './theme.tokens';

// Mirrors the public consumer pattern (which augments '@rhombuskit/theme-engine')
// using the in-package relative module. Verified at type-check time by
// `tsc -p tsconfig.spec.json` — jest transpile-only does not type-check, so the
// expect-error directive below is the real assertion and tsc is what enforces it.
declare module './theme.types' {
  interface ThemeRegistry {
    'foliokit-light': true;
    'foliokit-dark': true;
  }
}

describe('ThemeRegistry augmentation + provideRhombusTheme typing', () => {
  it('accepts augmented theme names', () => {
    const providers = provideRhombusTheme({
      light: 'foliokit-light',
      dark: 'foliokit-dark',
      default: 'system',
    });
    expect(providers).toBeDefined();
  });

  it('still accepts the built-in rhombus names', () => {
    const providers = provideRhombusTheme({
      light: 'rhombus-light',
      dark: 'rhombus-dark',
    });
    expect(providers).toBeDefined();
  });

  it('rejects names that are not in the registry', () => {
    const providers = provideRhombusTheme({
      // @ts-expect-error - 'not-a-theme' is not a registered ThemeName
      light: 'not-a-theme',
    });
    expect(providers).toBeDefined();
  });
});
