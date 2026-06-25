# Contributing to RhombusKit

Thanks for being here. RhombusKit is a small, high-rigor project, and the goal
of this guide is to make that rigor a **guided path rather than a hidden wall**:
if you can tell what's safe to change and how a PR will be judged before you
start, contributing is a lot more rewarding.

**You don't have to write code to contribute.** Filing a sharp bug, proposing a
component, reporting an accessibility gap, fixing a docs typo, or adding a
showcase example are all real, credited contributions.

## Ways to contribute

| You want to… | Do this |
|---|---|
| Suggest an improvement to an existing component/token | Open a **Feature request** issue |
| Propose a brand-new component | Open a **New component proposal** issue |
| Report something broken | Open a **Bug report** (with a reproduction) |
| Report an a11y / WCAG / screen-reader problem | Open an **Accessibility issue** |
| Ask a question or float a half-formed idea | Start a **Discussion** (and 👍 ideas you like) |
| Report a security vulnerability | **Privately** — see [SECURITY.md](./SECURITY.md) |

Voting (👍) on an existing issue or Discussion is itself a contribution — it's
how we decide what to build next, so it beats a duplicate.

## The two lanes: fast vs. gated

RhombusKit's public surface is guarded in CI by snapshot checks. That guard
**is** the line between the two contribution lanes — you can tell which lane
you're in by whether those checks stay green:

**🟢 Fast lane** — merged quickly, no design discussion required. Anything that
does **not** change an `etc/*.api.md` snapshot or the token CONTRACT:

- docs and showcase fixes, new examples, clearer a11y notes
- a new icon for the `provideRhombusIcons` registry
- added test coverage
- a bug fix that doesn't alter a public input/output, selector, or token name

**🔒 Gated lane** — please open a proposal first (the *New component proposal* or
*Feature request* form). Anything that changes the public contract:

- a new component, directive, or service
- a new public input/output, selector, or exported type
- a new design token (CONTRACT name)
- any breaking change

Why the split? Under our lockstep semver, an unreviewed change to the public API
or token CONTRACT is effectively irreversible, so those get discussed up front.
Everything else, we just want to merge.

Good first issues are labelled [`good first issue`](https://github.com/doug-williamson/RhombusKit/labels/good%20first%20issue)
and live entirely in the fast lane.

## Local setup

CI runs on **Node 22** with **pnpm** (via [Corepack](https://nodejs.org/api/corepack.html)).
Match that locally.

```sh
# pnpm is managed by Corepack — you do NOT need a global pnpm install.
corepack enable
corepack pnpm install --frozen-lockfile
```

> **Gotcha:** on some setups `pnpm` isn't on your PATH. Prefix commands with
> `corepack pnpm …` (e.g. `corepack pnpm exec nx …`) and they'll just work.

### Everyday commands

```sh
corepack pnpm run build     # build all packages (nx run-many --target=build --all)
corepack pnpm run test      # unit tests (jest)
corepack pnpm run lint      # eslint across the workspace
corepack pnpm exec nx serve showcase   # run the docs/showcase site locally
```

> Don't run `nx build core` while `nx serve showcase` is running — ng-packagr
> cleans `dist`, which wedges the showcase's global SCSS import. Stop the serve
> first.

## Scaffolding a new component

Once a **New component proposal** has been accepted, don't start from a blank
file — scaffold the house-style skeleton:

```sh
corepack pnpm run new:component <name>
# e.g.
corepack pnpm run new:component rating --title "Rating" --group "Status & layout"
corepack pnpm run new:component split-button --dry-run   # preview, write nothing
```

This writes a bespoke `OnPush` component (source + token-driven SCSS + a spec
with a jest-axe pass) under `packages/core/src/lib/<name>/`, a matching
`component-page` doc page under `apps/showcase/`, and idempotently wires the
public barrel, the route, and the sidebar/Cmd-K navigation. Re-running it is a
safe no-op on those shared files.

The generator deliberately stops at a green skeleton — it **doesn't bypass any
gate**. After filling in the real API, run the follow-ups it prints (build +
`api-snapshot.mjs --update`, `generate-llms.mjs`, add the component to
`contrast.spec.ts`). Those are the same gates documented next.

## The CI gates (and how to satisfy them)

Every PR must be green on these before merge. Most contributors never touch the
last three — they only fire when you change the public surface.

| Check | What it guards | If it fails because the change is intentional |
|---|---|---|
| `lint` | eslint | fix the lint errors |
| `test` | jest unit tests + ratcheting coverage | add/fix tests |
| `typecheck` | `@ts-expect-error` type-fixture specs (not type-checked by jest) | `corepack pnpm exec tsc --noEmit -p packages/core/tsconfig.spec.json` |
| `build` → token CONTRACT | `tools/verify-tokens.mjs` vs the committed snapshot | `node tools/verify-tokens.mjs --update-snapshot` |
| `build` → component styles | `tools/verify-component-styles.mjs` (no Sass `//` line-comment leaks in emitted CSS) | use `/* … */` block comments in component SCSS |
| `build` → public API | `tools/api-snapshot.mjs` vs `etc/*.api.md` | build first, then `node tools/api-snapshot.mjs --update` |
| `a11y` | Playwright color-contrast over the showcase, both themes | fix the token pair / contrast |

So if you intentionally change a public export or a token, the fix is to
**regenerate and commit the snapshot** — that diff is the signal reviewers
review:

```sh
corepack pnpm run build            # api-snapshot reads each package's dist
node tools/api-snapshot.mjs --update
node tools/verify-tokens.mjs --update-snapshot   # only if you changed tokens
```

> **Note on generated token files:** files under `packages/tokens/src/generated`
> are produced by `tools/generate-tokens.mjs` from the spec — don't hand-edit
> them, and watch for CRLF churn (a pre-commit hook blocks lone generated-file
> edits without a matching spec change).

## Commits & PRs

- **Conventional Commits** are enforced by commitlint (e.g.
  `feat(core): add accordion`, `fix(showcase): …`, `docs: …`). Keep body lines
  to ~100 characters.
- Keep PRs **small and single-focus** — a good PR states the problem and changes
  one thing.
- Fill in the PR template's surface-contract self-check.

## What to expect from us

A real person reads every issue and PR. You can expect a **first response within
about a week**, and if we decline something we'll say *why* — and point you at
the supported alternative where there is one (e.g. the `ThemeRegistry`
extensibility path for theming). "Not now" is often "yes, but unscheduled" — an
accepted proposal can sit on the roadmap for the community to upvote and help
build.

When a release ships a change you requested, you'll be **credited by name** in
the [release history](./docs/release-history.md). And every contributor —
including non-code help like accessibility audits, docs, and ideas — is
recognised in the [Contributors](./README.md#contributors) list via
[all-contributors](https://allcontributors.org).

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By
participating you agree to uphold it.
