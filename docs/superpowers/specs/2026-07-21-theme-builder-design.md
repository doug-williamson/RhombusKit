# Theme builder — design spec

**Date:** 2026-07-21
**Status:** **Ready for review** (derivation core hardened through two adversarial rounds; the spec itself through a third. Awaiting maintainer sign-off before implementation.)
**Type:** Additive. Ships a **new package** `@rhombuskit/theme-builder` in the next lockstep MINOR after PR1 merges (**v1.16.0 or later** — the in-flight density epic owns v1.15.0), plus a showcase-only page. **No change** to any existing package's public API, the 60-token CONTRACT, the primitives, or the default rendering.
**Scope:** new `@rhombuskit/theme-builder` package · `apps/showcase` `/theme-builder` page · 5 shared build/release wiring files (+ optional showcase edits). **Does not touch** `@rhombuskit/tokens`, `core`, `theme-engine`, or `material-preset` runtime source.
**Shape:** **PR1 is one published MINOR** (the package). **PR2 and PR3 are additive showcase-only follow-ups** (a `feat(showcase)` page and a roadmap move) — independently reviewable and revertible; they change no published-package source.
**Roadmap anchor:** `apps/showcase/src/app/pages/roadmap/roadmap-data.ts:142` (foundations.considering[0]): *"A visual generator that emits a token-override theme from a few seed colours, validated for AA contrast."*

---

## 1. Summary

A **seed → theme** generator. The user supplies one or two brand colours; the builder emits a complete, WCAG-AA-clean pair of light + dark themes covering all 60 CONTRACT tokens, in the exact form `docs/theming.md` sanctions (a `[data-theme]` block + a `RegisteredTheme` + a `ThemeRegistry` augmentation snippet). It ships as a pure-TypeScript package (no `@angular/*` peer) so it works from a CLI or build script, and the showcase `/theme-builder` page consumes it for **live preview** and copy/download export.

The headline promise — *"validated for AA contrast"* — is delivered by **AA-safety**: `generateTheme` builds each theme, then re-validates the exact 24 TEXT_PAIRS @ 4.5:1 + 4 BADGE_PAIRS @ 3:1 (per mode) with the repo's own WCAG math and **either returns an AA-clean `{light, dark}` or throws `ThemeAAError` — it never returns sub-AA output.** The fixed perceptual-lightness ladder (calibrated from the shipped packs) clears most pairs on its own, but a **bounded nudge is load-bearing**: it darkens `--text-accent` for green/lime/mint accents (which land ≈4.46–4.49 on `--bg` *pre-nudge*) and `--text-muted` for tinted neutrals. Because the ladder + nudge cover the accent axis, no accent seed makes `build()` throw; a pathological custom *neutral* is the only in-schema input that could exhaust the nudge and throw.

The AA check is a **gate that provably goes RED**: an internal `nudge:false` seam feeds a green seed straight through the real generator to a genuinely **sub-AA generated theme**, which `validateThemeAA` (and the e2e) reject; the same seed with the nudge on passes (positive control).

### 1.1 Global invariants (the hard constraints)

| Invariant | Where enforced |
|---|---|
| **CONTRACT stays frozen at 60** | The builder emits *values*, never new names. `packages/tokens/src/types.ts:16-119`; `tools/verify-tokens.mjs` unchanged. |
| **Default rendering is byte-identical** | `build()` (no seeds) and `build({accent:'#7c3aed'})` reproduce the shipped `rhombus-light`/`rhombus-dark` packs byte-for-byte via a **verbatim** VIOLET/SLATE path (no OKLCH round-trip); the nudge is a proven no-op on them (§9). |
| **AA-safe output** | `generateTheme` re-validates 24 TEXT_PAIRS @4.5 + 4 BADGE_PAIRS @3 per mode and **throws `ThemeAAError`** on any residual failure — it never *returns* sub-AA output. It is not a total function (a pathological neutral can throw); it is AA-safe. |
| **AA math has one implementation** | `parseColor`/`relativeLuminance`/`contrastRatio`/`alphaComposite` live once in `packages/theme-builder/src/color-math.ts`. (De-duplicating the showcase's `community-themes.spec.ts` copy is optional PR2 polish, not a hard constraint — see §12 D5.) |
| **No new `@angular/*` peer** | The package is pure TS. `tools/smoke-test-pack.mjs` peer rule (`:200`) is satisfied trivially. |
| **`@rhombuskit/tokens` untouched** | The generator reads the flat runtime maps `tokens.themes[...]` + `tokens.primitives['<family>-<step>']` and derives the CONTRACT key set from `Object.keys(basePack)` — it does not require `CONTRACT` to become a runtime export. |
| **Success stays green, error red** | Status/error/toast/`--code-string/-function/-number` families are **always pass-through** from the shipped packs; there are no `success`/`warning`/`error` seeds. (`--code-keyword` is the exception — it is accent-derived, so it *is* recoloured and AA-gated.) |

### 1.2 Revision history

The derivation core was produced by a multi-agent design panel (four independent designs → synthesis) and hardened through **two adversarial rounds**; the written spec was then hardened by a **third** (five lenses, every codebase claim verified against source). Rows marked ◆ change a *decision*, not just prose. Every finding was traced to real source or an independently-computed colour value.

**Round A — panel synthesis (v1) → four-lens critique.** Two blockers:

| # | Defect (v1) | Corrected decision (v2) |
|---|---|---|
| ◆ B1 | **The AA gate was a tautology.** buildRamp pins every rung to a fixed L-curve, so `accent[600]` is L≈0.5413 for every seed; the advertised "known-bad" seeds `#a7f3d0`/`#9aa0a6` did **not** throw. | The AA path was reframed and (Round C) re-anchored on a real sub-AA generated theme via a `nudge:false` seam. |
| ◆ B2 | **Canonical fidelity was false.** `accent` was required with no verbatim path, so `{accent:'#7c3aed'}` regenerated violet through OKLCH→hex and **drifted on 7/11 rungs**, breaking ≥5 shipped tokens. | ◆ **Frozen VIOLET verbatim ramp**; `accent` optional; canonical/omitted → VIOLET verbatim (no OKLCH). |
| ◆ M-b | **Seed schema not minimal.** `success/warning/error` seeds contradicted the semantic invariant and drove a sparse-ramp bug. | ◆ **Drop status seeds.** Schema = `accent` + `neutral`. |
| M-c/d/e/f | Sparse-ramp `undefined` nudge; global ink-flip; false "build-time only"; "import from a `.spec`". | Status never nudges; flip scoped to button; re-justified client-side math; extract to `color-math.ts`. |

**Round B — v2 → two-lens verification.** v2's fidelity-throw gate failed; two more blockers:

| # | Defect (v2) | Corrected decision (v3) |
|---|---|---|
| ◆ B3 | **The 1-D lightness fidelity throw over/under-rejected** (threw saturated yellow/gold/lime brands; passed near-grey). | ◆ **Delete the fidelity throw.** No seed is rejected for *fidelity*; low fidelity is a report *warning*. |
| ◆ B4 | **Byte-identity broke for 4 translucent tokens** (v2 emitted composited solids). | ◆ **Emit translucent tokens as literal `rgb(.. / a)`**; the validator composites over `--bg` only as a transient. |
| M-g/h | Composite base was `surface-0` not `--bg`; `--shadow-btn-primary` mislabeled non-colour. | Base = `--bg` per mode; `--shadow-btn-primary` is accent-derived. |

**Round C — spec review (five lenses, citations verified) → this revision.** One blocker + several majors:

| # | Defect (v3 spec) | Corrected decision (this revision) |
|---|---|---|
| ◆ C1 | **"AA guaranteed by construction / total function" was FALSE.** Against the real `--bg = slate[50] #f8fafc` (not white), a green accent `#16a34a` → `text-accent` = **4.491 < 4.5 pre-nudge** (`#22c55e`→4.486, `#008a29`→4.463); rescued only by the nudge (600→700 = 5.58). §4.4's "accent nudge inert" was wrong and a trap (invites scoping the nudge to neutrals → ships sub-AA). | ◆ Reframe as **AA-safe, not total**: the nudge is **load-bearing** for green/lime/mint accents and tinted neutrals. Only white-on-`accent[600]` (worst ≈4.67 over all hues) is by construction. |
| ◆ C2 | **The red-gate never exercised the real generator** (negative control was a hand-planted record). | ◆ Add an internal `nudge:false` seam: a green seed through it yields a real **sub-AA generated theme** → validator/e2e RED; nudge on → green. Closes D4. |
| ◆ C3 | **Version 1.15.0 was hardcoded** but density owns v1.15 (`roadmap-data.ts:118`, unreleased); "three MINOR releases" all at 1.15.0 was self-contradictory. | ◆ Don't hardcode. PR1 ships in the next minor (**v1.16+**); PR2/PR3 are showcase-only follow-ups; PR3's roadmap tag = the actual shipped version. |
| ◆ C4 | **`verbatimPath` was undefined** and a single boolean can't express mixed seeds. | ◆ **Remove it.** The nudge always runs; on verbatim/default families it is a no-op (shipped values pass at the `--bg` base), asserted by the byte-identity fixture. |
| ◆ C5 | **Coverage gate couldn't run** — a build+lint-only `project.json` (mcp shape) has no `@nx/jest:jest` target, so `run-many` skips it and `coverageThreshold` is inert. | ◆ `project.json` includes a `@nx/jest:jest` test target (tokens shape); PR1 exit-check proves the coverage gate goes red. |
| ◆ C6 | **The e2e "positive control" conflicted with the contrast harness** — `contrast.spec.ts:98` asserts `html[data-theme]` === the seeded preference before axe; a global `setTheme('tb-preview')` breaks it, and preview-on-interaction means axe scans the *shipped* theme. | ◆ Preview applies the generated theme to a **local `data-theme` subtree** (not global `html`); global stays the seeded theme (harness passes) and axe still scans the generated theme in the subtree. |
| ◆ C7 | **The button ink-flip was dead/self-defeating** — white clears `accent[600]` for all hues (worst ≈4.67), and if it didn't, hard-white `--text-on-accent` (checked vs the same fill) would throw. | ◆ **Drop the ink-flip.** `--btn-primary-text` = white; the validator is the safety net (deepen-bg, never lighten, is the theoretical fallback, not expected to fire). |
| M-i | `community-themes.spec.ts` importing the shared math was an unscoped app-test edit needing a jest mapper; D1 (accent required/optional) was pre-decided; misc citation/wording fixes. | Demoted to optional (§12 D5); D1 **closed as optional**; citations corrected (`src/spec/primitives.ts`; flat `tokens.primitives`; density-page `:34-37`). |

---

## 2. Ground rules — the recipe (verified against current source)

Per-PR, in order (mirrors the density/remaining-components recipe):

1. **Test/gate first (RED).** For gates added to **existing** files (the PR2 contrast route), prove RED against untouched `main` and for the right reason. For the **greenfield** package (PR1), the discipline is red-before-green *within the branch*: write the fixture → red → implement → green.
2. **Implement** the unit.
3. **Reuse, don't add.** No new CONTRACT token, no new primitive, no colour dependency. Escalate to §12.
4. **Barrel + api-snapshot.** Public exports via `packages/theme-builder/src/index.ts`; `etc/theme-builder.api.md` regenerated (LF).
5. **Showcase page + route + nav** (PR2), inside a `.showcase-page` wrapper, added to `contrast.spec.ts` ROUTES — **never** `a11y-coverage.ts`.
6. **Regen chain, fixed order:** `nx build` → `node tools/api-snapshot.mjs --update` → `node tools/generate-llms.mjs` (nav/theming) → `node tools/generate-mcp-data.mjs` → **restore LF** → `nx run-many test/lint` + `tsc` + smoke-test-pack.
7. **Commit** (commitlint body ≤ 100 chars; `feat:` for PR1, `feat(showcase)`/`chore` for PR2–3).
8. **Watch CI** to green.

---

## 3. Seed schema

```ts
export interface ThemeSeed {
  /** Brand accent hex. Omitted OR === #7c3aed → shipped VIOLET verbatim. */
  accent?: string;
  /** Neutral/surface base hex. Omitted OR === #64748b (slate-500) → shipped SLATE verbatim. */
  neutral?: string;
  /** Registry id + human label. Default name = OKLCH hue name of accent (e.g. "indigo"). */
  name?: string;
  label?: string;
  /** Chroma-envelope multiplier for generated ramps. Default 1.0, clamped [0.5, 1.5]. No AA effect. */
  vividness?: number;
}
```

- **"A few seed colours" = 1–2.** `accent` is the one degree of freedom a brand universally owns; `neutral` warms/cools the greys. `accent` is **optional in the type** (a bare `build()` = the shipped default, a useful identity that the byte-identity fixture depends on — §12 D1 is closed as *optional*). The UI still asks for an accent.
- **Dropped:** `success`/`warning`/`error` seeds. Status is always pass-through; custom status hues are a separately-validated future opt-in.
- **Not seedable:** fonts (`--font-*` var() aliases), shadows `--shadow-sm/md/lg/xl` (black), `--ink-surface`/`--ink-on-surface` (invariant `#0f172a`/`#f8fafc`), `#ffffff` for `--text-on-accent`/`--btn-primary-text`/`--tooltip-text`.

---

## 4. The derivation algorithm

Colour space: **OKLCH, hand-rolled** (Björn Ottosson matrices), ~150 tree-shakeable LOC, zero dependency. Runs client-side in the live page (the showcase is SSG — no server), which is exactly why a colour library is the *heavier* option.

### 4.1 Frozen constants (computed from source, unit-test-pinned)

- `RUNGS = [50,100,200,300,400,500,600,700,800,900,950]`.
- `VIOLET` / `SLATE` — the 11 shipped hexes each, transcribed from `packages/tokens/src/spec/primitives.ts:19-31` / `:5-17`, sourced at runtime from the **flat** `tokens.primitives['violet-600']` etc. (`packages/tokens/src/generated/tokens.ts`).
- `L_ACCENT_CURVE = RUNGS.map(r => oklchL(VIOLET[r]))`, `CHROMA_ENV = RUNGS.map(r => oklchC(VIOLET[r]))`; a **separate** `L_NEUTRAL_CURVE`/`C_NEUTRAL_CAP` from SLATE (neutral is lighter at the dark end than accent).
- `GREEN`/`AMBER`/`RED` — sparse shipped ramps (`50,100,500,600,700`). `DARK_BESPOKE` — the four frozen deep-tint hexes (`#002a0f`,`#2a1f00`,`#2a0a0a`,`#1a0a3a`).
- `LIGHT_MAP`/`DARK_MAP` — token→recipe, transcribed 1:1 from `rhombus-light.ts`/`rhombus-dark.ts`. Recipes: `{fam,step}` · `{literal}` · `{alias}` · `{shadow}` · `{inkConst}` · `{alpha:{fam,step,a}}` (emits the literal `rgb(r g b / a)` string) · `{bespokeDark}`.
- `INK={surface:'#0f172a',on:'#f8fafc'}`, `WHITE='#ffffff'`, `BG={light:'#f8fafc',dark:'#020617'}`.

> The numeric `L_ACCENT_CURVE`/`CHROMA_ENV`/gamut caps are **computed in PR1** from the frozen hexes with the shipped math and asserted — never hand-typed. The AA figures used below (white-on-`accent[600]` worst ≈ 4.67; `text-accent` on `--bg` ≈ 4.46 for green *pre-*nudge, 5.58 *post*-nudge; `slate[500]`-on-`slate[50]` = 4.548; a warm-tinted neutral drops `--text-muted` to ≈4.37 pre-nudge) are the Round-C reviewer's independently-computed values and are **re-asserted as PR1 gates** (§9), not taken on trust.

### 4.2 Ramp resolution (per family)

```
resolveRamp(css, VERBATIM, canonHex, seed):
  if css === undefined || normalizeHex(css) === canonHex:  return VERBATIM     // byte-identity, no OKLCH
  (L,C,H) = toOKLCH(css)
  anchor  = argmin_i |L_CURVE[i] - L|
  for i in 0..10:
    Li = L_CURVE[i]                                                            // fixed lightness ladder
    Ci = min(CHROMA_ENV[i] * (C / CHROMA_ENV[anchor]) * (seed.vividness ?? 1), GAMUT_CAP[i])
    ramp[RUNGS[i]] = (i === anchor && |Li - L| < 0.02) ? normalizeHex(css)     // pin the exact brand hex
                                                       : gamutClampToSrgb(fromOKLCH(Li, Ci, H))
  return ramp
```

The seed contributes **hue + relative chroma**; lightness comes from the ladder. This gets *most* pairs clear but is **not** sufficient alone for the accent (green hues land `text-accent` at ≈4.46 on `--bg`) — the nudge (§4.4) completes the guarantee.

### 4.3 Assembly (per mode)

```
assemble(mode, A, N, seed):
  MAP = mode==='light' ? LIGHT_MAP : DARK_MAP
  for [tok, recipe] in MAP:  rec[tok] = resolve(recipe, {A, N, mode})
  // {alpha}→ the LITERAL 'rgb(r g b / a)' string (NOT baked to a solid).
  // Dark accent-backed backgrounds: --status-scheduled-bg is a SOLID deep-tint (#1a0a3a verbatim |
  //   deepTint(hue) custom); --nav-active-bg stays its alpha string (nav-active-text = neutral slate[50])
  //   and is composited only transiently by the validator.
  assert setEq(keys(rec), CONTRACT_KEYS)                                       // MAP===CONTRACT, both modes
  rec['--btn-primary-text'] = WHITE                                            // clears accent[600] for all hues (≈4.67); validator guards
  rec['--shadow-btn-primary'] = mode==='light' ? `0 1px 2px 0 rgb(<A[600] rgb> / 0.25)` : '0 1px 2px 0 rgb(0 0 0 / 0.4)'
  return rec
```

`--shadow-btn-primary` is **accent-derived** (recoloured from the final fill in light, black in dark).

### 4.4 The bounded nudge (load-bearing)

For any failing AA-critical token, `stepToward` moves one rung **darker (light) / lighter (dark)** over that family's own materialized rung set, **clamping** at the ends (never wrapping), up to `FIDELITY_BUDGET = 2`. A clamp with budget remaining ⇒ "ramp exhausted" ⇒ `throw`. Status families never nudge (pass-through).

The nudge is **not cosmetic** — it is required to reach AA:
- **Accent:** `--text-accent`/`--code-keyword` for green/lime/mint hues land ≈4.46–4.49 on `--bg`/`--surface-0`; the nudge steps 600→700 (≈5.58). **Implementers must NOT scope the nudge to the neutral family** — doing so ships `text-accent` sub-AA.
- **Neutral:** a warm-tinted `neutral` seed drops `--text-muted` (`N[500]`) to ≈4.37 on `--bg`; the nudge steps 500→600 (which collapses it onto `--text-secondary`, both `N[600]` — surfaced as a report warning, §7).

On the **verbatim/default** path the shipped values already clear at the `--bg` base, so the nudge moves nothing (proven by the byte-identity fixture, §9) — no `verbatimPath` flag is needed.

### 4.5 `build()`

```
build(seed = {}, opts = { nudge: true }):
  A = resolveRamp(seed.accent,  VIOLET, '#7c3aed', seed)
  N = resolveRamp(seed.neutral, SLATE,  '#64748b', seed)
  for mode in ['light','dark']:
    rec = assemble(mode, A, N, seed)
    if opts.nudge: nudgeFailing(rec, mode, A, N, BUDGET=2)                     // §4.4
    for p in PAIRS(mode): if ratio(solidFor(p.fg, mode), solidFor(p.bg, mode)) < p.min:
        throw ThemeAAError(p, mode)                                            // AA-safe: never returns sub-AA
  return { light, dark, report }                                              // report: fidelity/muted-collapse warnings, moved tokens
```

`solidFor(v, mode)` = `alphaComposite(v, BG[mode])` if `v` is translucent, else `v` — a **transient** for measurement; the record keeps the source (possibly translucent) value.

- `build()` and `build({accent:'#7c3aed'})` → shipped packs, byte-identical (nudge no-ops).
- `build({accent:'#16a34a'})` → an AA-clean green theme (`text-accent` nudged 600→700).
- `build({accent:'#16a34a'}, {nudge:false})` → **`ThemeAAError`** (`text-accent` 4.49 < 4.5): the red-gate seam (§5).
- `build({accent:'#a7f3d0'})` (pastel mint) → an AA-clean theme + a **fidelity warning** (accent darkened; low chroma). It does **not** throw (Round B B3).

---

## 5. The AA contract (the headline promise, made gated)

**Pairs (per mode):** the exact 24 `TEXT_PAIRS` @ 4.5:1 + 4 `BADGE_PAIRS` @ 3:1 from `community-themes.spec.ts:19-53`. `WHITE` is checked only vs `--btn-primary-bg`; `--text-accent` on `--bg` **and** `--surface-0`; `--code-keyword` on `--surface-0` only. Translucent values are alpha-composited over `--bg` (per mode) before measuring.

**AA-safety.** `generateTheme` re-validates all pairs and throws on any residual failure, so it **never returns sub-AA output**. The fixed-L ladder clears white-on-`accent[600]` for every hue (worst ≈4.67) *by construction*; `--text-accent`/`--code-keyword` and tinted `--text-muted` are cleared by the **load-bearing nudge** (§4.4). No accent seed throws; only a pathological custom neutral could exhaust the nudge and throw.

**Red-capable gate** (satisfies the brief's "an e2e that FAILS on a sub-AA generated theme, with a positive control"):

- **Negative control — a real sub-AA *generated* theme (RED):** `build({accent:'#16a34a'}, {nudge:false})` runs the real pipeline and produces `--text-accent` = 4.49 on `--bg`; `validateThemeAA` reports the failure and `build()` throws. This exercises the generator's own failure surface, not a synthetic record.
- **Positive control (same seed, nudge on):** `build({accent:'#16a34a'})` clears all pairs.
- **Corpus (unit):** ~20 diverse real brand seeds → every light+dark passes `validateThemeAA` both modes. A regression that broke the ladder or nudge turns this RED.
- **e2e (PR2):** the `/theme-builder` page renders its default generated theme in a **local `data-theme` subtree**; `/theme-builder` is in `contrast.spec.ts` ROUTES, so axe scans the generated theme in both global themes while `html[data-theme]` stays the seeded preference (harness `:98` passes). A generated sub-AA theme would show as axe violations.

`validateThemeAA` and the WCAG math are `color-math.ts` exports (§6); the generator and the live preview import the one implementation.

---

## 6. Package architecture — `@rhombuskit/theme-builder`

A 6th lockstep package, pure-TS/`tsup` like `@rhombuskit/tokens` (using `@rhombuskit/mcp`'s `files:["dist"]` shape). `package.json` is **born at `1.14.0`**; release-please's `extra-files` bump overwrites it to whatever the next release computes (v1.16+).

### 6.1 Public surface (`src/index.ts`)

```ts
export { build as generateTheme } from './generate';          // (ThemeSeed, opts?) → { light, dark, report }
export { validateThemeAA } from './validate';                 // Record<60> → { ok, failures }
export { serializeThemeCss, toRegisteredThemes, toAugmentation } from './serialize';
export {
  parseColor, relativeLuminance, contrastRatio, alphaComposite,
  toOKLCH, fromOKLCH, gamutClampToSrgb,
} from './color-math';
export type { ThemeSeed, GeneratedTheme, ThemeAAResult } from './types';
export { ThemeAAError } from './errors';
```

Depends on `@rhombuskit/tokens` (`workspace:*`) for `tokens.themes[...]` (verbatim ramps + status/code pass-through) and `tokens.primitives`. CONTRACT keys via `Object.keys(tokens.themes['rhombus-light'])`. No `@angular/*` peer, no colour dependency.

### 6.2 Files to CREATE (under `packages/theme-builder/`)

`package.json` (name, `version 1.14.0`, `type module`, `exports`/`main`/`types` → `dist/index.mjs`/`.d.mts`, `files:["dist"]`, `funding` string, `publishConfig.access public`, `scripts.build: tsup`), **`project.json` with build (→ `pnpm run build`), lint, AND a `@nx/jest:jest` `test` target modeled on `packages/tokens/project.json:24-31`** (required so CI coverage runs — the mcp build+lint-only shape would silently skip it), `tsup.config.ts`, `tsconfig.json`/`.lib.json`/`.spec.json`, `jest.config.ts` (with `coverageThreshold` ≥ 90 branches), `README.md`, and `src/` (`index.ts`, `generate.ts`, `validate.ts`, `serialize.ts`, `color-math.ts`, `maps.ts`, `constants.ts`, `types.ts`, `errors.ts` + co-located `.spec.ts`).

### 6.3 Files to EDIT (5 shared wiring files — build/release infra only)

| File | Edit |
|---|---|
| `tools/api-snapshot.mjs:27` | +1 `PACKAGES` entry → `entry: packages/theme-builder/dist/index.d.mts`, `report: etc/theme-builder.api.md`. Generate with `--update`; **commit LF**. |
| `release-please-config.json:16` | +1 `extra-files` jsonpath bump for `packages/theme-builder/package.json`. Manifest untouched (single root package). |
| `.github/workflows/publish.yml:67` | +1 publish step. Prepare-job's "already published?" keys on core — no change. |
| `tools/smoke-test-pack.mjs:69` | +1 `PACKAGES` entry asserting `typeof m.generateTheme === 'function'`. |
| `tsconfig.base.json:21` | +1 path `@rhombuskit/theme-builder` → `packages/theme-builder/src/index.ts`. |

**No edit:** `.release-please-manifest.json`, `pnpm-workspace.yaml`, `nx.json`, `tools/smoke-test-stackblitz.mjs`. Root `README.md` package table updated for accuracy (not a gate).

---

## 7. The showcase `/theme-builder` page (PR2)

A default-exported standalone `OnPush` component (clone `density-page.component.ts`), inside a `.showcase-page` wrapper, importing the package.

- **Inputs:** an accent picker (required-in-UI) + optional neutral picker + a vividness slider → `generateTheme(seed)` (debounced).
- **Live preview via a local `data-theme` subtree.** Serialize `{light,dark}` to `[data-theme="tb-preview"]`/`[data-theme="tb-preview-dark"]` CSS injected once (id-guarded `<style>` in `document.head`); render two preview panels (`<div data-theme="tb-preview">`, `<div data-theme="tb-preview-dark">`) so the cascade themes each subtree **without touching global `html`** — this keeps `RhombusThemeService` (the sole writer of the global attribute) unbothered and lets `contrast.spec.ts` scan the generated theme (§5, §C6). An optional **"Apply to whole app"** action uses `service.registerThemes(...)` + `service.setTheme('tb-preview')` for a full-app try-on (session-only).
- **Report surface:** AA status + fidelity warnings (accent darkened / low chroma / `--text-muted` collapsed toward secondary).
- **Export (§8).**

**Gates:** add `'/theme-builder'` to `contrast.spec.ts` ROUTES. **Never** add `theme-builder` to `a11y-coverage.ts` (its `CONTRAST_VERIFIED` list is validated against `/components/*` routes only — `accessibility-page.component.spec.ts:29-37`; a non-component slug fails it). Nav entry in `NAV_GROUPS` "Get started"; title auto-formats via `RhombusTitleStrategy`. Regen `llms`/`mcp` + a `docs/theming.md` builder section.

---

## 8. Output formats (all three, from one `generate` call)

1. **Copy-paste CSS + registration snippet (primary):** `serializeThemeCss()` → two `[data-theme]{ … }` blocks over all 60 names; `toRegisteredThemes()` → the `provideRhombusThemes(...)` call; `toAugmentation()` → the `declare module '@rhombuskit/theme-engine' { … }` snippet. Exactly `docs/theming.md`'s two-step path.
2. **Downloadable file** (CSS and/or the `.ts` module).
3. **TS theme-pack module** — the `{light,dark}` `Record<SemanticTokenName,string>` objects.

---

## 9. Testing & verification plan

- **RED gate (PR1):** `build({accent:'#16a34a'}, {nudge:false})` throws `ThemeAAError` (real sub-AA generated theme); `validateThemeAA` on a planted `#999`/`#aaa` record returns failures. Both proven RED before the generator is complete.
- **AA-critical post-nudge (PR1):** `build({accent:'#16a34a'})` → `--text-accent` ≥ 4.5 on `--bg` and `--surface-0` (guards against scoping the nudge to neutrals only). `min(white-on-accent[600])` over the corpus ≥ 4.5.
- **Byte-identity fixture:** `build()` and `build({accent:'#7c3aed'})` deep-equal `tokens.themes['rhombus-light'/'-dark']` on all 60 tokens — including `--focus-ring`/`--border-accent`/`--nav-active-bg` as literal `rgb(.. / a)`, dark `--nav-active-text === slate[50]`, dark `--code-keyword === #c4b5fd` — **and zero tokens moved by the nudge** on the default.
- **AA corpus (positive control):** ~20 diverse seeds pass `validateThemeAA` both modes.
- **Colour-math goldens:** `toOKLCH('#7c3aed')`; `hex→OKLCH→hex` round-trip; the Ottosson matrices pinned (guards a transposed-constant hue shift AA wouldn't catch).
- **Coverage gate check (PR1):** `nx test theme-builder --configuration=ci` reports coverage; deleting a branch test turns it red (proves §6.4's threshold gates).
- **api-snapshot:** `etc/theme-builder.api.md` generated + committed (LF), gated in CI.
- **e2e (PR2):** `/theme-builder` in `contrast.spec.ts` ROUTES → axe zero-violations, both themes, scanning the local generated-theme subtrees.

---

## 10. Non-goals (explicitly out, with reasons)

- **Custom `success`/`warning`/`error`/`info` hues.** Semantic invariant; recolouring `--code-*`; sparse-ramp complexity. Future opt-in.
- **Rejecting seeds for fidelity.** Low-fidelity accents **warn**, never throw (Round B B3). Only a pathological neutral that exhausts the nudge budget throws (`ThemeAAError`, AA-safety — §4.4/§4.5).
- **New CONTRACT tokens / primitives / default-pack changes.** Forbidden.
- **Font / spacing / density / motion generation.** Colour-only.
- **Persisting generated themes across reload / a no-flash init path.** Preview is session-only; persistence follows `docs/theming.md`.
- **A Figma/DTCG export of generated themes.**

---

## 11. The three PRs

### PR1 — `@rhombuskit/theme-builder` package (core + AA), no UI · **a published MINOR (v1.16+)**
**Scope:** the package (§6) with the `@nx/jest:jest` test target, colour math, generator (incl. the `nudge` seam), `validateThemeAA`, serializers, frozen constants/maps; the 5 shared wiring edits; `etc/theme-builder.api.md`.
**Exit criteria:** (1) the RED gate (`nudge:false` green seed throws; planted record fails) proven red then correctly green; (2) AA-critical post-nudge + byte-identity + corpus green; (3) `nx build/test/lint theme-builder` green, coverage gate proven red-capable (≥ 90 branches); (4) `smoke-test-pack` imports it; (5) api-snapshot committed (LF); (6) release-please/publish wiring present (first-publish bootstrap — §13 R1).
**Explicitly NOT in PR1:** any showcase page, e2e route, nav/docs change.

### PR2 — showcase `/theme-builder` page + AA e2e gate · showcase-only follow-up
**Scope:** the page (§7) with the local-subtree preview, export UI (§8), `/theme-builder` → `contrast.spec.ts` ROUTES, nav entry, `docs/theming.md` section, `llms`/`mcp` regen. Optional: de-dupe `community-themes.spec.ts` onto the shared math (needs a showcase jest `moduleNameMapper` — §12 D5).
**Exit criteria:** (1) page renders under `.showcase-page`; (2) contrast e2e green in both themes, scanning the generated subtrees; (3) `theme-builder` absent from `a11y-coverage.ts` (its spec green); (4) regen clean, LF restored; (5) `html[data-theme]` unaffected by preview (harness `:98` passes).
**Explicitly NOT in PR2:** roadmap data changes.

### PR3 — roadmap promotion + polish · showcase-only follow-up
**Scope:** move "Theme builder" from `foundations.considering` → `foundations.now` with `tag: '<the minor PR1 shipped in>'` (not a hardcoded v1.15); update the `roadmap__shipped` prose + the foundations `now` blurb; keep `foundations.next` non-empty (`roadmap-page.component.spec.ts:40`).
**Exit criteria:** roadmap tests green; `foundations.next` non-empty; tag matches the actual release.

---

## 12. Open decisions register

**Resolved by the maintainer (2026-07-21):**

| # | Decision | Ruling |
|---|---|---|
| D2 | Low-fidelity seeds: warn or `strict` reject? | **Warn only** (never reject a brand). SETTLED. |
| D3 | `FIDELITY_BUDGET` value. | **2** (confirm against the PR1 corpus; green needs 1 step, keep headroom). SETTLED. |
| D5 | De-dupe `community-themes.spec.ts` onto the shared math? | **Optional** PR2 cleanup (not required for correctness). SETTLED. |

**Closed by this spec:**
- Scope/semver — **standalone `@rhombuskit/theme-builder` package** (maintainer chose 2026-07-21); ships **v1.16+** (density owns v1.15). SETTLED (C3).
- Output — **all three**, led by copy-paste CSS. SETTLED.
- Seed schema — **`accent` + `neutral`**; status dropped (B3/M-b); **`accent` optional** (forced by the byte-identity invariant — old D1). SETTLED.
- Ramp fidelity — **frozen VIOLET/SLATE verbatim + canonical short-circuit** (B2). SETTLED.
- Translucent tokens — **literal `rgb(.. / a)`**, composited transiently (B4). SETTLED.
- AA framing — **AA-safe (nudge load-bearing), not total** (C1); red-gate via the `nudge:false` seam (C2, old D4). SETTLED.
- Button — **white always; ink-flip dropped** (C7). SETTLED.

---

## 13. Risk register

| # | Risk | Where | Mitigation |
|---|---|---|---|
| R1 | **New npm name can't be published by the scoped token.** | `publish.yml`; npm | **Maintainer action:** one-time manual `npm publish` to claim `@rhombuskit/theme-builder` (or a create-scoped token) before the first release-please publish. Flag in the PR1 description. |
| R2 | `etc/theme-builder.api.md` committed with CRLF → CI byte-compare fails on Linux. | `api-snapshot.mjs` | Restore LF before commit (recipe step 6). |
| R3 | A wrong frozen constant silently ships a shifted theme that still passes AA. | `constants.ts`/`maps.ts` | Colour-math goldens + byte-identity fixture; every constant computed from shipped hexes. |
| R4 | The nudge is scoped to one family and silently ships `text-accent` (green) or `text-muted` (tinted neutral) sub-AA. | `generate.ts` §4.4 | The `#16a34a` post-nudge assertion + the tinted-neutral corpus case (§9) fail if the nudge is mis-scoped. |
| R5 | Live preview writes global `data-theme` and fights `RhombusThemeService`, or breaks `contrast.spec.ts:98`. | PR2 page | Preview via a **local `data-theme` subtree**; the global attribute stays the service's (C6). "Apply to whole app" goes through `service.setTheme` only. |
| R6 | `tokens.themes[...]`/`primitives` are `as const` with no index signature → TS7053 on string indexing. | `generate.ts` | Cast via `as keyof typeof …` (pattern at `density-page.component.ts:34-37`). |
| R7 | Version drift: PR3's roadmap tag hardcodes a minor that density already owns. | PR3 | Tag = the minor PR1 actually shipped in (v1.16+); this epic sequences **after** density's v1.15. |

---

## 14. Sequencing & release summary

| PR | Contents | Release | The gate that decides it |
|---|---|---|---|
| PR1 | `@rhombuskit/theme-builder` package + wiring | published MINOR (v1.16+) | RED seam→green; AA-critical post-nudge; byte-identity; corpus; coverage; api-snapshot; smoke-test |
| PR2 | `/theme-builder` page + export | showcase-only | contrast e2e green (both themes, generated subtrees); a11y-coverage spec green; regen clean |
| PR3 | Roadmap promotion + polish | showcase-only | roadmap tests green; `foundations.next` non-empty; tag matches release |

**Global invariants restated:** the 60-token CONTRACT is untouched; the default packs render byte-identical (nudge no-ops on them); every emitted theme is AA-clean or `build()` throws (AA-safe, nudge load-bearing); the AA gate is proven red-capable through the real generator; no new `@angular/*` peer; `@rhombuskit/tokens`/`core`/`theme-engine`/`material-preset` runtime source is not modified; `/theme-builder` is gated by `contrast.spec` ROUTES and never by `a11y-coverage`; the package ships in the next lockstep minor **after** density's v1.15.
