# RhombusKit
Nx + pnpm monorepo for RhombusKit — a framework-agnostic design token system and Angular component library. Ships @rhombuskit/tokens, @rhombuskit/theme-engine, @rhombuskit/material-preset, @rhombuskit/core, and the @rhombuskit/mcp docs server for AI assistants.

## Packages

| Package | What it is |
|---|---|
| [@rhombuskit/core](./packages/core) | Standalone, signal-based Angular 21 component library (WCAG 2.1 AA) |
| [@rhombuskit/tokens](./packages/tokens) | Framework-agnostic design-token contract (CSS / SCSS / TS) |
| [@rhombuskit/theme-engine](./packages/theme-engine) | Light / dark / system theming runtime for Angular |
| [@rhombuskit/material-preset](./packages/material-preset) | Bridges Angular Material's M3 tokens onto the contract |
| [@rhombuskit/mcp](./packages/mcp) | MCP server exposing the API surface + token CONTRACT to AI assistants (`npx -y @rhombuskit/mcp`) |

## Documentation

- **Component reference** — the live showcase at **[rhombuskit.online](https://rhombuskit.online)**: a page per component with variants, states, and accessibility notes.
- **For AI assistants** — [`/llms.txt`](https://rhombuskit.online/llms.txt) (curated index) and [`/llms-full.txt`](https://rhombuskit.online/llms-full.txt) (full API surface + design-token contract), generated from the CI-guarded snapshots so they never drift. For **interactive** access from Claude Code, Cursor, and other MCP clients, run the docs server — `npx -y @rhombuskit/mcp` (see [@rhombuskit/mcp](./packages/mcp)).
- **Theming guide** — [docs/theming.md](./docs/theming.md): setup, runtime switching, custom themes, and the Material bridge.
- **Release history** — [docs/release-history.md](./docs/release-history.md): a curated, human-readable narrative of every release (the machine-generated [CHANGELOG.md](./CHANGELOG.md) is the exhaustive commit-level record).
- **Per-package guides** — install + quick start live in each package's README (linked in the table above).
- **Public-surface contract** — the [`etc/*.api.md`](./etc) reports are the CI-guarded snapshot of every package's public exports. They're the machine-readable *surface contract*, not a tutorial — a diff there is a deliberate API-change review signal (see [How the surface is guarded](#how-the-surface-is-guarded)).

## Contributing

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)

RhombusKit welcomes suggestions and contributions — and you don't have to write
code to help. Suggesting a feature, proposing a component, reporting an
accessibility gap, improving docs, or just 👍-ing an idea are all credited
contributions.

- **Suggest or report something** — open an [issue](https://github.com/doug-williamson/RhombusKit/issues/new/choose)
  (feature request, new-component proposal, bug, or accessibility report).
- **Ask or discuss** — start a [Discussion](https://github.com/doug-williamson/RhombusKit/discussions).
- **Contribute code** — see [CONTRIBUTING.md](./CONTRIBUTING.md) for the
  fast-lane vs. gated split, local setup, and how the CI surface gates work.

By participating you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md). For
security issues, please follow the [Security Policy](./SECURITY.md).

## Support

RhombusKit is a solo, AI-assisted project, and sponsorship is a longevity
signal — not a paywall. Every component and fix stays free and MIT-licensed.
Sponsorship covers the running costs (CI minutes for the WCAG 2.1 AA checks, the
[rhombuskit.online](https://rhombuskit.online) docs hosting, and the AI tooling
behind the release cadence).

- **Sponsor** — [github.com/sponsors/doug-williamson](https://github.com/sponsors/doug-williamson) (monthly or one-time), or see [Support](https://rhombuskit.online/support).
- **Free ways to help** — star the repo, [propose or upvote a component](https://rhombuskit.online/roadmap), or report an accessibility gap. All credited.

### Sponsors

Thank you to everyone funding independent, accessible open source. Sponsors are
credited here and on the [Support page](https://rhombuskit.online/support).

<!-- sponsors --><!-- sponsors -->

<sub>No sponsors yet — [be the first](https://github.com/sponsors/doug-williamson). The list between the markers above is regenerated from GitHub Sponsors.</sub>

## Contributors

Every contribution counts — code, docs, design, accessibility audits, and ideas
alike. This project follows the [all-contributors](https://allcontributors.org)
specification; we credit non-code help too.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/doug-williamson"><img src="https://github.com/doug-williamson.png" width="80px;" alt="Doug Williamson"/><br /><sub><b>Doug Williamson</b></sub></a><br /><a href="#code-doug-williamson" title="Code">💻</a> <a href="#doc-doug-williamson" title="Documentation">📖</a> <a href="#design-doug-williamson" title="Design">🎨</a> <a href="#maintenance-doug-williamson" title="Maintenance">🚧</a> <a href="#a11y-doug-williamson" title="Accessibility">️️️️♿️</a></td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Maintainers credit a contribution by commenting
`@all-contributors please add @user for a11y,doc,ideas` on any issue or PR.

## Versioning & stability

RhombusKit is **stable (`1.x`)**. As of `1.0.0` the semver contract below is in
force: breaking changes to the covered surface require a major bump, minor
releases add features backward-compatibly, and patches are fixes only. Review
[CHANGELOG.md](./CHANGELOG.md) (or the curated [release history](./docs/release-history.md))
and the GitHub release notes before upgrading.

### Semver contract

The five packages — `@rhombuskit/tokens`, `@rhombuskit/theme-engine`,
`@rhombuskit/material-preset`, `@rhombuskit/core`, and `@rhombuskit/mcp` — are
released **in lockstep on one synced version**.

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
