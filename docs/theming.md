# Theming guide

How RhombusKit themes itself, how to switch themes at runtime, and how to extend the
system with your own theme without breaking the contract.

- [How theming works](#how-theming-works)
- [Setup](#setup)
- [Switching themes at runtime](#switching-themes-at-runtime)
- [No flash on first paint](#no-flash-on-first-paint)
- [Custom themes](#custom-themes)
- [Theme builder](#theme-builder)
- [Overriding token values](#overriding-token-values)
- [Density](#density)
- [The Material bridge](#the-material-bridge)

## How theming works

RhombusKit's colour, shadow, radius, geometry, and font decisions live in a three-tier
token system in [`@rhombuskit/tokens`](https://www.npmjs.com/package/@rhombuskit/tokens):

1. **Primitives** — the raw palette (`violet-600`, `slate-100`, …). Internal.
2. **CONTRACT** — semantic names that are the public, versioned API: `--bg`,
   `--surface-0`, `--text-primary`, `--btn-primary-bg`, `--toast-error-text`, …
3. **Theme packs** — concrete value maps for each theme that bind CONTRACT names to
   primitives. `rhombus-light` and `rhombus-dark` ship in the box.

A theme pack is emitted as a CSS block scoped to a `data-theme` attribute on `<html>`:

```css
[data-theme="rhombus-light"] { --bg: #f8fafc; --text-primary: #0f172a; /* … */ }
[data-theme="rhombus-dark"]  { --bg: #020617; --text-primary: #f8fafc; /* … */ }
```

Every component — RhombusKit's own and (via the [Material bridge](#the-material-bridge))
every Angular Material component — reads `var(--…)`, so flipping `data-theme` re-themes
the whole app with no recompilation.

**The contract:** token *names* are covered by semver and CI-guarded; generated token
*values* are a theme detail and may change in any release. See the
[versioning policy](../README.md#versioning--stability).

## Setup

Load the global SCSS in this order (tokens first, so later layers can reference the
custom properties they declare):

```scss
// styles.scss
@use '@rhombuskit/tokens/scss' as tokens;          // declares the CONTRACT vars
@use '@rhombuskit/material-preset/scss' as preset; // maps Material → CONTRACT
@use '@rhombuskit/core/scss' as core;              // RhombusKit component/directive globals

// Opt in to the Material bridge on the element that carries data-theme (here
// :root) so every --mat-sys-* re-resolves per active theme + palette.
:root {
  @include preset.material-bridge();
}
```

> **Breaking change in v1.9:** `@use '@rhombuskit/material-preset/scss'` no longer
> auto-applies the bridge at `:root`. Add the `@include preset.material-bridge();`
> line above. This makes the bridge opt-in and lets you scope it to a Material subtree.

Register the theme runtime in your app providers:

```ts
// app.config.ts
import { provideRhombusTheme } from '@rhombuskit/theme-engine';

export const appConfig: ApplicationConfig = {
  providers: [
    // Omit the call entirely to accept the defaults below.
    provideRhombusTheme({
      light: 'rhombus-light',  // ThemeName applied for "light"
      dark: 'rhombus-dark',    // ThemeName applied for "dark"
      default: 'system',       // 'system' | a ThemeName — used before any choice is stored
    }),
  ],
};
```

`RhombusThemeService` is `providedIn: 'root'`; with the defaults you don't have to call
`provideRhombusTheme` at all.

## Switching themes at runtime

Inject `RhombusThemeService` and read its signals or change the preference:

```ts
import { RhombusThemeService } from '@rhombuskit/theme-engine';

private readonly theme = inject(RhombusThemeService);

// State (signals):
this.theme.preference(); // what the user chose: a ThemeName | 'system'
this.theme.current();    // what's applied now: always a concrete ThemeName

// Actions:
this.theme.setTheme('rhombus-dark'); // or 'system'
this.theme.toggle();                 // cycles light → dark → system → light
```

The preference is persisted to `localStorage` under the key
**`rhombuskit:theme-preference`** (exported as `STORAGE_KEY`). The stored value is the
*literal* preference — including `'system'` — so "follow the OS" survives reloads. When
the preference is `'system'`, the service tracks `prefers-color-scheme` and re-resolves
`current()` if the OS theme changes mid-session.

RhombusKit also ships drop-in UI for this: `<rhombus-theme-toggle>` (a cycling button)
and `<rhombus-theme-menu>` (explicit Light / Dark / System items).

> Don't set `data-theme` yourself — the service owns it. Setting it manually will be
> overwritten on the next preference change.

## No flash on first paint

The service runs after Angular hydrates, so on its own it can't prevent a flash of the
wrong theme. Set `data-theme` *before* first paint with the init script, which mirrors
the service's resolution logic and uses the same storage key:

```ts
import { THEME_INIT_SCRIPT, getThemeInitScript } from '@rhombuskit/theme-engine';
```

- `THEME_INIT_SCRIPT` — the inline JS body for the **default** rhombus config. Paste it
  into a `<script>` in `<head>`, before your app bundle.
- `getThemeInitScript(config)` — returns a full `<script>…</script>` string for a
  **custom** config; inject it at build time (e.g. an index-transform).

```html
<head>
  <script>
    /* contents of THEME_INIT_SCRIPT — reads localStorage['rhombuskit:theme-preference'],
       resolves 'system' via prefers-color-scheme, sets <html data-theme>, fails silently */
  </script>
</head>
```

Guarantee: the script and the service use the same `STORAGE_KEY` and `data-theme`
attribute and the same resolution rules, so the pre-paint theme always matches what the
service settles on.

## Custom themes

Two steps: tell TypeScript the name exists, and ship the CSS that defines it.

**1. Augment `ThemeRegistry`** so `setTheme('your-theme')` type-checks:

```ts
// theme.augmentation.ts
declare module '@rhombuskit/theme-engine' {
  interface ThemeRegistry {
    'midnight-light': true;
    'midnight-dark': true;
  }
}
```

**2. Register the names and ship their CSS.** Define the CONTRACT values under your
`[data-theme]` selectors — the cleanest path is a token theme pack, but any CSS that
sets the CONTRACT custom properties works:

```scss
[data-theme='midnight-light'] {
  --bg: #f5f6ff;
  --surface-0: #ffffff;
  --text-primary: #161a2b;
  --btn-primary-bg: #4f46e5;
  /* …every CONTRACT name… */
}
[data-theme='midnight-dark'] { /* … */ }
```

```ts
provideRhombusTheme({ light: 'midnight-light', dark: 'midnight-dark' });
```

If you use a custom config, generate the FOUC script with `getThemeInitScript(config)`
so the pre-paint resolution matches.

> This is the **sanctioned extensibility path** — it adds themes without changing the
> CONTRACT, so it never breaks the semver contract. You're responsible for providing a
> complete set of CONTRACT values; a missing name falls back to the inherited value.

## Theme builder

Writing all 60 CONTRACT values by hand — and keeping them AA-clean in both light and
dark — is the slow part of the two steps above.
[`@rhombuskit/theme-builder`](https://www.npmjs.com/package/@rhombuskit/theme-builder)
does it from a seed: give it a brand accent (and, optionally, a neutral) and it derives
a complete light + dark theme over every contract token, then **re-validates the WCAG AA
contrast pairs and either returns an AA-clean theme or throws** — it never returns sub-AA
output. It is pure TypeScript (no Angular peer), so it runs from a build script or a CLI:

```ts
import {
  generateTheme,
  serializeThemeCss,
  toRegisteredThemes,
  toAugmentation,
} from '@rhombuskit/theme-builder';

const theme = generateTheme({ accent: '#0ea5e9', name: 'sky' });

serializeThemeCss(theme);   // the two [data-theme] blocks (step 2 above)
toRegisteredThemes(theme);  // the provideRhombusThemes(...) metadata (step 1)
toAugmentation(theme);      // the declare-module snippet
```

A bare `generateTheme()` (or the canonical `#7c3aed` / `#64748b` seeds) reproduces the
shipped `rhombus-light` / `rhombus-dark` packs byte-for-byte. The fixed perceptual
lightness ladder plus a small, bounded contrast nudge keep the accent axis AA-clean for
every hue; only a pathological custom *neutral* can exhaust the nudge and throw.

For an interactive version — pick seeds, watch a live light + dark preview, and copy or
download the theme in any of the three forms — open the **[Theme builder](/theme-builder)**
page. The preview is applied to a local subtree, so it never disturbs your own theme.

## Overriding token values

To retint the built-in themes rather than add new ones, override the CONTRACT custom
properties under the existing `data-theme` selector (load after the tokens layer):

```scss
[data-theme='rhombus-light'] {
  --btn-primary-bg: #0ea5e9; // your brand primary
  --btn-primary-hover: #0284c7;
}
```

Because everything resolves through `var(--…)`, this re-tints RhombusKit components and
Material components alike. Keep an eye on contrast — RhombusKit's defaults are tuned to
WCAG 2.1 AA in both themes.

## Density

Density is a single app-wide choice of control **geometry** — `compact`, `default`, or
`comfortable` — set once at bootstrap. It owns the box (heights, padding, gaps) and never
the type: each component's `size` input still owns font size, so density and size are
orthogonal and adding density is non-breaking. An app that never opts in renders exactly
as before.

```ts
import { provideRhombusDensity } from '@rhombuskit/core';

bootstrapApplication(App, {
  providers: [
    provideRhombusDensity('compact'), // 'compact' | 'default' | 'comfortable'
  ],
});
```

The provider is eager: registering it constructs `RhombusDensityService`, which writes the
level onto `<html>` as `data-density`. It is theme-invariant (a 40px control is 40px in
every theme), so it lives in the palette-level primitives — five frozen names,
`--control-height-sm|md|lg`, `--field-height`, `--row-height` — not the semantic CONTRACT.
Every level clears the WCAG 2.2 24×24 target floor; there is deliberately no equivalent of
Material's `-2`/`-3` steps, which drop touch targets and the floating label.

Switch at runtime through the same service:

```ts
private readonly density = inject(RhombusDensityService);
onCompact() { this.density.density.set('compact'); }
```

**The Material bridge is required for Material-backed controls.** Density reaches
RhombusKit's own components (button, segmented, chip, chip group, nav list, accordion,
stepper) with no extra setup, but the **form-field family, data table, selection list,
tabs, toolbar, and paginator** only move when the [Material bridge](#the-material-bridge)
is included — once, on `:root` or `html`:

```scss
@use '@rhombuskit/material-preset/scss' as rhombus;

:root {
  @include rhombus.material-bridge();
}
```

> Include the bridge on `:root`/`html`, not on an app-level wrapper. The service writes
> `data-density` on `<html>`, so a bridge included at `.app` compiles a
> `.app[data-density='…']` selector that never matches.

**What density leaves alone.** It does not touch checkbox, radio, or switch state layers;
slider, menu, dialog, datepicker, card, or snackbar (Angular Material no-ops density on
those too); or any font size. Those are stated exclusions, not gaps — a compact app keeps
them at their default size.

### SSR and prerendering

Unlike the theme preference — a per-user `localStorage` value that is unknowable at
prerender, which is why theming needs the [pre-paint init script](#no-flash-on-first-paint)
— density is a bootstrap constant supplied through DI, so the correct level is already
known when a page is rendered on the server. The service writes it through the injected
document, so statically rendered pages ship the right `data-density` in their HTML and the
browser's identical write on hydration is a no-op. **That is why density needs no pre-paint
script**: there is no wrong-value first paint to prevent.

### Limitations

- **One level per build for static/SSR pages.** The level is baked in at render time. A
  page prerendered with `provideRhombusDensity('compact')` ships compact markup; switching
  at runtime is a client-side reflow after hydration.
- **No persistence.** There is no stored preference and nothing reads one; reload returns
  to the bootstrapped level. If you offer a user toggle, persist and re-apply it yourself.
- **Client-only apps paint once at the bootstrapped level**, then the service's first write
  runs during bootstrap — before first paint in practice, but if you need a guaranteed
  value in the initial HTML, set `<html data-density="…">` in your index template.

### Migrating from mat-density

Coming off Angular Material's `mat.density($scale)`? `provideRhombusDensity('compact')` is
**value-identical to `mat.theme((density: -1))` on twelve of the thirteen in-scope
components** (the one exception, the segmented control, becomes 36px where `mat.density`
leaves it at 40px, because Material's button-toggle ramp is flat at `-1` — that is the
feature, not a regression). You also gain a `comfortable` direction, runtime switching, no
`-2` accessibility cliff, and a fix for Material's sub-48px touch-target overlap.

The swap:

```scss
// BEFORE
html { @include mat.theme((color: (…), typography: Roboto, density: -1)); }

// AFTER — delete the `density` key (do not leave it at 0; delete it).
@use '@rhombuskit/tokens/scss';
@use '@rhombuskit/material-preset/scss' as rhombus;

html { @include mat.theme((color: (…), typography: Roboto)); }
:root { @include rhombus.material-bridge(); } // required — see above
```

```ts
bootstrapApplication(App, { providers: [provideRhombusDensity('compact')] });
```

Density is scoped, so **restore the components it leaves out by hand** — or accept +4px on
them. These names are declared nowhere in RhombusKit, so there is no conflict:

```scss
:root {
  @include mat.checkbox-overrides((state-layer-size: 36px)); // was -1
  @include mat.radio-overrides((state-layer-size: 36px));
  @include mat.expansion-overrides((
    header-collapsed-state-height: 44px,
    header-expanded-state-height: 60px,
  ));
  @include mat.tree-overrides((node-min-height: 44px));
  @include mat.select-overrides((arrow-transform: translateY(-8px)));
}
```

`rhombus-checkbox` and `rhombus-radio` are shipped RhombusKit components, so this is a real,
visible change, not hypothetical.

> **Running both at once is unsupported.** A component-class rebind beats any
> `mat.theme((density: …))` value unconditionally, so an app that keeps a Material density
> scale *and* adopts RhombusKit density gets a partial, un-opt-out-able shift — for example
> a table row and header collapsing to the same height. `provideRhombusDensity()` detects a
> live `mat.density` scale in dev mode and warns. Remove the Material density scale and use
> `provideRhombusDensity()` alone.

## The Material bridge

[`@rhombuskit/material-preset`](https://www.npmjs.com/package/@rhombuskit/material-preset)
maps Angular Material's M3 system tokens (`--mat-sys-*`) onto the RhombusKit CONTRACT —
e.g. `--mat-sys-primary: var(--btn-primary-bg)`, `--mat-sys-surface: var(--surface-0)`.
With the bridge included, Material components inherit the active theme automatically; no
`.mat-mdc-*` overrides, no hard-coded colours, and no hand-maintained `mat.theme()` →
`--mat-sys-*` mapping to keep in sync.

**Opt-in (v1.9):** include the bridge once on the element that carries `data-theme`:

```scss
@use '@rhombuskit/material-preset/scss' as rhombus;

:root {
  @include rhombus.material-bridge();
}
```

Because every value is a `var(--contract-token)`, the bridge tracks light/dark and every
registered palette with no per-theme configuration — so you can delete any local
`mat.theme()` bridge SCSS. Include it on a scoped selector instead to theme a Material
subtree; note that components rendered in the body-level CDK overlay (menu, tooltip,
toast, datepicker and select panels) are only reached by a `:root` / `html` include.
Before v1.9 the bridge auto-applied at `:root` on import; that auto-apply was removed, so
existing consumers must add the `@include` line above.

**Support model:** the bridge tracks Angular Material **21.x** and uses the official
`mat.*-overrides()` mixins for shape/typography that `--mat-sys-*` can't express.
`@angular/material@^21` is a peer dependency; raising the supported Material major is
itself a breaking change.

One caveat worth knowing: a few Material components read `--mat-sys-primary` directly as
on-surface accent **text** (not just as a fill). RhombusKit scopes those to an
AA-compliant accent where needed; if you override `--btn-primary-bg` to a low-contrast
colour, check accent text on both surfaces.
