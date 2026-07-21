import { serializeThemeCss, toRegisteredThemes, toAugmentation } from './serialize';
import { build } from './generate';
import { BASE, CONTRACT_KEYS } from './constants';

describe('serializeThemeCss', () => {
  const css = serializeThemeCss(build({ name: 'rhombus' }));

  it('emits a [data-theme] block for the light name and the -dark name', () => {
    expect(css).toContain('[data-theme="rhombus"] {');
    expect(css).toContain('[data-theme="rhombus-dark"] {');
  });

  it('emits all 60 CONTRACT tokens per block with the generated values', () => {
    for (const key of CONTRACT_KEYS) {
      expect(css).toContain(`  ${key}: ${BASE.light[key]};`);
    }
    // 60 light + 60 dark declarations.
    expect(css.match(/^ {2}--[a-z0-9-]+: /gm)?.length).toBe(120);
  });
});

describe('toRegisteredThemes', () => {
  it('produces light + dark RegisteredTheme metadata sharing a palette', () => {
    const registered = toRegisteredThemes(build({ accent: '#0f766e', name: 'teal', label: 'Teal' }));
    expect(registered).toEqual([
      { name: 'teal', label: 'Teal', mode: 'light', palette: 'teal' },
      { name: 'teal-dark', label: 'Teal', mode: 'dark', palette: 'teal' },
    ]);
  });
});

describe('toAugmentation', () => {
  it('emits a ThemeRegistry declaration-merge snippet for both names', () => {
    const snippet = toAugmentation(build({ name: 'teal' }));
    expect(snippet).toContain("declare module '@rhombuskit/theme-engine'");
    expect(snippet).toContain('interface ThemeRegistry');
    expect(snippet).toContain("'teal': true;");
    expect(snippet).toContain("'teal-dark': true;");
  });
});
