# @rhombuskit/material-preset

The Angular Material bridge for [RhombusKit](https://rhombuskit.online).

A small SCSS layer that maps Angular Material's M3 system tokens (`--mat-sys-*`) onto
the [`@rhombuskit/tokens`](https://www.npmjs.com/package/@rhombuskit/tokens) CONTRACT.
Once you include the `material-bridge()` mixin, every Angular Material component — and
every `@rhombuskit/core` component built on top of one — reads its colours from the
active RhombusKit theme, so toggling `data-theme` re-themes Material in lockstep. No
hard-coded colours, no `.mat-mdc-*` selector overrides, and no hand-maintained
`mat.theme()` → `--mat-sys-*` mapping to keep in sync.

## Install

```sh
pnpm add @rhombuskit/material-preset @rhombuskit/tokens
```

Peer dependency: `@angular/material@^21`.

## Usage

In your global stylesheet, load the tokens first (they declare the custom properties
the bridge references), then include the `material-bridge()` mixin on the element that
carries `data-theme` (usually `:root` / `html`):

```scss
// Order matters — tokens first so the bridge can reference --surface-0, --btn-primary-bg, …
@use '@rhombuskit/tokens/scss' as tokens;
@use '@rhombuskit/material-preset/scss' as rhombus;

:root {
  @include rhombus.material-bridge();
}
```

That's it — Material components now follow the RhombusKit theme, and you can delete any
local `mat.theme()` bridge SCSS. Because every value is a `var(--contract-token)`, the
bridge tracks light/dark and every registered palette automatically. Include it on a
scoped selector instead to theme a Material subtree (note: components rendered in the
body-level CDK overlay — menu, tooltip, toast, datepicker and select panels — are only
reached by a `:root` / `html` include).

> **Breaking change in v1.9:** importing `@rhombuskit/material-preset/scss` no longer
> auto-applies the bridge at `:root`. Add the `@include rhombus.material-bridge();` line
> shown above. This makes the bridge opt-in and scopable.

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
