# RhombusKit
Nx + pnpm monorepo for RhombusKit — a framework-agnostic design token system and Angular component library. Ships @rhombuskit/tokens, @rhombuskit/theme-engine, @rhombuskit/material-preset, and @rhombuskit/core.

## Versioning & stability

RhombusKit is currently **pre-1.0 (`0.x`)**: until `1.0.0`, minor releases may
include breaking changes (documented in [CHANGELOG.md](./CHANGELOG.md) and the
GitHub release notes). Pin to an exact `0.x.y` and review the changelog before
upgrading. From **`1.0.0`**, the policy below takes effect.

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
