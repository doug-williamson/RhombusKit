# @rhombuskit/core

The Angular component library at the heart of [RhombusKit](https://rhombuskit.online).

Standalone, signal-based, `OnPush` Angular 21 components — thin, themeable wrappers over
Angular Material plus a few bespoke pieces — all styled through the
[RhombusKit token contract](https://www.npmjs.com/package/@rhombuskit/tokens) and built
to **WCAG 2.1 AA** (axe-checked in CI, contrast verified in both themes).

Buttons, cards, badges, chips, form fields (input/textarea/select), checkbox, radio,
switch, tabs, menu, breadcrumbs, pagination, data table, dialog, tooltip, toast, alert,
avatar, spinner/progress, app shell, and more.

## Install

```sh
pnpm add @rhombuskit/core @rhombuskit/material-preset
```

`@rhombuskit/tokens` and `@rhombuskit/theme-engine` come along as dependencies; add
`@rhombuskit/material-preset` for the Material → token bridge. Peer dependencies:
`@angular/{core,common,cdk,forms,material,router}@^21` and `rxjs@^7.8`.
`highlight.js@^11` is an **optional** peer (only `<rhombus-code-block>` uses it).

## Setup

**1. Global styles** (`styles.scss`) — order matters:

```scss
@use '@rhombuskit/tokens/scss' as tokens;             // CONTRACT custom properties
@use '@rhombuskit/material-preset/scss' as preset;    // Material → token bridge
@use '@rhombuskit/core/scss' as core;                 // directive/component globals
```

**2. Providers** (`app.config.ts`):

```ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRhombusTheme } from '@rhombuskit/theme-engine';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideRhombusTheme(), // defaults to rhombus-light / rhombus-dark / system
  ],
};
```

**3. Flash-free theme** — drop `THEME_INIT_SCRIPT` into `<head>` (see
[@rhombuskit/theme-engine](https://www.npmjs.com/package/@rhombuskit/theme-engine)).

## Usage

Components are standalone — import the ones you use:

```ts
import { RhombusButtonComponent, RhombusInputComponent } from '@rhombuskit/core';
```

```html
<rhombus-button variant="primary" leadingIcon="add">New post</rhombus-button>

<rhombus-input label="Email" type="email" [control]="email">
  <span rhombusError>Enter a valid email.</span>
</rhombus-input>
```

Form components are reactive-forms-first: pass a `FormControl` via `[control]`.

## Reference

The **live showcase at [rhombuskit.online](https://rhombuskit.online)** is the
component reference — every component has a page with variants, states, and
accessibility notes. The CI-guarded **public-surface contract** (every export with its
signatures) lives in
[`etc/core.api.md`](https://github.com/doug-williamson/RhombusKit/blob/main/etc/core.api.md).

For theming and custom themes, see the
[Theming guide](https://github.com/doug-williamson/RhombusKit/blob/main/docs/theming.md).

## Stability

Named exports, public input/output names, component selectors, and SCSS subpath exports
are covered by semver. See the
[versioning & semver policy](https://github.com/doug-williamson/RhombusKit/blob/main/README.md#versioning--stability).

## License

MIT
