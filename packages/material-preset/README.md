# @rhombuskit/material-preset

The Angular Material bridge for [RhombusKit](https://rhombuskit.online).

A small SCSS layer that maps Angular Material's M3 system tokens (`--mat-sys-*`) onto
the [`@rhombuskit/tokens`](https://www.npmjs.com/package/@rhombuskit/tokens) CONTRACT.
Once imported, every Angular Material component — and every `@rhombuskit/core`
component built on top of one — reads its colours from the active RhombusKit theme, so
toggling `data-theme` re-themes Material in lockstep. No hard-coded colours; no
`.mat-mdc-*` selector overrides.

## Install

```sh
pnpm add @rhombuskit/material-preset @rhombuskit/tokens
```

Peer dependency: `@angular/material@^21`.

## Usage

In your global stylesheet, **after** the tokens (which declare the custom properties
the bridge references) and after Angular Material's theme:

```scss
// Order matters — tokens first so the bridge can reference --surface-0, --btn-primary-bg, …
@use '@rhombuskit/tokens/scss' as tokens;
@use '@rhombuskit/material-preset/scss' as material-preset;
```

That's it — Material components now follow the RhombusKit theme.

## Support model

The bridge tracks Angular Material **21.x** M3 system tokens and uses the official
`mat.*-overrides()` mixins for component shape/typography it can't express through
`--mat-sys-*`. Bumping the supported Angular Material major is a breaking change. See
the [Theming guide](https://github.com/doug-williamson/RhombusKit/blob/main/docs/theming.md#the-material-bridge)
for the full support statement.

## Stability

SCSS subpath exports (`@rhombuskit/material-preset/scss`) are covered by semver; the
specific `--mat-sys-*` internals the bridge maps are not. See the
[versioning & semver policy](https://github.com/doug-williamson/RhombusKit/blob/main/README.md#versioning--stability).

## License

MIT
