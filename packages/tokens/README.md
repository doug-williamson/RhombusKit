# @rhombuskit/tokens

The framework-agnostic design-token foundation for [RhombusKit](https://rhombuskit.online).

A three-tier token system — palette **primitives** → semantic **CONTRACT** names →
light/dark **theme packs** — emitted as CSS custom properties, SCSS, and TypeScript.
Every other RhombusKit package resolves its colours, shadows, radii, and fonts from
these tokens, so theming the contract re-themes the whole kit.

## Install

```sh
pnpm add @rhombuskit/tokens
```

No peer dependencies — this package is plain CSS/SCSS/TS.

## Usage

Use these tokens with React, Vue, Svelte, Tailwind, or a plain HTML file —
there's no framework coupling. For the CSS/SCSS paths, set the theme pack on your
root element (this is also your dark-mode switch):

```html
<html data-theme="rhombus-light"><!-- or "rhombus-dark" --></html>
```

**Global CSS** (no build step — works straight from a CDN):

```css
@import '@rhombuskit/tokens/css';
/* ...or, with no install at all: */
/* @import 'https://cdn.jsdelivr.net/npm/@rhombuskit/tokens/dist/css/theme-rhombus.css'; */
```

**SCSS** (recommended — load this first so downstream `@use`s can read the vars):

```scss
@use '@rhombuskit/tokens/scss' as tokens;

.my-surface {
  background: var(--surface-0);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
```

**TypeScript** (the raw primitives + theme packs, e.g. for tooling):

```ts
import { tokens } from '@rhombuskit/tokens';

tokens.primitives['violet-600']; // '#7c3aed'
tokens.themes['rhombus-dark']['--surface-0'];
```

**Tailwind CSS v4** — map the contract onto Tailwind's colours with `@theme
inline` (the `inline` keyword keeps the `var()` live, so utilities re-theme with
`data-theme` automatically — no `dark:` variants needed):

```css
@import 'tailwindcss';
@import '@rhombuskit/tokens/css';

@theme inline {
  --color-surface: var(--surface-0);
  --color-body: var(--text-primary);
  --color-border: var(--border);
  --color-accent: var(--text-accent);
}
```

Subpath exports: `./css`, `./css/primitives`, `./css/contract`, `./scss`, `./scss/*`.

The density level blocks (`:root[data-density='compact'|'comfortable']`) ride inside
`./css/primitives` and `./scss/primitives` — there is no separate density subpath.

More framework recipes (React, Tailwind, vanilla JS) and a live, no-build demo:
**[rhombuskit.online/tokens](https://rhombuskit.online/tokens)**.

## Theming

The token **names** are a stable contract; the **values** are a theme. Light and dark
ship in the box, switched via the `data-theme` attribute on `<html>`. To register your
own theme pack or override values, see the
[Theming guide](https://github.com/doug-williamson/RhombusKit/blob/main/docs/theming.md).

## What's in the box

Beyond the 60 semantic CONTRACT tokens, the package publishes a set of **theme-independent
primitives** — values that are the same in every theme:

| family | count | names |
| --- | --- | --- |
| Type scale | 65 | `--type-<role>-{size,line-height,weight,tracking}` over the 15 M3 roles, 2 prominent weights, 3 weight constants |
| Spacing | 11 | `--space-0` … `--space-16` (4px grid) |
| Corner radius | 7 | `--radius-none` … `--radius-full` (the M3 corner ramp) |
| State layers | 4 | `--state-{hover,focus,pressed,dragged}-opacity` |
| Motion | 8 | `--motion-duration-*`, `--motion-ease-*` |
| Border width | 2 | `--border-width`, `--border-width-strong` |
| Density | 5 | `--control-height-*`, `--field-height`, `--row-height` |

Live specimens for all of these are at
[rhombuskit.online/foundations](https://rhombuskit.online/foundations).

## Stability

Token CONTRACT **names** are covered by semver and CI-guarded (a snapshot diff is a
review event); generated **values** are not. The published **primitive** names above are
frozen append-only on the same terms, guarded by `primitives.snapshot.json`.

> The `--radius-*` **values** were retuned to the Material 3 corner ramp. The names did not
> change, so this is not a breaking change under the policy above — but if you referenced a
> rung for its pixel value, see the migration table in the
> [Theming guide](https://github.com/doug-williamson/RhombusKit/blob/main/docs/theming.md#corner-radius).

See the
[versioning & semver policy](https://github.com/doug-williamson/RhombusKit/blob/main/README.md#versioning--stability).

## License

MIT
