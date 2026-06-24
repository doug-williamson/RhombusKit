<!--
  Thanks for contributing to RhombusKit! Keep PRs small and single-focus.
  See CONTRIBUTING.md for the fast-lane vs. gated split and local setup.
-->

## What & why

<!-- What does this change, and what problem does it solve? Link the issue. -->

Closes #

## Type of change

- [ ] Fast lane — docs/showcase, a11y note, a new icon, tests, a bug fix that does **not** change a public export or token
- [ ] Gated — new component, new public input/output, new token, or any breaking change (should reference an accepted proposal)

## Surface-contract self-check

- [ ] This change does **not** alter any `etc/*.api.md` snapshot or the token CONTRACT
- [ ] …or, if it does: I ran the regeneration and committed the updated snapshot
  - Public API: `pnpm exec nx run-many --target=build --all` then `node tools/api-snapshot.mjs --update`
  - Token CONTRACT: `node tools/verify-tokens.mjs --update-snapshot`

## Checklist

- [ ] `pnpm exec nx run-many --target=lint --all` passes
- [ ] `pnpm exec nx run-many --target=test --all` passes
- [ ] `pnpm exec nx run-many --target=build --all` passes (`verify-tokens` / `verify-component-styles` / `api-snapshot` green)
- [ ] Touched a type-fixture spec? `pnpm exec tsc --noEmit -p packages/core/tsconfig.spec.json` passes
- [ ] Accessibility considered (keyboard, ARIA, contrast) where relevant
- [ ] Commits follow [Conventional Commits](https://www.conventionalcommits.org/)

<!--
  Maintainer note: if this PR ships a community-requested change, add a trailer
  so the requester is credited in the release history:
      Requested-by: @handle (#123)
-->
