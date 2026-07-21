# @rhombuskit/theme-builder

Generate WCAG-AA-validated [RhombusKit](https://rhombuskit.online) themes from a few seed
colours. Framework-agnostic (no Angular peer) — usable from a build script, a CLI, or the
interactive [`/theme-builder`](https://rhombuskit.online/theme-builder) page.

You give it a brand accent (and, optionally, a neutral); it emits **both** a light and a dark
theme covering the full 60-token RhombusKit CONTRACT, then re-validates every text/background
pair for WCAG 2.1 AA and either returns an AA-clean theme or throws — it never returns sub-AA
output.

## Install

```sh
npm i @rhombuskit/theme-builder @rhombuskit/tokens
```

## Usage

```ts
import { generateTheme, serializeThemeCss, toRegisteredThemes } from '@rhombuskit/theme-builder';

const theme = generateTheme({ accent: '#0f766e', name: 'teal' });

// Paste-ready [data-theme] CSS over all 60 CONTRACT tokens (light + dark):
console.log(serializeThemeCss(theme));

// Metadata for the theme registry (pair with the CSS above):
const registered = toRegisteredThemes(theme); // RegisteredTheme[]
```

The emitted CSS + registration follow the sanctioned custom-theme path in
[the theming guide](https://rhombuskit.online/theming). A bare `generateTheme()` reproduces the
built-in `rhombus-light`/`rhombus-dark` packs byte-for-byte.

## License

MIT
