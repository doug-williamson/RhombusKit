# RhombusKit — Release History

A curated, human-readable narrative of every RhombusKit release. For the
exhaustive, commit-level record see the machine-generated
[CHANGELOG.md](../CHANGELOG.md); this document tells the story of *what each
release was about*.

All four packages — `@rhombuskit/tokens`, `@rhombuskit/theme-engine`,
`@rhombuskit/material-preset`, and `@rhombuskit/core` — are versioned and
released **in lockstep on one synced version**.

---

## At a glance

| Version | Date | Theme |
|---|---|---|
| **1.1.1** | 2026-06-11 | Patch: icon vertical-align, theme-menu active icon, sidenav corners |
| **1.1.0** | 2026-06-10 | Showcase orientation overviews, branding; button size + scroll fixes |
| **1.0.0** | 2026-06-05 | **Stable release.** Showcase redesign, generated API reference, theming guide |
| **0.11.0** | 2026-06-04 | WCAG 2.1 AA color-contrast gate (Phase 4) |
| **0.10.0** | 2026-06-04 | Component wave: alert, avatar, breadcrumbs, dialog, menu, pagination, spinner/progress, tabs, toast |
| **0.9.0** | 2026-06-04 | Selection controls: checkbox, radio, switch, tooltip · **breaking** error-marker change |
| **0.8.0** | 2026-06-03 | App-shell `hasNav` + themeable sidenav width |
| **0.7.0** | 2026-06-03 | Content composites: page-header, code-block, empty-state |
| **0.6.0** | 2026-06-03 | App-shell top-bar layout + showcase dogfood |
| **0.5.0** | 2026-06-03 | App-shell layout primitive; discriminated `ColumnDef` |
| **0.4.x** | 2026-06-02 | Inline-SVG icons; theme-config fixes; data-table click fixes |
| **0.3.0** | 2026-05-29 | Publishable FESM bundles; `provideRhombusTheme`; M3 bridge |
| **0.2.0** | 2026-05-29 | Theme engine + controls; data-table; button/card/chip/badge/form primitives |
| **0.1.0** | 2026-05 | Initial monorepo seed + token CONTRACT |

---

## 1.x — Stable

### 1.1.1 — 2026-06-11
Patch release.

- **Fixes** — `rhombus-icon` now uses a CSS block comment so `vertical-align`
  isn't swallowed (plus a CI guard that fails the build on Sass line-comment
  leaks in emitted component styles); the theme-menu active item's icon is
  colorized to match its label; the app-shell sidenav drawer corners are
  squared.

### 1.1.0 — 2026-06-10
First minor on the stable line.

- **Features** — showcase orientation **Overviews**, a branded tab title and
  favicon.
- **Fixes** — button `sm`/`md`/`lg` size variants now render distinctly;
  app-shell resets content scroll to top on route change.

### 1.0.0 — 2026-06-05 — **Stable release** 🎉
The semver contract takes effect (see the README "Versioning & stability"
section). The release itself was a documentation and showcase milestone rather
than new components.

- **Showcase redesign** — a homepage at `/`, every component refactored into a
  deep-linkable **Overview / API / Examples** tab shell, an **API reference tab
  generated from the type surface**, and an interactive **theming guide** at
  `/theming`.
- **Docs** — JSDoc backfilled across the public inputs/outputs, with API
  metadata regenerated from it.

From here on, breaking changes to the covered public surface (barrel exports,
token CONTRACT names, SCSS subpaths, selectors, the theming contract) require a
major bump.

---

## 0.x — Pre-1.0 development

### 0.11.0 — 2026-06-04 — Accessibility (Phase 4)
- WCAG **2.1 AA color-contrast gate** added to CI, with default-theme token
  fixes so the bundled light/dark themes pass it.

### 0.10.0 — 2026-06-04 — The component wave
The single largest component drop. Added: **alert**, **avatar**,
**breadcrumbs**, **dialog** (component + service), a generic **menu** (with
overflow-menu refactored onto it), **pagination**, **spinner** and **progress
bar**, a **tabs** directive, and a **toast** service. Material-preset fixes:
centered the indeterminate spinner, and corrected surface/tooltip text sizing.

### 0.9.0 — 2026-06-04 — Selection controls
- Added **checkbox**, **radio group**, **switch**, and the **tooltip**
  directive.
- ⚠️ **Breaking** — form-field errors moved from the `<span slot="error">`
  convention to the `[rhombusError]` marker directive. Migration: replace
  `slot="error"` with `rhombusError` and import `RhombusErrorDirective`.

### 0.8.0 — 2026-06-03 — App-shell navigation
- App-shell gained a `hasNav` input and a themeable sidenav width.

### 0.7.0 — 2026-06-03 — Content composites
- Added the **page-header**, **code-block**, and **empty-state** composites.
- Fixes: centered `matIconButton` icon content; flipped the data-table sort
  arrow and faded it on clear.

> This is the version your offline notes may have been pinned to — everything
> from 0.8.0 onward (24 → 31 components, accessibility gate, the 1.0 redesign,
> and the stable semver contract) landed after it.

### 0.6.0 — 2026-06-03 — Top-bar app-shell
- App-shell rendered as a full-width top bar; showcase began dogfooding the
  shell with a demo page. Inline-icon vertical-centering fix.

### 0.5.0 — 2026-06-03 — Layout primitive
- Added the `rhombus-app-shell` slotted layout primitive.
- `ColumnDef` discriminated into `DataColumn | DisplayColumn` for the data
  table.

### 0.4.2 — 2026-06-02
- Data-table ignores row clicks originating from interactive cell content.

### 0.4.1 — 2026-06-02
- Theme controls honor `RHOMBUS_THEME_CONFIG`.

### 0.4.0 — 2026-06-02 — Inline-SVG icons
- Default icons (overflow-menu, theme toggle/menu) render as inline SVG.

### 0.3.0 — 2026-05-29 — Publishable packages
- Theme-engine and core build as publishable **FESM bundles**.
- Added `provideRhombusTheme` for configurable resolved theme names, and bridged
  `--mat-sys` background + surface-container onto the CONTRACT.
- Packaging fixes: correct published artifacts, declared `@angular/cdk` /
  `@angular/forms` peer deps.

### 0.2.0 — 2026-05-29 — Theming + first components
The foundational release. Added the **theme engine** (`RhombusThemeService`
with system-preference detection and flash prevention) and theme controls, the
**data table** (with controlled sort and responsive column hints), the
**overflow menu** and **confirm dialog**, the first form primitives
(**input / textarea / select**), and the **button**, **card**, **chip**, and
**badge** primitives — each with a showcase page. Tokens aligned to the FolioKit
naming, with a font CONTRACT and M3 system-token bridge.

### 0.1.0 — 2026-05 — Seed
- Initial Nx + pnpm monorepo and the framework-agnostic design-token CONTRACT.

---

*Maintained alongside [CHANGELOG.md](../CHANGELOG.md). When a new version is
released, add a curated entry here summarizing its theme.*
