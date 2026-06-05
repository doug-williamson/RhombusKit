# @rhombuskit/theme-engine

The theming runtime for [RhombusKit](https://rhombuskit.online).

Applies and persists a light / dark / **system** theme preference: it resolves the
preference, reflects it onto the `data-theme` attribute on `<html>` (which the
[token packs](https://www.npmjs.com/package/@rhombuskit/tokens) key off), remembers it
in `localStorage`, and follows the OS `prefers-color-scheme` when set to system. Ships
a flash-free pre-paint init script and a type-safe path for registering custom themes.

## Install

```sh
pnpm add @rhombuskit/theme-engine @rhombuskit/tokens
```

Peer dependencies: `@angular/core@^21`, `@angular/common@^21`.

## Quick start

`RhombusThemeService` is `providedIn: 'root'`, so with the default
`rhombus-light` / `rhombus-dark` themes you don't need to register anything — just
inject it. To use custom theme names, provide config:

```ts
// app.config.ts
import { provideRhombusTheme } from '@rhombuskit/theme-engine';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRhombusTheme({ light: 'rhombus-light', dark: 'rhombus-dark' }),
  ],
};
```

```ts
// Anywhere — read state (signals) and change the preference.
import { RhombusThemeService } from '@rhombuskit/theme-engine';

private readonly theme = inject(RhombusThemeService);

this.theme.preference(); // 'rhombus-light' | 'rhombus-dark' | 'system'
this.theme.current();    // always concrete: 'rhombus-light' | 'rhombus-dark'
this.theme.setTheme('rhombus-dark');
this.theme.toggle();     // light → dark → system → light
```

### No-flash on first paint

Inject `THEME_INIT_SCRIPT` (or `getThemeInitScript(config)`) into `<head>` so the
correct `data-theme` is set **before** Angular boots:

```html
<head>
  <script>/* contents of THEME_INIT_SCRIPT */</script>
</head>
```

It uses the same `STORAGE_KEY` (`rhombuskit:theme-preference`) and resolution logic as
the service, so there's no mismatch and no flash of the wrong theme.

## Custom themes

`ThemeRegistry` is an augmentable interface — declare your theme names to type-check
`setTheme(...)`, then ship CSS for `[data-theme="your-theme"]`. Full worked example in
the [Theming guide](https://github.com/doug-williamson/RhombusKit/blob/main/docs/theming.md#custom-themes).

## Stability

The `data-theme` contract and the `rhombuskit:theme-preference` key are covered by
semver. See the
[versioning & semver policy](https://github.com/doug-williamson/RhombusKit/blob/main/README.md#versioning--stability).

## License

MIT
