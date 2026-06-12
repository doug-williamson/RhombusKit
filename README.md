# RhombusKit
Nx + pnpm monorepo for RhombusKit — a framework-agnostic design token system and Angular component library. Ships @rhombuskit/tokens, @rhombuskit/theme-engine, @rhombuskit/material-preset, and @rhombuskit/core.

## Packages

| Package | What it is |
|---|---|
| [@rhombuskit/core](./packages/core) | Standalone, signal-based Angular 21 component library (WCAG 2.1 AA) |
| [@rhombuskit/tokens](./packages/tokens) | Framework-agnostic design-token contract (CSS / SCSS / TS) |
| [@rhombuskit/theme-engine](./packages/theme-engine) | Light / dark / system theming runtime for Angular |
| [@rhombuskit/material-preset](./packages/material-preset) | Bridges Angular Material's M3 tokens onto the contract |

## Documentation

- **Component reference** — the live showcase at **[rhombuskit.online](https://rhombuskit.online)**: a page per component with variants, states, and accessibility notes.
- **Theming guide** — [docs/theming.md](./docs/theming.md): setup, runtime switching, custom themes, and the Material bridge.
- **Release history** — [docs/release-history.md](./docs/release-history.md): a curated, human-readable narrative of every release (the machine-generated [CHANGELOG.md](./CHANGELOG.md) is the exhaustive commit-level record).
- **Per-package guides** — install + quick start live in each package's README (linked in the table above).
- **Public-surface contract** — the [`etc/*.api.md`](./etc) reports are the CI-guarded snapshot of every package's public exports. They're the machine-readable *surface contract*, not a tutorial — a diff there is a deliberate API-change review signal (see [How the surface is guarded](#how-the-surface-is-guarded)).

## Versioning & stability

RhombusKit is **stable (`1.x`)**. As of `1.0.0` the semver contract below is in
force: breaking changes to the covered surface require a major bump, minor
releases add features backward-compatibly, and patches are fixes only. Review
[CHANGELOG.md](./CHANGELOG.md) (or the curated [release history](./docs/release-history.md))
and the GitHub release notes before upgrading.

### Semver contract

The four packages — `@rhombuskit/tokens`, `@rhombuskit/theme-engine`,
`@rhombuskit/material-preset`, and `@rhombuskit/core` — are released **in lockstep
on one synced version**.

**Covered by semver** (a breaking change requires a major bump):

- Named exports from each package's public barrel (`index.ts`) — component /
  directive / service classes, their public input & output names, and exported
  types.
- The design-token **CONTRACT names** (`--bg`, `--text-primary`, `--toast-*`, …).
- SCSS subpath exports (`@rhombuskit/core/scss`, `@rhombuskit/tokens/scss`, …).
- The theming contract: the `data-theme="rhombus-light|rhombus-dark"` attribute
  and the `rhombuskit:theme-preference` localStorage key.
- Component selectors (`rhombus-button`, `[rhombusTooltip]`, …).

**Not covered** (may change in any release):

- Generated CSS **values** — only the token *names* are part of the contract.
- Internal / BEM class names and any non-barrel (deep-import) symbols.
- The `@angular/material` internals the preset bridge maps to.

### Deprecation

A symbol marked `@deprecated` keeps working for **at least one minor release**
before removal, and is only removed at the **next major**.

### Supported Angular

RhombusKit supports Angular **`^21`** (peer dependency). Raising the minimum
Angular major is itself a breaking change.

### How the surface is guarded

The contract isn't only a promise — CI enforces it on every PR (the `build` job):

- **Token CONTRACT** — `tools/verify-tokens.mjs` diffs the live CONTRACT against
  the committed `packages/tokens/contract.snapshot.json`.
- **Public exports** — `tools/api-snapshot.mjs` diffs each package's built type
  surface against the committed `etc/*.api.md` reports.

An intentional change regenerates the snapshot (`--update-snapshot` / `--update`),
which surfaces the diff in review.

### Extending without breaking

Add your own tokens/themes via `ThemeRegistry` augmentation +
`provideRhombusTheme({ light, dark })` — the sanctioned extensibility path. It
does not change the CONTRACT.
