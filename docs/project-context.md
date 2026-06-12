# RhombusKit — Project Context

A version-controlled snapshot of RhombusKit's current state, written to seed an
external assistant's context (e.g. a Claude Project). Pair it with the curated
[release history](./release-history.md) and the exhaustive
[CHANGELOG.md](../CHANGELOG.md).

> **Keep this fresh:** update the `CURRENT VERSION` line and the component count
> whenever they change — they are the first things to drift.

```markdown
# RhombusKit — Current State

CURRENT VERSION: 1.1.1 (released). All four packages release in lockstep on one
synced version: @rhombuskit/tokens, @rhombuskit/theme-engine,
@rhombuskit/material-preset, @rhombuskit/core.

STABILITY: Stable 1.x. Crossed 1.0.0 on 2026-06-05 — the semver contract is now
in force (NOT pre-1.0 anymore). Breaking changes to the covered surface require a
major bump.

STACK: Nx + pnpm monorepo. Angular 21 (peer dep ^21), standalone + signal-based
components, WCAG 2.1 AA. Releases automated via Release-Please + conventional
commits.

PACKAGES:
- @rhombuskit/core — Angular component library (31 components)
- @rhombuskit/tokens — framework-agnostic design-token CONTRACT (CSS/SCSS/TS)
- @rhombuskit/theme-engine — light/dark/system theming runtime
- @rhombuskit/material-preset — bridges Angular Material M3 tokens onto CONTRACT

COMPONENTS (31): alert, app-shell, avatar, badge, breadcrumbs, button, card,
checkbox, chip, code-block, confirm-dialog, data-table, dialog, empty-state,
form-field, icon, input, menu, overflow-menu, page-header, pagination,
progress-bar, radio, select, spinner, switch, tabs, textarea, theme-toggle,
toast, tooltip.

SEMVER CONTRACT (major bump required to break):
- Named exports from each package barrel (classes, public input/output names, types)
- Token CONTRACT *names* (--bg, --text-primary, --toast-*, …) — values NOT covered
- SCSS subpath exports, component selectors
- Theming contract: data-theme="rhombus-light|rhombus-dark" + localStorage key
  rhombuskit:theme-preference
CI guards it: tools/verify-tokens.mjs (token snapshot) + tools/api-snapshot.mjs
(etc/*.api.md type-surface snapshots).

KNOWN BREAKING CHANGE TO REMEMBER (0.9.0): form-field errors use the
[rhombusError] marker directive (RhombusErrorDirective), NOT the old
<span slot="error">.

SHOWCASE: live site at rhombuskit.online — homepage, per-component
Overview/API/Examples tabs, API reference generated from the type surface,
interactive theming guide at /theming.

DOCS: README.md, docs/theming.md, docs/release-history.md (curated narrative),
CHANGELOG.md (exhaustive auto-generated), etc/*.api.md (public-surface snapshots).

VERSION ARC SINCE 0.7:
0.8 app-shell hasNav · 0.9 checkbox/radio/switch/tooltip (+breaking error marker)
· 0.10 alert/avatar/breadcrumbs/dialog/menu/pagination/spinner/progress/tabs/toast
· 0.11 WCAG AA contrast gate · 1.0.0 stable + showcase redesign + generated API
ref · 1.1.0 overviews/branding + button-size/scroll fixes · 1.1.1
icon/theme-menu/sidenav fixes.
```

---

## Companion: custom instructions

The block above is reference *knowledge*. For an assistant's *behavior*, pair it
with standing instructions: respect the semver contract (flag any covered-surface
break as a MAJOR), follow Angular 21 standalone/signal patterns, never reintroduce
the removed `slot="error"` convention, use Conventional Commits, and never
hand-edit `CHANGELOG.md` or bump versions manually (Release-Please owns releases).
