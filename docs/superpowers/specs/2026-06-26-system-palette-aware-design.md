# Palette-aware "System" — design

**Date:** 2026-06-26
**Status:** Approved
**Type:** Enhancement (additive, ships as MINOR)
**Area:** `@rhombuskit/theme-engine`, `@rhombuskit/core` theme controls, showcase init script

## Problem

In an app with more than one theme palette (e.g. the showcase's built-in
Rhombus plus the registered Teal community palette), choosing **System** from
the theme controls always jumps to the **built-in** palette, discarding the
active palette. Concretely: on Teal Light/Dark, clicking System lands on
Rhombus Light/Dark (whichever the OS prefers).

This is correct per the current model — `'system'` is a single flat preference
value that can only resolve to `config.light` / `config.dark` (the built-ins).
But it is surprising: a user on Teal who clicks System reasonably expects
"follow my OS, **but keep Teal**."

## Goal

Make "follow system" **palette-aware** and the Mode (Light/Dark/System) and
Palette axes **fully independent**: changing one never resets the other.
Switching palette while following the OS keeps you following the OS within the
new palette; choosing System while on a palette keeps that palette.

## Constraints

- **Additive + MINOR.** No breaking change to the public API or the persisted
  value format. Aligns with the theme-registry "single-signal / additive" design.
- **No-flash preserved.** A persisted "follow-system-within-Teal" state must
  resolve correctly pre-paint in the init script, so a hard reload does not
  flash the built-in palette before correcting. Preserves the PR #92 guarantee.

## Approach (chosen)

**Widen the single preference vocabulary.** A concrete name like `teal-light`
already encodes *(palette=teal, mode=light)*. The only *(palette, mode)* pair
the vocabulary cannot express is *(non-built-in palette, mode=system)*. Add
exactly one new form:

| Stored value          | Meaning *(palette, mode)*                  |
| --------------------- | ------------------------------------------ |
| `rhombus-light`, …    | concrete: palette + fixed light/dark       |
| `system`              | built-in palette, follow OS *(unchanged)*  |
| `system:<palette>`    | **new** — that palette, follow OS          |

`_preference` stays the single source of truth (one signal, one localStorage
value). Bare `'system'` is unchanged, so unconfigured apps are byte-identical.

Rejected alternatives: two explicit persisted axes (`palette` + `mode`) —
violates single-signal, changes storage format, too large for a MINOR; flat
`'system'` + separate `lastPalette` key — two sources of truth that can desync.

## State model

The UI's two axes are **derived**, not stored separately:

- **active palette** = `palette()` of the resolved theme (already computed).
- **active mode** = `system` when the preference is a system-form, else the
  resolved theme's light/dark.

Helpers (pure, in a new `theme.util.ts`, shared by service + init-script):

- `paletteOf(name)` — extracted from `theme.service.ts` (unchanged logic).
- `parsePreference(value) → { kind: 'system', palette?: string } | { kind: 'concrete' }`
- `formatSystem(palette, builtin) → palette === builtin ? 'system' : 'system:' + palette`

## Resolution & two-axis API (`theme.service.ts`)

`current()` resolves a system-form within its palette:

```ts
const p = parsePreference(this._preference());
if (p.kind === 'system')
  return this.resolveSystem(p.palette ?? this.builtinPalette, this.systemPrefersDark());
return pref as ThemeName;
```

```ts
private resolveSystem(palette, wantDark): ThemeName {
  const mode = wantDark ? 'dark' : 'light';
  const member = this.themes().find(
    (t) => (t.palette ?? paletteOf(t.name)) === palette && t.mode === mode,
  );
  return member?.name ?? (wantDark ? this.config.dark : this.config.light);
}
```

New public signal: `followsSystem = computed(() => parsePreference(this._preference()).kind === 'system')`
— true for both `'system'` and `'system:teal'`. The UI reads this instead of
string-sniffing the preference.

Behavior changes (the two axes become symmetric):

| Action                      | New behavior                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `setMode('light'\|'dark')`  | unchanged — concrete member of the active palette                                             |
| `setMode('system')`         | `formatSystem(this.palette(), builtin)` → stays in the active palette                          |
| `setPalette(p)`             | if `followsSystem()` → `formatSystem(p)`, else concrete member; **+ no-op guard for unknown palette** |
| `toggle()`                  | gates on `followsSystem()` so the light→dark→system cycle stays within the active palette       |
| `isAcceptablePreference()`  | accepts `system:<palette>` iff that palette is in the construction-time registry               |

`palette()` and `mode()` need no change: both read `current()`, which now
resolves `system:teal` → `teal-dark`, so they report Teal + Dark automatically.

## No-flash & persistence

**Persistence acceptance.** A stored `system:<palette>` is restorable iff
`<palette>` exists in the *construction-time* registry (built-ins +
`provideRhombusThemes`), never the imperative `registerThemes` set — identical
to the existing rule for concrete names. A removed palette → unacceptable →
falls back to `config.default`.

**Library init script (`buildInitBody`).** Emit a compact palette→members map,
built in TS from the `RegisteredTheme[]` already passed in (only members that
exist), e.g. `P={"teal":{"l":"community-teal-light","d":"community-teal-dark"}}`.
A self-contained prefix rewrites `s` before the existing resolution line:

```js
if(s&&s.indexOf('system:')===0){var g=P[s.slice(7)];s=g?((dk?g.d:g.l)||'system'):'system';}
```

A known palette resolves to its dark/light member by OS; an unknown palette or
missing-mode slot degrades to bare `'system'` → built-in (polarity kept),
mirroring `resolveSystem`. **Byte-identical guarantee:** the entire prefix and
the `P` declaration are gated on `registeredThemes.length`, so the default
rhombus-only output is unchanged to the byte.

**Showcase init script (`apps/showcase/src/index.html`).** This hand-maintained
copy mirrors the same `system:<palette>` branch with
`{teal:{l:'community-teal-light',d:'community-teal-dark'}}`. Its `[data-theme]`
CSS is already rendered into `<head>` during SSG (`app.component.ts`), so first
paint stays fully styled. *(The pre-existing divergence between this hand-written
script and `getThemeInitScript` is out of scope — noted as a follow-up.)*

## Edge-case rulings

1. **Palette missing the OS-resolved mode** (e.g. a dark-only palette, OS=light)
   → fall back to the **built-in** theme of that polarity, not the palette's
   other member. Keeps light/dark correct; matches the existing `setMode` fallback.
2. **Unknown/removed palette in a persisted `system:<p>`** → unacceptable, falls
   back to `config.default`. Same as a removed augmentation today.

## File-by-file changes

`packages/theme-engine`:
- `theme.types.ts` — widen `ThemePreference` to `` ThemeName | 'system' | `system:${string}` ``; refresh doc comment.
- `theme.util.ts` *(new)* — `paletteOf` (extracted), `parsePreference`, `formatSystem`.
- `theme.service.ts` — `current()` + `resolveSystem`; `followsSystem`; `setMode('system')`; `setPalette()`; `toggle()`; `isAcceptablePreference()`; update stale "system is a built-in-palette concept" comments.
- `theme-init-script.ts` — gated palette-map prefix in `buildInitBody`.

`packages/core`:
- `rhombus-theme-menu.component.ts` & `rhombus-theme-toggle.component.ts` — `activeMode` reads `theme.followsSystem()`.

`apps/showcase`:
- `src/index.html` — mirror the `system:<palette>` branch.

No public API removed or renamed; `followsSystem` is additive; `ThemePreference`
only widens. Ships as a MINOR.

## Test plan

- *Service* (`theme.service.spec.ts` / `theme-modes.spec.ts`): `setMode('system')`
  on Teal → `'system:teal'`; `current()` resolves `system:teal` by OS and reacts
  to OS flips; `setPalette('teal')` while following → `'system:teal'`; full
  `toggle()` cycle on Teal; hydrate stored `'system:teal'` (accepted with Teal
  registered, rejected → default without); `followsSystem`; built-in
  `setMode('system')` still yields bare `'system'`.
- *Init script* (`theme-init-script.spec.ts`): stored `'system:teal'` → correct
  member by OS; unknown palette / missing-mode → built-in fallback; **default
  output byte-identical** (assert exact string).
- *Components*: System radio highlights when on `system:teal`; existing
  `theme-controls-config.spec.ts` "literal 'system'" test stays green (built-in
  → bare `'system'`).
