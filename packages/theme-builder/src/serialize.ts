// Turn a generated theme into the three sanctioned outputs (docs/theming.md): a copy-paste
// [data-theme] CSS block over all 60 tokens, RegisteredTheme metadata, and a ThemeRegistry
// declaration-merge snippet so the custom names type-check.
import type { SemanticTokenName } from '@rhombuskit/tokens';
import { CONTRACT_KEYS } from './constants';
import type { GeneratedTheme, RegisteredThemeMeta } from './types';

function block(name: string, values: Record<SemanticTokenName, string>): string {
  const lines = CONTRACT_KEYS.map((key) => `  ${key}: ${values[key]};`).join('\n');
  return `[data-theme="${name}"] {\n${lines}\n}`;
}

/** Two `[data-theme="<name>"]{…}` blocks (light + `-dark`) over every CONTRACT token. */
export function serializeThemeCss(theme: GeneratedTheme): string {
  return `${block(theme.name, theme.light)}\n\n${block(`${theme.name}-dark`, theme.dark)}\n`;
}

/** Light + dark `RegisteredTheme` metadata sharing one palette (pair with the CSS above). */
export function toRegisteredThemes(theme: GeneratedTheme): RegisteredThemeMeta[] {
  return [
    { name: theme.name, label: theme.label, mode: 'light', palette: theme.name },
    { name: `${theme.name}-dark`, label: theme.label, mode: 'dark', palette: theme.name },
  ];
}

/** The `declare module '@rhombuskit/theme-engine'` snippet so `setTheme('<name>')` type-checks. */
export function toAugmentation(theme: GeneratedTheme): string {
  return (
    `declare module '@rhombuskit/theme-engine' {\n` +
    `  interface ThemeRegistry {\n` +
    `    '${theme.name}': true;\n` +
    `    '${theme.name}-dark': true;\n` +
    `  }\n` +
    `}\n`
  );
}
