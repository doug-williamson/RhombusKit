# RhombusKit — Density Modes: Design & Implementation Plan

**Date:** 2026-07-20 — **revision v3.2** (v1 → v2 → v3 → v3.1 → v3.2)
**Status:** **Ready for implementation.** Architecture ratified with the maintainer and independently re-verified across three adversarial review rounds. v2's substitution inventory and non-breaking arithmetic survived unchanged; v2's three blocking defects (an inert provider, an impossible gate test, a default-density paginator regression) and v3's residual defects (a bridge-edit contradiction that would have broken PR 2, and five non-existent Material custom-property names that silently blinded the geometry gate) are all corrected. Full revision history in §1.2 — **read it before implementing**, since several corrections reverse a claim an earlier draft stated confidently. Residual questions are in the Open Decisions register (§13). **D6 and D7 — the two that gated PR 2 — were settled on 2026-07-20** (comfortable filled padding is **28/12**, and the content floor is stated per size), together with **D10**, a defect found while settling them: the line-height every form-field calculation depends on was holding by accident, and is now pinned. Nothing remaining in §13 blocks PR 1 or PR 2.
**Scope:** The Foundations-track "Density modes" item — the sole entry in `foundations.next` (`apps/showcase/src/app/pages/roadmap/roadmap-data.ts:124-130`), described there as *"the highest-leverage gap enterprise Material migrators hit right after parity."*
**Shape:** **Three MINOR releases**, not one train (§12). PR 1 is foundation-only and carries the non-breaking proof that gates PRs 2 and 3.

---

## 1. Summary

**Density modes** give an application a single app-wide choice of control geometry — `compact` | `default` | `comfortable` — set once at bootstrap with `provideRhombusDensity()`. Density owns the **box** (heights, padding, gaps). It never touches the **type**.

**The public surface is deliberately tiny.** `provideRhombusDensity()` is essentially all of it, plus **five** frozen geometry primitives that exist so `/density` has a documented scale and Figma/MCP have something to export. Everything else — per-component paddings, per-line-count list heights, form-field vertical padding, Material token rebinding — is **internal plumbing**: unfrozen, invisible to consumers, changeable at will.

### 1.1 Headline invariants

| Invariant | Detail |
|---|---|
| **Default renders byte-identical to `main`. Zero exceptions.** | An app that does not call `provideRhombusDensity` must render pixel-for-pixel as it does today. This is a **hard invariant**, not a goal. A component that cannot meet it leaves scope. PR 1 lands the mechanised proof (§9.2) and it gates everything after. |
| **FIVE frozen public primitives** | `--control-height-sm` · `--control-height-md` · `--control-height-lg` · `--field-height` · `--row-height`. 17 published primitives → **22**. Append-only forever (`tools/verify-tokens.mjs:15-21`). **No** `--control-pad-x`, `--control-pad-y` or `--stack-gap` — see §4.2. |
| **Internal plumbing is unfrozen** | Per-level Material token values live in a new hand-authored `packages/material-preset/src/styles/_density.scss`; per-component ramps live in each component's own SCSS. Nothing there enters `primitives.css`, `primitives.snapshot.json`, `design-tokens.json` or MCP. |
| **CONTRACT stays frozen at 60** | Density is theme-invariant, so it lands in primitives, not the semantic CONTRACT (`packages/tokens/src/types.ts:16-119`). Motion is the exact precedent (`packages/tokens/src/spec/primitives.ts:77-81`). |
| **Three MINOR PRs** | Foundation → Tier 1 → Tier 2 + surface (§12). Each independently shippable and independently verifiable. |
| **No new `@angular/*` peer** | The service imports from `@angular/core` **only** (`DOCUMENT` moved there in v20; verified at `node_modules/@angular/core/types/core.d.ts:9437`). No `@angular/common` import, so no peerDependencies edit and no `tools/smoke-test-pack.mjs` risk. |
| **The provider is EAGER, and it writes at prerender too** | `provideRhombusDensity()` carries a `provideEnvironmentInitializer` that constructs the service (`core.d.ts:384`). A `providedIn: 'root'` service nobody injects is never built — that was v2's B1. The service writes through the **injected `DOCUMENT`**, never the `document` global, so prerendered HTML carries the level and hydration is a no-op (§3.1). |
| **The bridge include is MANDATORY for Material-backed density** | `material-bridge()` is opt-in (`packages/material-preset/src/styles/index.scss:9`). Without it, density reaches only the components RhombusKit styles itself (§11). v1 claimed the opposite. |
| **WCAG floor holds at every level** | Global compact is a true Material −1 **in value** wherever Material's −1 moves the value; segmented is the single documented exception (§4.4). The smallest box the system produces at compact is 28px. |
| **Touch targets are governed by one rule, not per-component anecdote** | **Rule T** (§8.3): any density block that drops a control below both 48px *and* its own default value rebinds that component's `*-touch-target-size`, on the component's own class — never on `:root`. Two sites fire: compact buttons and `dense` table rows. |
| **Coexistence with `mat.density` is UNSUPPORTED, documented and dev-mode detected** | Component-class rebinds (§2.3) beat any `mat.theme((density: N))` emission unconditionally, so an existing `mat.density` app sees a partial shift it never opted into. §11.5 states the exact per-component delta and ships a dev-only probe. |

### 1.2 Revision history

#### v1 → v2 — what changed, and why

v1 was reviewed by four adversarial lenses and found to have defects that invalidate the design, not merely the prose. Every one is corrected here.

| # | v1 defect | Corrected decision |
|---|---|---|
| **1** | **The non-breaking claim was false.** v1 sized the token set first, then specified density as "replace literals with vars". Every shipped literal that did not already equal the new default became a silent regression — ~15 of them, e.g. nav-list `gap: 10px` → 12px, stepper label `gap: 0.0625rem` → 0.75rem (a 1100% growth), accordion trigger `padding: 0.875rem` → 0.5rem. | **Inventory-first (§7).** Every in-scope declaration was audited for its *actual shipped value* first. A var is substituted **only where the default provably equals what ships today**, with the proof stated inline. Everywhere else the literal stays and only compact/comfortable get explicit rules. |
| **2** | **One scalar, six semantics.** `--stack-gap` was asked to be simultaneously 4px, 2px, 10px, 8px, 24px and 1px. `--control-pad-x/-y` flattened the button's documented 12/16/24 inline ramp onto one value. | **The three padding/gap primitives are DELETED** from the frozen set. Per-component precision is implemented at full fidelity as **internal, untokenized per-level rules** (§4.2, §7.1). |
| **3** | **The headline form-field change was a no-op downward.** `container-height` is a `min-height` on a `border-box` infix; content (32px padding + line box) wins, so a compact floor never binds. | The bridge drives **`container-vertical-padding` in lockstep** with height, plus the two filled-with-label paddings — exactly as Material's own ramp does. Four keys, not one. Proved with measured data in §7.2. |
| **4** | **`compact ≈ Material −1` was numerically false** for form-field (48px = −2) and list (40px = −2). | **Recalibrated (§4.4):** field 52 (−1), list one-line 44 (−1), table row 48 (−1). The claim is now true for every component that has a Material equivalent. |
| **5** | **Scoped and global density were conflated.** A descendant re-declaring `--row-height` cannot re-drive an already-substituted `--mat-*` value. | Stated once as a **general rule (§2.2)**, proved in a browser, and applied: scoped steps rebind the `--mat-*` token itself. |
| **6** | **The data-table's `density` input was a guaranteed no-op** — `.rhombus-data-table` is an inner template div, not the host — and `density="default"` matched nothing, so a table could not escape a global compact. | Binding moves to the template div (`rhombus-data-table.component.ts:59`); `density="default"` emits a **real block** restoring Material's literals, and is explicitly tested (§7.3). |
| **7** | **Header/footer row heights were collapsed onto one `--row-height`** (48px), an 8px and 4px silent shrink at default density. | Three **independent** ramps, driven separately (§7.3). |
| **8** | **Selection-list's three per-line-count heights were fed from one token**, collapsing two-line rows by 16px at default density with no opt-in. | All three driven at full precision as internal values (§7.4). |
| **9** | **The migration story was inverted** — "nothing in SCSS changes" was exactly backwards for a `mat.density` migrator, who by definition has not included the opt-in bridge. | §11 states the mandatory SCSS line plainly and scopes the caveat to the components it actually binds. |
| **10** | **`mat.expansion-overrides()` / `mat.stepper-overrides()` were proposed** for components that are hand-rolled and read no Material token. | **Struck.** Both would emit dead CSS. This also settles v1's "four vs two new override calls" contradiction (§2.3). |
| **11** | **The test that "proves non-breaking" inspected the generated `:root` block** — the wrong layer entirely; every regression originated in component SCSS. | A **computed-style geometry baseline** regenerated from `main` by tooling, never hand-edited (§9.2). |
| **12** | **Scope was 2–4× any shipped component pack**, as a single train. | **Three PRs (§12)**, each with its own checklist and exit criteria. |

#### v2 → v3 — what changed, and why

v2 went through the same four-lens pass. **The architecture survived**: the two-layer token split, the inventory-first substitution table (all eight `substitute-var` defaults independently re-verified equal to shipped values), the −1 recalibration, the three-independent-ramps decisions and the three-PR shape are all unchanged. v3 is a targeted fix pass. Where a fix changes a **decision** rather than only prose, it is marked ◆.

| # | v2 defect | Corrected decision |
|---|---|---|
| **B1** ◆ | **`provideRhombusDensity()` was inert.** The provider supplied a token; `RhombusDensityService` was `providedIn: 'root'`; nothing injected it. Angular builds root services **lazily**, so the attribute was never written and every level was a silent no-op. The theme precedent hid this — `RhombusThemeService` is constructed only because `AppComponent` renders `RhombusThemeMenuComponent` (`apps/showcase/src/app/app.component.ts:49`) *and* theming has a pre-paint init script. Density had neither. All four §9.4 jest tests `TestBed.inject()`-ed the service by hand, §9.3's e2e helper deliberately bypassed it, and the one toggle test ran on `/density` — the single page that injects it. The entire test plan structurally could not catch it. | The provider now carries **`provideEnvironmentInitializer(() => inject(RhombusDensityService))`** (§3.1), so registering the provider *is* what constructs the service. The raw `ENVIRONMENT_INITIALIZER` token is `@deprecated from v19.0.0` (`core.d.ts:1857`); the function form is at `:384`. Two new gates: a jest spec that must **never name `RhombusDensityService`** (§9.1 row 4b) and a prerender assertion on raw HTML (§9.1 row 7). |
| **B1b** ◆ | **The SSR guard was reasoned about at the wrong layer.** §3.1's `isPlatformBrowser` early return would have made a prerendered page paint at default and reflow on hydration — a **layout** shift, the exact failure the omitted init script was justified by. The comment's premise ("an unguarded `documentElement` touch fails the BUILD") is true only of the `document` **global**. | The service injects **`DOCUMENT`** and the platform guard is **deleted**. Writes through the injected document are serialised into the emitted HTML — proven in-repo by `AppComponent`'s `<style id="rk-community-themes">` (`app.component.ts:127-134`), present in `dist/apps/showcase/browser/motion/index.html`. The distinction that was missing: **theme is a per-user value unknowable at prerender (localStorage); density is a bootstrap constant known at prerender (DI).** That is now §3.1's stated reason for shipping no init script, replacing the weaker "developer's choice, not an end-user preference" argument. Also drops the `@angular/common` import → §1.1's peer row. |
| **B2** | **The PR 1 gate test was self-contradictory.** §9.1 row 1 asserted both "all five primitives present in each block" and "the `:root` block is byte-identical to `main`'s". `main`'s `:root` contains none of the five (`primitives.snapshot.json` = 17 names). Mutually exclusive, and it was PR 1 exit criterion 2. | Split into **A1** (structure/values) and **A2** (**additive-only** against `main`: `removed` empty, `changed` empty, `added` exactly five). Declaration **order** inside `:root` is explicitly out of scope — the api-snapshot union-order lesson from v1.11–v1.14 applies. |
| **B3** | **A default-density regression survived in §7.10.** Per-level paginator values were placed inside the bridge's **unconditional** `mat.paginator-overrides()` (`_bridge.scss:223`), where no level selector is in scope, shrinking every bridged app's paginator 56→52px at **default**. | Relocated to `_density.scss`'s level blocks, like every other per-level value (§4.3, §7.10). `_bridge.scss:223-230` is **not edited by this epic**. A generator-level regression guard is added (§9.1). |
| **H1** ◆ | **Touch-target overhang was ad-hoc.** Buttons had the identical problem the spec fixed for rows: `fesm2022/button.mjs` renders an absolutely-positioned `.mat-mdc-button-touch-target` at `var(--mat-button-<appearance>-touch-target-size, 48px)`, never rebound, so compact's 28/36/44px boxes overhang by **10/6/2px per side** — worse than `main` at every size. Two stacked compact `sm` buttons need ≥20px of gap, and nothing in the system provides it (`--stack-gap` was deleted; chip-group compact is 6px). | **Rule T**, stated once and systematically in a rewritten §8.3, backed by a full inventory of every touch-target-rendering component in Material 21. Compact buttons get a five-appearance rebind scoped to `.rhombus-button--<size>` (§7.1). |
| **H2** ◆ | **The selection-list touch-target "fix" was BOTH inert AND leaky.** `MatListOption` hand-rolls its checkbox markup and renders **no** `.mat-mdc-checkbox-touch-target` (`grep -c touch-target-size .../fesm2022/list.mjs` → 0), so the rebind bound nothing — while, because `_density.scss` offers only a `:root[data-density]` selector, the declarations leaked to **every checkbox, radio and switch in the document**, dropping out-of-scope targets 48→44px undocumented. "Two-line rows are unaffected" was also false: an inherited custom property has no per-line-count scope. | The rebind is **struck**. The real pointer target is the option **row** — flush siblings, so each target *is* its own box: zero overhang and zero overlap at every level, smallest value 44px (§7.4). Rule T2 now forbids `:root`-scoped touch-target rebinds by rule, so this class of defect cannot recur. |
| **H3** ◆ | **Six holes in the golden baseline** — the assertion the whole epic rests on. `PROPS` omitted `margin-*` while §7.5 puts a margin in scope; the key had no **theme** axis so both passes collided; "ordinal-among-identical-siblings" did not disambiguate same-signature elements under different parents; the `/^(rhombus\|mat)-/` filter could not see `mdc-`-only elements (`.mdc-button__label`, whose `gap: 0.5em` §7.1 explicitly rules out-of-scope); the `hasAttribute('data-density') === false` precondition **self-disabled** from PR 3 onward; and §8.4's third probe was an identity that could not fail. A seventh, found while verifying: `width`/`height` are **used** values and the showcase loads no webfont (`index.html:59`), so `--font-family-sans` falls through to `system-ui` and text-sized boxes differ CI-vs-local. | §9.2 is redesigned: `margin-*` added and bare `width`/`height` removed (replaced by a `FIXED_BOX` allowlist plus specified-value custom-property probes); keys anchored to an authored `data-example-id` plus an in-scope-ancestor path; **theme becomes an assertion, not a data axis** (every theme checked against one theme-invariant golden); the filter widens to `mdc-`/`cdk-`; the corpus narrows to demo subtrees + chrome-once (140 routes → 93, ~126k records → ~2,200); the precondition becomes a golden-header level check **plus** an unconditional "no `[data-density='default']` rule exists" guard; and §8.4's probe compares the row's **content box** against its row box, with a positive control that fails if the probe is blind. |
| **H4** ◆ | **Density coexistence was unaddressed.** An app already running `mat.theme((density: -1))` gets chips 28→32, form-field 52→56, tabs 44→48, table row 48→52 **without ever calling `provideRhombusDensity`** — because component-class rebinds beat any `:root` value unconditionally. §2.3 argued bridge-independence purely as an upside; it is also un-opt-out-able. The damage is not the +4px but the *partial* shift: the table header collapses to the same height as its rows. | New **§11.5**: policy is **unsupported, documented, dev-mode detected**, with the three cascade positions analysed and per-component deltas for all three coexistence cases. The headline it buys: `provideRhombusDensity('compact')` is **value-identical to `mat.theme((density: -1))` for twelve of the thirteen in-scope components**, which makes §11.4 a swap rather than a redesign. |
| **M1** ◆ | **Segmented compact is Material −3, not −1.** `button-toggle/_m3-button-toggle.scss:70` is `(40px, 40px, 40px, 36px, 24px)` — 36px is index 4. §4.4's calibration table omitted segmented entirely while §11.2 stated the underlying fact. | **Keep 36px.** Moving to 40px would mean segmented has *no compact step at all*, reproducing the very `mat.density` deficiency §11.2 sells against. The invariant was stated one notch too strong and is repaired instead (§4.4): compact is a true −1 **in value wherever Material's −1 moves the value**; where the ramp is flat, compact takes the first entry that differs. Safe because we never emit a Material density *scale* and button-toggle's density map has exactly **one** key — neither `touch-target-display` nor `filled-label-display` — so §8.2's −2 cliff does not exist there. |
| **M2** | **Three inconsistent statements** about where `mat.list-overrides()` lives. §7.4 asserted and denied the same claim in two sentences. | Stated once: it lives in **`_density.scss`**. `_bridge.scss` gains **zero** new `mat.*-overrides()` calls; its **18** existing calls (`:149`–`:319`) are untouched. (Both the defect list and two reviews said 19; verified 18 — `grep -n -- "-overrides"` returns 20 lines, two of which, `:140` and `:167`, are comments.) |
| **M3** ◆ | **PR 1 did not stand alone as a MINOR** — it froze three symbols into the api-snapshot-gated barrel while nothing read the primitives they drive. Combined with B1 it shipped a doubly non-functional public symbol. | **The barrel entry and all `packages/core` density TS move to PR 2** (§10.1 item 11, §12). PR 1 becomes a pure tokens MINOR whose only api-snapshot delta is `etc/tokens.api.md`. It also removes the coverage problem: `collectCoverageFrom` counts every file under `src/lib` whether imported or not, so impl and specs now land together. Cost: two `[data-density]` blocks nothing can activate for one release — the same shape as any token landing ahead of its consumer. |
| **M4** | **§5.2's "no second name list to drift" was false.** `densityLevels` had no type relationship to `controlHeight`/`fieldHeight`/`rowHeight`; a typo (`fieldHight`) emits `--field-hight`, `verify-tokens`' prefix filter drops it, CI is green, compact silently stays 56px. | `densityDefaults` becomes the single source of key names and `densityLevels` is typed `Record<'compact'\|'comfortable', DensityScale>` derived from it (§5.1). The three default exports keep `as const` — `etc/tokens.api.md` embeds the literal type. A runtime backstop in the generator suite catches the wrong-*value* case the type cannot (§9.1). |
| **M5** ◆ | **The three-line list ramp was set but rendered nowhere**, so a regression of `list-item-three-line-container-height` (v1's exact 88→48 defect) would diff clean while §9.2 claimed to catch "all of them". | **Dropped from the override set** (§7.4). Three-line is unreachable through `RhombusSelectionListComponent`'s API, and demonstrating it would require shipping a raw `<mat-list>` demo on a docs site whose pitch is that you never write `mat-*`. Direct `mat-list` consumers get one `mat.list-overrides()` line in their own app, documented next to §11.5. |
| **M6** ◆ | **§7.3's `dense` header height was not Material −4.** The spec set 2.25rem (36px) citing "its own clamp floor"; `table/_m3-table.scss:48` header ramp is `(56,52,48,44,40)` → index 5 is **40px**. Row (`:50`) and footer (`:49`) at 36px *are* correct. | Header becomes **2.5rem / 40px**. This keeps the "−4, its own clamp floor" justification literally true *and* preserves a property Material holds at every index: the header is always 4px taller than the row. §7.3's measured line is restated. |
| **M7** | **§7.2's dismissal of the tag-input remove icon was wrong** — and so was the review's correction. Chips render **no** touch-target element (`grep -c touch-target .../fesm2022/chips.mjs` → 0), and `[matChipRemove]` is **not** an `.mdc-evolution-chip__action`, so `height: 100%` never reaches it. | The control is **density-invariant**: an 18px content box from a hard literal that reads no `--mat-chip-*` token, so **0px delta** from this epic. Whether it clears 24×24 is a pre-existing, density-independent question — measured in PR 2 and filed standalone if it fails (§8.5's precedent). The chip's *primary* action does track the chip box (32/28/36); that is the number, on the right element. |
| **L1–L8** | Eight citation/wording errors. | All eight verified against real source and fixed: `?? null` is not "required" (`[attr.x]` removes for `null` **and** `undefined`); the ninth docstring is `api-metadata.ts:2563`; the sibling generator tests are `package.json:16`/`:18`, not `:15`/`:17`; `theming.md` is read at `generate-mcp-data.mjs:154`; the paginator citations were each off by one (`:40`/`:41`/`:42` — note `touch-target-display` at `:44` **was already correct**, do not "fix" it); the stepper header gap is `:26`; `flatPrimitives` is `generate-tokens.mjs:53` with the array at `:54-59`; nav-list's `margin-top` is `:14`. |

**Conflicts between the four v3 fix designs, and how they were resolved.**

1. **Eager-construction mechanism.** One design proposed `provideAppInitializer`, another `provideEnvironmentInitializer`. **Resolved to `provideEnvironmentInitializer`** — it fires when the environment injector is constructed, strictly earlier than app initializers and before the root component, with no awaited-promise machinery for a synchronous attribute write. Both are correct at prerender.
2. **Where the `mat.density` coexistence probe lands.** The H4 design put it in PR 1 "because the initializer lands there anyway"; the M3 decision moves all `packages/core` TS to PR 2. **Resolved in favour of M3** — the probe ships with the provider, and the provider now ships in PR 2.
3. **The three-line list height.** The H4 design's populated `_density.scss` listing retained `list-item-three-line-container-height` with a "not exercised by the showcase" note; the M5 decision drops it. **Resolved in favour of dropping it** — a value set on faith and rendered nowhere is exactly v1's defect provenance. §4.3's listing omits it.
4. **The golden-baseline precondition.** Two designs offered fixes for H3(e): a simple `expect([null,'default']).toContain(level)` and a two-guard version (golden-header level + an unconditional "no `[data-density='default']` rule exists in any stylesheet" check). **Resolved to the two-guard version**, which subsumes the simpler one; guard 2 is the real invariant and is what makes guard 1 safe.

**Raised by the v3 reviews, deliberately NOT fixed in this pass** — each is recorded in §13 with a recommendation rather than silently absorbed, because each is a numeric change to a ratified calibration and deserves its own review: the filled-appearance label-centring formula (§13 D6), the per-size content-floor arithmetic at `md`/`lg` (D7), the incomplete paginator escape under a table-local `density="default"` (D8), and the `material-bridge()` include-point constraint (D9).

#### v3 → v3.1 — post-review corrections (applied by hand, no further review round)

The v3 fix pass was itself reviewed by a closure lens and a fresh-eyes lens. Both found residual defects; all are corrected below. **These were the last review-driven edits — the spec is frozen for implementation after this point**, and anything further is handled during the PRs.

| # | Defect | Correction |
|---|---|---|
| **N1** ◆ | **"`_bridge.scss` is not edited by this epic" was false**, and PR 2's checklist told an implementer to *"diff the bridge to confirm zero lines touched"*. Three existing calls each gain a default-equal geometry key, and PR 1 adds the `@use`/`@include`. Following the checklist literally meant either dropping the global density path for form-field, table and tabs, or failing your own gate. | §2.3 now enumerates **exactly** what the bridge gains (zero new calls, zero per-level values, three one-key additions, one `@use`+`@include`); §4.3 and §7.4 restated; the PR 2 checklist narrowed to the **paginator call only**. |
| **F2** ◆ | **Five of seventeen `VARS` probe names do not exist in Material 21** — `--mat-tab-header-container-height` (real: `--mat-tab-container-height`) and four `--mat-list-item-*` that are really `--mat-list-**list-item**-*`. Those probes read `""` forever, so the gate reported green while tabs and the whole selection-list ramp went unmeasured. | Corrected in §9.2 with the double-prefix explained. **Independently verified**: each bad name returns 0 files from `grep -rl` over `fesm2022/`, each corrected name returns 1; the other twelve all resolve. |
| **F1** | **PR 2 exit criterion 5 could not pass** — the prerender assertion needs the `/density` route and the `app.config.ts` provider, both of which land in PR 3. | The assertion moved to **PR 3**; `density.spec.ts` lands split (Rule T gates in PR 2, prerender + toggle in PR 3). §15's PR-2 gate row updated to match. |
| **F3** | **§7.4's three-line numbers (92 / 84) contradicted M5**, which had dropped that token from scope — both were *driven* values labelled "untouched". The stated "preserved visual ratio at every level" rationale was falsified by the same decision. | Table pinned to **88 at every level**; the ratio claim replaced with the honest ±4px drift and why it is accepted. |
| **F4** | The dev-mode probe read the **`document` global** inside the environment initializer — violating §2.5's own never-the-global rule, in the one function guaranteed to run at prerender. | Takes the injected `DOCUMENT` and gates on `doc.defaultView`, which is a fact about the document rather than a guess about global scope. |
| **F5** | **"48 files (one per route)" contradicted the 93-route corpus**, and the two-tabs-into-one-file merge rule was never stated — the regenerator was unwritable from the text. | Restated as one file per **component** (46 + `_home` + `_chrome`), with the `exampleId`-uniqueness precondition that makes the merge safe, plus a PR 1 gate that fails loudly on a duplicate id. |
| **F6/N4** | `@forward 'density'` in `index.scss` would have published an explicitly-INTERNAL mixin as consumer-callable. And §9.2's `margin-top` coverage silently depends on the nav-list demo rendering **two adjacent** sections (the rule is a `+` sibling selector). | `@use` from `_bridge.scss` instead of `@forward`; PR 1 gains an assertion that the generated golden actually contains a `margin-top` record. |
| **N2 / R17** | `ENVIRONMENT_INITIALIZER`'s deprecation cited as `core.d.ts:1861-1866`; R17 claimed the service imports `@angular/common`. | `:1857` (verified; `:384` for the function form was already exact). R17 corrected to core-only — `DOCUMENT` moved to `@angular/core` in v20. |
| **N3** | *Reported but **rejected**.* The closure lens claimed button's display-companion range should be `:158-167`. | **Verified against source: `:159-168` is correct** — the five `*-touch-target-display` keys sit at `:159`, `:162`, `:163`, `:165`, `:168`. The original citation stands; only the mis-attribution to §8.3.1's table (which lists the `*-size` line, a different token) was reworded. *A "fix" that lands a wrong citation is a new defect — the same lesson as the api-snapshot union-order trap.* |

#### v3.1 → v3.2 — the golden baseline was dropped on contact with the code

Implementation of PR 1 began with the geometry harness. It did not survive first contact, and the spec is corrected rather than the code bent to fit it.

**What happened.** The `exampleId` sweep was the first task. Adding the input took minutes; wiring 54 usages was next. Before starting the sweep I checked what `<app-example>` actually wraps — and it wraps **only the Overview hero**, 54 times, one per component. The **Examples tab uses no wrapper at all**: raw markup under `.showcase-section` / `.showcase-row`, e.g. **31 `<rhombus-button>` instances** on `/components/button` carrying every size, variant and appearance. §9.2's collection root, `[data-example-id] .example__preview`, would have covered ~10% of the demos — and, because the record count would still have landed near the predicted ~2,200, **nothing would have looked wrong**. v3's §9.2 explicitly claimed `button sm/lg padding ✅` as caught; it would not have been.

**The deeper problem.** Fixing the anchor was possible — section headings turn out to be a perfect free anchor (all 537 `.showcase-section` elements lead with an `<h2>`, and headings are unique within every one of the 53 page files). But fixing it would have preserved a design that was **disproportionate to its question**. The golden needed a signature-path key language, run-collapsing, in-scope ancestor hops, duplicate-id detection, 48 committed JSON files and a regenerator that worktrees, builds and serves `main` — nearly all of it solving problems *the approach itself created*, to answer "did any default geometry move?"

**Replaced by** a named-value gate: ~20 rows of `{selector, property, expected, why}` asserted at default density, ~9s, no golden, no regenerator, no anchor. The expected values are transcribed from §7, which had already audited every one. Full rationale in the rewritten §9.2.

**Dropped with it:** `exampleId` (implemented, then reverted — the gate needs no anchor, and 54 mechanical edits for unrelated deep-link value do not belong in an infrastructure PR); the `COMPONENTS` → `routes.ts` extraction (it existed so the golden could share the route list); and risks R19, R22, R23, R24, R28, which described failure modes of the golden design only.

**One real finding survived the rewrite.** The gate initially failed on segmented, asserting 40px against a measured 41.5px. Cause: Material's rule is `line-height: var(--mat-button-toggle-height, 40px)`, so the token is a *line-height*, the box is content-sized, and 41.5px is font-metric dependent — it would have differed between a dev box and CI. §7.6's default-equality claim is fine; the *probe* was wrong. This produced a rule now recorded in §9.2: **assert the property density drives, never a rendered box that merely depends on it.**

---

**Carried into implementation, not fixed here** (fresh-eyes recommendations, recorded so they are decisions rather than oversights): ~~PR 1 is releasable but large to *review* — the geometry-baseline harness has no dependency on the token work and can be split out if review drags.~~ **Moot in v3.2** — with the harness gone, PR 1 is small enough to review in one sitting. Rule T has no mechanical enforcement; the stylelint rule should land in PR 2 rather than as a follow-up. ~~D6 and D7 must be answered **before** PR 2 authors §4.3's comfortable block.~~ **Both were settled on 2026-07-20** — see §13 D6/D7, and D10 for the pinned line-height they turned out to depend on; §3.3 and §7.2 carry the resolved numbers. And §9.1 row 4b leans on `TestBed.createComponent` forcing the environment injector — prove it against a deliberately-broken provider before trusting it, since the prerender assertion is the only independent backstop.

---

## 2. Ground rules

### 2.1 The mechanism in detail

**Layer 1 — the frozen primitives.** `tools/generate-tokens.mjs` emits primitives in one unconditional `:root` block (`flatPrimitives` at `:53`, the emitted array at `:54-59`) and has no scoped-block path (themes get scoping at `:78-81`). §5 extends it to emit two additional blocks, `:root[data-density="compact"]` and `:root[data-density="comfortable"]`, carrying **only the five frozen names**.

**Layer 2 — the attribute.** `RhombusDensityService` sets `data-density` on `document.documentElement`, mirroring `packages/theme-engine/src/lib/theme.service.ts:229-232` (the `setAttribute` is at `:231`) and its browser guard at `theme.service.ts:108-110`.

**Layer 3 — Material.** Material's `overrides()` mixins accept any value: `core/tokens/_token-utils.scss` validates only the **name** against an allowlist (`get-overrides()` at `:18-35`; the emitter at `:107-117`), then interpolates the value verbatim in `values()`:

```scss
// node_modules/@angular/material/core/tokens/_token-utils.scss:73-81
@mixin values($tokens) {
  @include sass-utils.current-selector-or-root() {
    @each $key, $value in $tokens {
      @if $value != null { --mat-#{$key}: #{$value}; }
```

The `current-selector-or-root()` wrapper is why the opt-in bridge can be included at an arbitrary selector, and why `_density.scss` (§4.3) can nest its level blocks under `&`.

> **Correction to v1 §2.1.** v1 claimed the density *arithmetic* never runs on the `overrides()` path. It does: `_define-overrides()` calls `get-tokens()` unconditionally (e.g. `button/_button-theme.scss:76-83` → `button/_m3-button.scss:149`), so `get-density-tokens()` executes on every `overrides()` call. The conclusion is unchanged but the reason differs: that arithmetic runs against **Material's own** `density-scale` system value purely to build the name allowlist, and never touches the value we supply.

**Layer 4 — consumption.** Every density token is read at runtime as a plain `var()` in shipped structural CSS, never resolved at Sass compile time: `min-height: var(--mat-form-field-container-height, 56px)`, `height: var(--mat-table-row-item-container-height, 52px)`, `line-height: var(--mat-button-toggle-height, 40px)` (all in `node_modules/@angular/material/fesm2022/*.mjs`).

**Every RhombusKit var inside an override map carries its own literal fallback.** Nested `var()` indirection makes Material's fallback dead weight: if our var is ever undefined the declaration becomes invalid-at-computed-value-time and falls back to the property's *initial* value, not Material's. Always author `var(--field-height, 3.5rem)`.

**Values must carry a length unit.** Several Material components do runtime `calc()` on these tokens — form-field's floating label is `translateY(calc(calc(6.75px + var(--mat-form-field-container-height, 56px) / 2) * -1))`. A unitless value silently invalidates the whole declaration. Every anchor in §4.4 is rem-authored.

### 2.2 Global and scoped density are two different mechanisms

This is the rule v1 missed. It is stated once, here, and every scoped mechanism in the spec obeys it.

> **A scoped density step must rebind the `--mat-*` token itself. Re-declaring the RhombusKit primitive that feeds it is inert**, because the bridge substitutes `var()` at `:root` and only the *resolved* value inherits.

**Global works** because `:root` **is** `<html>`: the bridge's `--mat-form-field-container-height: var(--field-height)` and the `[data-density]` block's `--field-height` are declared on the *same element*, so when `--field-height` changes the `--mat-*` value re-substitutes there and the new value inherits down (including into body-appended CDK overlays).

**Scoped does not**, proved in headless Chromium against the real cascade. With a global `comfortable` (`--field-height: 4rem`) and two subtrees:

| subtree | declares | `--field-height` at the element | `--mat-form-field-container-height` | rendered |
|---|---|---|---|---|
| `.scoped-wrong` | `--field-height: 3.25rem` | `3.25rem` ✅ | **`4rem`** ❌ | **64px** |
| `.scoped-right` | `--mat-form-field-container-height: 3.25rem` | `4rem` | `3.25rem` ✅ | **52px** |

`.scoped-wrong` successfully changes the primitive and has **zero effect**.

**Specificity.** Emit `:root[data-density='compact']` (pseudo-class + attribute = **0,2,0**), never bare `[data-density='compact']` (**0,1,0**), which ties with `:root` and is decided by source order. Verified in-browser: with the density block deliberately emitted *before* the base `:root` block, `(0,2,0)` still wins. **Emission order is therefore not load-bearing** — do not "fix" the generator's block ordering later.

**Corollary worth stating:** `.rhombus-data-table__table`'s existing `--mat-table-*` declarations (`rhombus-data-table.component.scss:59-64`) already use the correct pattern — they declare the `--mat-*` name directly on an ancestor of the consuming row.

### 2.3 Prefer a component-class rebind over a bridge override

**General rule, second half of §2.2:** when a RhombusKit class already sits on or above the element that reads a Material token, rebind the `--mat-*` token **there** rather than adding a bridge override. It is bridge-independent, it works identically for global and scoped density, and it confines the change to consumers who opted into the RhombusKit component.

Two in-scope cases qualify and both avoid a bridge edit entirely:
- `.rhombus-chip` **is** the `.mat-mdc-standard-chip` element (`rhombus-chip.directive.ts` host block sets `class: 'rhombus-chip'`).
- `.rhombus-segmented` is an ancestor of every `mat-button-toggle` in the group (`rhombus-segmented.component.ts:58,86` bind it on the group element).

**Consequence.** v1's proposed `mat.button-toggle-overrides()` addition is unnecessary — `.rhombus-segmented` is already an ancestor of every toggle, and `.rhombus-chip` **is** the `.mat-mdc-standard-chip` element. Combined with §7.11's and §7.12's strikes, **`_bridge.scss` gains no new `mat.*-overrides()` call at all** — its **18** existing calls (`:149`–`:319`) stay at 18.

**Precisely what the bridge *does* gain** (state it this way everywhere; the loose phrase "the bridge is not edited by this epic" is false and was corrected in v3 — see §1.2 N1):
- **Zero** new `mat.*-overrides()` calls, and **zero** per-level values. Every per-level value lives in `_density.scss`.
- **Three existing calls each gain exactly one geometry key**, all *default-equal* substitute-vars (so they move nothing until a consumer opts in): `mat.form-field-overrides()` at `:168-180` gains `container-height: var(--field-height, 3.5rem)`; `mat.table-overrides()` at `:216-221` gains `row-item-container-height: var(--row-height, 3.25rem)`; `mat.tabs-overrides()` at `:248-260` gains `container-height: var(--control-height-lg, 3rem)`.
- **One `@use` + one `@include`** inside `material-bridge()` (`:25`) to pull in `_density.scss`'s `density-levels()`. This lands in **PR 1**.

`mat.paginator-overrides()` at `:223-230` is the one call an implementer must confirm is **untouched** — its per-level values go in `_density.scss` (§1.2 B3). All per-level plumbing lands in `_density.scss` (§4.3), which contains **five** `mat.*-overrides()` calls per level — form-field, table, list, paginator, toolbar. Of those, `mat.list-overrides()` is the only one for a component `_bridge.scss` does not already override, and *that* is the sense in which it is "new". This resolves v1's four-vs-two contradiction downward and v2's own three-way contradiction about where the call lives (§1.2, M2).

> **Verified count:** `grep -n -- "-overrides" packages/material-preset/src/styles/_bridge.scss` returns 20 lines, of which `:140` and `:167` are comments → **18** `@include mat.*-overrides()` calls. Earlier drafts and two reviews said 19.

**The cost of bridge-independence, stated.** A custom property declared on the consuming element beats any ancestor value unconditionally — specificity and source order never enter, because custom-property resolution takes the *nearest declaring ancestor*. So a component-class rebind wins even against an `html { @include mat.theme((density: -1)) }` include written **afterwards**. That is the property this section is proudest of, and it is also the reason an app already running a Material density scale gets a geometry shift it never opted into, with no ordering that undoes it. See **§11.5**, which states the exact per-component delta and the policy.

**Touch-target tokens are the sharpest instance of this rule** and get their own hard constraint. Every `*-touch-target-size` name is app-global and shared with components §6 explicitly excludes — bare `matButton`, `<rhombus-checkbox>`, `<rhombus-radio>`, `<rhombus-switch>`, direct `mat-list`. Unlike a geometry token, there is no level at which a `:root` rebind of one of these is merely redundant: it is **always** a silent regression for the excluded components, whose boxes do not move. See §8.3 **Rule T2**, and the §7.4 defect it exists to prevent — a rebind authored into `_density.scss`, whose only selector form is `:root[data-density]` (§2.2), and which therefore leaked document-wide.

### 2.4 Component shape

Unchanged from `docs/superpowers/specs/2026-07-18-remaining-components-design.md:28`: `standalone: true`, `OnPush`, `ViewEncapsulation.None`, `styleUrl` scss, signal APIs only. Component SCSS references contract tokens or rebinds `--mat-<component>-*`; RhombusKit components carry no `--mat-sys-*`.

**Sub-rule for this epic:** a rule that changes geometry must clear Material's own specificity. Material's `.mdc-button` base rule is `(0,1,0)`; RhombusKit anchors every button size rule as `&--sm.mdc-button` = `(0,2,0)` (rationale documented at `packages/core/src/lib/button/rhombus-button.component.scss:30-35`). Any density rule layered on top must therefore clear `(0,2,0)`, not merely `(0,1,0)`. §7 gives the per-component verdict.

### 2.5 Environment gotchas

- `pnpm` is not on PATH — use `corepack pnpm`. Workspace deps need `-w`.
- Do **not** `nx build core` while `nx serve showcase` runs — ng-packagr cleans dist and wedges the showcase's global `@use '@rhombuskit/core/scss'`.
- `packages/tokens/src/generated/*` is written with `\n` while `.gitattributes` `* text=auto` gives CRLF working copies. `generate-tokens.mjs` does **not** normalize CRLF on read (unlike `generate-llms.mjs:37` and `generate-mcp-data.mjs:40`). Restore line endings before committing (§10.3 step 8).
- commitlint caps body lines at 100 chars.
- `tools/verify-tokens.mjs` reads `packages/tokens/dist/css/theme-rhombus.css` (`:102-105`) — **the build must precede it**.
- **`DOCUMENT`, never the `document` global**, in any code that can run during prerender. The showcase is `outputMode: static` and `app.config.server.ts` merges the full `appConfig`, so **every bootstrap provider executes at prerender time**. Writes through the injected `DOCUMENT` are serialised into the emitted HTML; the global does not exist. A platform guard is the *wrong* tool when the value being written is knowable at build time — it converts a correct prerender into a hydration layout shift. In-repo proof that `DOCUMENT` writes survive prerender: `AppComponent` writes `<style id="rk-community-themes">` via `inject(DOCUMENT)` (`apps/showcase/src/app/app.component.ts:127-134`) and that element is present in `dist/apps/showcase/browser/motion/index.html`.

---

## 3. Public API

### 3.1 The surface

Three exported symbols plus one component input. All three live in `packages/core/src/lib/density/`, inside the jest coverage gate (`packages/core/jest.config.ts:11-16` scopes `collectCoverageFrom` to `src/lib/**/*.ts`).

```ts
// packages/core/src/lib/density/density.types.ts

/**
 * App-wide geometry scale. Density owns the BOX (heights, padding, gaps);
 * each component's own `size` input owns the TYPE (font-size). The two are
 * orthogonal by kind — see the /density page for the composition rules.
 */
export type RhombusDensity = 'compact' | 'default' | 'comfortable';
```

```ts
// packages/core/src/lib/density/rhombus-density.tokens.ts
import { InjectionToken } from '@angular/core';
import type { RhombusDensity } from './density.types';

/**
 * The bootstrap density. Caller-trusted; no runtime validation is performed
 * (same stance as RHOMBUS_THEME_CONFIG, theme.tokens.ts:68-69).
 */
export const RHOMBUS_DENSITY = new InjectionToken<RhombusDensity>('RHOMBUS_DENSITY', {
  providedIn: 'root',
  factory: () => 'default',
});
```

```ts
// packages/core/src/lib/density/rhombus-density.service.ts
import {
  DOCUMENT,
  Injectable,
  effect,
  inject,
  signal,
  type WritableSignal,
} from '@angular/core';
import { RHOMBUS_DENSITY } from './rhombus-density.tokens';
import type { RhombusDensity } from './density.types';

export const DENSITY_ATTRIBUTE = 'data-density';

/**
 * Writes the app-wide density level onto <html> as `data-density`.
 *
 * Constructed EAGERLY by provideRhombusDensity()'s environment initializer —
 * NOT lazily on first inject(). A `providedIn: 'root'` service that nobody
 * injects is never built, which would make every level a silent no-op. There is
 * no density UI component whose rendering would construct it by accident, and
 * deliberately no init script. (This was v2's B1.)
 *
 * Runs on the SERVER as well as the browser, deliberately. Unlike the theme
 * preference — a per-user localStorage value, unknowable at prerender, hence
 * THEME_INIT_SCRIPT — density is a bootstrap CONSTANT supplied through DI, so
 * the correct value IS known at prerender time. Writing it through the injected
 * DOCUMENT (never the `document` global) bakes it into the prerendered HTML, so
 * a static build paints at the right density and the browser's identical write
 * on hydration is a no-op. That is why density needs no pre-paint script.
 */
@Injectable({ providedIn: 'root' })
export class RhombusDensityService {
  /**
   * The DOM to write to. Injected, not the global: on the server this is the
   * platform-server document and writes to it are serialised into the emitted
   * HTML — proven in-repo by AppComponent's `<style id="rk-community-themes">`
   * (app.component.ts:127-134), present in dist/.../motion/index.html.
   */
  private readonly document = inject(DOCUMENT);

  /** Live density. Writable — set it to switch at runtime. */
  readonly density: WritableSignal<RhombusDensity> = signal(inject(RHOMBUS_DENSITY));

  constructor() {
    // Synchronous first write. Effects flush on a scheduler whose ordering
    // relative to SSR serialisation is not contractual, so the initial value is
    // applied eagerly here and the effect below carries only LATER changes.
    this.apply(this.density());
    effect(() => this.apply(this.density()));
  }

  private apply(level: RhombusDensity): void {
    this.document.documentElement.setAttribute(DENSITY_ATTRIBUTE, level);
  }
}
```

Note the import list: `@angular/core` only. `PLATFORM_ID` / `isPlatformBrowser` are gone, so this file adds **no** `@angular/common` import and therefore no peerDependencies edit and no `tools/smoke-test-pack.mjs` risk (§14 R17). `DOCUMENT` moved to `@angular/core` in v20 and is exported there in the pinned 21.2.14 (`node_modules/@angular/core/types/core.d.ts:9437`).

```ts
// packages/core/src/lib/density/rhombus-density.providers.ts
import {
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type EnvironmentProviders,
} from '@angular/core';
import { RHOMBUS_DENSITY } from './rhombus-density.tokens';
import { RhombusDensityService } from './rhombus-density.service';
import type { RhombusDensity } from './density.types';

/**
 * Set the app-wide density once at bootstrap. Omit it entirely and the app is
 * byte-identical to today: no attribute is written, so no [data-density] block
 * matches and the generated stylesheet's :root values apply unchanged.
 *
 * Register in `bootstrapApplication`'s providers. Registering it in a route's
 * providers does NOT work — density is one attribute on <html>, so there is
 * nothing per-route about it — and a dev-mode warning fires if you try. To
 * scope density to a subtree, set the `data-density` attribute yourself (§2.2).
 *
 * Material-backed components additionally require the opt-in bridge mixin:
 *   :root { @include rhombus.material-bridge(); }
 */
export function provideRhombusDensity(mode: RhombusDensity): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: RHOMBUS_DENSITY, useValue: mode },
    // RhombusDensityService is providedIn:'root' and Angular builds root
    // services LAZILY. Without this initializer nothing ever injects it, the
    // attribute is never written, and every level is a no-op. The initializer
    // runs when the environment injector is created — on the SERVER too, so
    // prerendered HTML carries the level.
    //
    // provideEnvironmentInitializer (core.d.ts:384), NOT the raw
    // ENVIRONMENT_INITIALIZER token, which is @deprecated from v19.0.0
    // (core.d.ts:1857).
    provideEnvironmentInitializer(() => {
      const service = inject(RhombusDensityService);
      if (isDevMode()) {
        if (inject(RHOMBUS_DENSITY) !== service.density()) {
          // Same failure class as B1, recurring at a different scope: the
          // provider was registered somewhere its token can never reach the
          // root service. inject(RHOMBUS_DENSITY) resolves in the injector
          // where the provider was registered; service.density() came from the
          // root injector, so a mismatch IS the silently-ignored case.
          console.warn(
            '[RhombusKit] provideRhombusDensity() was registered in a child ' +
              'injector (a route, or a lazily-created environment injector) ' +
              'and has been ignored. Register it at bootstrap, or scope ' +
              'density to a subtree with the data-density attribute — /density.',
          );
        }
        // Pass the injected DOCUMENT — §2.5's never-the-global rule applies
        // here more than anywhere, since this initializer runs at prerender.
        warnOnMaterialDensity(inject(DOCUMENT));
      }
    }),
  ]);
}

/**
 * One-shot coexistence probe (§11.5). `--mat-checkbox-state-layer-size` is
 * emitted by `mat.theme((density: N))` ONLY when N !== 0
 * (core/tokens/_system.scss:149), and RhombusKit declares it NOWHERE — the
 * repo's only `state-layer-size` is --mat-icon-button-state-layer-size at
 * rhombus-code-block.component.scss:34, a different token on a scoped
 * selector. So a non-empty value at the document root proves a Material
 * density scale is active alongside ours, with no false positives by
 * construction. Dev-mode only: one getComputedStyle read at app init.
 */
function warnOnMaterialDensity(doc: Document): void {
  // §2.5's rule is absolute: injected `DOCUMENT`, never the `document` global,
  // in anything that can run during prerender — and the environment initializer
  // exists precisely so this DOES run at prerender. The caller injects DOCUMENT
  // and passes it; `doc.defaultView` is null under prerender, which is a fact
  // about the document rather than a guess about the global scope.
  const view = doc.defaultView;
  if (!view) return; // prerender: no window, nothing to probe
  const probe = view
    .getComputedStyle(doc.documentElement)
    .getPropertyValue('--mat-checkbox-state-layer-size')
    .trim();
  if (!probe) return;
  console.warn(
    '[RhombusKit] A Material density scale (mat.theme((density: …)) or ' +
      'mat.all-component-densities()) is active alongside ' +
      'provideRhombusDensity(). The two emit competing values for chip, ' +
      'form-field, table, tabs and list, and RhombusKit wins for some but not ' +
      'all of them. Remove the Material density scale — see ' +
      'https://rhombuskit.dev/density#migrating-from-mat-density',
  );
}
```

**Deliberate omissions, all load-bearing:**

- **No persistence, no `localStorage` key, no pre-paint init script.** The theme system has all three, and its init script is already hand-copied into `apps/showcase/src/index.html:53-55` with a "keep in sync" comment. Density persistence would create a *third* hand-maintained copy. The **mechanical** reason density needs no init script — stronger than v2's "a developer's choice, not an end-user preference", and checkable: the theme system needs one because its value comes from `localStorage` and cannot be known at prerender; density's value comes from DI and **is** known at prerender, so the service writes it into the prerendered HTML through the injected `DOCUMENT` and the browser's identical write on hydration is a no-op. There is nothing left for an init script to prevent.
  - **CSR-only caveat.** An app with no SSR/prerender writes the attribute at bootstrap, after `index.html` has painted. A normal SPA paints nothing RhombusKit-styled before bootstrap, so nothing shifts — but an app that hand-writes a splash screen or skeleton into `index.html` and styles it with RhombusKit tokens **will** paint it at default and reflow. The one-line, consumer-owned mitigation is a static attribute, not a script: `<html data-density="compact">`. That is exactly the pattern this repo already uses for theming at `apps/showcase/src/index.html:2` (`<html lang="en" data-theme="rhombus-light">`).
- **No `try/catch`.** There is no storage here, so there is nothing to swallow.
- **No equality guard on `set()`.** Angular signals already dedupe.
- **No conditional `removeAttribute()` for `'default'`.** Always `setAttribute`. The byte-identical promise is about the generated *stylesheet* (which emits no `default` block), not about the attribute's presence. §9.2's guard 2 is what keeps that harmless: it asserts unconditionally that no `[data-density='default']` rule exists in any stylesheet.
- **No runtime validation of the string.** Same stance as `theme.tokens.ts:68-69`.

The omissions keep the **service** branch-free; the feature's only instrumentable conditionals are the provider's two dev-mode branches — see §9.4.

**Three residual SSR limitations, documented rather than hidden:**

1. **Prerender bakes one level per build.** A static build emits the same `data-density` on every route for every visitor. Inherent to density being a bootstrap constant; per-request density would need dynamic SSR reading the request, and is out of scope.
2. **Runtime switching does not survive reload** — now also true of a prerendered page, which returns to the provider's level. The `/density` toggle prose (§10.1 item 2) already says "global and unpersisted" and remains correct.
3. **The CSR-only paint window above has no test**, because the showcase is prerendered and CI never exercises the client-rendered-only path. It is documented, not gated (§14 R21).

### 3.2 The data-table's own knob

The table is the one component that gets a local override, because its ramp removes no touch target at any level and because "this one table opts out" is the single most-requested escape.

```ts
// packages/core/src/lib/data-table/rhombus-data-table.component.ts
/**
 * Table-local density. Overrides the app-wide provideRhombusDensity() level for
 * this table only — including 'default', which restores default geometry inside
 * a globally-compact app. 'dense' is table-only (36px rows): it has no global
 * equivalent because it drops below every other component's floor.
 */
readonly density = input<RhombusDensity | 'dense' | undefined>(undefined);
```

**The binding goes on the inner template div, not the host.** `rhombus-data-table.component.ts:58-60` is:

```
  template: `
    <div class="rhombus-data-table">
```

and the `@Component` has **no `host:` block at all** (verified across the whole decorator, `:45-154`). `:host` is not an option either — the component is `ViewEncapsulation.None` at `:56`. So:

```ts
<div class="rhombus-data-table" [attr.data-density]="density() ?? null">
```

`?? null` is **not required** — Angular's `[attr.x]` binding removes the attribute for `undefined` as well as `null` (the check is `value == null`), so `[attr.data-density]="density()"` alone would behave identically. It is written explicitly because the intent ("absent means inherit") should be legible at the binding site rather than depend on a framework nullish detail. **Stated correctly here** because v2 justified it with a false claim about the string `"undefined"`, and an implementer reasoning about other `attr.` bindings would carry that error forward.

**Four named steps, and an answer to the 44/40 question.** The exposed ramp is `comfortable` 60 / *(unset — inherits)* / `default` 52 / `compact` 48 / `dense` 36. Material's intermediate −2 (44px) and −3 (40px) are deliberately **not** given names: a five-rung named scale has no honest vocabulary for the middle two. Consumers who want them use the documented one-line escape hatch, which is the same mechanism the component itself uses (§2.2):

```scss
.my-table .rhombus-data-table { --mat-table-row-item-container-height: 2.75rem; } /* 44px */
```

### 3.3 Composition with `size`

> **Density owns the BOX. Size owns the TYPE. They are orthogonal by kind.**

This is not a precedence rule — they touch **disjoint CSS properties**, which is what keeps the release non-breaking.

| Axis | Who sets it | What it controls | Where |
|---|---|---|---|
| **Density** | app-wide, `provideRhombusDensity()` | `min-height`, `height`, `padding`, `gap` | `:root[data-density]` rebinds 5 primitives; `_density.scss` rebinds internal `--mat-*` values |
| **Size** | per-instance, `size="sm\|md\|lg"` | `font-size` only | `.rhombus-form-field--sm/md/lg` etc. |

**Worked example.** A form field at `size="sm"` under `compact`:

```scss
/* packages/core/scss/_form-field.scss:26-28 — UNCHANGED by this epic */
&--sm { font-size: 0.75rem; }                      /* type: 12px */

/* packages/material-preset/src/styles/_bridge.scss — NEW, two keys */
@include mat.form-field-overrides((
  container-height: var(--field-height, 3.5rem),   /* box; default 56 == shipped 56 */
  container-text-line-height: 1.5em,               /* pins L; see below. No visual change. */
));

/* packages/material-preset/src/styles/_density.scss — NEW, internal */
&[data-density='compact'] {
  @include mat.form-field-overrides((container-vertical-padding: 0.875rem)); /* 14px */
}
```

Rendered: a **52px-tall** field with **12px** text (proof in §7.2). Before this epic the same markup gave a 56px field with 12px text. The `size` class did not change; only the app-wide box did, and only because the app opted in.

**Why the form field's line-height is deliberately NOT pinned (v3.2 reversal).** Every height
calculation in §7.2 and §8.4 uses `L = 24px`, and that value arrives by **inheritance**: Material
reads `var(--mat-form-field-container-text-line-height, var(--mat-sys-body-large-line-height))`,
the bridge sets neither, so the declaration is invalid at computed-value time and `line-height`
inherits.

v3.1 pinned `container-text-line-height: 1.5em` here to make that load-bearing rather than
accidental, on the reasoning that `em` resolves against the element's own font-size and so
reproduces today's value. **That was measured in one context and is false in general.** An
inherited value varies by ancestor and no fixed declaration can reproduce it: at the document root
the inherited value is 24px and `1.5em` is also 24px, but inside `mat-dialog-content` or a
`.mat-mdc-row` — ancestors this same bridge creates via `--mat-sys-body-medium-line-height` (`:129`)
— the inherited value is **20px** while `1.5em` computes to **21px**. A `rows="3"` textarea in a
dialog grows 92px → 95px at DEFAULT density, in an app that never opted in.

So the pin is reverted and the hazard it was aimed at — someone completing the typescale with
`body-large`, or re-adding the pin — is guarded **statically** instead, in
`tools/verify-component-styles.mjs`. A rendered assertion provably cannot do it: at the root the
pinned and inherited values coincide, and the showcase renders no form field under either
divergent ancestor. `apps/showcase-e2e/tests/geometry.spec.ts` still asserts the root value of
24px, which catches the `body-large` case, and says so precisely rather than implying it covers
both.

```css
line-height: var(--mat-form-field-container-text-line-height, var(--mat-sys-body-large-line-height));
```

and `_bridge.scss` sets **neither** token — its typescale block (`:107-137`) declares `label-large/medium/small`, `body-medium` and `title-medium`, and stops short of `body-large`. Both `var()`s are therefore undefined, the declaration is invalid at computed-value time, `line-height` falls back to inheritance, and it picks up the unitless `line-height: 1.5` from `packages/tokens/src/styles/_reset.scss:20` — which multiplies each element's *own* font-size, i.e. the one the `size` class just set. Three coincidences in a row.

`body-large` is the obvious missing entry in that typescale block. The moment anyone completes it — a plausible, well-intentioned tidy-up — the line-height becomes a fixed `rem`, stops tracking `size`, and **every D6/D7 number breaks silently**: no build error, no test failure, just fields that no longer centre their labels.

`1.5em` resolves against the element's own font-size, so it is **byte-identical to what renders today** — the default-density baseline diff stays empty (§9.2) — while making the arithmetic load-bearing rather than accidental. **Add `--mat-form-field-container-text-line-height` to §9.2's `VARS`** so any future change to it fails the geometry gate loudly.

**The nine misleading docstrings get corrected in PR 3.** All eight form-field components carry the identical string `/** Density scale applied via host classes; defaults to \`md\`. */` above `readonly size = input<FormFieldSize>('md');`:

`autocomplete/rhombus-autocomplete.component.ts:155` · `date-picker/rhombus-date-picker.component.ts:129` · `date-range-picker/rhombus-date-range-picker.component.ts:97` · `input/rhombus-input.component.ts:108` · `number-input/rhombus-number-input.component.ts:128` · `select/rhombus-select.component.ts:125` · `tag-input/rhombus-tag-input.component.ts:134` · `textarea/rhombus-textarea.component.ts:83`

Plus a **ninth** — `segmented/rhombus-segmented.component.ts:130` says *"Density preset applied via host class"*, and its classes set only `--mat-button-toggle-label-text-size` (`rhombus-segmented.component.scss:20-28`), i.e. pure type. Correct all nine to name `size` as a **type** scale, cross-referencing `provideRhombusDensity` for box geometry.

All **nine** strings are checked into `apps/showcase/src/generated/api-metadata.ts` and must be regenerated in the same commit (§10.3): the eight form-field copies at lines **243, 1218, 1311, 1613, 1922, 2663, 3600, 3710**, plus segmented's at **2563** (verified: `"description": "Density preset applied via host class. Defaults to \`md\`."` under `"type": "SegmentedSize"`). v2 promised nine corrections and enumerated eight lines; R5 said "8 copies are checked in". Both are corrected to nine.

### 3.4 Barrel entry — **lands in PR 2, not PR 1**

Appended at the end of `packages/core/src/index.ts` (after the Carousel block, `:387-396`), matching the Icon block's provider+service+type ordering (`:298-306`) and the file's "keep this barrel flat" convention (`:1-3`).

> **Retargeted to PR 2** (§1.2 M3). `packages/core/src/index.ts` is api-snapshot-frozen (`etc/core.api.md`); exporting three symbols is a public commitment, and making it one release before anything reads the primitives they drive buys nothing and cannot be walked back. It also removes a coverage problem: `collectCoverageFrom` counts every file under `src/lib` whether imported or not (`packages/core/jest.config.ts:11-16`), so landing `src/lib/density/*.ts` in PR 1 would drag the global percentages unless the specs landed with it. Impl **and** specs now land together in PR 2, and PR 1 touches no `packages/core` TypeScript at all.

```ts
// Density — an app-wide geometry scale (compact / default / comfortable) set once
// at bootstrap via provideRhombusDensity(), which eagerly constructs the service
// via an environment initializer. The service writes a data-density attribute on
// <html> through the injected DOCUMENT — on the server as well as the browser, so
// prerendered HTML carries the level and there is no hydration shift. The levels
// rebind five
// theme-invariant geometry primitives (three control heights, field height, row
// height) that both the Material bridge and the bespoke components read, plus
// internal per-level values that are NOT public API. Orthogonal to each
// component's `size` input: density owns the BOX and size owns the TYPE, which is
// why adding density is non-breaking — an app that never calls this renders
// exactly as before. Material-backed components additionally require the opt-in
// `material-bridge()` mixin. Every level clears the WCAG 2.2 24x24 target floor;
// there is deliberately no equivalent of Material's -2/-3. No persistence and no
// pre-paint script (unlike the theme preference).
export { RhombusDensityService } from './lib/density/rhombus-density.service';
export { provideRhombusDensity } from './lib/density/rhombus-density.providers';
export type { RhombusDensity } from './lib/density/density.types';
```

---

## 4. The token decision

The four component packs (v1.11–v1.14) shipped **thirteen components with zero new tokens**. That is the bar this decision has to clear. It clears it because density is a dimension question and the repo has **no dimension scale at all** — but v1 cleared it *badly*, by tokenizing implementation detail. The core insight of this revision is a **two-layer split**.

### 4.1 Why a new scale is unavoidable

Grep across `packages/` returns **zero** occurrences of `--space-*`, `--spacing-*`, `--size-*` or `--density-*`. The CONTRACT's 60 names (`packages/tokens/src/types.ts:16-119`) are colours, five shadows and three font *families*. The published primitives (17 names, `packages/tokens/primitives.snapshot.json`) are `--radius-*`, `--motion-*`, `--border-width*`. The de-facto spacing system is 111 literal `padding:` / `min-height:` / `gap:` declarations across 28 component SCSS files. Density cannot re-point an existing token because there is nothing to re-point.

### 4.2 The two-layer split — public-frozen vs internal

**This is the correction that dissolves v1's structural defect.** v1 conflated two things that have opposite requirements:

| | **(a) Public frozen primitives** | **(b) Internal plumbing** |
|---|---|---|
| Purpose | give `/density` a documented scale; give Figma/MCP something to export; let a consumer read one number | render each component correctly at each level |
| Count | exactly **five** | as many values as precision demands |
| Lifetime | **append-only forever** (`verify-tokens.mjs:15-21`) — a one-way door | changeable in any MINOR, no ceremony |
| Shape | one scalar per concept | per-size, per-line-count, per-appearance |
| Where | `packages/tokens/src/spec/primitives.ts` → `primitives.css` | `packages/material-preset/src/styles/_density.scss` + each component's own SCSS |
| Visible in | `primitives.snapshot.json`, `design-tokens.json`, MCP `list_tokens`, `etc/tokens.api.md` | **nothing** |

**Why five and not eight.** v1's squeeze came from trying to express implementation detail as frozen public names. Three concrete proofs that a padding/gap scalar cannot work:

1. **The button.** Three shipped pairs — `0.25rem 0.75rem` / `0.5rem 1rem` / `0.625rem 1.5rem` (`rhombus-button.component.scss:36-38`). A documented 12/16/24px inline ramp mapped onto one `--control-pad-x` **deletes the ramp**: after the change sm/md/lg would differ only in `min-height` and `font-size`.
2. **The nav-list.** One file needs 10px (`:80`), 4px (`:9`), 2px (`:74`), 2px (`:135`) and 8px (`:233`) — five values from one scalar. It also needs a **three-value** block shorthand for the heading (`padding: 8px 12px 4px`, `:19`), which no scalar can express.
3. **The stepper.** `--stack-gap` would have driven a layout gutter (1.5rem, `:8`), a sibling-button gap (0.5rem, `:27`), an intra-control gap (0.625rem, `:45`) and a 1px optical nudge (0.0625rem, `:133`) — simultaneously −12px, +4px, +2px and +1100%.

Deleting the three names does **not** reduce fidelity. The button's 12/16/24 ramp and the list's 48/64/88 ramps are implemented at full precision in §7 — they simply are not public names.

**Why five and not fewer.** Each of the five is genuinely load-bearing — every one is read by shipped CSS, not merely documentation:

| Token | Read by |
|---|---|
| `--control-height-sm` | button sm `min-height` + icon-button square (`rhombus-button.component.scss:36,50`); `--mat-chip-container-height` on `.rhombus-chip`; nav-list disclosure width (`:151`) |
| `--control-height-md` | button md (`:37,51`); `--mat-button-toggle-height` on `.rhombus-segmented` |
| `--control-height-lg` | button lg (`:38,52`); `--mat-tab-container-height` via `mat.tabs-overrides()` |
| `--field-height` | `--mat-form-field-container-height` via `mat.form-field-overrides()` — reaches all eight form-field consumers |
| `--row-height` | `--mat-table-row-item-container-height` via `mat.table-overrides()` |

### 4.3 Where internal plumbing lives

**Decision: a new hand-authored `packages/material-preset/src/styles/_density.scss`**, exposing a `density-levels()` mixin that `material-bridge()` includes internally.

Two alternatives were evaluated and rejected:

- **Inside `_bridge.scss`.** Mechanically fine, but that file's own docblock (`:20-24`) declares a single responsibility — *"Every value is a var() reference into the CONTRACT — do NOT introduce hard-coded colour/shadow/radius values here."* Density plumbing is nothing *but* hard-coded per-level values. Rejected on the file's own stated rule.
- **Generated but excluded from the published prefix list.** Viable (`verify-tokens.mjs:26-29` filters by prefix, so unlisted names never enter the snapshot) but it forces `@rhombuskit/tokens` — a framework-agnostic package with no Angular and no Material dependency — to know about `--mat-form-field-container-vertical-padding`. A hard layering inversion, and it puts unfrozen values in a frozen-looking artifact.

`_density.scss` wins on four counts: correct layering; **no second consumer include** (it rides the `:root { @include rhombus.material-bridge(); }` line consumers already have, documented at `index.scss:5-9`); the same CDK-overlay reach as the colour bridge, for the same reason; and nothing enters `primitives.css`, so nothing is frozen.

Tooling cost is **one array element**: `tools/copy-material-preset-assets.mjs:13` is `const files = ['_bridge.scss', '_compat.scss', 'index.scss'];` — add `'_density.scss'`. Plus `@forward 'density';` in `packages/material-preset/src/styles/index.scss` (currently `@forward 'bridge'; @forward 'compat';` at `:15-16`).

```scss
// packages/material-preset/src/styles/_density.scss
//
// INTERNAL per-level plumbing. NOT public API. These values are unfrozen and may
// change in any MINOR — the public density surface is provideRhombusDensity()
// plus the five frozen primitives in @rhombuskit/tokens.
//
// Emitted from inside material-bridge(), so it is reached by the single
// `:root { @include rhombus.material-bridge(); }` line consumers already have.
// Nesting under `&` yields :root[data-density='…'] = (0,2,0), which beats the
// (0,1,0) :root primitives block regardless of source order.
//
// NOTHING IS EMITTED FOR 'default'. That is the byte-identical invariant made
// structural: with no default block there is no default-density value to get
// wrong.

@use '@angular/material' as mat;

@mixin density-levels() {
  &[data-density='compact'] {
    // form-field: three per-level keys — arithmetic in §7.2.
    // container-height itself is a substitute-var in _bridge.scss, not here.
    @include mat.form-field-overrides((
      container-vertical-padding:                 0.875rem, // 14px — Material -1
      filled-with-label-container-padding-top:    1.375rem, // 22px
      filled-with-label-container-padding-bottom: 0.375rem, //  6px
    ));

    // table: header and footer are two INDEPENDENT ramps (§7.3). Row height
    // comes free via --row-height's substitute-var and is NOT restated here.
    @include mat.table-overrides((
      header-container-height: 3.25rem, // 52px — Material -1
      footer-container-height: 3rem,    // 48px — Material -1
    ));

    // list: the ONE per-level call in this epic for a component _bridge.scss
    // does not already override (§2.3, §7.4). three-line is deliberately NOT
    // set — see §7.4 and §1.2 M5.
    @include mat.list-overrides((
      list-item-one-line-container-height: 2.75rem, // 44px
      list-item-two-line-container-height: 3.75rem, // 60px
      list-item-leading-icon-start-space:  0.75rem, // 12px — must move in
      list-item-leading-icon-end-space:    0.75rem, // lockstep with start
    ));

    // paginator: this is the ONLY correct home for these values. The bridge's
    // mat.paginator-overrides() at _bridge.scss:223 is UNCONDITIONAL — putting
    // container-size there shrinks the bar 56 -> 52px at DEFAULT for every
    // bridged app, opted in or not. That was v2's B3.
    @include mat.paginator-overrides((
      container-size: 3.25rem, // 52px — Material -1 (_m3-paginator.scss:40)
    ));

    @include mat.toolbar-overrides((
      standard-height: 3.75rem, // 60px — Material -1 (_m3-toolbar.scss:38)
      mobile-height:   3.25rem, // 52px — Material -1 (:39). BOTH or NEITHER (§7.9)
    ));
  }

  &[data-density='comfortable'] {
    @include mat.form-field-overrides((
      container-vertical-padding:                 1.25rem, // 20px
      filled-with-label-container-padding-top:    2rem,    // 32px
      filled-with-label-container-padding-bottom: 0.5rem,  //  8px
    ));
    @include mat.table-overrides((
      header-container-height: 4rem,    // 64px
      footer-container-height: 3.75rem, // 60px
    ));
    @include mat.list-overrides((
      list-item-one-line-container-height: 3.25rem, // 52px
      list-item-two-line-container-height: 4.25rem, // 68px
      list-item-leading-icon-start-space:  1.25rem, // 20px
      list-item-leading-icon-end-space:    1.25rem,
    ));
    @include mat.paginator-overrides((container-size: 3.75rem)); // 60px
    @include mat.toolbar-overrides((
      standard-height: 4.5rem, // 72px
      mobile-height:   4rem,   // 64px
    ));
  }
}
```

**Five `mat.*-overrides()` calls per level** — form-field, table, list, paginator, toolbar. `_bridge.scss` gains **zero** new calls and **zero per-level values**; it is edited only in the three narrow ways §2.3 enumerates (one default-equal key on each of three existing calls, plus the `@use 'density'` + `@include density.density-levels()` inside `material-bridge()` at `:25`, which lands in PR 1).

**Wiring: `@use`, not `@forward`.** `_density.scss`'s header declares it INTERNAL, so `index.scss` must **not** `@forward 'density'` — that would publish `rhombus.density-levels()` as a consumer-callable mixin and contradict the file's own contract. `_bridge.scss` `@use`s it privately. The only `index.scss` change is none; the only tooling change is the one array element in `tools/copy-material-preset-assets.mjs:13`. Accordion and stepper appear nowhere here: both are hand-rolled and read no Material token, so their per-level values live in their own component SCSS (§7.11, §7.12).

**This compiles to the right selector, verified by reading the emitter.** `mat.*-overrides()` routes through `token-utils`' `values()`, which wraps emission in `sass-utils.current-selector-or-root()` (`core/style/_sass-utils.scss:18-27`): inside a selector it emits at that selector. Nested `&[data-density='compact']` → `material-bridge()` → the consumer's `:root { … }` yields `:root[data-density="compact"]` = **(0,2,0)**, which beats the `:root` primitives block regardless of source order (§2.2). PR 2 should nonetheless compile `_density.scss` and grep the output for that selector carrying `--mat-paginator-container-size: 3.25rem` before trusting three levels of mixin nesting.

Bespoke RhombusKit component internals (the button's padding ramp, nav-list gaps, stepper geometry) do **not** live here — they stay in each component's own SCSS, co-located with the geometry they modify.

### 4.4 Anchor values

Rem-authored (SC 1.4.4 — rem respects an enlarged default browser font size where px does not); px shown at a 16px root.

**The five frozen primitives:**

| Token | compact | **default** | comfortable | Default proof |
|---|---|---|---|---|
| `--control-height-sm` | `1.75rem` / 28 | **`2rem` / 32** | `2.25rem` / 36 | `rhombus-button.component.scss:36` ships `min-height: 2rem`; Material chip default is 32px (`chips/_m3-chip.scss:79`) |
| `--control-height-md` | `2.25rem` / 36 | **`2.5rem` / 40** | `3rem` / 48 | `:37` ships `2.5rem`; Material button-toggle default is 40px (`button-toggle/_m3-button-toggle.scss:70`) |
| `--control-height-lg` | `2.75rem` / 44 | **`3rem` / 48** | `3.5rem` / 56 | `:38` ships `3rem`; Material tab default is 48px (`tabs/_m3-tabs.scss:56`) |
| `--field-height` | `3.25rem` / 52 | **`3.5rem` / 56** | `4rem` / 64 | Material form-field default 56px (`form-field/_m3-form-field.scss:129`), and 56 is what actually renders — arithmetic in §7.2 |
| `--row-height` | `3rem` / 48 | **`3.25rem` / 52** | `3.75rem` / 60 | Material table row default 52px (`table/_m3-table.scss:50`) |

**Calibration check — compact matches Material's −1 value wherever Material's −1 actually moves:**

| Component | Material −1 | Our compact | ✓ |
|---|---|---|---|
| button / control-md | 36 | 36 | ✓ |
| chip | 28 | 28 | ✓ |
| form-field | 52 | 52 | ✓ |
| table row | 48 | 48 | ✓ |
| table header (internal) | 52 | 52 | ✓ |
| table footer (internal) | 48 | 48 | ✓ |
| list item one / two-line (internal) | 44 / 60 | 44 / 60 | ✓ |
| tabs | 44 | 44 | ✓ |
| toolbar standard / mobile (internal) | 60 / 52 | 60 / 52 | ✓ |
| paginator bar (internal) | 52 | 52 | ✓ |
| **segmented (button-toggle)** | **40 — the ramp is FLAT at 0/−1/−2** | **36** | **✗ by design** |

**The one exception, and why it is not a hole.** `button-toggle/_m3-button-toggle.scss:70` is `list.nth((40px, 40px, 40px, 36px, 24px), $index)` with the clamp at −4: Material's −1 **and** −2 are both 40px, so a "true −1" segmented would not compact **at all**. 36px is the ramp's index 4 — nominally scale **−3**. That is safe here, and only here, because **we never emit a Material density scale**: the −2 cliff §8.2 describes lives entirely in the `*-touch-target-display` and `form-field-filled-label-display` tokens, and button-toggle's density map has **exactly one key** and carries neither. 36px clears SC 2.5.8 with **12px** of margin, measured against button-toggle's own clamp floor of 24px.

Choosing 40px instead would give segmented no compact step and reproduce exactly the `mat.density` deficiency §11.2 sells against ("flat where you need it most"). So the **invariant is restated rather than the value changed**:

> **Compact is a true Material −1 in VALUE wherever Material's −1 moves the value. Where Material's ramp is flat, compact takes the first entry that differs — and no display token ever flips, because no Material density scale is ever emitted.**

v1's compact landed form-field and list on **−2**, which is where `form-field-filled-label-display` flips to `none` (`form-field/_m3-form-field.scss:130`). The recalibration is what makes §8.2's stated safety margin real rather than accidental.

**Comfortable is entirely outside Material's scale** (Material's maximum is 0). That is fine mechanically — `overrides()` accepts any value — but it carries zero upstream validation and needs explicit visual review in PR 2, particularly the form field, where the floated-label transform is a fixed `-34.75px` while the resting position is `H/2`, so the travel lengthens 4px at 64px (§7.2).

### 4.5 Three-place prefix registration

Miss any one and the tokens silently vanish from the frozen surface, the Figma export, or MCP. With five names, **three prefixes** cover them.

| # | File | Current value | Add |
|---|---|---|---|
| 1 | `tools/verify-tokens.mjs:21` | `['--radius-', '--motion-duration-', '--motion-ease-', '--border-width']` (**with** `--`) | `'--control-height-'`, `'--field-height'`, `'--row-height'` |
| 2 | `tools/generate-mcp-data.mjs:121` | same list, **no** `--`; it filters flat `design-tokens.json` keys at `:122-123` then re-prefixes at `:125` | the same three in bare form |
| 3 | `tools/generate-design-tokens.mjs:42-48` | `primitiveType()` — five prefix arms, **fallback `return 'color'`** | three `return 'dimension'` arms before the fallback |

Number 3 is the dangerous one: the fallback is `'color'` (`:48`), so forgetting this file does not error — it silently types five dimension tokens as *colours* in `design-tokens.json`, in the Tokens-Studio/Figma import, and transitively in MCP `list_tokens` (which copies `$type` at `generate-mcp-data.mjs:125`). No existing test catches it; §9.1 adds one.

Also: `etc/tokens.api.md` embeds the whole `tokens` const literal type, so all five keys land in the frozen public API report and `api-snapshot.mjs` fails CI until re-run.

**Snapshot count: 17 → 22** (2 border-width + 8 motion + 7 radius + 5 density). v1's figure of 25 assumed the eight-name set and is stale.

---

## 5. The generator change

`/density` derives its docs from generated tokens the way `/motion` does, rather than hand-authoring the scoped blocks.

### 5.1 The spec table

`densityLevels` must be a **separate export** from `spec/primitives.ts`, not a key inside `primitives` — `flattenPrimitives` (`generate-tokens.mjs:38-49`) recurses into every nested object, so a nested `density` key would flatten to `--density-compact-field-height` and pollute the base `:root` block.

```ts
// packages/tokens/src/spec/primitives.ts — after :105, before the barrel at :107
//
// Density is theme-independent box geometry (a 40px control is 40px in every
// theme), so it lives here as a primitive — like radius/motion/border-width, NOT
// in the themed CONTRACT. These FIVE names are the entire public density surface;
// per-component precision (paddings, per-line-count list heights, form-field
// vertical padding) is INTERNAL and lives in @rhombuskit/material-preset's
// _density.scss and in each component's own SCSS. Do not add a sixth name here
// without a very good reason: published primitives are append-only forever.
//

// The DEFAULT level. These three keep their `as const` literal types: they enter
// the `primitives` barrel and therefore etc/tokens.api.md, which embeds the whole
// literal type (§4.5). Widening any of them churns the frozen API report.
export const controlHeight = { sm: '2rem', md: '2.5rem', lg: '3rem' } as const;
export const fieldHeight = '3.5rem';
export const rowHeight = '3.25rem';

/**
 * The single source of density key NAMES. `densityLevels` is typed against this,
 * so a typo (`fieldHight`) is a compile error rather than a custom property that
 * verify-tokens.mjs's prefix filter silently drops (:26-29) while CI stays green
 * and compact form-fields quietly remain 56px. (That was v2's M4.)
 */
const densityDefaults = { controlHeight, fieldHeight, rowHeight } as const;

/**
 * Same key names as `densityDefaults`, same nesting depth, values widened to
 * string. Object-valued families become Record<their own keys, string>, so
 * `controlHeight` must carry exactly sm/md/lg — no more, no less.
 */
type DensityScale = {
  readonly [K in keyof typeof densityDefaults]:
    (typeof densityDefaults)[K] extends Record<string, unknown>
      ? { readonly [S in keyof (typeof densityDefaults)[K]]: string }
      : string;
};

// FLOOR NOTE: --control-height-sm at compact (1.75rem / 28px) is the smallest box
// the system produces. It must never drop below 1.5rem — icon-only buttons zero
// their min-width (rhombus-button.component.scss:49), so this value alone holds
// WCAG 2.2 SC 2.5.8 for them.
//
// The 'default' level IS `densityDefaults` above — there is no third entry here,
// and the generator emits no [data-density='default'] block.
export const densityLevels: Record<'compact' | 'comfortable', DensityScale> = {
  compact: {
    controlHeight: { sm: '1.75rem', md: '2.25rem', lg: '2.75rem' },
    fieldHeight: '3.25rem',
    rowHeight: '3rem',
  },
  comfortable: {
    controlHeight: { sm: '2.25rem', md: '3rem', lg: '3.5rem' },
    fieldHeight: '4rem',
    rowHeight: '3.75rem',
  },
};

export const primitives = { slate, violet, green, amber, red, fontFamily, radius, motion,
  borderWidth, borderWidthStrong, ...densityDefaults } as const;
```

Three properties this buys: `fieldHight: '3.25rem'` is now **two** errors (excess property *and* missing `fieldHeight`); `controlHeight: { sm, md, lrg }` fails the same way, so the nested family is covered too; and because the barrel **spreads** `densityDefaults`, the names in `primitives` and the names in `DensityScale` are the *same identifiers*, not two lists that agree by convention. `as const` on the object literal preserves the spread members' literal types, so `etc/tokens.api.md` is unchanged from the v2 draft.

**What the type still cannot catch** is a wrong *value* — `fieldHeight: '3.5rem'` under `compact` is the right name with no compaction. That needs a runtime backstop in the generator suite (§9.1).

**Each family must be a TOP-LEVEL key of the `primitives` barrel.** `flattenPrimitives` prefixes with the parent key at every level, so `controlHeight` must be a top-level *object* (`{sm,md,lg}`) and the other two top-level *scalars* (a scalar at prefix `''` yields the bare kebab name, `:41`). This is the `borderWidth` / `borderWidthStrong` precedent documented at `primitives.ts:101-105`.

`toKebab` (`generate-tokens.mjs:34-36`) was verified against all five keys: `controlHeight` → `control-height`, `fieldHeight` → `field-height`, `rowHeight` → `row-height`.

### 5.2 Scoped emission

Mirror the theme-scoping shape at `generate-tokens.mjs:78-81`. Reusing `flattenPrimitives` is what makes the **emission** mechanical; what makes the **names** safe is §5.1's typing — `densityLevels` is typed against the same object the barrel spreads, so a divergent name is a compile error. The generator suite additionally asserts every level moves every value (§9.1). *(v2 claimed "there is no second name list to drift" on the strength of `flattenPrimitives` alone; that was false — see §1.2 M4.)*

```js
// import at :22 becomes:
const { primitives, densityLevels } = await import('../packages/tokens/src/spec/primitives.ts');

// after :53 (const flatPrimitives = flattenPrimitives(primitives);), whose
// emitted :root array is :54-59
// `:root[...]` is (0,2,0) — NOT bare `[...]` (0,1,0), which would tie with the
// base :root block and be decided by source order. 'default' is not emitted: it
// is exactly what the base :root block already holds.
const densityCSS = Object.entries(densityLevels).map(([level, values]) => {
  const lines = Object.entries(flattenPrimitives(values))
    .map(([k, v]) => `  --${k}: ${v};\n`).join('');
  return `:root[data-density="${level}"] {\n${lines}}\n`;
}).join('\n');
```

`densityCSS` is appended to both `primitivesCSS` (the array at `:54-59`, joined at `:60`) and the `_primitives.scss` rebuild (`:95-101`). `theme-rhombus.css` picks the blocks up for free because `primitivesCSS` is embedded whole at `:85`. **`copy-token-assets.mjs` needs no change** — `primitives.css` and `_primitives.scss` are already in its allowlists (`:13-16`, `:28`), and `index.scss` already `@forward 'primitives'` (`:141`).

Note `_theme-rhombus.scss` does **not** embed primitives (`:138-143`) — anyone who `@use`s `theme-rhombus` alone (permitted by the `./scss/*` wildcard at `packages/tokens/package.json:44`) gets themes without density defaults. Document this; do not change the code.

### 5.3 The verify-tokens dedupe — mandatory

`tools/verify-tokens.mjs:26-29` scrapes published names with a line-anchored, **block-unaware** regex and no dedupe. Each of the five now appears once in `:root` and once per density block: **5 × 3 = 15 scraped entries for 5 unique names.** `--update-snapshot` (`:43`) writes that array verbatim, and the added/removed diff at `:86-89` is `Set`-based — so duplicates pass the guard **silently**, which is strictly worse than a crash because the frozen snapshot rots unnoticed.

```js
const publishedPrimitives = [
  ...new Set(
    [...primitivesCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)]
      .map((m) => m[1])
      .filter((n) => PUBLISHED_PRIMITIVE_PREFIXES.some((p) => n.startsWith(p))),
  ),
].sort();
```

This is semantically correct, not a workaround: the scrape's stated contract is *names*, append-only (`:15-21`), and the existing `.sort()` already implies order-insensitivity. It is also robust to any future scoped block (print, forced-colors). **Shrinking the public set from eight names to five does not remove the need** — it is a function of *any* repeated emission.

### 5.4 A second generated export for the docs page

`tokens.primitives` is a flat single-value map (`generate-tokens.mjs:52`, `:156`), so it can express the five *names* but only the default values. `generate-tokens.mjs` emits a second const alongside it:

```ts
// packages/tokens/src/generated/tokens.ts (generated)
export const tokens = {
  primitives: { /* …flat, unchanged… */ } as const,
  density: { compact: {…}, comfortable: {…} } as const,
  themes: { /* …unchanged… */ },
};
```

built from `Object.fromEntries(Object.entries(densityLevels).map(([lvl, v]) => [lvl, flattenPrimitives(v)]))`. `/density` then derives its rows:

```ts
const PRIM = tokens.primitives;
const DENSITY_PREFIXES = ['control-height-', 'field-height', 'row-height'];
const NAMES = Object.keys(PRIM).filter((k) => DENSITY_PREFIXES.some((p) => k.startsWith(p)));
const ROWS = NAMES.map((k) => ({
  name: `--${k}`,
  compact: tokens.density.compact[k as keyof typeof tokens.density.compact],
  default: PRIM[k as keyof typeof PRIM],
  comfortable: tokens.density.comfortable[k as keyof typeof tokens.density.comfortable],
}));
```

> **The `as keyof typeof` casts are mandatory, not stylistic.** `tsconfig.base.json:15` sets `"strict": true`, and `tokens.density.compact` is an `as const` object literal with no index signature — indexing it with a `string` is **TS7053**, which turns the `lint` job (`.github/workflows/ci.yml:37`) and the `build` job (`:123`) red. The repo's own precedent is `apps/showcase/src/app/pages/motion/motion-page.component.ts:15`, which writes `PRIM[k as keyof typeof PRIM]`. v1 cited that line while dropping the cast.

---

## 6. Scope

### 6.1 Tier 1 (PR 2) — the reason enterprises ask for this

`data-table` (+ its `density` input) · form-field family (×8) · selection-list · nav-list · button · segmented · chip + chip-group.

### 6.2 Tier 2 (PR 3) — ships in the following train

tabs · app-shell toolbar · pagination · accordion · stepper.

### 6.3 Explicitly out, with stated reasons

**Material's density API is a documented no-op for six of these, and the source proves it more strongly than the docs do.** A component with no `get-density-tokens()` function in its `_m3-*.scss` emits no density keys at *any* scale, so `mat.theme((density: -N))` provably cannot move it. Zero density functions in: `dialog/_m3-dialog.scss`, `menu/_m3-menu.scss`, `datepicker/_m3-datepicker.scss`, `card/_m3-card.scss`, `slider/_m3-slider.scss`, `snack-bar/_m3-snack-bar.scss`, plus tooltip, badge and divider.

| Component | Why out |
|---|---|
| **dialog** | No Material density tokens; a transient surface whose size is content-driven. RhombusKit's own SCSS is padding-only (`rhombus-dialog.component.scss:6`, `:31`). |
| **menu** | No Material density tokens. `rhombus-menu.component.scss:36` pins item height at 2.25rem/36px — a pointer target, and a menu is an overlay that does not compete for page rhythm. |
| **datepicker calendar** | No Material density tokens; a fixed 7-column grid of pointer targets Material deliberately never densified. **The date picker's *field* is Tier 1 via form-field — only the popup is excluded.** |
| **card** | No Material density tokens, and `rhombus-card.component.scss:49-52` already exposes a first-class `padding` input (none/sm/md/lg) that a global scale would fight. |
| **slider** | No Material density tokens; the thumb is a drag target governed by SC 2.5.7 as well as 2.5.8, and RhombusKit's SCSS declares no fixed geometry. |
| **toast** | snack-bar has no Material density tokens; transient overlay, no page rhythm. |
| **avatar** | Already consumer-sized via `height: var(--rhombus-avatar-size, 2.5rem)` (`rhombus-avatar.component.scss:13`). Size is semantic (xl in a header, sm in a cell), not rhythm. |
| **tag** | Has its own two-step padding scale with `line-height: 1` (`rhombus-tag.component.scss:13,24,29`). A static label, not a control, with no pointer target. **Deliberate divergence from chip**, which *is* Tier 1 — chip is interactive and Material-backed; tag is neither. |
| **stat / skeleton / sheet / carousel / breadcrumbs / alert** | Display, overlay or inline-flow surfaces. **Skeleton is the important one:** its boxes are sized from `--rhombus-skeleton-h/-w` (`rhombus-skeleton.component.scss:49,57,64`) so a consumer matches them to the real content. Moving skeletons independently would produce a layout shift on load — the exact failure skeletons exist to prevent. |
| **empty-state** | `rhombus-empty-state.component.scss:14` is `padding: 40px 24px`, generous **by design**. The only component where density is not merely inapplicable but actively counterproductive. |
| **reorder-list** | Excluded, stated rather than silent. It is the closest thing to a list in the exclusion set (`rhombus-reorder-list.component.scss:11,20,45`), so a user setting compact may reasonably expect it to track. Its 2rem drag handle is a **drag** target (SC 2.5.7) and must not shrink. Revisit in a later train if asked for. |
| **bottom-nav** | Excluded, stated rather than by omission. Its `min-height: 44px` (`rhombus-bottom-nav.component.scss:31`) is the iOS HIG touch floor, not a rhythm value, and it is fixed viewport chrome rather than content — platform chrome conventionally does not rescale with in-app density. Its height is also partly device-determined (`padding-bottom: env(safe-area-inset-bottom, 0)`, `:8`). It does **not** shrink at compact, which keeps it safely above the SC 2.5.8 floor, and it does **not** grow at comfortable, which is a known and accepted visual asymmetry. Revisit only if a comfortable-mode design review finds the mismatch objectionable. |

**Font-size is out of scope.** Verified across every `get-density-tokens()` in v21: Material's density changes only `*-container-height`, `*-state-layer-size`, `*-vertical-padding`, `*-touch-target-display` and `*-start/end-space`. **Zero font sizes.** Copying that stance keeps us clear of the bridge's hard-coded M3 typescale (`_bridge.scss:82-137`) and is what makes §3.3's orthogonality clean.

---

## 7. Per-component implementation briefs

Every declaration below was read from shipped source at the cited `file:line`. Each carries an **R2 classification**:

- **substitute-var** — the default value *provably equals* what ships today, proof stated inline.
- **per-level-override-only** — the literal stays untouched; only compact/comfortable get rules. Default emits nothing.
- **out-of-scope** — stated with a reason, so no implementer reaches for it.

> **Structural headline.** RhombusKit owns **zero** geometry in data-table, the form-field family and selection-list. A repo-wide grep across `packages/` and `apps/` for `container-height|container-vertical-padding|row-item-container|header-container-height|footer-container-height|one-line-container|two-line-container|leading-icon-start-space|paginator-container-size` returns **zero hits outside `node_modules`**. For those three families "substitute a var only where the default equals the shipped literal" is vacuous — there are no literals — so per-level-override-only is the *only* option, and the byte-identical invariant holds **by construction** provided the generator emits nothing at default.

### 7.1 Button — Tier 1 · anchor: already present

| Declaration | Shipped | Owner | Plan |
|---|---|---|---|
| `min-height` sm/md/lg (`:36-38`) | `2rem` / `2.5rem` / `3rem` | rhombuskit-scss | **substitute-var** → `var(--control-height-sm\|md\|lg, …)`. Proof: defaults are 2/2.5/3rem, identical token-for-token, and the `var()` fallback is the same literal. |
| icon-button `width` + `height` (`:50-52`) | `2rem` / `2.5rem` / `3rem` | rhombuskit-scss | **substitute-var**, both axes, same three primitives. Substituting both is what keeps the square square at every level, and means the icon-button preset needs no density rule of its own. |
| `padding` sm/md/lg (`:36-38`) | `0.25rem 0.75rem` / `0.5rem 1rem` / `0.625rem 1.5rem` | rhombuskit-scss | **per-level-override-only** — see the ramp below. Even the md pair (which happens to equal v1's proposed default) stays a literal, or the ramp flattens against its siblings. |
| `font-size` sm/md/lg (`:36-38`) | `0.8125` / `0.875` / `1rem` | rhombuskit-scss | **out-of-scope**, deliberately. The glyph is `1.25em` and the label gap `0.5em` *of this size* (`:20,:24`), so ramping type silently rescales every button icon and invalidates the box assertion documented at `:14-16`. |
| `height: auto` (`:36-38`) | `auto` | rhombuskit-scss | **out-of-scope** — structural. Releases Material's fixed `.mdc-button` height so `min-height` can bind. Must survive verbatim at every level. |
| icon-button `min-width` + `padding` (`:49`) | `0` / `0` | rhombuskit-scss | **out-of-scope** — structural, and a **hard constraint**: this rule is (0,2,0), so every density padding rule must carry `:not(.rhombus-button--icon-button)` or icon-only buttons re-inflate at compact. |
| `.mdc-button__label` gap (`:20`), `.mat-icon` sizing (`:24-26`) | `0.5em`, `1.25em`/`1em` | rhombuskit-scss | **out-of-scope** — em-relative, already self-scaling. Tokenizing would replace a self-scaling value with a fixed one. The golden baseline can now *see* this element (§9.2's filter widens to `mdc-`), so the ruling is verifiable rather than merely stated. |
| `.mat-mdc-button-touch-target` height — five Material appearance tokens | **48px** (`--mat-button-{text,filled,outlined,protected,tonal}-touch-target-size`; `button/_m3-button.scss:25,32,38,45,51`) | material-token | **per-level-override-only, COMPACT ONLY** — **Rule T** (§8.3). Shrinking `min-height` to 28/36/44 without rebinding leaves **10/6/2px of overhang per side**, which is 2px/side *worse than `main`* at every size. |

**The padding ramp at full precision, without a frozen token.** Appended to `rhombus-button.component.scss` at top level, after the `.rhombus-button` block:

```scss
// ── Density: the sm/md/lg padding ramp (INTERNAL) ────────────────────────────
// Shipped padding is a three-step ramp: inline 12/16/24px, block 4/8/10px. One
// scalar cannot express three pairs, so density does NOT tokenize button padding
// and no --control-pad-* name is frozen. The default rendering above keeps its
// literals untouched, and each NON-default level is an explicit rule.
//
// Selector `[data-density='…'] .rhombus-button--sm.mdc-button:not(…)` is (0,4,0),
// clearing the default rule's (0,2,0) and Material's .mdc-button (0,1,0) by
// specificity, so it is source-order independent (same reasoning as :30-35). It
// is ANCESTOR-matched, not :root-anchored — §2.2's :root form is needed only for
// the TOKEN block, where the competitor sits on :root itself. Here the
// competitor is a class rule, and the ancestor form additionally fires inside a
// scoped subtree, which a :root-anchored rule never could.
//
// :not(.rhombus-button--icon-button) is MANDATORY — the icon-button preset zeroes
// padding at (0,2,0) (:49). Icon-buttons need no density rule at all: their
// square is already var(--control-height-*), which the level blocks move for free.

$-rhombus-button-density-padding: (
  compact: (
    sm: 0.125rem 0.625rem,   //  2px / 10px
    md: 0.375rem 0.875rem,   //  6px / 14px
    lg: 0.5rem   1.25rem,    //  8px / 20px
  ),
  comfortable: (
    sm: 0.375rem 1rem,       //  6px / 16px
    md: 0.75rem  1.25rem,    // 12px / 20px
    lg: 0.875rem 2rem,       // 14px / 32px
  ),
);

@each $level, $sizes in $-rhombus-button-density-padding {
  @each $size, $pad in $sizes {
    [data-density='#{$level}']
      .rhombus-button--#{$size}.mdc-button:not(.rhombus-button--icon-button) {
      padding: $pad;
    }
  }
}
```

The map is a private SCSS variable (leading hyphen = not `@forward`-able), compiled away entirely: it emits six flat rules and **zero** custom properties, so it is invisible to `/density`, Figma, MCP and `verify-tokens`. That is exactly what "internal plumbing" means. The inline ramp is preserved at full precision — 10/14/20 at compact, 16/20/32 at comfortable.

*Rejected variant:* private custom properties (`padding: var(--_rk-btn-pad-sm, 0.25rem 0.75rem)`). Equally R2-safe, and it would cascade into a scoped subtree — but it puts three private names into the computed style of every button, one devtools glance from being treated as public API. The ancestor selector already handles scoping.

**The touch-target rebind (Rule T, §8.3).** Appended immediately after the padding-ramp block, in the same file:

```scss
// ── Density: touch-target rebinds (INTERNAL — Rule T, §8.3) ──────────────────
// Material renders <span class="mat-mdc-button-touch-target"> on every matButton
// (fesm2022/button.mjs), styled per appearance as:
//   position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%);
//   height: var(--mat-button-<appearance>-touch-target-size, 48px);
// Being absolute and centred it only ADDS pointer area above and below the
// button — the button box itself is always clickable — so binding the token to
// the button's own box removes nothing reachable. It removes the OVERHANG, which
// is what makes two stacked compact buttons' targets overlap so a click resolves
// by paint order to the wrong button.
//
// FIVE names because Material has no shared one (APPEARANCE_CLASSES in
// fesm2022/button.mjs; tokens at button/_m3-button.scss:25,32,38,45,51).
// <rhombus-button> emits text|filled|outlined (rhombus-button.component.ts:29);
// tonal and elevated are accepted per its docstring at :25, so all five are
// declared. Five declarations, zero cost.
//
// NOT --mat-icon-button-touch-target-size: icon-only mode is a RhombusKit class
// on a [matButton], never matIconButton, so it keeps its appearance token and
// the height-only (left:0/right:0) target — no horizontal overhang exists.
//
// SCOPED to .rhombus-button--<size>, never :root (Rule T2): these names are also
// read by every bare matButton in a consumer app, whose height density does not
// move. A :root rebind would shrink their targets 48 -> 28px undocumented.
//
// COMPACT ONLY (Rule T1). comfortable sm is 36px — under 48, but ABOVE default's
// 32px, so its overhang (6px/side) is already better than main's (8px/side).
// Default-level overhang is pre-existing on main and deliberately NOT fixed here:
// that is a rendered-geometry change at default density and ships in its own
// MINOR, same disposition as §7.9's app-shell literal and §8.5's segmented.
//
// NEVER emit --mat-button-*-touch-target-display: `none` deletes the span (§8.2).

$-rhombus-button-density-target: (
  compact: (sm: 1.75rem, md: 2.25rem, lg: 2.75rem),   // 28 / 36 / 44px
);

@each $level, $sizes in $-rhombus-button-density-target {
  @each $size, $h in $sizes {
    [data-density='#{$level}'] .rhombus-button--#{$size} {
      --mat-button-text-touch-target-size: #{$h};
      --mat-button-filled-touch-target-size: #{$h};
      --mat-button-outlined-touch-target-size: #{$h};
      --mat-button-protected-touch-target-size: #{$h};
      --mat-button-tonal-touch-target-size: #{$h};
    }
  }
}
```

Three flat rules, five custom properties scoped to a component class — invisible to `/density`, Figma, MCP and `verify-tokens`, exactly like the padding map. Ancestor-matched rather than `:root`-anchored, so it also fires inside a scoped `[data-density]` subtree (§2.2).

**Why the rebind is mandatory, not belt-and-braces.** Minimum vertical gap two adjacent buttons need for their targets not to overlap:

| size | compact box | overhang/side, unfixed | min stacked gap, unfixed | with Rule T |
|---|---|---|---|---|
| `sm` | 28 | 10 | **20px** | 0 |
| `md` | 36 | 6 | **12px** | 0 |
| `lg` | 44 | 2 | **4px** | 0 |

**The spec provides no such gap and cannot.** `--stack-gap` was deleted in v2 (§4.2), so no primitive expresses a stacking gap at all; the only gaps density touches are chip-group (0.5rem → compact 0.375rem = **6px**, short of `sm`'s 20px and `md`'s 12px) and the app-shell toolbar's 4px, which §7.9 leaves out of scope. There is no gap-based mitigation to fall back on.

**Note on the horizontal axis.** `.mdc-button`'s `min-width: 64px` survives at compact, so text buttons keep a ≥64px pointer target at every level — but that is the **horizontal** axis only. The touch target is `left: 0; right: 0`, exactly the box width, so horizontally adjacent buttons never overlap. The entire problem is vertical.

### 7.2 Form-field family (×8) — Tier 1 · no anchor · **four keys, not one**

`packages/core/scss/_form-field.scss` declares **no** heights, paddings, gaps or min-heights across its 49 lines — only `width: 100%` (`:10`), the three font-size variants (`:26-28`) and colour rebinds. Every rendered pixel comes from Material defaults.

| Token | Shipped | Compact | Comfortable | Source |
|---|---|---|---|---|
| `container-height` | 56px | **52** | **64** | `form-field/_m3-form-field.scss:129`, ramp (56,52,48,44,40,36) |
| `container-vertical-padding` | 16px | **14** | **20** | `:131`, ramp (16,14,12,10,8,6) |
| `filled-with-label-container-padding-top` | 24px | **22** | **32** | `:132-133`, ramp (24,22,12,10,8,6) |
| `filled-with-label-container-padding-bottom` | 8px | **6** | **8** | `:134-135`, ramp (8,6,12,10,8,6) |

`container-height` is **substitute-var** via `var(--field-height, 3.5rem)` in the bridge's existing `mat.form-field-overrides()` call (`_bridge.scss:168-180`) — default 56 == shipped 56. The other three are **per-level-override-only** and **internal** (`_density.scss`), so no fifth frozen name is created.

**Why the padding is mandatory — the arithmetic.** Material's infix is `min-height: var(--mat-form-field-container-height, 56px)` with `box-sizing: border-box`, so rendered height = `max(H, padTop + padBottom + L)`. Two padding regimes are resolved by *source order* in `fesm2022/_form-field-chunk.mjs`: offset 64978 sets the filled-with-label pair (24/8), then offset 65359 overrides it for `.mdc-text-field--outlined .mat-mdc-form-field-infix, .mdc-text-field--no-label .mat-mdc-form-field-infix` with the symmetric `container-vertical-padding` (16/16). Both total 32px, which is why the two appearances render identically today.

`L` is **not** 24px here. Material declares `line-height: var(--mat-form-field-container-text-line-height, var(--mat-sys-body-large-line-height))`, and the bridge emits `label-*`, `body-medium` and `title-medium` but **never** `body-large` (`_bridge.scss:107-137`); the showcase calls `material-bridge()` and never `mat.theme()` (`apps/showcase/src/styles.scss:13`). The declaration is therefore invalid-at-computed-value-time and `line-height` inherits the unitless `1.5` from `packages/tokens/src/styles/_reset.scss:20`. So `L` = 18px (`--sm`), 21px (`--md`), 24px (`--lg`).

Measured in headless Chromium against the real box, at a 16px root:

| container-height | Material's paired padding | **height moved alone** | **height + padding in lockstep** |
|---|---|---|---|
| 56 (default) | 16 | 56 | 56 |
| **52 (−1, our compact)** | 14 | **52** ✅ | **52** ✅ |
| 48 (−2, v1's compact) | 12 | **50** ❌ | 48 ✅ |
| 44 (−3) | 10 | **50** ❌ | 44 ✅ |
| 40 (−4) | 8 | **50** ❌ | 40 ✅ |

**The content floor is a single number, and slack is zero (D7, settled — then corrected by measurement).**

`L` is **24px at every size**, and the floor is `padTop + padBottom + L`:

| Padding sum | H | content floor | slack |
|---|---|---|---|
| compact **28** | 52 | 52 | **0** |
| default **32** | 56 | 56 | **0** |
| comfortable **40** | 64 | 64 | **0** |

**The form field is exactly content-sized at every level, so `min-height` never binds and lockstep padding is not merely advisable — it is the only thing that moves the box.** That is a stronger proof than the per-size version this replaces, and it is measured rather than derived.

**Why `L` is constant, and the shipped bug behind it.** Two earlier drafts assumed `L = 1.5 × font-size` with the `size` classes supplying 12/14/16px (`_form-field.scss:26-28`), giving `L` = 18/21/24 and slack 6/3/0. Measured in a browser, all three variants are **identical**: wrapper font 16px, input font 16px, line-height 24px, infix 56px. The `size` input is **inert** — `.rhombus-form-field--sm` (specificity 0,1,0) and `.mat-mdc-form-field` (also 0,1,0) both set `font-size`, and Material injects its component CSS at runtime *after* `styles.css`, so Material wins on source order.

This is the **same cascade trap the button hit** — its `size` input was silently dead in v1.0 until the variants were anchored on `.mdc-button` for (0,2,0). Form-field never received the equivalent fix. It is a real shipped bug affecting eight components, **and it is out of scope here**: fixing it changes rendering for every consumer using `size` today, which would violate the one invariant PR 1 exists to prove. Tracked as a standalone change.

**Consequence for D-E.** "Density owns the box, `size` owns the type" describes the intended end state, not the current one — today `size` owns nothing. The non-breaking guarantee is unaffected (an inert input stays inert), but the division of labour only becomes true once the cascade fix lands. State it that way rather than implying it already holds.

*(This supersedes both v2's "the content floor is 50px, so 52 rescues it by 2px" — true only at `sm` — and v3.1's 6/3/0 table, which was right to reject a single number but derived `L` from a `size` input that does not work.)* v1's 48px anchor was a genuine no-op downward. The remaining margin is thin at every size: under the SC 1.4.12 text-spacing stylesheet with a span-based trigger (`mat-select`, `mat-date-picker` — not every form-field child is an `<input>`), measured:

| case | rendered |
|---|---|
| normal spacing, span, h52 / pad16 | 52 ✅ |
| **SC 1.4.12, span, h52 / pad16 (height alone)** | **56** ❌ |
| **SC 1.4.12, span, h52 / pad14 (lockstep)** | **52** ✅ |

**Therefore the bridge moves `container-vertical-padding` in lockstep with `container-height`** — not because 52px fails today, but because its 2px of headroom is consumed entirely by a user stylesheet SC 1.4.12 explicitly requires to work, and by any app with a base font above 16px.

**Label centring — the second half, and why lockstep resolves it for free.** The resting label is `top: calc(H/2)` with `translateY(-50%)`; the text centre sits at `padTop + L/2` (the flex is `align-items: baseline`, so `min-height` slack falls *below* the first line box). The label is centred exactly when `H = padTop + padBottom + L`. Residual offset = `(H − padTop − padBottom − L) / 2`:

- default: `(56 − 32 − L)/2 = (24 − L)/2`
- compact: `(52 − 28 − L)/2 = (24 − L)/2`
- comfortable: `(64 − 40 − L)/2 = (24 − L)/2`

**Identical at all three levels.** At `--md` that is 1.5px low at every level — compact introduces **zero** new misalignment. Ship the height alone and the offset jumps to `(48 − 32 − 21)/2 = −2.5px` in the opposite direction while the box does not even shrink.

**Comfortable must be (64, 20, 28, 12), not (64, 16, 24, 8) and not (64, 20, 32, 8).** Comfortable is authored, so the centring invariant is the thing to preserve: outlined needs 20/20 (`20+20+24 = 64`); keeping 16/16 gives offset `(64−32−24)/2 = 4px`, a visible drop.

**The filled pair is 28/12 — forced, not chosen (D6, settled).** The resting label is anchored to the *container height*, `.mat-mdc-floating-label { top: calc(var(--mat-form-field-container-height, 56px) / 2) }`, so the residual offset is `H/2 − padTop − L/2`. Holding that constant across levels therefore requires only:

> **Centring invariant: `H/2 − padTop = 4px` at every level.**

This form is **size-independent** — `L` cancels — so it holds simultaneously at `sm`, `md` and `lg`, which the earlier per-size arithmetic did not:

| Level | H/2 | filled padTop | `H/2 − padTop` | |
|---|---|---|---|---|
| compact | 26 | 22 | **4** | ✓ |
| default *(shipped)* | 28 | 24 | **4** | ✓ |
| comfortable — **28/12** | 32 | **28** | **4** | ✓ |
| ~~comfortable — 32/8~~ | 32 | 32 | 0 | ✗ 4px label drop |

`padTop = 28` is the only value that satisfies it. The rejected 32/8 optimised the 4:1 *headroom ratio*, which is the wrong quantity — only `padTop` moves the label. The padding **sum stays 40** either way, so §7.2's content-floor arithmetic is untouched: D6 and D7 are independent.

**The −2 cliff is safe at compact, by two independent margins.** `form-field-filled-label-display` flips to `none` at index 3 = scale −2 = 48px (`_m3-form-field.scss:130`). Our compact is 52px = index 2 = `block`. Additionally we never emit that token at all.

**Out of scope, stated:**
- **Floated-label transform.** `translateY(-34.75px) scale(0.75)` is a hard px literal, not derived from `container-height`. Because the resting position is `H/2`, float travel shortens 2px at compact and lengthens 4px at comfortable. The label still lands in the notch at every level because the notch is positioned by the outline, not the label. Upstream-validated at −1; **comfortable needs a visual check in PR 2**.
- **Subscript (hint/error) block.** `0.75rem` pinned by RhombusKit at `_bridge.scss:179` with the rationale at `:176-178`. Material's density ramp (`:126-137`) contains **no** subscript token, so there is no upstream-validated ramp to follow, and shrinking a text block trades a legibility floor for ~4px.
- **The seven other consumers** (input, textarea, select, autocomplete, date-picker, date-range-picker, tag-input) declare **zero** form-field geometry between them — verified by grep for `container-height|vertical-padding|min-height|height:` across all eight consumer SCSS files. **Zero per-component SCSS work.** This is the one v1 claim that survives whole: a single bridge change does reach seven consumers at once. Only the *count of keys* was wrong.
- **number-input** (the 8th consumer) — stepper button `1.75rem` square and `18px` glyph (`rhombus-number-input.component.scss:34-35`, `:70-71`). **Out of scope**, resolving v1's §7.2-vs-§8.3 contradiction in favour of "zero SCSS work". 28px is already below the 40px control-md anchor and only 4px above the SC 2.5.8 floor; binding it to `--control-height-sm` would land it at 28px anyway (no change) and any smaller ramp breaches the floor. It is a fixed square glyph affordance, not a density-tracking control. **Stated explicitly so no implementer rewires it.**
- **tag-input** chip remove control (`rhombus-tag-input.component.scss:12-25`, `1rem` on the inner `mat-icon` at `:21`) — **out of scope because it is density-invariant.** *(v2 said "governed by the chip's touch target"; the v3 review said it "tracks the chip box, 32→28px". Both are wrong — see §1.2 M7.)* Chips render **no** touch-target element at all (`grep -c touch-target node_modules/@angular/material/fesm2022/chips.mjs` → 0). `[matChipRemove]`'s host `classAttribute` is `mat-mdc-chip-remove mat-mdc-chip-trailing-icon mat-focus-indicator mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing` — **no `mdc-evolution-chip__action`** — so the `.mdc-evolution-chip__action { height: 100% }` rule never reaches it; `MatChip` projects it straight into `.mdc-evolution-chip__cell--trailing`. Its box comes from `.mat-mdc-standard-chip .mdc-evolution-chip__icon--trailing { height: 18px; width: 18px }` with `.mat-mdc-chip-trailing-icon { box-sizing: content-box }` plus UA `<button>` padding, and RhombusKit sets no width/height on the button. **18px is a hard literal reading no `--mat-chip-*` token, so the delta from this epic is 0px at every level.** Whether the rendered box (18px + UA padding + the `::after` state layer's `top:-3px; bottom:-3px; left:5px; right:5px`) clears 24×24 is a **pre-existing, density-independent** question: measure it in PR 2's Playwright pass and file any failure as a standalone a11y bug, per §8.5's precedent — do not fix it under a "non-breaking density" headline.
  - For contrast, the chip's **primary** action *does* track the chip box: `.mdc-evolution-chip__action--primary` is `height: 100%` of `.mat-mdc-standard-chip`, so 32 default / 28 compact / 36 comfortable, full chip width. That is the number the review meant, on the right element.
- **autocomplete** `height: 1px` (`:52`) — a visually-hidden element. Listed only to close the grep.

**Cross-component coupling:** tag-input renders `<mat-chip-row rhombusChip>` (`rhombus-tag-input.component.ts:85-86,144`), so §7.7's chip rebind reaches its pills. At compact the field moves 56→52 while its chips move 32→28. Consistent, but authored in two different files — check the pair together in the Playwright pass.

### 7.3 Data-table — Tier 1 · scoped rebinds `--mat-*` directly

| Declaration | Shipped | Owner | Plan |
|---|---|---|---|
| `--mat-table-row-item-container-height` | **52px** (`table/_m3-table.scss:50`, ramp 52/48/44/40/36) | material-token | **substitute-var** → `var(--row-height, 3.25rem)` in `mat.table-overrides()`. Default 52 == 52. |
| `--mat-table-header-container-height` | **56px** (`:48`, ramp 56/52/48/44/40) | material-token | **per-level-override-only** — an *independent* ramp with a different default. compact 52 / comfortable 64. **Never bind to `--row-height`.** |
| `--mat-table-footer-container-height` | **52px** (`:49`, ramp 52/48/44/40/36) | material-token | **per-level-override-only** — a third independent ramp. compact 48 / comfortable 60. |
| cell `padding` (th/td) | `0 16px` | material-mdc-class | **out-of-scope.** No backing token exists (`fesm2022/table.mjs` hardcodes `.mdc-data-table__cell, .mdc-data-table__header-cell { padding: 0 16px }`), so reaching it needs a `.mdc-data-table__cell` selector, which the repo forbids (`packages/core/scss/_form-field.scss:6-7`; `rhombus-data-table.component.scss:20-21` permits only `.mat-sort-*` structural classes). Material's own ramp never moves it either. The 24px first/last-of-type rules do **not** apply — they use the element selectors `mat-cell`/`mat-header-cell` while this component renders `<table mat-table>` with `<th mat-header-cell>`/`<td mat-cell>` (`rhombus-data-table.component.ts:61-78`). |
| sort-arrow `margin-inline-start` | `10px` (`rhombus-data-table.component.scss:22-24`) | rhombuskit-scss | **out-of-scope** — a deliberate widening from Material's 6px, with documented rationale at `:16-21`. Not a density axis. |
| sort-header container height | none (flex, inherits the header row) | material-mdc-class | **out-of-scope** — derived from `header-container-height`, already covered. |
| `__loading` / `__empty` padding | `3rem` / `3rem 1.5rem` (`:102`, `:107`) | rhombuskit-scss | **out-of-scope** — one-off centred panels, not row rhythm. |
| `--mat-paginator-container-size` (embedded) | 56px (`paginator/_m3-paginator.scss:40`) | material-token | **per-level-override-only.** Scoped table steps must rebind it on `.rhombus-data-table__paginator` directly (§2.2). |
| projected `<mat-checkbox>` / `<mat-radio-button>` touch target | **48px** (`--mat-checkbox-touch-target-size`, `checkbox/_m3-checkbox.scss:23`; `--mat-radio-touch-target-size`, `radio/_m3-radio.scss:19`) | material-token | **per-level-override-only, `dense` ONLY** — **Rule T** (§8.3). comfortable 60 / default 52 / compact 48 all sit at or above the 48px target with zero overhang; only the 36px `dense` row leaves an overhang. |

**The scoped SCSS**, appended to `rhombus-data-table.component.scss`:

```scss
// --- Table-local density -----------------------------------------------------
// Bound to the inner .rhombus-data-table div — the component has no host block
// (rhombus-data-table.component.ts:45-154) and is ViewEncapsulation.None (:56),
// so neither a host binding nor :host would match this selector.
//
// RULE (§2.2): every step rebinds the --mat-* token DIRECTLY. Re-declaring
// --row-height would be inert — the bridge substitutes var(--row-height) at :root
// and only the resolved value inherits.
//
// Header / footer / row are three INDEPENDENT Material ramps with three different
// defaults (56 / 52 / 52). Never collapse them to one value.
//
// Checkbox and radio touch targets are absolutely-positioned 48px squares centred
// on the control. Below a 48px row they overhang, so adjacent rows' targets
// OVERLAP and a click in the overlap band resolves by paint order to the WRONG
// row. Only the `dense` step (36px) is below 48px, so per Rule T (§8.3) only
// `dense` needs the rebind; the other three pin it for explicitness, at
// Material's own default value. 36px is well clear of the 24px SC 2.5.8 floor.
// This bug is live in upstream Material at density -2 and below; we fix it here.
//
// RhombusKit's own data-table renders NO checkbox — verified: zero mat-checkbox /
// mat-radio references across packages/core/src/lib/data-table/, and
// rhombus-data-table.component.ts:48-54 imports only MatTable/Sort/Paginator/
// ProgressSpinner modules. The case being handled is a CONSUMER projecting a
// <mat-checkbox> into a cell template, which is the documented selection pattern.
// Scoped to this table's own attribute — never :root (Rule T2) — and because
// `dense` is table-local with no global level, no :root form of it can exist.

.rhombus-data-table {
  // `default` MUST emit a real block, not be a no-op: it is how one table escapes
  // an app-wide provideRhombusDensity('compact'). These are Material's scale-0
  // literals, restated so they win over the inherited :root[data-density] block.
  // This does NOT violate the byte-identical invariant — the block matches
  // nothing unless the input is explicitly set.
  &[data-density='default'] {
    --mat-table-header-container-height:   3.5rem;  // 56px
    --mat-table-footer-container-height:   3.25rem; // 52px
    --mat-table-row-item-container-height: 3.25rem; // 52px
    --mat-checkbox-touch-target-size:      3rem;    // 48px — Material default
    --mat-radio-touch-target-size:         3rem;
  }

  &[data-density='comfortable'] {
    --mat-table-header-container-height:   4rem;    // 64px
    --mat-table-footer-container-height:   3.75rem; // 60px
    --mat-table-row-item-container-height: 3.75rem; // 60px
    --mat-checkbox-touch-target-size:      3rem;
    --mat-radio-touch-target-size:         3rem;
  }

  // TRUE Material -1.
  &[data-density='compact'] {
    --mat-table-header-container-height:   3.25rem; // 52px
    --mat-table-footer-container-height:   3rem;    // 48px
    --mat-table-row-item-container-height: 3rem;    // 48px
    // 48px row = 48px target: flush, zero overhang. Pinned anyway so the value is
    // explicit rather than inherited by luck.
    --mat-checkbox-touch-target-size:      3rem;
    --mat-radio-touch-target-size:         3rem;
  }

  // Table-only. TRUE Material -4 — the clamp floor of all three ramps
  // (table/_m3-table.scss:44 clamps at -4). The header ramp (:48) is
  // (56,52,48,44,40) and floors at 40px; the footer (:49) and row (:50) ramps
  // are (52,48,44,40,36) and floor at 36px. So the header is 40px, NOT 36px —
  // v2 set 2.25rem here while citing "-4, its own clamp floor", which was
  // internally inconsistent (§1.2 M6). 40px also preserves a property Material
  // holds at EVERY index of its ramp: the header is 4px taller than the row.
  // Collapsing them would make `dense` the only level where header == row,
  // deleting the visual anchor exactly where the grid is tightest.
  &[data-density='dense'] {
    --mat-table-header-container-height:   2.5rem;  // 40px  <-- Material -4 header
    --mat-table-footer-container-height:   2.25rem; // 36px
    --mat-table-row-item-container-height: 2.25rem; // 36px
    // Rule T: pinned to the ROW height, not the header's — the checkboxes live
    // in rows. 36px row vs a 48px target = 6px overhang/side = 12px of
    // cross-row overlap without this.
    --mat-checkbox-touch-target-size:      2.25rem;
    --mat-radio-touch-target-size:         2.25rem;
  }
}

.rhombus-data-table[data-density='compact'] .rhombus-data-table__paginator {
  --mat-paginator-container-size: 3.25rem; // 52px
}
.rhombus-data-table[data-density='dense'] .rhombus-data-table__paginator {
  --mat-paginator-container-size: 3rem;    // 48px
}
```

**Measured (headless Chromium, global density = `compact`):** unscoped row 48px · `density="default"` row **52px** (the escape works) · `density="default"` header 56px · `density="dense"` row 36px · `density="dense"` **header 40px** · `density="dense"` projected checkbox touch target 36px.

> **Re-measure required.** The `dense` header value above is the corrected 40px (§1.2 M6); v2 recorded 36px. **Sequence this edit before the geometry baseline is first captured** (§9.2) — otherwise `dense`'s header lands in the committed golden at 36px and the correction reads as a regression on the next diff.

**Token names verified:** `checkbox/_m3-checkbox.scss:23` → `--mat-checkbox-touch-target-size`; `radio/_m3-radio.scss:19` → `--mat-radio-touch-target-size`. Consuming rule in `fesm2022/checkbox.mjs` confirms the absolute positioning that causes the overlap.

**Honest note on hard `height`.** `fesm2022/table.mjs` sets `.mat-mdc-row { height: var(--mat-table-row-item-container-height, 52px) }` — a hard `height`, not `min-height`. RhombusKit cannot convert it without a `.mat-mdc-*` selector, so the SC 1.4.12 exposure (a user stylesheet forcing line-height 1.5 clips row content rather than growing the row) **exists today at 52px** and compact makes it marginally worse at 48px. It is not new, and it is not a claimed advantage over `mat.density` (§11.3).

**Bonus behaviour, worth a test.** Because the button's density rules are ancestor-matched (§7.1), a `<div class="rhombus-data-table" data-density="compact">` **does** compact the buttons inside it — something a `:root`-anchored rule could never deliver. At `dense` the table's toolbar buttons would compact to their `dense`-adjacent size too. **Decided: acceptable and desirable**; assert it rather than leaving it undiscovered.

### 7.4 Selection list — Tier 1 · two independent ramps driven, a third deliberately not

`rhombus-selection-list.component.scss` declares **no** heights and **no** item padding — only colour rebinds, font-family, the group label's typography/margin, and a focus ring (`outline: 2px`, `outline-offset: -2px`). Same structural result as the form-field family: per-level-override-only is the only option and default is byte-identical by construction.

| Token | Shipped | compact | comfortable | Source |
|---|---|---|---|---|
| `list-item-one-line-container-height` | **48px** | **44** | **52** | `list/_m3-list.scss:86-87`, ramp (48,44,40,36,32,24) |
| `list-item-two-line-container-height` | **64px** | **60** | **68** | `:88-89`, ramp (64,60,56,52,48,48) |
| ~~`list-item-three-line-container-height`~~ | **88px** | *(not set)* | *(not set)* | `:90-91`, ramp (88,84,80,76,72,56) — **dropped, see below** |
| `list-item-leading-icon-start-space` | 16px | **12** | **20** | `:84`, ramp (16,12,8,4,4,4) |
| `list-item-leading-icon-end-space` | 16px | **12** | **20** | `:85`, same rule, `margin-inline-end` |

Compact is Material's index-2 column verbatim — upstream-validated. Comfortable is a uniform +4 from default on the **two driven** heights (one-line and two-line), so the two-line row keeps its 16px lead over one-line at every level. Start/end space must move in lockstep or the icon decentres in its gutter.

**The three-line lead is *not* preserved, and that is accepted.** With three-line pinned at Material's 88px (M5, §1.2), its lead over two-line is 28px at compact, 24px at default and 20px at comfortable rather than a constant 24px. The visual ratio holds exactly at default — the one level density does not create — and drifts ±4px either side. This is the cost of keeping an unmeasurable value out of scope; it is invisible unless a consumer renders one-, two- and three-line options adjacent at a non-default level. *(v3 correction: v2 claimed the ratio was preserved at every level, which M5 had already falsified.)*

**Two-line is live**, which is why v1's single `--row-height` was a real default-density regression: `rhombus-selection-list.component.ts:77` emits `matListItemTitle` and `:78-82` conditionally emits `matListItemLine` for `opt.description` (repeated at `:109-114` and `:142-147` for the other two selection modes). Material applies `.mdc-list-item--with-two-lines` whenever that line is present, pulling the 64px token. Feeding all three from one 48px value collapses every described row by 16px **with no opt-in**.

**Three-line is DROPPED, not set on faith.** It is unreachable through this component's own API — `rhombus-selection-list.component.ts:77-82` emits at most `matListItemTitle` plus one `matListItemLine` — so the showcase cannot exercise it and the golden baseline cannot see it. v2 set it "for consistency" while conceding it renders nowhere; that is the exact provenance of v1's 88→48px defect: a value shipped, verified by nothing (§1.2 M5). The two alternatives are worse. *Add a showcase example*: demonstrating three-line requires shipping a raw `<mat-list>` demo on a docs site whose entire pitch is that you never write `mat-*`. *Accept and document*: a token nothing measures.

Dropping it costs nothing real. The only beneficiary is a consumer bypassing the library for raw `mat-list`, and their fix is one line in their own app:

```scss
:root[data-density='compact'] { @include mat.list-overrides((list-item-three-line-container-height: 5.25rem)); } /* 84px */
```

That is documented next to §11.5's coexistence guidance, where a direct-`mat-list` consumer already is. *(If the team elects to keep the token instead, it must be gated at the data layer — a case in `tools/generate-tokens.test.mjs` that compiles `_density.scss` and asserts 84px/92px per level and absence at default. Cheap, deterministic, and honest about being a data check rather than a render check. What must not ship is v2's arrangement, where §9.2 claimed to catch "all of them" and this one was invisible.)*

**Where `mat.list-overrides()` lives — stated once.** It goes in **`_density.scss`** (§4.3), inside the compact and comfortable blocks, and emits nothing at default. It is the only per-level override call in this epic for a component `_bridge.scss` does not already override — that, and nothing about `_bridge.scss`, is the sense in which §2.3 calls it "new". **`_bridge.scss` gains no new `mat.*-overrides()` call and no per-level value**; for the three narrow edits it *does* receive, see §2.3. *(v2 asserted and denied this in two consecutive sentences — §1.2 M2; v3 corrected the over-broad "not edited at all" phrasing that replaced it — §1.2 N1.)*

**Touch targets — the rebind v2 proposed is STRUCK. It was both inert and leaky.**

`MatListOption` renders **no** Material touch-target element. Its complete `#checkbox` template in `fesm2022/list.mjs` is:

```html
<ng-template #checkbox>
  <div class="mdc-checkbox" [class.mdc-checkbox--disabled]="disabled">
    <input type="checkbox" class="mdc-checkbox__native-control" [checked]="selected" [disabled]="disabled"/>
    <div class="mdc-checkbox__background">
      <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24" aria-hidden="true">
        <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
      </svg>
      <div class="mdc-checkbox__mixedmark"></div>
    </div>
  </div>
</ng-template>
```

Four elements, none of them `.mat-mdc-checkbox-touch-target`; the `#radio` template has the same shape. `grep -c touch-target-size node_modules/@angular/material/fesm2022/list.mjs` → **0** (the file's four `touch-target` occurrences are all inside `_mat-animation-noopable` transition-suppression selectors that reference the class defensively; no template emits one). So `--mat-checkbox-touch-target-size` and `--mat-radio-touch-target-size` have **no consumer inside a list option** — the rebind bound nothing. Simultaneously, because `_density.scss`'s only selector form is `:root[data-density='…']` (§2.2, §4.3), the two declarations would have landed on `:root` and dropped **every out-of-scope checkbox, radio and switch in the document** from 48px to 44px, undocumented — checkbox and radio appear nowhere in §6.3's exclusion list. v2's claim that "two-line rows (60px) are unaffected" was false for the same reason: an inherited custom property has no per-line-count scope.

**What the pointer target actually is: the option row itself.** The invisible 40px `.mdc-checkbox__native-control` is not it — it lives inside `.mdc-list-item__start`, which `list.mjs` declares `{ fill: currentColor; flex-shrink: 0; pointer-events: none }`. The target is `.mat-mdc-list-option`, `width: 100%` with the hard `height` from its line-count token:

| Level | one-line | two-line | three-line | ≥24px? |
|---|---|---|---|---|
| comfortable | 52 | 68 | **88** *(untouched — Material default)* | ✓ |
| default | 48 | 64 | **88** | ✓ |
| **compact** | **44** | **60** | **88** *(untouched)* | ✓ — 20px of margin |

**Three-line is pinned at 88px at every level**, because M5 (§1.2) dropped `list-item-three-line-container-height` from scope entirely — the showcase does not exercise a three-line option, so the value would ship unmeasured by the geometry gate. "Untouched" therefore means *Material's default, 88px* (`_m3-list.scss:90-91`, ramp `(88,84,80,76,72,56)`, index 1). *(v3 correction: this table previously read 92 at comfortable and 84 at compact — both **driven** values labelled "untouched", which contradicted M5. Neither ships.)*

Rows are flush siblings, so **each target *is* its own row box: zero overhang and zero overlap at every level, by construction.** The smallest target this component ships is 44px, 20px above the SC 2.5.8 floor. Rule T does not fire here (§8.3).

**Hard `height` again:** `fesm2022/list.mjs` sets `.mdc-list-item.mdc-list-item--with-one-line { height: var(…) }`. Same SC 1.4.12 note as §7.3.

**Does selection-list get its own `density` input? No — decided.** v1's §3.2 heading promised "tables and lists" and delivered only the table. The table earns a local input because a single dense grid inside an otherwise-default app is a real, common request and its ramp removes no touch target. A list does not have that story: it is a navigation/selection surface that reads as part of page rhythm, and a local override would have to rebind three coupled height tokens plus two touch-target tokens to stay correct. If a consumer needs it, the same one-line escape hatch as §3.2 applies. **Stated so the omission is a decision, not a gap.**

### 7.5 Nav list — Tier 1 · bespoke · **default must emit nothing**

| Declaration | Shipped | Plan |
|---|---|---|
| item height | **none** — content-derived: 8 + max(24px icon, 17.5px label) + 8 = **40px with an icon, 33.5px without** (`:77-91`; icon default md=24px from `rhombus-icon.component.ts:88` + `SIZE_PX`, template passes no `[size]` at `:223`) | **per-level-override-only, and the default level MUST emit no declaration at all.** v1's `min-height: var(--row-height)` = 48px grows an icon row by 8px and an icon-less row by 14.5px at default density — the largest v1 regression after the table. If a floor is wanted, add `min-height` **only** inside the compact and comfortable blocks. |
| item `padding` | `8px 12px` (`:81`) | **per-level-override-only.** The 12px inline is deliberate — the nav-list lives in the app-shell sidenav where 16px eats the rail. compact `6px 10px` / comfortable `10px 14px`. |
| item `gap` | `10px` (`:80`) | **per-level-override-only.** Not a round token value; v1's 12px default was a +2px regression. |
| root list `gap` | `4px` (`:9`) | **per-level-override-only** (v1 default 12px = +8px). Floor: nav-list rings are **inset** (`outline-offset: -2px` at `:53,:102,:168`), so this gap has no ring-clearance minimum and compact may safely go to 2px. |
| group `gap` | `2px` (`:74`) | **per-level-override-only** — arguably out of scope: at 2px there is no compact step available and only comfortable can move. |
| section-to-section `margin-top` | `12px` (`:14`) | **per-level-override-only.** Selector is `.rhombus-nav-list__section + .rhombus-nav-list__section` (`:13`, so the declaration is `:14`, not `:15`) = (0,2,0), so density rules need (0,3,0). **This is the declaration that forced `margin-*` into the golden baseline's `PROPS`** (§9.2) — v2's list could not see it, making a default-density regression here invisible to the gate. |
| heading `padding` | `8px 12px 4px` (`:19`) | **per-level-override-only.** The asymmetry is intentional (the heading hugs the group below), and **no scalar can express a 3-value shorthand** — a second independent proof that deleting `--control-pad-*` was correct. |
| disclosure `width` | `2rem` (`:151`) | **substitute-var** → `var(--control-height-sm, 2rem)`. Proof: 2rem == 2rem. The **only** substitute-var in this file. Deliberately a *width*: the disclosure has no height and stretches from `.rhombus-nav-list__parent { align-items: stretch }` (`:135`), so it tracks the row automatically. Using a height primitive to drive a width keeps the control square against the stretched row. |
| `--list` item `padding` | `14px 16px` (`:236`) | **per-level-override-only.** v1's 8/16 cut block padding by 6px per side at default, silently converting the link-row appearance back into a sidebar row. Selector is (0,2,0); density rules need (0,3,0). |
| `--list` root `gap` | `8px` (`:233`) | **per-level-override-only**, and it **overrides** the 4px root gap at `:9` — the two must be ramped as a matched pair or the appearances invert at some level. Floor: `--list` rows carry a visible 1px border (`:238`), so compact must keep enough gap that adjacent borders do not read as one divider. **6px is the practical floor.** |
| disclosure `padding` (`:152`), collapsible-heading `gap` (`:37`), parent-row `gap` (`:135`), nested-group `2px/14px/12px` (`:175-177`), badge `1.25rem` (`:206-208`), `--list` type/border/radius (`:237-239`), item font-size/line-height (`:85-86`) | various | **out-of-scope**, each with a reason: structural zeros, space-between-absorbed gaps, indent-rail geometry synced to the 24px icon column, a fixed non-target affordance, separate primitive families (type/border-width/radius), and typography. |

**Nav-list is the only component in scope that is structurally safe under SC 1.4.12**, precisely because it has no fixed height — a user stylesheet forcing line-height 1.5 *grows* the row rather than clipping it. Adding a height at default density would destroy that property: a second, independent reason to reject v1's `min-height` substitution.

### 7.6 Segmented — Tier 1 · no bridge edit

| Declaration | Shipped | Plan |
|---|---|---|
| `--mat-button-toggle-height` | **40px** — RhombusKit never declares it; Material reads `line-height: var(--mat-button-toggle-height, 40px)` on `.mat-button-toggle-appearance-standard .mat-button-toggle-label-content`; ramp `button-toggle/_m3-button-toggle.scss:70` = (40,40,40,36,24) | **substitute-var** → declare `--mat-button-toggle-height: var(--control-height-md, 2.5rem)` on `.rhombus-segmented` (`rhombus-segmented.component.scss:8`, alongside the existing `--mat-button-toggle-*` colour rebinds). Proof: control-height-md default 40 == Material default 40. **No bridge edit, no `mat.button-toggle-overrides()` call** (§2.3) — `.rhombus-segmented` is already an ancestor of every toggle. **Compact resolves to 36px, which is the ramp's index 4 (nominal scale −3), NOT −1** — Material's ramp is flat at 40px across 0/−1/−2, so a "true −1" would mean no compact step at all. Documented as the single calibration exception at §4.4; safe because button-toggle's density map has exactly one key and carries neither `touch-target-display` nor `filled-label-display`, so §8.2's cliff does not exist here. 36 ≥ 24, with 12px of margin against button-toggle's own clamp floor of 24px. |
| per-size height (sm/md/lg) | **40 / 40 / 40 — all three identical today.** `rhombus-segmented--sm\|md\|lg` set *only* `--mat-button-toggle-label-text-size` (`:20-28`) | **out-of-scope — and a trap worth naming.** Segmented's size variants are typography-only, unlike the button's. Binding them to `--control-height-sm/md/lg` (the obvious symmetry) ships a −8px regression on `sm` and +8px on `lg` at **default** density. Growing segmented a real height ramp is a separate breaking change; do not smuggle it in under density. **Apply the height token uniformly.** |
| label `padding` | `0 12px` (Material `.mat-button-toggle-label-content`, no token) | **out-of-scope**, three reasons: no `overrides()` key exists so the only reach is a `.mat-button-toggle-label-content` selector, violating the no-`.mat-*` rule (`rhombus-segmented.component.scss:1-7`, `_chip.scss:4`); v1's 16px default was a +4px-per-side regression; and 12px is already the tightest inline padding in the system. |
| `__label` `margin-block-end` (`:45`), `__content` `gap` (`:51`), `--full-width` layout (`:30-36`) | `0.375rem`, `0.375rem`, flex | **out-of-scope** — external label spacing, a 6px intra-segment gap inside the line box, and a layout mode. |

### 7.7 Chip + chip group — Tier 1 · no bridge edit

| Declaration | Shipped | Plan |
|---|---|---|
| `--mat-chip-container-height` | **32px** — Material renders `.mat-mdc-standard-chip { height: var(--mat-chip-container-height, 32px) }` (a hard height); ramp `chips/_m3-chip.scss:79` = (32,28,24) | **substitute-var** → declare `--mat-chip-container-height: var(--control-height-sm, 2rem)` on `.rhombus-chip` in `packages/core/scss/_chip.scss:6`. Proof: 32 == 32. Same-element declaration (`.rhombus-chip` **is** `.mat-mdc-standard-chip`), so no bridge edit. Compact lands 28px = true Material −1. **Caveat, stated:** this scopes density to chips carrying `[rhombusChip]`; a bare `mat-chip-option` stays 32px. That is correct and intentional. |
| chip inline padding | `12px`, via a 9-selector matrix keyed on with-primary-graphic / with-leading-action / with-trailing-action / with-avatar | **out-of-scope.** No token exists, and Material's own ramp moves `container-height` **only**, leaving this flat at every level — match that precedent. Reaching it needs 9 `.mdc-evolution-chip` selectors including 4 `[dir=rtl]` variants: the largest `.mat-*` incursion in the codebase for a ≤4px gain. |
| `--mat-chip-container-shape-radius` (`_bridge.scss:162-164`) | `var(--radius-full)` | **out-of-scope** — radius, a separate primitive family. Listed only to record that `mat.chips-overrides()` already exists, so a future bridge-ward move would be a one-key addition rather than a new call. |
| chip-group `gap` | `0.5rem` (`_chip.scss:64`) | **per-level-override-only.** v1 §7.7 explicitly proposed `var(--stack-gap, 0.75rem)` — a +4px default regression written with its wrong default inline. Keep 0.5rem; compact `0.375rem` / comfortable `0.75rem`. |
| chip-group `display` / `flex-wrap` / `font-family` (`:62-65`) | — | **out-of-scope** — layout and type. |

### 7.8 Tabs — Tier 2 · the cleanest component in the epic

`packages/core/src/lib/tabs/` contains **only** `rhombus-tab-group.directive.ts` + its spec — **no SCSS file exists**, confirmed by directory listing. The directive's host block adds `class: 'rhombus-tab-group'` and nothing else (`:23-29`).

| Declaration | Shipped | Plan |
|---|---|---|
| `--mat-tab-container-height` | **48px** (`tabs/_m3-tabs.scss:56`, ramp 48/44/40/36/32) | **substitute-var** → add `container-height: var(--control-height-lg, 3rem)` to the **existing** `mat.tabs-overrides()` call (`_bridge.scss:248-260`). Proof: control-height-lg default 48 == Material default 48. compact resolves to 44 = true Material −1. **That is the whole component.** |
| `.mat-mdc-tab { height: … }` | hard `height` | **out-of-scope as a declaration** — noted because it is a hard height, so tabs cannot honour SC 1.4.12 by growing. `.mat-mdc-tab-labels` uses `min-height` off the same token, so the two disagree by design upstream. |

### 7.9 App-shell toolbar — Tier 2 · **the 56px premise was wrong**

> **Correction, flagged for the implementer.** `rhombus-app-shell.component.scss:21` declares `min-height: var(--rhombus-app-shell-toolbar-height, 56px)` — RhombusKit's own 56px. That declaration is **inert**. Material sets a hard `height` on the same box (`.mat-toolbar-row, .mat-toolbar-single-row { height: var(--mat-toolbar-standard-height, 64px) }`, `fesm2022/toolbar.mjs`), and `min-height` can only raise a floor, never pull 64px down to 56px. **The shell renders at 64px on desktop today**, and at 56px only below the 599px breakpoint where Material swaps in `--mat-toolbar-mobile-height` (default 56px — the one place the two numbers coincide).
>
> Under the byte-identical invariant the value that must be preserved at default is therefore the **rendered** geometry — 64px desktop / 56px mobile — not the inert literal. "Preserve 56 at default" would ship an 8px desktop shrink to every app that never opted in: exactly the class of silent regression this revision exists to prevent.
>
> The 56px literal is a real pre-existing bug (the showcase documents it as a working knob at `apps/showcase/src/app/pages/app-shell/app-shell-page.component.ts:174`, and the original design intended it — `docs/superpowers/specs/2026-06-17-rhombuskit-mobile-nav-design.md:193`). Fixing it is legitimate but it is a **breaking geometry change** and belongs in its own MINOR with its own changelog line. **It is out of scope for this epic.**

| Declaration | Shipped | Plan |
|---|---|---|
| `--mat-toolbar-standard-height` | **64px** ≥600px (`toolbar/_m3-toolbar.scss:38`, ramp 64/60/56/52) | **per-level-override-only.** No frozen primitive equals 64 (the largest is `--control-height-lg` at 48), so binding one is a 16px shrink at default. Emit compact **60** / comfortable **72** inside `_density.scss`; leave default unstated so Material's 64px survives untouched. |
| `--mat-toolbar-mobile-height` | **56px** ≤599px (`:39`, ramp 56/52/48/44), applied inside `@media (max-width: 599px)` | **per-level-override-only — a SECOND token v1 never mentions.** Driving only the standard height gives an app that shrinks on desktop and not on phones, which is the opposite of where density matters most. compact **52** / comfortable **64**. **Both or neither.** |
| `min-height: var(--rhombus-app-shell-toolbar-height, 56px)` (`:21`) | inert | **out-of-scope — do not touch.** See the correction above. |
| toolbar `gap` (`:22`) | `4px` | **out-of-scope** — a micro-gap between adjacent 40px icon buttons. The deleted `--stack-gap` would have made it 12px (+8px) at default. |
| nav-toggle `40px` square (`:90-91`) | `40px` | **out-of-scope** — a pointer target inside a bar whose height density already drives. Shrinking it buys ~8px the toolbar token already delivers, at the cost of a smaller tap target. |
| nav-body / nav-footer padding (`:71`, `:76`) | `8px` | **out-of-scope** — chrome padding. Listed for exhaustiveness. |

### 7.10 Pagination — Tier 2 · **do not touch the inner field**

`rhombus-pagination.component.scss` is 8 lines and sets colour only (`:3-7`); `rhombus-pagination.component.ts:38-48` renders a bare `<mat-paginator>` with a class.

| Declaration | Shipped | Plan |
|---|---|---|
| `--mat-paginator-container-size` | **56px** (`paginator/_m3-paginator.scss:40`, ramp 56/52/48/40/40/40) | **per-level-override-only.** No frozen primitive equals 56 except `--field-height`, and reusing a *form-field* primitive for a paginator **bar** is a semantic accident that breaks the moment the two anchors diverge. compact **52** / comfortable **60**, in **`_density.scss`**'s level blocks (§4.3), via a per-level `mat.paginator-overrides((container-size: …))`; default unstated. **It CANNOT go in `_bridge.scss:223`** — that call sits in `material-bridge()`'s unconditional body, where no level selector is in scope, so the value would apply at DEFAULT and shrink every bridged app's paginator bar 56→52px. That was v2's B3, and it was this section alone: §7.2, §7.9, §7.11 and §7.12 all correctly route per-level values through `_density.scss` per §4.3. |
| `--mat-paginator-form-field-container-height` | **40px** (`:41`, ramp 40/40/40/40/40/**36**) | **out-of-scope — confirmed, and it is a deliberate upstream pin.** Pinned across levels 0…−4; it only moves at −5. v1's instruction to bind it to `--field-height` would render a **56px field inside a 56px bar at DEFAULT density** — 16px growth, zero clearance, in an unconfigured app. Do not bind it, and do not add per-level overrides either: Material's own ramp says the correct value at every level we expose is *do not move*. |
| `--mat-paginator-form-field-container-vertical-padding` | **8px** (`:42`, ramp 8/8/8/8/8/6) | **out-of-scope** — pinned alongside its height. The arithmetic is deliberate: 40 + 8 + 8 = 56 = the bar height at level 0. |
| `--mat-paginator-page-size-select-touch-target-height` | **48px** (`:14`), on `.mat-mdc-paginator-touch-target` (84px wide via `--mat-paginator-page-size-select-width`) | **out-of-scope — Rule T does not fire.** Recorded because the paginator is one of only **two** touch-target-rendering components inside §6's scope (§8.3's inventory), so its absence from Rule T's firing list must read as a decision rather than an oversight. T1 requires that a density block *reduce* a control below 48px; density never touches the paginator field, which is pinned at 40px at every level we expose (row above), and the bar never drops below 52px, so the 48px target sits inside it with 2px of clearance per side. There is no vertically adjacent target in the bar to overlap. |
| `--mat-paginator-touch-target-display` | `block` (`:44` — **this citation was already correct**; two v3 reviews claimed `:43`, verified `:44`, do not "fix" it. Ramp block/block/none/none/none/none) | **out-of-scope, not driven.** Rule T3 (§8.3) forbids emitting any `*-touch-target-display` token from a density block. Noted because it is the paginator's −2 accessibility cliff. Since we never emit a Material density *scale*, it never fires — but if anyone later proposes routing density through `mat.theme((density: …))` instead of `overrides()`, this token silently kills a touch target. |

**The global form-field density cannot leak into the paginator — proved.** `fesm2022/paginator.mjs` re-declares both tokens locally on `.mat-mdc-paginator`:

```
--mat-form-field-container-height: var(--mat-paginator-form-field-container-height, 40px);
--mat-form-field-container-vertical-padding: var(--mat-paginator-form-field-container-vertical-padding, 8px);
```

Because those declarations sit on an ancestor of the inner field, §7.2's global binding is shadowed **by construction** for both the height and the padding. This is the mechanism that protects the pin. **Assert it** (§9.1) — it is the exact defect a future contributor will re-introduce.

> **Citation note.** All three per-level citations above were off by one in v2 (`:41`/`:42`/`:43`) and are corrected to `:40`/`:41`/`:42`. The corrected `:40` now **agrees with §7.3's** citation of the same `container-size` token, which was right all along — v2 contradicted itself across two sections.

### 7.11 Accordion — Tier 2 · hand-rolled · **no `mat.expansion-overrides()`**

`rhombus-accordion.component.ts:16-21` documents it: *"Hand-rolled (native `<button>` headers + `role="region"` bodies), so it carries no `--mat-sys-*`"* — and the file imports nothing from `@angular/material`. `expansion/_m3-expansion.scss:58-59` does ship real ramps (collapsed 48/44/40/36, expanded 64/60/56/48), but **nothing in this repo reads them.** Adding the override call emits dead CSS. **Struck.**

| Declaration | Shipped | Plan |
|---|---|---|
| trigger `padding` (`:30`) | `0.875rem 1rem` (14/16) | **per-level-override-only.** 14px equals no frozen primitive, and the deleted `--control-pad-y` default would have been −6px per side at default. compact `0.625rem 0.75rem` / comfortable `1.125rem 1.25rem`. The inline value is symmetric, so RTL is unaffected. |
| trigger `gap` (`:28`) | `0.75rem` | **per-level-override-only** — the one value that happened to equal v1's `--stack-gap` default, which is exactly why v1 read as safe. |
| trigger `min-height` | **none** (verified absent across `:25-47`) | **out-of-scope — DO NOT ADD.** v1 proposed `min-height: var(--control-height-lg)` = 48px. With `font: inherit` (`:33`) at a 16px base the trigger already renders ~47–52px, so a 48px floor is either inert or a ~1px growth at default — and a real growth in any app with a smaller base font. It buys nothing the padding ramp does not already deliver and risks the invariant. **Stated as a decision, because "the accordion has no height" otherwise reads as an oversight.** |
| heading-text `gap` (`:52`), content `padding` (`:107`) | `0.125rem`, `0 1rem 1rem` | **out-of-scope** — a 2px intra-label gap (typographic) and body padding on a disclosure region, not a control. Both were `--stack-gap` casualties in v1. |

### 7.12 Stepper — Tier 2 · hand-rolled · **no `mat.stepper-overrides()`**

`rhombus-stepper.component.ts:16-19` imports `CdkStep`, `CdkStepHeader`, `CdkStepper`, `STEPPER_GLOBAL_OPTIONS` and its docstring at `:26-30` reads *"It **extends CdkStepper** … no @angular/material, no `--mat-sys-*`, no new peer."* `stepper/_m3-stepper.scss:64` ships a `stepper-header-height` ramp (72/68/64/60/42) that nothing here reads. **Struck**, same as accordion. Together these two strikes settle v1's four-vs-two contradiction definitively — and not merely because a decision said so, but because the other two have **no consumer**.

| Declaration | Shipped | Plan |
|---|---|---|
| root `gap` (`:8`) | `1.5rem` | **per-level-override-only** — the largest single v1 regression in this tier (`--stack-gap` 0.75rem would halve it). This is the gutter between the tablist and the content panel, a layout value with no business sharing a token with a 2px label gap. compact `1.25rem` / comfortable `2rem`. |
| header/tablist `gap` (`:26`) | `0.5rem` | **per-level-override-only.** *(v2 cited `:27`, which is the closing brace; the declaration is `:26` — `.rhombus-stepper__header` opens at `:24`, `display: flex` is `:25`.)* **Floor constraint applies here specifically:** the tab's ring is `outline: var(--border-width-strong) solid; outline-offset: 2px` (`:62-65`) — an **outward** ring extending ~4px past the border box. At an 8px sibling gap two adjacent focused tabs already have exactly **0px** clearance between rings. **Compact must not take this gap below 8px.** Comfortable `0.75rem`. |
| tab `padding` (`:47`) | `0.5rem 0.75rem` | **per-level-override-only.** The block value coincidentally equalled v1's `--control-pad-y`, but the inline did not (+4px per side at default). compact `0.375rem 0.625rem` / comfortable `0.75rem 1rem`. |
| indicator bubble `width`/`height` (`:93-94`) | `1.75rem` (28px) | **per-level-override-only** — 28px ≠ `--control-height-sm` (32px), so v1's substitution was a +4px default regression. It is **not** a pointer target in its own right (the whole `.rhombus-stepper__tab` is the button), so it may go below 24px without an SC 2.5.8 concern — keep it ≥24px anyway for numeral legibility. compact `1.5rem` / comfortable `2rem`. |
| indicator glyph (`:105-107`) | `rhombus-icon { font-size: 1.125rem; width: 1.125rem; height: 1.125rem }` | **per-level box, NOT the rem→em conversion this revision proposed — corrected during PR 3 against measured rendering.** The glyph should shrink with the bubble (18px in a 24px compact circle reads cramped), but `em` cannot do it: `em` on `width` is *own*-font-size-relative (so `1.385em` renders ~24px, not 18px), and the bubble's `font-size` — the step number — is deliberately level-invariant (§7.12 keeps the bubble as width/height only), so an em glyph would track nothing. The working fix keeps the base rule at `1.125rem` and adds a **per-level `rhombus-icon` box** in the density blocks (compact `1rem`/16px, comfortable `1.25rem`/20px); the icon's inner span flex-shrinks to that box, so the visible glyph tracks the bubble — **measured 18→16→20px**. **Default is untouched, so there is NO deliberate default-density rendering change in this PR** (cleaner than the rem→em plan, which would have been one). Local fix in this file; the icon primitive is not touched (§7.13). |
| tab `gap` (`:45`), label `gap` (`:133`), connector `min-width`/`margin-inline-start` (`:190`/`:191`), vertical rail `min-width` (`:38`) | `0.625rem`, `0.0625rem`, `1rem`/`0.25rem`, `12rem` | **out-of-scope.** The 1px label gap is the clearest single illustration of v1's structural defect — `--stack-gap` would have made it 12px, a 1100% growth at default density. Never tokenize it. |

### 7.13 Cross-cutting: `<rhombus-icon>` glyphs do not track density — and that is fine

`rhombus-icon.component.ts:99-102` computes `const px = typeof size === 'number' ? size : SIZE_PX[size]; return \`${px}px\`` — the preset path **always** produces px (sm 20 / md 24 / lg 32, documented at `:13`). That value is applied via a **host style binding** at `:43` (`'[style.--rhombus-icon-size]': 'sizeCss()'`), and the internal rules read `var(--rhombus-icon-size, 24px)` at `:67-68`, `:76-78`.

**Because the binding writes an inline style on the icon's own host element, a parent rule setting `--rhombus-icon-size` is overridden** — inline wins over any inherited value regardless of the parent's specificity. There is therefore **no non-`!important` way** for a consuming component's SCSS to make a `<rhombus-icon>` track density.

**Decision: do NOT retrofit the primitive in this epic.** v1 listed the `em` retrofit as a blocking prerequisite (D2). It is not, and it is a change to the primitive's public contract (`RhombusIconSize` would have to admit a relative length or a new mode). Justification for leaving it: **an icon is not itself a pointer target** — its containing button is — so a fixed 20px glyph inside a control that shrinks 48→36px still clears SC 2.5.8 on the container, and 20px inside 36px remains visually correct with 8px of surround.

The two cases that genuinely break are **fixable locally, without touching the primitive**, because both style a raw element rather than depending on the `size` input:
- **stepper indicator** — `rhombus-icon` descendant selector at `:104-107` → give it a **per-level box** in the density blocks, not the rem→em conversion (which does not track; corrected in PR 3, §7.12).
- **number-input** — a plain SVG class at `:70-71` → out of scope entirely, because the 28px button is itself out of scope (§7.2).

**Record the `em` retrofit as a follow-up MINOR.** This is strictly narrower than v1's D2 and removes a blocking prerequisite from the epic.

Absolute-unit icon inventory, for completeness: stepper `1.125rem` (`:105-107`) · number-input `18px` (`:70-71`) · tag-input `1rem` (`rhombus-tag-input.component.scss:20-22`) · nav-list disclosure `2rem` width (`:151`) · segmented, which renders `<rhombus-icon size="sm">` (`rhombus-segmented.component.ts:75,105`) and resolves through the primitive to a hard pixel string. The button is the **only** place in the library that sizes an icon relatively (`rhombus-button.component.scss:23-27`, reasoning at `:10-16`) — and it tracks for free.

---

## 8. Accessibility

### 8.1 The binding success criteria

- **SC 2.5.8 Target Size (Minimum), AA (WCAG 2.2)** — pointer targets ≥ **24×24 CSS px**. Exceptions: Spacing / Equivalent / Inline / User-agent control / Essential.
  > **Corrected wording (v1 misstated this).** The Spacing exception requires that a 24px-diameter circle centred on an undersized target's bounding box **does not intersect another target, or the circle of another undersized target**. Full-size targets get **no** circle. v1's version ("another target's circle") would permit an undersized control to sit flush against a ≥24px control, which the real exception forbids.
  CSS px is density-independent, so the floor does not move under browser zoom.
- **SC 1.4.12 Text Spacing, AA** — no loss of content when the user forces all four of: `line-height: 1.5×`, paragraph spacing `2×`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`.
- **SC 1.4.4 Resize Text, AA** — px survives zoom but ignores an enlarged default browser font size; `rem` respects both. Every anchor in §4.4 is rem-authored.

### 8.2 Why compact stops at Material −1

The cliff at −2 is sharp, and it is a **semantics** change, not a spacing change. The index math is `$index: ($scale * -1) + 1` (`button/_m3-button.scss:156`), so scale −2 → index 3:

```scss
// node_modules/@angular/material/button/_m3-button.scss:158-169
button-filled-container-height:     list.nth((40px, 36px, 32px, 28px), $index),
button-filled-touch-target-display: list.nth((block, block, none, none), $index),
//                                             ^i1    ^i2    ^i3 = NONE
```

The token is consumed as `display: var(--mat-button-filled-touch-target-display, block)` — the hidden 48px touch target is **deleted** at −2. The same shape appears in checkbox, radio, slide-toggle, paginator and icon-button. The `_m3-*.scss` line for each **display companion** is given here — §8.3.1's inventory table gives the `*-touch-target-**size**` line, which is a different token: button `:159-168` (five interleaved keys at `:159`, `:162`, `:163`, `:165`, `:168` — the intervening lines are `*-container-height`), icon-button `:50`, checkbox `:65`, radio `:62`, slide-toggle `:131`, paginator `:44`. This is **Rule T3**: *no density block ever emits a `*-touch-target-display` token.* And `form-field/_m3-form-field.scss:130`:

```scss
form-field-filled-label-display: list.nth((block, block, none, none, none, none), $index),
```

Index 3 is `none` again — the **floating label disappears** at −2, in the *filled* appearance only (the outlined appearance has no equivalent density-driven display token). Also: `_m3-icon-button.scss:45-54` ramps the state layer 40/36/32/28/**24**/24 with the source comment *"caps out at 24px, because anything lower will be smaller than the icon."*

**Global compact is therefore a true Material −1 equivalent** — §4.4's calibration table shows every component anchor landing on Material's −1 **value**, with segmented the single documented exception (third bullet below). Three margins matter numerically:

- **Chip.** At compact 28px; at Material −2 it would be **exactly 24px** — the floor with zero margin. Stopping at −1 is what buys the margin.
- **Icon-only buttons.** `min-width: 64px` is zeroed (`rhombus-button.component.scss:49`), so the square **is** the target. `--control-height-md` at compact (36px) is the only thing holding SC 2.5.8 for them, and `--control-height-sm` at compact (28px) is the system's smallest box. **Neither may ever drop below 24px** — comment recorded in `primitives.ts` (§5.1). Their Material touch-target span is **height-only** (`left: 0; right: 0`), so zeroing `min-width` creates no horizontal target overhang: the square box *is* the horizontal target at every level.
- **Segmented.** The only anchor not on Material's index 2, because index 2 **is** 40px — the ramp is flat across 0/−1/−2 (`button-toggle/_m3-button-toggle.scss:70`). Our compact is 36px, the index-4 entry (§4.4). **The −2 cliff argument does not apply here**: button-toggle ships exactly **one** density token (`button-toggle-height`) and neither `touch-target-display` nor `filled-label-display` is among them, so there is no cliff at segmented to be two steps past. Margin against the 24px floor: **12px**, measured against button-toggle's own clamp floor rather than against a cliff.

The table-only `dense` step (36px rows) is safe on target size *for the row*, and §7.3's touch-target rebinding fixes the overlap problem it would otherwise create (§8.3).

### 8.3 Touch targets — **Rule T**, stated once and systematically

v2 handled touch targets by anecdote, and both anecdotes were wrong: it fixed a selection-list case that does not exist while missing the button case that does (§1.2 H1, H2). The root cause was that two structural facts were never established — *which components render a touch-target element at all*, and *which layer owns the token*. Both are settled here, and the rule follows mechanically.

#### 8.3.1 Inventory — every touch-target element in Material 21

Occurrences of `touch-target` per module in `node_modules/@angular/material/fesm2022/`: `button.mjs` **72** · `radio.mjs` **12** · `checkbox.mjs` **12** · `slide-toggle.mjs` **10** · `_icon-button-chunk.mjs` **10** · `paginator.mjs` **8** · `list.mjs` **4** · everything else **0**.

| Component | Element class | Sizing custom property | Default | Positioning | Axes sized | Token at |
|---|---|---|---|---|---|---|
| button — text | `.mat-mdc-button-touch-target` | `--mat-button-text-touch-target-size` | 48px | `absolute; top:50%; left:0; right:0; translateY(-50%)` | height only (width = box) | `button/_m3-button.scss:45` |
| button — filled | same | `--mat-button-filled-touch-target-size` | 48px | same | height only | `:25` |
| button — outlined | same | `--mat-button-outlined-touch-target-size` | 48px | same | height only | `:32` |
| button — protected/elevated | same | `--mat-button-protected-touch-target-size` | 48px | same | height only | `:38` |
| button — tonal | same | `--mat-button-tonal-touch-target-size` | 48px | same | height only | `:51` |
| icon-button (`matIconButton`) | `.mat-mdc-button-touch-target` | `--mat-icon-button-touch-target-size` | 48px | `absolute; top/left:50%; translate(-50%,-50%)` | **both** | `button/_m3-icon-button.scss:23` |
| fab / mini-fab / extended-fab | same | `--mat-fab-touch-target-size` · `--mat-fab-small-touch-target-size` | 48px | same | both (extended: height) | `button/_m3-fab.scss:23-24` |
| checkbox | `.mat-mdc-checkbox-touch-target` | `--mat-checkbox-touch-target-size` | 48px | `absolute; top/left:50%; translate(-50%,-50%)` | both | `checkbox/_m3-checkbox.scss:23` |
| radio | `.mat-mdc-radio-touch-target` | `--mat-radio-touch-target-size` | 48px | same (+ `[dir=rtl]` mirror) | both | `radio/_m3-radio.scss:19` |
| slide-toggle | `.mat-mdc-slide-toggle-touch-target` | `--mat-slide-toggle-touch-target-size` | 48px | same (+ RTL mirror) | height (`width: 100%`) | `slide-toggle/_m3-slide-toggle.scss:63` |
| paginator (page-size select) | `.mat-mdc-paginator-touch-target` | `--mat-paginator-page-size-select-touch-target-height` (h) + `-width`, 84px (w) | 48px | `absolute; top/left:50%; translate(-50%,-50%)` | both | `paginator/_m3-paginator.scss:14` |

**Confirmed negatives, with what actually sizes the pointer target instead:**

- **list — 0 rendered elements.** `list.mjs`'s four `touch-target` occurrences are all inside `_mat-animation-noopable` transition-suppression selectors, matching nothing `MatListOption` renders. **Real target: the option row itself** (§7.4).
- **chips — 0.** The chip's pointer target is `.mdc-evolution-chip__action--primary`, at `height: 100%` of `.mat-mdc-standard-chip { height: var(--mat-chip-container-height, 32px) }`, so it tracks the chip box (32 / 28 / 36) at full chip width. The **remove control does not** — it is not an `.mdc-evolution-chip__action` at all (§7.2, §1.2 M7).
- **tabs, table, form-field, button-toggle (segmented), toolbar, expansion, stepper — 0.** Their pointer target is the control box itself. Nothing to rebind.

**The intersection with §6's scope is exactly two components: button and paginator.**

#### 8.3.2 The rule

> **Rule T.** A Material touch-target span is absolutely positioned and centred on its control, so it only ever **adds** pointer area outside the control box and can never reduce the control's own clickable area. Shrinking the span to the control box is therefore never a loss of reachable pixels — it is purely the removal of overhang.
>
> **T1.** Any density block that reduces a control's rendered box **below both 48px and that control's own default-level value** MUST, in the same block and on a selector that is the control's RhombusKit component class (or a scoped ancestor of it), rebind that component's `*-touch-target-size` property to the box value the block just set.
>
> **T2.** A `*-touch-target-size` rebind is **NEVER** authored on `:root`, in `_bridge.scss`, or in `_density.scss`'s `:root[data-density]` blocks. Every one of these names is shared with components outside §6's scope whose boxes do not move and whose 48px targets must survive (§2.3).
>
> **T3.** No density block ever emits a `*-touch-target-display` token; `none` **deletes** the element (§8.2).

**Both halves of T1's threshold are load-bearing.** `< 48px` alone would fire at **comfortable `sm`** (36px box, 6px overhang) — but comfortable *grows* that box from default's 32px, so its overhang is 6px against `main`'s 8px, strictly better. Rule T fixes only what a density level makes **worse than `main`**.

#### 8.3.3 Where Rule T fires

| Scope member | Renders a target? | Box drops below 48 **and** below default? | Rule T selector |
|---|---|---|---|
| **button** (§7.1) | yes | **yes — compact sm/md/lg** | `[data-density='compact'] .rhombus-button--<size>` |
| **data-table** (§7.3) | no (consumer-projected checkbox/radio) | **yes — at `dense` only** | `.rhombus-data-table[data-density='dense']` |
| paginator (§7.10) | yes | no — field pinned at 40px, bar never below 52px | none |
| selection-list (§7.4) | no — the row **is** the target | n/a | **none — v2's rebind is struck** |
| chip / tag-input (§7.7, §7.2) | no | n/a | none |
| form-field ×8, tabs, toolbar, segmented, accordion, stepper, nav-list | no | n/a | none |

#### 8.3.4 The overhang table, corrected

| Component | Level | Control box | Target | Overhang/side | Adjacent overlap | Fires? |
|---|---|---|---|---|---|---|
| button `sm` (text/filled/outlined) | compact | 28 | 48 | **10** | **20** (stacked) | **yes** → 1.75rem |
| button `md` | compact | 36 | 48 | **6** | **12** (stacked) | **yes** → 2.25rem |
| button `lg` | compact | 44 | 48 | **2** | **4** (stacked) | **yes** → 2.75rem |
| button `sm` | default *(`main` today)* | 32 | 48 | 8 | 16 | no — pre-existing, own MINOR |
| button `md` | default *(`main` today)* | 40 | 48 | 4 | 8 | no — pre-existing, own MINOR |
| button `lg` | default | 48 | 48 | 0 | none | no |
| button `sm` | comfortable | 36 | 48 | 6 | 12 | no — better than default's 8 |
| button `md` / `lg` | comfortable | 48 / 56 | 48 | 0 | none | no |
| icon-only button, all sizes | compact | 28/36/44 sq. | 48 h × box w | as above, **vertical only** | as above, vertical only | **yes** (same five tokens) |
| data-table row + projected checkbox/radio | comfortable / default / compact | 60 / 52 / 48 | 48 | 0 | none | no |
| data-table row + projected checkbox/radio | **`dense`** | **36** | 48 | **6** | **12** | **yes** → 2.25rem |
| selection-list option (row **is** the target) | compact | 44 / 60 / 84 | = box | 0 | none | no |
| chip primary action | compact | 28 (`height: 100%` of chip) | = box | 0 | none | no |
| tag-input remove control | **all levels** | **18 content-box, density-invariant** | = box | 0 | n/a | no — pre-existing question, own bug |
| paginator page-size select | compact | field 40, bar 52 | 48 | 4 vs field, 0 vs bar (2px clearance) | none — no adjacent target | no |
| `matIconButton` (code-block, theme-toggle, theme-menu) | all | 40 — **out of §6 scope** | 48 sq. | 4, both axes | 4 across the toolbar's 4px gap | no — **pre-existing on `main` and unchanged by density**; listed so the nonzero overlap reads as a known exclusion, not an inconsistency |

The two rebinds are specified inline at §7.1 (button) and §7.3 (`dense` table).

#### 8.3.5 What is deliberately NOT fixed here

**Default-level button overhang stays live**: `sm` 8px/side and `md` 4px/side on `main` today, so two stacked default `sm` buttons' targets already overlap by 16px. Fixing it is a **rendered-geometry change at default density** and therefore ships in its own MINOR — the same disposition §7.9 gives the app-shell 56px literal and §8.5 gives segmented's line-height collapse. Recording it here matters: the system now has the vocabulary to fix it, and without this paragraph the next reviewer will simply re-file it.

**This overlap bug is live in upstream Material at −2 and below today. We fix the two cases we create, and record every case we do not.**

### 8.4 SC 1.4.12 — the test must use all four declarations, and the right probe per component

v1's assertion forced only `line-height: 1.5` and probed `scrollHeight <= clientHeight`. Both halves are wrong:

1. **All four declarations are required** — `line-height: 1.5`, paragraph spacing `2×`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`. The two the compact tier actually endangers are **horizontal**, and a vertical-overflow probe cannot see them at all.
2. **`scrollHeight <= clientHeight` is the wrong probe for `overflow: visible` boxes** — overflowing text simply escapes without ever making `scrollHeight` exceed `clientHeight`, so the assertion passes vacuously.

**The probe is named per element and per axis:**

| Element | Probe | Why |
|---|---|---|
| `.rhombus-nav-list__label` | `el.scrollWidth <= el.clientWidth` | It carries `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` (`:198-200`), so under letter/word-spacing a compact nav-list ellipsises sooner. This is the one element in the library where clipping is directly observable. |
| button / segmented / chip labels | bounding-box comparison against the container | `overflow: visible` — text escapes rather than clipping, so only a geometric comparison detects it. |
| table rows, list items, tabs | **inner content box vs row box** — `min(child top)` / `max(child bottom)` of the row's text element compared against the row's own rect | These use **hard `height`**, so content clips. `getBoundingClientRect()` returns a child's **unclipped** layout box even under `overflow: hidden` (`.mdc-list-item { overflow: hidden }`, `list.mjs`), so it measures exactly the pixels being cut off. This exposure exists on `main` already (§7.3, §7.4, §7.8); the test asserts **non-regression** rather than claiming a fix. |

> **v2's third probe was vacuous and is replaced.** It compared `getComputedStyle(row).height` against the very custom property `height` is declared from — an identity that cannot disagree, so it passed unconditionally. That is precisely the failure mode §8.4 itself diagnoses in v1's `scrollHeight <= clientHeight` (§1.2 H3).

```ts
// apps/showcase-e2e/tests/density.spec.ts
const TEXT_SPACING = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important; }
  p { margin-block: 2em !important; }`;

type Clip = { rowH: number; contentH: number; overflow: number };

async function measureClip(page: Page, rowSel: string, textSel: string): Promise<Clip> {
  return page.$eval(rowSel, (row: HTMLElement, sel: string) => {
    const r = row.getBoundingClientRect();
    const kids = Array.from(row.querySelectorAll<HTMLElement>(sel));
    if (kids.length === 0) throw new Error(`probe blind: no ${sel} inside row`);
    const boxes = kids.map((k) => k.getBoundingClientRect());
    const top = Math.min(...boxes.map((b) => b.top));
    const bottom = Math.max(...boxes.map((b) => b.bottom));
    return {
      rowH: r.height,
      contentH: bottom - top,
      overflow: Math.max(0, r.top - top) + Math.max(0, bottom - r.bottom),
    };
  }, textSel);
}

const HARD_HEIGHT_ROWS: ReadonlyArray<readonly [string, string]> = [
  ['.mat-mdc-list-option',         '.mdc-list-item__content'],
  ['.rhombus-data-table tbody tr', 'td.mat-mdc-cell'],
  ['.mat-mdc-tab',                 '.mdc-tab__text-label'],
];

for (const [rowSel, textSel] of HARD_HEIGHT_ROWS) {
  test(`SC 1.4.12 — compact does not clip ${rowSel} more than default`, async ({ page }) => {
    await page.addStyleTag({ content: TEXT_SPACING });

    const atDefault = await withDensity(page, 'default', () => measureClip(page, rowSel, textSel));
    const atCompact = await withDensity(page, 'compact', () => measureClip(page, rowSel, textSel));

    // (a) POSITIVE CONTROL — the probe MUST report overflow when the row is
    //     forced short. Without this the whole assertion can pass while blind,
    //     which is exactly how v1's probe survived review. withRowHeightOverride
    //     must itself assert the forced rowH is ~24 before checking overflow.
    const forced = await withRowHeightOverride(page, rowSel, '24px', () =>
      measureClip(page, rowSel, textSel));
    expect(forced.overflow, 'probe is blind — it cannot observe clipping at all')
      .toBeGreaterThan(0);

    // (b) Sanity — real boxes, not zeros (jsdom-style vacuity, cf. §8.8).
    expect(atDefault.rowH).toBeGreaterThan(0);
    expect(atDefault.contentH).toBeGreaterThan(0);

    // (c) THE GATE. These rows carry a hard `height`, so clipping under the
    //     text-spacing stylesheet is a PRE-EXISTING exposure on main (§7.3,
    //     §7.4, §7.8). The claim density makes is NON-REGRESSION, not a fix.
    expect(atCompact.overflow,
      `compact clips ${rowSel} by ${atCompact.overflow - atDefault.overflow}px more than default`)
      .toBeLessThanOrEqual(atDefault.overflow + 0.5);   // 0.5px sub-pixel tolerance
  });
}
```

**Why each `textSel` is the right inner box.** List rows clip (`.mdc-list-item { overflow: hidden }`) and `.mdc-list-item__content` is the flex child that grows. Table cells are the flow children of a hard-height `tr`. For tabs, `.mdc-tab__content` is `height: inherit` and therefore **cannot** report growth — use `.mdc-tab__text-label`, whose `line-height: 1` is replaced outright by the stylesheet's `1.5 !important` and which grows inside the fixed-height `.mat-mdc-tab { height: var(--mat-tab-container-height, 48px) }`.

### 8.5 Segmented's line-height collapse — re-scoped, not fixed here

v1 asserted segmented's box *"collapses to ~21px under a 1.5 line-height user stylesheet — below the 24px floor"* and treated compact as newly load-bearing. **The first half is confirmed; the second is false.**

The box is `line-height: var(--mat-button-toggle-height, 40px)` on `.mat-button-toggle-label-content`. A conforming text-spacing stylesheet sets `line-height: 1.5 !important` on `*`, which **replaces** that declaration outright. The resulting box is `1.5 × --mat-button-toggle-label-text-size` (0.875rem at md) = **21px** — a value that never reads `--mat-button-toggle-height` at all. The collapsed height is therefore **identical at compact, default and comfortable, and identical before and after this epic.**

**Conclusions:** (a) the `--mat-button-toggle-height` substitution is safe to ship, since it cannot move the 1.4.12 case; (b) v1's claim that *"the SC 2.5.8 guarantee for segmented rests entirely on the compact anchor"* is **struck** — the anchor governs the normal case only; (c) the real defect is **pre-existing on `main`**, and its only fix is a `min-height` on the toggle button element, which needs a `.mat-button-toggle` selector and therefore a decision against the repo's no-`.mat-*` rule. **File it as a standalone a11y bug, out of this epic.** Shipping it inside PR 2 would put a rendered-geometry change on `main` under a "non-breaking density" headline — exactly the conflation this revision exists to prevent.

### 8.6 Focus-ring clearance — an 8px floor for outward rings

Outward rings are `outline: 2px solid` + `outline-offset: 2px`, extending **4px beyond the border box**. Two adjacent focused siblings therefore need **≥8px** of gap for zero ring overlap.

- **Outward-ring components have a hard 8px sibling-gap floor.** The stepper is the binding case: its tab ring is at `rhombus-stepper.component.scss:62-65` and its sibling gap is exactly `0.5rem` = 8px (`:26` — v2 cited `:27`, which is the closing brace; this is the load-bearing citation for the whole floor). At default density there is already **0px** of clearance between rings. **Compact must not reduce it.** Same shape at `alert:83`, `app-shell:109`, `carousel:81`, `menu:28`, `breadcrumbs:36`, `sheet:110`.
- **Inset-ring components are exempt.** `outline-offset: -2px` at `nav-list:53,102,168`, `selection-list:46`, `accordion:45`. Nav-list's gaps may safely go to 2px at compact (§7.5).

This is not an AA failure — SC 2.4.11 is about obscuring, and 2.4.13 Focus Appearance is AAA — but it is the tightest the system has ever been, and the floor is recorded so a future contributor does not "optimise" compact below it.

### 8.7 Forced colors

In forced-colors mode background colours are discarded, so the accordion's panel dividers (`rhombus-accordion.component.scss:15-17`) and the app-shell toolbar's bottom rule (`:23`) are the only remaining boundaries between surfaces. Compact does not remove those borders, but it removes the padding that currently separates them, so adjacent triggers read as a denser ruled table. **That is legible and not a conformance failure** — stated so it is a considered outcome rather than an unexamined one.

### 8.8 jest-axe does not cover target size — and it is worse than "disabled"

`target-size` **is** enabled by default in the installed axe-core (4.10.2 / 4.11.4, tags `wcag22aa`/`wcag258`), and `packages/core/src/testing/axe.ts:19-26` does not disable it — it disables only `region`, `landmark-one-main`, `page-has-heading-one`, `html-has-lang`. But under jsdom it **silently passes regardless of geometry**: a 10×10 `<button>` with `runOnly: {type:'rule', values:['target-size']}` yields `violations 0 / incomplete 0 / passes 1`, because `getBoundingClientRect` returns zeros and axe reaches a *pass* verdict.

**Decided:** add `'target-size': { enabled: false }` to the axe helper **with a comment pointing at `apps/showcase-e2e/tests/density.spec.ts`**, so the gate's real location is discoverable rather than implied. The helper already documents the analogous reasoning for contrast at `:10-12`.

### 8.9 Non-issues, verified

- **Reduced motion.** Zero SCSS in `packages/core/src/lib` transitions `height`, `padding`, `gap`, `width` or `all`, so a runtime density switch (which the `/density` toggle performs live) causes no animated reflow.
- **200% browser zoom.** Page zoom scales the CSS px unit with the target, so the floor does not move.
- **RTL.** Every substitution in §7 replaces a symmetric shorthand or a Material `*-start/end-space` logical token. No new physical-direction asymmetry is introduced. The accordion's `1rem` inline padding is symmetric; nav-list's nested-group indent is already logical.

---

## 9. Testing & verification plan

### 9.1 The suites

| # | Spec | Asserts |
|---|---|---|
| 1 | **`tools/generate-tokens.test.mjs`** (new) + a `"test:tokens"` script + a CI step | **A1 — structure and values.** Exactly three blocks are emitted: `:root`, `:root[data-density='compact']`, `:root[data-density='comfortable']`. **No `[data-density='default']` block is emitted anywhere.** All **five** primitives appear in each of the three. Every value matches §4.4's anchor table. Every height in every block resolves ≥ 1.5rem. <br>**A2 — `:root` is ADDITIVE-ONLY with respect to `main`.** Parse `main`'s generated `:root` block and the branch's into ordered name→value maps and assert three things separately: `removed` is empty, `changed` is empty, and `added` is exactly the five new names. Mechanically checkable without a `main` checkout by reusing `packages/tokens/primitives.snapshot.json` (`main`'s 17 names): all 17 survive with unchanged values, and the new count is exactly **22** — which is already what row 2 gates, so the two rows now agree. **Declaration ORDER inside `:root` is explicitly out of scope** (`flattenPrimitives` ordering is an implementation detail, and the api-snapshot union-order trap from v1.11–v1.14 applies). <br>*v2 fused "all five present in each block" with "the `:root` block is byte-identical to `main`'s". `main`'s `:root` contains none of the five, so those were mutually exclusive — and it was PR 1 exit criterion 2 (§1.2 B2). The invariant intended was additive-only, not identical.* <br>`generate-tokens.mjs` has **no test at all** today while both siblings do (`package.json:16` `test:design-tokens`, `:18` `test:mcp-data`, run at `ci.yml:133`, `:137`). *(v2 cited `:15`/`:17`, which are `test:schematics` and `test:mcp`; the paired `ci.yml` cites were correct.)* |
| 1b | same file | **`densityLevels` value backstop (§5.1's runtime half).** For every level: `Object.keys(flattenPrimitives(values))` equals `Object.keys(flattenPrimitives(densityDefaults))`, the flattened maps are **not** equal, and **every** key's value differs from default. Catches the right-name/wrong-value typo the type system cannot see (§1.2 M4). |
| 1c | same file | **B3 regression guard.** Compile `_density.scss` + `_bridge.scss` and assert the emitted `:root` block contains **no** `--mat-paginator-container-size` declaration, and that `:root[data-density='compact']` contains exactly one, at `3.25rem`. This is the assertion that would have caught the default-density paginator shrink (§1.2 B3). |
| 2 | `tools/verify-tokens.mjs` · `generate-mcp-data.mjs` · `generate-design-tokens.mjs` | the five names appear as published primitives with `$type: 'dimension'`, **exactly once each** (the §5.3 dedupe), snapshot count is **22**, and none appear in the 60-name CONTRACT. |
| 2b | `tools/generate-design-tokens.test.mjs` §7 + `tools/generate-mcp-data.test.mjs:69-76` | add a `--control-height-md` / `--row-height` case to each. Neither *breaks* without the `primitiveType()` edit — they just fail to cover the new family, which is exactly how the `'color'` fallback ships unnoticed. |
| 3 | **`apps/showcase-e2e/tests/geometry.spec.ts`** (new) | §9.2. **This is the gate.** ~20 named-value rows, ~9s. |
| 4 | `packages/core/src/lib/density/rhombus-density.service.spec.ts` (new) | the interaction tests in §9.4. |
| **4b** | **`packages/core/src/lib/density/rhombus-density.providers.spec.ts` (new)** | **THE B1 GATE.** Bootstraps through the **public** path — `configureTestingModule({ providers: [provideRhombusDensity('compact')] })` plus `createComponent` of an **empty** host — and asserts `<html>` gains `data-density`. **This file must contain zero occurrences of `RhombusDensityService`**: injecting it would construct the service by hand and the test would pass against the broken implementation, which is exactly how v2's four service tests were blind (§1.2 B1). Also asserts the attribute is **absent** with no provider (the byte-identical promise), and that the dev-mode child-injector warning fires while the root attribute stays unchanged. Enforce the no-`RhombusDensityService` constraint with a one-line grep in the PR checklist so the file cannot rot back into the hole. |
| **4c** | **`packages/core/src/lib/density/rhombus-density.providers.spec.ts`** | **H4 probe.** `--mat-checkbox-state-layer-size` set on `documentElement` → `provideRhombusDensity()` warns once; empty → it does not warn. jsdom is sufficient: this reads a custom property, not layout. |
| 5 | `packages/core/src/lib/data-table/rhombus-data-table.component.spec.ts` (extend) | `density` set → the **template div** gets `[data-density]`; omitted → attribute absent; `'dense'` accepted; **`'default'` accepted and emits the attribute** (v1's test matrix covered set/omitted/`'dense'` and would not have caught the escape being a no-op). |
| 6 | the 8 form-field specs (extend) | the `size` class is still applied and the `<mat-label>` element is still rendered — locks the non-breaking promise as far as jsdom can. |
| 7 | `apps/showcase-e2e/tests/density.spec.ts` (new) | the browser-only a11y assertions from §8, the per-element 1.4.12 probes from §8.4, the toggle-wiring test, **and one assertion that a global compact leaves `--mat-paginator-form-field-container-height` at 40px** (§7.10). <br>**Plus, as the FIRST test in the file — the prerender assertion.** Fetch `/density` with Playwright's `APIRequestContext` (which executes **no** scripts) and expect the raw HTML to match `/<html[^>]*\sdata-density="default"/`. This is the only check that fails if the provider is inert, if the service reverts to the `document` global, or if a platform guard is reintroduced. Feasible as-is: `outputMode: static` emits per-route directories (`dist/apps/showcase/browser/{motion,theming,…}/index.html`) and `showcase:serve-static` serves that tree — no new job, no new browser, no config change. |
| **7b** | same file | **Rule T gates (§8.3).** (a) At compact, for each of `.rhombus-button--sm/--md/--lg`, the `.mat-mdc-button-touch-target` span's `getBoundingClientRect().height` equals the button's own height (±0.5px) — goes red if §7.1's SCSS block is dropped or mis-scoped. (b) **The leak gate**, the assertion that would have caught the §7.4 defect: at `:root[data-density='compact']`, `getComputedStyle(document.documentElement).getPropertyValue('--mat-checkbox-touch-target-size')` is **empty**, and an out-of-scope `<rhombus-checkbox>` rendered outside any data-table still measures a 48px `.mat-mdc-checkbox-touch-target`. Both must be e2e, never jest — §8.8 records that jsdom returns zeroed rects and axe silently passes. |
| 8 | `apps/showcase-e2e/tests/contrast.spec.ts` (edit) | add `'/density'` to `ROUTES`. *(The `COMPONENTS` extraction to `routes.ts` is dropped — it existed so the golden baseline could share the route list; the named-value gate names its own routes.)* |

**jest vs Playwright.** jsdom has no layout engine (`packages/core/src/testing/axe.ts:10-12`, `apps/showcase-e2e/playwright.config.ts:3-13`), and jest specs never load `packages/core/scss` or `_bridge.scss` (`packages/core/jest.config.ts` has no CSS transform; `setupFilesAfterEnv` is only `src/test-setup.ts`, `:6`). **jest can verify the token data and the DI wiring; it cannot verify a single pixel.**

An exhaustive grep for `height|offsetHeight|getBoundingClientRect|clientHeight` across all spec files returns hits in exactly one file (`rhombus-skeleton.component.spec.ts:15,27,142,145,159,172`), and every one is about the skeleton's explicit `[height]` *input* passed through to a CSS var, not measured layout. **Geometry changes break nothing in jest** — which is precisely why §9.2 exists.

### 9.2 The non-breaking proof — a named-value geometry gate

**Shipped: `apps/showcase-e2e/tests/geometry.spec.ts`.** A list of named selectors, properties, and the literal value that ships today, asserted at default density. ~10 routes, ~20 rows, one Playwright navigation per route, **~9s** in the existing `e2e` job. No golden file, no generated keys, no regenerator.

**Why v1's proposed test could never work.** It inspected the generated `:root` custom-property block. Every one of the ~15 regressions originated in **component SCSS replacing a literal with a var whose default differed**. Inspecting a variable's value tells you nothing about whether some component's `padding: 8px 12px` became `var(--control-pad-x)` = 16px. Wrong layer entirely.

**Why the elaborate v2/v3 design was dropped.** Revisions 2 and 3 specified a full DOM-walking computed-style golden: a signature-path key language, run-collapsing for repeated siblings, in-scope ancestor hops, an authored `exampleId` on every demo (54 usages / 48 files), 48 committed JSON files, and a regenerator that `git worktree add`s the merge-base, builds it and serves it. It was **disproportionate to the question it answers** — "did any default geometry move?" — and its complexity was self-generated: most of the design existed to solve problems the approach itself created (key churn, duplicate-id merging, corpus size).

It also rested on a **false premise, caught at first contact with the code**: it rooted collection at `[data-example-id] .example__preview`, assuming `<app-example>` wraps demos generally. It does not. `<app-example>` appears **54 times and only in the Overview tab** (one hero per component); the Examples tab — where every size, variant and appearance actually renders, e.g. **31 `<rhombus-button>` instances** on `/components/button` — uses raw markup under `.showcase-section` / `.showcase-row` with no wrapper at all. The golden would have watched 54 hero demos while the variant markup went unmeasured, and the record count would still have landed near the predicted ~2,200, so nothing would have looked wrong. §9.2 of v3 nonetheless listed `button sm/lg padding ✅` as caught. It would not have been.

**What the gate asserts.** Each row is `{ selector, property, expected, why }`, with `why` carrying the source citation so a failure is diagnosable without opening the spec:

```ts
{ sel: '.rhombus-button--sm', prop: 'min-height',  expect: '32px', why: 'scss:36' },
{ sel: '.mat-mdc-row',        prop: 'height',      expect: '52px', why: '_m3-table.scss:50' },
{ sel: '.rhombus-nav-list__item', prop: 'padding-left', expect: '12px', why: 'scss:81' },
```

The expected values are **transcribed from §7**, which already audited each one against source when it verified the substitutions were default-equal. The gate does not rediscover the inventory; it pins it.

**Two rules the implementation must keep.**

1. **A selector matching nothing is a FAILURE, never a skip.** Silent non-matching is how a gate reports green while measuring nothing — the defect class that shipped five non-existent `--mat-*` names in v3 (§1.2 F2) and rooted v3's collector at a wrapper that covers 10% of the demos. Verified by deliberately pointing a row at a bogus selector and confirming a hard failure.
2. **Assert the property density *drives*, never a rendered box that merely depends on it.** Segmented is the worked example: Material's rule is `line-height: var(--mat-button-toggle-height, 40px)` on `.mat-button-toggle-label-content`, so the *rendered* box is **41.5px** (inline-block descender overflow) and is font-metric dependent — it would differ between a Windows dev box and the CI runner, reproducing exactly the flakiness that got `getBoundingClientRect` goldens rejected. Asserting the `line-height` is deterministic and is the value the substitute-var actually changes. Same reasoning applies to any content-sized box: prefer `min-height`, `padding-*`, `gap`, `line-height` and specified-value custom properties over used-value `width`/`height`.

**The precondition** is `expect([null, 'default']).toContain(<html data-density>)` — written as an assertion about the *level*, not "the attribute is absent", so it keeps biting once PR 3 registers `provideRhombusDensity('default')` in the showcase and the attribute is always present.

**Coverage, stated honestly.** This catches a regression **only in what is on the list**. That is accepted: §7 *is* the enumeration of what density touches, so a change outside it means someone went off-plan, which code review owns rather than CI. Adding a row when §7 grows is a one-line edit and should be part of any PR that adds a substitution.

**And one thing it structurally cannot claim.** It proves *"default is unchanged"*. It proves nothing about whether compact and comfortable are **good** — §8's probes own that. The temptation once this ships will be to read a green gate as "density is verified". It is the non-breaking half only.

**PR gates.** PR 1 lands the file green against untouched `main` (verified: 10/10). PRs 2 and 3 must keep it green — a row that legitimately changes means a substitution was *not* default-equal, which is a design question, not a test-maintenance chore.


### 9.3 The e2e density-setting mechanism

The theme e2e seeds `localStorage` pre-paint (`contrast.spec.ts:83-90`). **Density cannot reuse that** — there is no persistence, so there is no key to seed and nothing reads one.

**Decided: post-load `page.evaluate` writing the attribute directly**, plus **one** test that clicks the real `/density` toggle. `addInitScript` is wrong (the service's effect runs at bootstrap and would clobber a pre-boot attribute); but because the signal never changes afterwards, the effect never re-runs, so a post-load write sticks.

```ts
async function setDensity(page: Page, mode: Density) {
  await page.evaluate((m) => document.documentElement.setAttribute('data-density', m), mode);
  await page.waitForFunction((m) => document.documentElement.getAttribute('data-density') === m, mode);
}
```

The `waitForFunction` is required — without it the assertions race the style recalc. This needs zero test-only product code, drives the **public** contract, and works on **every** route, so compact target-size can be asserted on `/components/button`, not only on `/density`.

**The toggle test is not redundant — but it is not provider cover either.** `page.evaluate` deliberately bypasses `RhombusDensityService`, so it would keep passing even if `provideRhombusDensity` were completely broken. One test — click the `/density` control, assert `<html>` gains the attribute — covers the **signal → attribute** path. Keep it.

**Do not, however, treat it as cover for provider wiring.** It runs on `/density`, the one page that injects the service directly (§10.1 item 2), so it would pass with the provider inert — that is precisely how v2's B1 survived its own test plan (§1.2 B1). Provider wiring is covered by **§9.1 row 4b** (jest, the public path, with `RhombusDensityService` forbidden from the file) and the **prerender assertion in row 7** (raw HTML, no scripts executed). The toggle test now has two independent backstops rather than being the sole cover.

### 9.4 Branch-coverage strategy for the 88% floor

The gate is defined in exactly one place — `packages/core/jest.config.ts:23-30`: lines 95, statements 95, functions 90, **branches 88**. No other project has a `coverageThreshold`, so a density service placed outside `packages/core` would be **coverage-ungated**. `--configuration=ci` turns coverage on via `nx.json:48-60`, and `ci.yml:103` runs it for all projects.

`collectCoverageFrom` counts **every** shippable file under `src/lib`, not just imported ones (`jest.config.ts:11-16`, whose comment says *"This makes the ratchet honest"*). **Creating `packages/core/src/lib/density/*.ts` without a spec immediately drags the global percentages down.** Impl and spec land in the same commit.

**The SSR early return no longer exists** (§1.2 B1b), so the **service is branch-free**. Under §3.1's omissions the feature's only instrumentable conditionals are the provider's two **dev-mode** branches — the child-injector mismatch and the `mat.density` probe. (v1 counted the data-table's `??` as another; it lives in an Angular template expression string, which istanbul cannot instrument.) The denominator therefore **shrinks**, which makes the 88% floor easier, not harder. Covered by:

1. unconfigured injection → `density() === 'default'` and `<html>` gets `data-density="default"`
2. `provideRhombusDensity('compact')` → attribute is `compact`
3. `density.set('comfortable')` + flush → attribute re-written (covers `apply()` a second time via the effect)
4. **a child environment injector registering a different level** → the dev warning fires and the **root attribute is unchanged** (§9.1 row 4b). *This replaces v2's `{ provide: PLATFORM_ID, useValue: 'server' }` test, which asserted behaviour the design now deliberately inverts.*
5. the `--mat-checkbox-state-layer-size` probe, both legs (§9.1 row 4c)

> The **true server behaviour** — that the attribute **is** written during prerender — is unprovable in jsdom and is covered instead by the prerender assertion in §9.1 row 7.

### 9.5 Existing specs that need updating

| Spec | Why | Verdict |
|---|---|---|
| `apps/showcase/src/app/pages/migrate/migrate-page.component.spec.ts:19-24` | asserts `boxes.length > 40` and `.finder__group` length **exactly 2** | safe **only if** the `mat.density` row keeps `pkg: 'material'` (§10.1). A third `pkg` value both fails this and renders nowhere |
| `apps/showcase/src/app/pages/roadmap/roadmap-page.component.spec.ts:25-33` | asserts every track's columns are exactly `['Shipping now','Up next','Considering']` | stays green (columns render unconditionally by title) — but **add a non-emptiness assertion while in the file**, since this is the test that would catch an emptied Foundations `next` column |
| `apps/showcase/src/app/pages/accessibility/accessibility-page.component.spec.ts:20,29-37` | `.a11y__grid li` count === `CONTRAST_VERIFIED.length`, and every slug must resolve to `/components/*` | **safe only if `a11y-coverage.ts` is left untouched** (§10.2) |
| `apps/showcase-e2e/tests/contrast.spec.ts` | +2 cases (one per theme). The `COMPONENTS` extraction is **dropped** — it served the golden baseline only. | ROUTES is 2 + 46×3 = 140 routes × 2 themes = 280 tests at 2 workers / 60s timeout (`playwright.config.ts:24,28`). +2 needs no config change. The extraction is a pure move with no behaviour change |
| `apps/showcase-e2e/tests/geometry.spec.ts` (new) | adds **10 tests** (one per asserted route) to the same `e2e` job | Measured at **~9s** against `showcase:serve-static`. **No `playwright.config.ts` change is needed.** |
| ~~`example.component.ts` + ~48 page files~~ | ~~`<app-example>` gains a required `exampleId`~~ | **DROPPED with the golden baseline (§9.2).** The named-value gate needs no anchor. `exampleId` was implemented and reverted; if deep-linkable examples are wanted, that is a standalone PR with its own rationale. |
| the 8 form-field specs | new label-presence + size-class assertions | additive |

---

## 10. Showcase, docs & regen

### 10.1 File-by-file change-set (all PR 3 unless noted)

| # | File | Change |
|---|---|---|
| 1 | `apps/showcase/src/app/pages/density/density-page.component.{ts,scss}` | **New.** Clone `/motion` (101 lines, plain `showcase-page` div, **not** `<app-component-page>`, default-exported, standalone, OnPush, sibling `.scss`). Root must be `<div class="showcase-page density">` (mirrors `motion-page.component.ts:28-30`) — the contrast spec waits on `.showcase-page, .home`. Derive the 3-column token table per §5.4, **with the `as keyof typeof` casts**. |
| 2 | same file | **The live toggle.** No showcase-level density control exists to clone, so render `<rhombus-segmented ariaLabel="Density" [options]="levels" [value]="current()" (valueChange)="setDensity($event)" />` using `SegmentOption<RhombusDensity>` (`rhombus-segmented.component.ts:121,123,139,142`) bound to `RhombusDensityService.density`. **Prose must state the toggle is global and unpersisted.** |
| 3 | `apps/showcase/src/app/app.config.ts` | Add `provideRhombusDensity('default')` after the icons block (`:22-27`). Passing `'default'` explicitly is documentation-by-example. **Must land in PR 3, not PR 1.** With the provider now eager and writing through `DOCUMENT`, this is a **real behavioural change**, not test hygiene: adding this line makes every prerendered showcase page emit `data-density="default"` on `<html>`, which the geometry baseline observes (§9.2's guard 1, and the `null` ↔ `'default'` golden-header transition). |
| 4 | `apps/showcase/src/app/app.routes.ts` | Insert a flat route immediately after `:310`: `{ path: 'density', title: 'Density', loadComponent: () => import('./pages/density/density-page.component') }`. **Must be `export default class DensityPageComponent`** — every route here uses bare `import(...)` with no `.then()`. |
| 5 | `apps/showcase/src/app/shared/navigation.ts` | One line after `:26`: `{ path: '/density', label: 'Density' },`. Lands in the `Get started` group, lighting up the header Guides dropdown **and** Cmd-K (`NAV_COMMANDS`, `:118-120`). **Keep the exact single-line form** — both generators regex-parse it (§14, R7). |
| 6 | `apps/showcase/src/app/pages/tokens/tokens-page.component.ts:102-112` | **Added — v1 missed this and no gate catches it.** The section is titled "Geometry & motion primitives" and its lead enumerates the theme-invariant layer as exactly *"Radius, border-width, and motion"*, adding *"There's no need to define a parallel `--r-*` / `--motion-*` scale."* Five published dimension primitives make both statements incomplete. There is **no** `tokens-page.component.spec.ts` and the strings are hard-coded template literals, so nothing in CI fails — which is exactly why it ships wrong. |
| 7 | `apps/showcase/src/app/pages/roadmap/roadmap-data.ts` | Move the sole `foundations.next` item (`:124-130`) into `foundations.now` with a release tag. **Refill `next`** by promoting the top two `considering` entries — Theme registry (`:132-136`) and High-contrast theme (`:142-145`) — and delete them from `considering`. Without the refill the column renders empty. |
| 8 | `apps/showcase/src/app/pages/roadmap/roadmap-page.component.ts` | `:38` still lists density as un-shipped Foundations work — change `(density, theming, RTL, and tooling)` → `(theming, motion, RTL, and tooling)`. Also update `roadmap__shipped` (`:42-47`). |
| 9 | `apps/showcase/src/app/pages/migrate/material-map.ts` | Add the `mat.density` row after the `Tree` row (`:61`) and **before** the CDK banner (`:63`), under its own comment banner. `match: 'partial'`, `pkg: 'material'` (mandatory — §9.5), `api: 'mat.density'` (must be unique; `api` is the identity key). Content per §11. |
| 10 | `apps/showcase-e2e/tests/contrast.spec.ts` | Add `'/density'` to `ROUTES` after `:77`. **Do not touch `COMPONENTS`** — those are exploded into three `?tab=` URLs and a plain foundation page has no tabs. |
| 11 | `packages/core/src/index.ts` | The barrel block from §3.4 (**PR 2**, retargeted from PR 1 — §1.2 M3). PR 1 would freeze three symbols into an api-snapshot-gated barrel while nothing reads the primitives they drive, and would land `src/lib/density/*.ts` inside `collectCoverageFrom` (`jest.config.ts:11-16`) ahead of their specs. Moving to PR 2 keeps PR 1 free of any `packages/core` TypeScript. |

### 10.2 The contrast-gate rule

> `/density` goes in `contrast.spec.ts` **ROUTES only**. It must **NOT** go in `a11y-coverage.ts`.

`accessibility-page.component.spec.ts:29-37` builds its valid-slug set from `NAV_COMMANDS.filter((c) => c.path.startsWith('/components/'))` and asserts `expect(unknown).toEqual([])`. The nav entry is `/density`, not `/components/density`, so adding a `CONTRAST_VERIFIED` entry would fail with `['density']` vs `[]`. A second assertion (`:20`) binds the rendered `<li>` count to `CONTRAST_VERIFIED.length`. Leave the file alone.

Caveat: `/motion` is not currently in ROUTES, so `/density` becomes the first foundation page besides `/theming` under the real-browser contrast gate. A 3-column table and a segmented control introduce fresh colour pairs that have never been scanned — **run `nx run showcase-e2e:e2e` locally before pushing.**

### 10.3 The regen chain, in order

Order matters twice: `verify-tokens` reads `packages/tokens/dist/css/theme-rhombus.css` (`:102-105`), so the **build must precede it**; `generate-mcp-data` reads `docs/theming.md` at `:154` and `apps/showcase/public/design-tokens.json` at `:155`, so **design-tokens must precede mcp-data**.

```
1. corepack pnpm --filter @rhombuskit/tokens run generate    # generate-tokens.mjs
2. corepack pnpm exec nx run-many --target=build --all       # verify-tokens/api-snapshot read dist
3. node tools/verify-tokens.mjs --update-snapshot            # primitives.snapshot.json 17 -> 22
4. node tools/api-snapshot.mjs --update                      # etc/{core,tokens}.api.md + api-metadata.ts
5. corepack pnpm exec tsx tools/generate-design-tokens.mjs   # design-tokens.json
6. node tools/generate-llms.mjs                              # llms.txt + llms-full.txt
7. node tools/generate-mcp-data.mjs                          # packages/mcp/src/generated/mcp-data.ts
8. # CRLF restore BEFORE committing:
   git status --short packages/tokens/src/generated packages/tokens/*.snapshot.json
   git checkout -- packages/tokens/src/generated/contract.css \
                   packages/tokens/src/generated/_contract.scss \
                   packages/tokens/src/generated/_theme-rhombus.scss \
                   packages/tokens/src/generated/index.scss \
                   packages/tokens/contract.snapshot.json
9. corepack pnpm exec tsx tools/generate-design-tokens.test.mjs \
   && node tools/generate-mcp-data.test.mjs \
   && node tools/generate-tokens.test.mjs \
   && corepack pnpm nx test tokens
```

**Generated-file impact.** Real content change (4): `primitives.css`, `_primitives.scss`, `theme-rhombus.css` (embeds `primitivesCSS` at `generate-tokens.mjs:85`), `tokens.ts` (flat primitives at `:156` gains 5 keys, plus the new `density` const). **Pure CRLF noise on Windows (4):** `contract.css`, `_contract.scss`, `_theme-rhombus.scss`, `index.scss`. Outside `src/generated`: `primitives.snapshot.json`, `design-tokens.json`, `mcp-data.ts`, `etc/tokens.api.md`, `etc/core.api.md`, `api-metadata.ts`, `llms.txt`.

**Nine CI `--check` gates** enforce this, all in the `build:` job **after** `nx run-many --target=build --all` (`ci.yml:123`): `verify-tokens.mjs` (`:124-125`), `verify-component-styles.mjs` (`:126-127` — gates new density SCSS for Sass `//` leaks), `api-snapshot.mjs` (`:128-129`), `generate-llms.mjs --check` (`:130-131`), `test:design-tokens` (`:132-133`), `generate-design-tokens.mjs --check` (`:134-135`), `test:mcp-data` (`:136-137`), `generate-mcp-data.mjs --check` (`:138-139`) — **plus `test:tokens` (new) = nine.** (v1 said "ten" and enumerated nine.) Outside `build:`: `typecheck` (`:39-47`), `stackblitz` (`:141-160`), `a11y` (`:162-179`).

### 10.4 Documentation

| File | Change |
|---|---|
| `docs/theming.md` | **New `## Density` section between `## Overriding token values` (`:183`) and `## The Material bridge` (`:199`).** Cover: the provider one-liner; **the mandatory `material-bridge()` include and exactly which components need it (§11)**; the three levels; the `data-density` attribute; the box/type orthogonality; the WCAG floor; the honest OUT list from §6.3. Plus **three required subsections**: (1) **SSR and prerendering** — the level is written during prerender, so statically rendered pages ship correct density markup with no hydration shift, and **that is why density needs no pre-paint script**, in explicit contrast with `## No flash on first paint` (`:113`), whose mechanism is localStorage; (2) **Limitations** — the CSR-only paint window and its one-line `<html data-density="…">` mitigation, one level baked per static build, no persistence across reload; (3) **Migrating from `mat.density`** under the anchor **`#migrating-from-mat-density`**, which the dev-mode probe links to, so the anchor is **load-bearing, not decorative** — content is §11.5's case-(a) delta table plus §11.4's swap. Also extend `:16` to mention geometry. **Editing this file forces a regen** — it is a direct input to both generators (`generate-mcp-data.mjs:154`; v2 cited `:155`, which is `design-tokens.json` — §10.3 had it right, so the spec disagreed with itself). |
| `packages/core/README.md` | Add `provideRhombusDensity()` as a commented optional line in the `## Setup` step-2 providers block (`:39-53`), shown **inside `bootstrapApplication`'s providers specifically**, **with the bridge-include caveat** and a one-line note that route-level registration is ignored (and warns in dev). |
| `packages/tokens/README.md` | No new subpath (§5.2 keeps one artifact), but note the density blocks ride inside `./css/primitives` and `./scss/primitives`. |
| `README.md` | Extend the Theming-guide bullet (`:17`) to *"…custom themes, density, and the Material bridge."* No new bullet. |

---

## 11. Migration story vs `mat.density`

### 11.1 What Material's density does

`mat.density($scale)` selects an index into per-component literal lists at **Sass compile time** (`core/theming/_definition.scss:77`; index math `($scale * -1) + 1`). Scale runs 0 → −3/−5 depending on component. It changes only `*-container-height`, `*-state-layer-size`, `*-vertical-padding`, `*-touch-target-display` and `*-start/end-space`.

### 11.2 What it cannot do

- **No positive direction.** Material's maximum is 0. There is no "comfortable" — the scale only ever removes.
- **No runtime switching.** There is no `--mat-sys-density-*`; the scale resolves in Sass. Switching at runtime means precompiling one full token block per level.
- **No-ops on six components**, provably: no `get-density-tokens()` exists in `dialog`, `menu`, `datepicker`, `card`, `slider` or `snack-bar` (§6.3).
- **Flat where you need it most.** `button-toggle` is 40px at 0, −1 and −2 (`_m3-button-toggle.scss:70`).
- **A silent a11y cliff at −2.** Touch targets and the filled floating label vanish with no warning (§8.2).
- **A live touch-target overlap bug** below 48px rows, which we fix (§8.3).

### 11.3 What RhombusKit does differently

| | `mat.density` | RhombusKit density |
|---|---|---|
| When | Sass compile time | **Runtime**, via one attribute |
| Surface | a Sass mixin inside a theme object | `provideRhombusDensity('compact')` + `RhombusDensityService` (a `WritableSignal`) |
| Emission | one full token block **per level** | one custom-property set; levels rebind five vars plus internal values |
| Levels | 0 / −1 / −2 / −3 (numeric, one-directional) | compact / default / comfortable (named, **bidirectional**) + a table-only `dense` |
| Units | px | **rem** (SC 1.4.4) |
| Property | `height:` | **`min-height:` where RhombusKit owns the property; Material-backed controls keep a fixed height and rely on the anchor values themselves clearing the floor** (§8.4) |
| a11y floor | none — −2 deletes touch targets and the filled label | every level clears 24×24; **no −2/−3 equivalent exists**; the sub-48px touch-target overlap is fixed (§8.3) |
| Scoping | global to the emission selector | global **plus** a table-local `density` input, including a real `'default'` escape |
| Coverage | no-ops on 6 components, silently | the same 6 are **out of scope and documented as such** (§6.3) |
| Reach | Material components only | Material **and five bespoke RhombusKit components** (nav-list, accordion, stepper, chip-group, app-shell) under one switch |

> **Two v1 claims corrected here.** (a) The property row no longer sells `min-height` as a categorical advantage — §7.3, §7.4 and §7.8 concede the hard `height` honestly. (b) The reach row says **five**, not "~15": the bespoke components actually touched are nav-list, accordion, stepper, chip-group and app-shell.

### 11.4 The exact swap — **and the one SCSS line that IS required**

```scss
// BEFORE — Angular Material
@use '@angular/material' as mat;
html {
  @include mat.theme((color: (…), typography: Roboto, density: -1));
}
```

```scss
// AFTER — DELETE the `density` key. Do NOT leave it at 0; delete it.
// (`mat.all-component-densities(-1)`, if you use that form, is deleted outright.)
@use '@angular/material' as mat;
@use '@rhombuskit/tokens/scss';
@use '@rhombuskit/material-preset/scss' as rhombus;

html { @include mat.theme((color: (…), typography: Roboto)); }

// The ONE line RhombusKit density requires. This is NOT optional.
:root { @include rhombus.material-bridge(); }

// KEEP your density on the five components RhombusKit leaves alone (§6.3).
// These names are declared nowhere in RhombusKit, so there is no conflict —
// this is the supported way to retain them.
:root {
  @include mat.checkbox-overrides((state-layer-size: 36px));   // was -1
  @include mat.radio-overrides((state-layer-size: 36px));
  @include mat.expansion-overrides((
    header-collapsed-state-height: 44px,
    header-expanded-state-height:  60px,
  ));
  @include mat.tree-overrides((node-min-height: 44px));
  @include mat.select-overrides((arrow-transform: translateY(-8px)));
}
```

```ts
// AFTER — the provider.
import { provideRhombusDensity } from '@rhombuskit/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideRhombusDensity('compact'),   // = Material -1, but runtime-switchable
  ],
});
```

**What you get, stated honestly:**

- **Identical geometry** on chip, form-field ×8, table (row / header / footer), tabs, selection list (one- and two-line ramps + icon spaces), toolbar (standard **and** mobile), paginator bar, and form-field filled padding — **twelve components, value for value** (§11.5's case-(c) table).
- **Segmented becomes 36px** where `mat.density(-1)` left it at 40px, because Material's button-toggle ramp is flat at −1 (§4.4). This is the one visible change, and it is the feature rather than a regression.
- **Buttons do not move, and never did.** RhombusKit's `height: auto; min-height:` at (0,2,0) has always neutralised `--mat-button-*-container-height` at (0,1,0). If you believed `mat.density(-1)` was compacting your `<button rhombus-button>`, it was not.
- **Runtime switching**, a `comfortable` direction, no −2 cliff, and the sub-48px touch-target overlap fix (§8.3) — none of which `mat.density` offers.
- **You must restore the five out-of-scope components by hand** (the SCSS above), or accept +4px on checkbox/radio state layers, `mat-expansion`, `mat-tree`, and the select arrow offset. `rhombus-checkbox` and `rhombus-radio` **are** shipped RhombusKit components, so this is a real, visible change — not hypothetical. §6.3 is where the decision to exclude them is recorded.

```ts
// …and it is switchable at runtime, which mat.density cannot be:
private readonly density = inject(RhombusDensityService);
onUserPickedCompact() { this.density.density.set('compact'); }
```

> **v1 §11.4 was captioned "Nothing in SCSS changes at all." That was exactly backwards.** `material-bridge()` is **opt-in** (`packages/material-preset/src/styles/index.scss:3-9`, mixin at `_bridge.scss:25`), and a developer migrating off `mat.theme((density: -1))` by definition has **not** included it. Without that line, `provideRhombusDensity` no-ops on every Material-backed component.

**Scope the caveat precisely** — it is not a blanket warning. Because §2.3 puts two of the Material rebinds on RhombusKit's own classes, density works **without** the bridge for: **button, segmented, chip, chip-group, nav-list, accordion, stepper**. It **requires** the bridge for: **form-field family (×8), data-table, selection-list, tabs, toolbar, paginator**.

> **The same bridge-independence is what makes case (b) in §11.5 non-empty.** A `mat.density` user who never includes the bridge still gets a +4px chip, because `.rhombus-chip` **is** the `.mat-mdc-standard-chip` element and there is no ordering that undoes it.

`/migrate` row: `match: 'partial'`, and **partial is the honest word** — the surface differs (a provider + attribute, not a Sass mixin), the level set differs (three named levels vs four numeric ones), and the low end is deliberately unreachable (§8.2). Do **not** mark it `full`.

### 11.5 Coexistence with `mat.density` — unsupported, and here is exactly why

> **Policy: running a Material density scale and RhombusKit density in the same app is UNSUPPORTED.** It is not blocked — nothing *can* block it — it is detected in dev mode, and this section states the delta so the decision is informed rather than discovered. v2 had no treatment of coexistence anywhere, while §11 targets precisely this persona (§1.2 H4).

#### 11.5.1 The three cascade positions

`mat.theme((density: N))` and `mat.all-component-densities(N)` emit, at the caller's selector, one **flat `--mat-<token>: <value>;` declaration** per token from `get-density-tokens($scale)` across 17 components when `$scale != 0` (`core/tokens/_system.scss:140-158`, component list at `:165-186`). No `current-selector-or-root` wrapper, no `!important`, no system-token indirection. Those declarations collide **by name** with RhombusKit's, and the collision resolves differently depending on which of RhombusKit's three cascade positions the value lives in:

| # | Position | Selector | Beats `mat.theme` at `html` (0,0,1)? | at `:root` (0,1,0)? |
|---|---|---|---|---|
| **P1** | component-class rebind (§2.3) — `.rhombus-chip`, `.rhombus-segmented`, `.rhombus-data-table[data-density]` | on/above the consuming element | **Always** — custom-property resolution takes the *nearest declaring ancestor*; specificity and order never enter | **Always** |
| **P2** | `_density.scss` level blocks (§4.3) | `:root[data-density='compact'\|'comfortable']` = (0,2,0) | **Always** | **Always** |
| **P3** | bridge substitute-var — `mat.form-field-overrides()`, `mat.table-overrides()`, `mat.tabs-overrides()` | the bridge's include selector, normally `:root` = (0,1,0) | **Always** | **Tie → source order; last include wins** |

Two consequences worth stating, because they are counter-intuitive: **P3 is the only position where the consumer's include order matters**, and only in the narrow case where they wrote `:root { @include mat.theme(…) }` rather than Material's documented `html { … }`. And **P1 and P2 win even against `html { @include mat.theme(…) }` written after the bridge** — there is no ordering a consumer can choose that restores their `mat.density` values for chip, segmented, or any per-level token.

#### 11.5.2 Case (a) — `material-bridge()` **and** `mat.theme((density: -1))`, no `provideRhombusDensity`

`data-density` is `'default'` (§3.1 always writes it), so `_density.scss` emits nothing and P2 is empty.

| Component | Token | Today (−1) | After this epic | Δ | Mechanism |
|---|---|---|---|---|---|
| chip `[rhombusChip]` | `chip-container-height` | 28 | **32** | **+4** | P1 — unconditional |
| segmented | `button-toggle-height` | 40 | 40 | 0 | P1, but `--control-height-md` default 40 == Material's flat −1 |
| form-field ×8 | `form-field-container-height` | 52 | **56** | **+4** | P3 |
| form-field filled | `-vertical-padding` / filled top / bottom | 14 / 22 / 6 | 14 / 22 / 6 | 0 | per-level-only ⇒ nothing at default; Material's survives |
| table row | `table-row-item-container-height` | 48 | **52** | **+4** | P3 |
| table header | `table-header-container-height` | 52 | 52 | 0 | per-level-only |
| table footer | `table-footer-container-height` | 48 | 48 | 0 | per-level-only |
| tabs | `tab-container-height` | 44 | **48** | **+4** | P3 |
| selection list 1/2-line | `list-list-item-*-container-height` | 44 / 60 | 44 / 60 | 0 | per-level-only |
| list leading-icon start/end | — | 12 / 12 | 12 / 12 | 0 | per-level-only |
| toolbar standard / mobile | `toolbar-*-height` | 60 / 52 | 60 / 52 | 0 | per-level-only |
| paginator bar | `paginator-container-size` | 52 | 52 | 0 | per-level-only — **only once B3 is fixed.** Under v2's §7.10 it became 52 unconditionally, which coincidentally matched *here* and diverged for everyone else |
| button (all sizes) | `button-*-container-height` | 32/40/48 | 32/40/48 | 0 | **immune before and after** — `rhombus-button.component.scss:36-38` sets `height: auto; min-height:` at (0,2,0), neutralising Material's `height:` at (0,1,0). `mat.density` has never moved a RhombusKit button |
| icon-button | `icon-button-state-layer-size` | 36 | 36 | 0 | RhombusKit hard-sizes the square at (0,3,0); the state layer is unused geometry |
| checkbox / radio | `*-state-layer-size` | 36 | 36 | 0 | §6.3 out of scope; RhombusKit declares neither name anywhere (verified) |
| select arrow, expansion, `mat-stepper`, tree, fab | — | −1 values | unchanged | 0 | out of scope |
| **all `*-touch-target-display`** | button / checkbox / radio / paginator / fab | `block` at −1 | `block` | 0 | RhombusKit never emits these (Rule T3) |

**The damage is not the +4px. It is the second column of zeros.** The app ends up with a 52px table row *and* a 52px table header — Material keeps a 4px header lead at every index of its ramp, and this is the one configuration that erases it. Likewise a 56px form-field beside a 44px list row, where Material's −1 pairs 52 with 44.

At −2 every +4 becomes **+8** (chip 24→32, form-field 48→56, row 44→52, tabs 40→48) while `touch-target-display: none` **stays** `none` — the app keeps Material's −2 a11y cliff *and* gets larger controls. The worst of both.

*(This table names the two worst rhythm mismatches; pairwise mismatches between an in-scope component that moves and an out-of-scope one that does not are a combinatorial space and completeness is not claimed.)*

#### 11.5.3 Case (b) — `mat.density` **without** `material-bridge()`

P2 and P3 are both empty. Only P1 applies:

| Component | Today (−1) | After | Δ |
|---|---|---|---|
| chip `[rhombusChip]` | 28 | **32** | **+4** |
| everything else | — | unchanged | 0 |

One component, +4px, landing on a consumer who took **no action whatsoever** and gets **no warning** (§11.5.5). §11.4 reassures this reader that density "works without the bridge for … chip"; written as a feature, it is for this reader the entire exposure.

#### 11.5.4 Case (c) — `mat.density(-1)` **and** `provideRhombusDensity('compact')`

P2 wins every per-level token; P3's substitute-vars resolve from the `:root[data-density='compact']` primitives block; P1 resolves the same way. Material's emission is fully shadowed.

| Component | `mat.density(-1)` | `provideRhombusDensity('compact')` | Identical? |
|---|---|---|---|
| chip | 28 | 28 | ✓ |
| form-field container-height | 52 | 52 | ✓ |
| form-field vertical-padding / filled top / bottom | 14 / 22 / 6 | 14 / 22 / 6 | ✓ |
| table row / header / footer | 48 / 52 / 48 | 48 / 52 / 48 | ✓ |
| tabs | 44 | 44 | ✓ |
| list one / two-line | 44 / 60 | 44 / 60 | ✓ |
| list leading-icon start / end | 12 / 12 | 12 / 12 | ✓ |
| toolbar standard / mobile | 60 / 52 | 60 / 52 | ✓ |
| paginator bar | 52 | 52 | ✓ |
| **segmented** | **40** | **36** | ✗ — the sole divergence (§4.4) |

> **Twelve of thirteen in-scope components are value-identical, and the thirteenth diverges only because Material's ramp is flat there.** That is the strongest claim in the whole migration story, and v2 did not make it. It is what makes §11.4 a **swap** rather than a redesign.

Case (c) is therefore *safe* — and also *pointless*: the `mat.density` half is entirely shadowed and only costs the consumer correctness on the out-of-scope tokens.

#### 11.5.5 Detection

In dev mode `provideRhombusDensity()` probes `--mat-checkbox-state-layer-size` **once** at app init and warns if a Material density scale is present (`warnOnMaterialDensity()`, §3.1). The sentinel is false-positive-free by construction: `mat.theme()` emits that token **only** when the scale is non-zero (`_system.scss:149`), and RhombusKit declares the name **nowhere** — the repo's only `state-layer-size` is `--mat-icon-button-state-layer-size` at `rhombus-code-block.component.scss:34`, a different token on a scoped selector. Production builds pay nothing.

**Three limits on the probe, stated rather than implied.** It fires only inside `provideRhombusDensity()`, so a **case-(b)** consumer who adopts nothing never sees it (§14 R25). It detects a scale at `:root`, so a `mat.theme()` emitted at a *scoped* selector (`.legacy-area { @include mat.theme(…) }`) — legal, and producing the same collisions inside that subtree — goes undetected. And it cannot distinguish −1 from −3, so a consumer at −3 gets a delta table that does not quite describe their app.

---

## 12. The three PRs

Each is a **MINOR**. Each is independently shippable, independently verifiable, and independently revertible. v1 proposed all of this as one train 2–4× the size of any shipped component pack.

### PR 1 — Foundation. **Zero component geometry change.**

*(v3.2: this heading also said "and zero `packages/core` TypeScript", and §12 assigned the service/provider/type to PR 2. Both were wrong, and the adversarial review caught the contradiction against what shipped. A foundation whose entry point lands in a later PR is inert and untestable on its own — `provideRhombusDensity()` is what makes PR 1 independently verifiable and independently releasable. The service, provider, type, barrel entry and their two specs are PR 1. The invariant that matters is unchanged and unweakened: **zero component geometry change**.)*

**Scope**

- [ ] `densityDefaults` / `DensityScale` / typed `densityLevels` + the three default exports in `packages/tokens/src/spec/primitives.ts` (§5.1), including the floor comment.
- [ ] `tools/generate-tokens.mjs` scoped emission into **all three** emitted artefacts — `primitives.css`, `_primitives.scss` and `theme-rhombus.css` (§5.2). *(The SCSS entry point is what consumers actually enter through; emitting into the CSS alone left density live at default and inert under `[data-density]`.)* **The `tokens.density` TS export moves to PR 3**, where `/density` is the first thing that reads it — shipping an unused generated export earlier is speculative.
- [ ] Three prefix registrations: `verify-tokens.mjs:21`, `generate-mcp-data.mjs:121`, `generate-design-tokens.mjs:42-48` (§4.5).
- [ ] The `verify-tokens` dedupe (§5.3) — **mandatory, not cosmetic**.
- [ ] `packages/material-preset/src/styles/_density.scss` **created and wired but empty of per-component values** — `@use 'density'` from `_bridge.scss` (**not** `@forward` in `index.scss`: the file declares itself INTERNAL, and forwarding would publish `rhombus.density-levels()` as consumer-callable — §4.3), `'_density.scss'` added to `tools/copy-material-preset-assets.mjs:13`, `density-levels()` included from `material-bridge()` at `_bridge.scss:25` (§4.3).
- [ ] The three **default-equal substitute-var keys** on existing bridge calls (§2.3): `mat.form-field-overrides()` `:168-180`, `mat.table-overrides()` `:216-221`, `mat.tabs-overrides()` `:248-260`. Each must be provably default-equal, so the baseline diff stays empty.
- [ ] `tools/generate-tokens.test.mjs` + `"test:tokens"` script + CI step (§9.1 rows 1, 1b, 1c).
- [ ] ~~`'target-size': { enabled: false }` in the axe helper~~ — **moves to PR 2**, with the components whose targets it concerns. jest-axe does not check target size by default, so in PR 1 it guards nothing (§8.8).
- [ ] Regen chain (§10.3).

**Explicitly NOT in PR 1:** any component SCSS change; any `mat.*-overrides()` geometry key; **any `packages/core` TypeScript — the service, provider, types, barrel entry and their specs all land in PR 2** (§1.2 M3); `provideRhombusDensity` in the showcase's `app.config.ts` (§10.1 item 3); the `/density` page.

**Exit criteria**

1. `verify-tokens` reports **22** published primitives — not 15, not 37.
2. `generate-tokens.test.mjs` green on **both halves of §9.1 row 1**: **A1** — three blocks, five names each, anchors match §4.4, every height ≥ 1.5rem, **no `default` block**; **A2** — `:root` is **additive-only** against `main` (`removed` empty, `changed` empty, `added` exactly the five). *Declaration order inside `:root` is out of scope; do not "fix" it.* Plus rows 1b (every level moves every value) and 1c (no `--mat-paginator-container-size` at `:root`).
3. `design-tokens.json` types all five as `$type: 'dimension'`, and MCP `list_tokens` returns them.
4. **`geometry.spec.ts` is green against untouched `main`** — verified 10/10 before any density code exists, so the baseline it pins is genuinely `main`'s. Both failure modes were exercised deliberately: a wrong expected value fails with its source citation, and a selector matching nothing fails rather than skipping.
5. `api-snapshot` diff is **`etc/tokens.api.md` only**; `etc/core.api.md` is untouched. Restore any unrelated union reordering to `main`'s order (§14, R4).
6. `test:stackblitz` green.

*(v2's "branches ≥ 88% with the `PLATFORM_ID: 'server'` leg covered" moves to PR 2's exit criteria, and the leg itself no longer exists — §9.4.)*

### PR 2 — Tier 1

**Scope** — the §3.4 barrel block and `packages/core/src/lib/density/{density.types,rhombus-density.tokens,rhombus-density.providers,rhombus-density.service}.ts` **plus both spec files** (service spec + the new providers spec, §9.1 rows 4b/4c), landing in the same commit per §9.4's coverage rule · §7.1 button (padding ramp **and** the Rule T touch-target rebind) · §7.2 form-field family (four keys) · §7.3 data-table + its `density` input · §7.4 selection-list · §7.5 nav-list · §7.6 segmented · §7.7 chip + chip-group.

**Checklist**

- [ ] Every substitution carries its `default == shipped` proof in a source comment.
- [ ] Every per-level rule clears the required specificity: button (0,4,0) with `:not(.rhombus-button--icon-button)`; nav-list section/`--list` rules (0,3,0).
- [ ] The data-table binding is on the **template div** (`rhombus-data-table.component.ts:59`), and `density="default"` emits a **real block**.
- [ ] **Rule T fires at exactly two sites and no others** (§8.3): compact buttons (five appearance tokens, scoped to `.rhombus-button--<size>`) and `.rhombus-data-table[data-density='dense']`. **No `*-touch-target-size` declaration appears on `:root`, in `_bridge.scss`, or in `_density.scss`** (Rule T2) — the §9.1 row 7b leak gate asserts this.
- [ ] **The selection-list touch-target rebind is NOT present.** It was inert and leaky (§7.4).
- [ ] The per-level `mat.paginator-overrides()` is in **`_density.scss`**, and **the `mat.paginator-overrides()` call at `_bridge.scss:223-230` is unchanged** — diff that call to confirm zero lines touched (§1.2 B3). *(Do **not** diff the whole bridge to zero: §2.3 requires three existing calls to gain one default-equal key each, and PR 1 adds the `@use`/`@include` at `:25`. An implementer who diffs the whole file to zero either drops the global density path for form-field, table and tabs, or fails their own checklist — §1.2 N1.)*
- [ ] **`dense` table header is `2.5rem` / 40px**; row and footer are `2.25rem` / 36px (§7.3).
- [ ] `--mat-list-item-three-line-container-height` is **not** set anywhere (§7.4).
- [ ] `--mat-paginator-form-field-container-height` is **not** touched anywhere.
- [ ] Segmented's `--mat-button-toggle-height` is applied **uniformly**, never per size variant (§7.6).
- [ ] Comfortable form-field is visually reviewed — the floated-label travel lengthens 4px and has no upstream equivalent (§7.2).
- [ ] The tag-input-inside-form-field pair (52px field, 28px chips) is checked together in Playwright, **and the remove control is measured** to settle the pre-existing SC 2.5.8 question (§7.2).
- [ ] The bonus behaviour — buttons inside a scoped `data-density` table compact correctly — is asserted (§7.3).
- [ ] `rhombus-density.providers.spec.ts` contains **zero** occurrences of `RhombusDensityService` (grep it).
- [ ] Compile `_density.scss` and grep the output for `:root[data-density="compact"]` carrying `--mat-paginator-container-size: 3.25rem` (§4.3).

**Exit criteria**

1. **The geometry baseline diff at default density is empty.** Any non-empty default delta is a defect, not a review item.
2. `geometry.spec.ts` is still green. A row that legitimately has to change means a substitution was **not** default-equal — that is a design question to escalate, not a test to update.
3. Playwright: every interactive host in compact measures ≥ 24×24; `touch-target-display` is never `none`; the form-field floating label has `display !== 'none'`; `getComputedStyle(field).fontSize` is identical across all three levels (the executable proof of box/type orthogonality).
4. **Rule T gates green** (§9.1 row 7b): compact button touch targets equal their box; no `--mat-checkbox-touch-target-size` on `:root`; an out-of-scope `<rhombus-checkbox>` still measures 48px.
5. `rhombus-density.providers.spec.ts` passes without naming the service (§9.1 row 4b), and the **Rule T gates** (§9.1 row 7b) are green.

   *(The **prerender assertion** — §9.1 row 7 — is a **PR 3** exit criterion, not PR 2. Both of its inputs land in PR 3: the `/density` route (§10.1 item 4) and `provideRhombusDensity('default')` in `app.config.ts` (§10.1 item 3, explicitly "must land in PR 3"). In PR 2 no showcase page registers the provider, so nothing emits `data-density` and the fetch has nothing to assert against. **`density.spec.ts` therefore lands split**: row 7b's Rule T gates in PR 2, row 7's prerender assertion and the toggle test in PR 3. This was v3's N-list item F1.)*
6. `packages/core` branches ≥ 88%.
7. A global compact leaves `--mat-paginator-form-field-container-height` at `40px` (§7.10).
8. `api-snapshot` delta now includes `etc/core.api.md` and `api-metadata.ts`.
9. The eight form-field specs and all Tier 1 component specs still green.
10. `test:stackblitz` green — the service imports `@angular/core` only, so no peer edit is needed (§14, R17).

### PR 3 — Tier 2 + surface

**Scope** — §7.8 tabs · §7.9 toolbar (both height tokens; the 56px literal untouched) · §7.10 pagination (bar only) · §7.11 accordion · §7.12 stepper (incl. the local `em` glyph fix) · the nine docstring corrections (§3.3) · the `/density` page + route + nav (§10.1) · `tokens-page.component.ts:102-112` · roadmap promote-and-refill · the migrate row · `theming.md` §Density + READMEs · full regen.

**Checklist**

- [ ] `mat.expansion-overrides()` and `mat.stepper-overrides()` are **not** added (§7.11, §7.12).
- [ ] Toolbar drives **both** `standard-height` and `mobile-height`, or neither (§7.9).
- [ ] The app-shell 56px `min-height` literal is untouched, and the pre-existing bug is filed separately.
- [ ] The `/density` derivation uses `as keyof typeof` (§5.4) — this is a CI-red type error otherwise.
- [ ] The nav entry keeps the exact single-line `{ path: '…', label: '…' }` form (§14, R7); grep `llms.txt` for `/density` after regen.
- [ ] `provideRhombusDensity('default')` lands in `app.config.ts` **here**, and `geometry.spec.ts` stays green — its precondition already accepts `data-density="default"` alongside `null`, so no edit is needed.
- [ ] `docs/theming.md`'s `## Density` section carries the **`#migrating-from-mat-density`** anchor the dev-mode probe links to (§10.4) — the anchor is load-bearing, not decorative.
- [ ] `nx run showcase-e2e:e2e` run locally before pushing (§10.2).

**Exit criteria**

1. Geometry baseline default diff empty, except the deliberate stepper glyph `rem`→`em` conversion, which is reviewed and noted.
2. All nine `--check` gates green (§10.3).
3. `/density` renders `.showcase-page`, passes the contrast gate in both themes, and its table derives from `tokens.density` rather than hard-coded values.
4. The roadmap `next` column is non-empty.

---

## 13. Open decisions register

**Genuinely open — these need a call:**

| # | Decision | Recommendation | Alternative |
|---|---|---|---|
| **D1** ~~*(em conversion)*~~ **RESOLVED in PR 3 — the em conversion was wrong and is dropped.** | **The stepper glyph fix.** v3.2 proposed a rem→em conversion as "the one deliberate default-density change." Measured against the real rendering during PR 3, `em` does **not** work: `em` on `width` is own-font-size-relative (~24px, not 18px) and the bubble font-size is level-invariant, so an em glyph tracks nothing. | **Ship a per-level `rhombus-icon` box instead** (compact 1rem, comfortable 1.25rem), leaving the default `1.125rem` untouched. The glyph now tracks the bubble (18→16→20px) **and default rendering is unchanged**, so PR 3 has NO deliberate default-density change at all — the geometry baseline stays fully empty. Noted in the changelog as a compact/comfortable-only refinement. | ~~Split the em change into its own patch~~ — moot; there is no default change to isolate. |
| **D2** | **Does the `/density` toggle persist across reloads in the showcase only** (a page-local signal, not a shipped preference)? | **No.** Keep the page honest: the toggle is global and unpersisted, and the prose says so. A showcase-only persistence layer would model a feature the library does not ship. | Persist in the showcase for demo comfort, clearly labelled as showcase-only. |
| **D3** | **Reorder-list** is excluded (§6.3) only because it appeared in no tier, not for a principled reason. A user setting compact may reasonably expect it to track alongside selection-list and nav-list. | **Leave it excluded in this epic and revisit if asked.** Its 2rem drag handle is a SC 2.5.7 drag target that must not shrink, so a compact step would move padding only — low value, non-zero risk. | Add it to Tier 2 in PR 3. Additive and non-breaking either way. |
| **D4** | **The app-shell 56px inert `min-height`** (§7.9) is a real pre-existing bug that this epic deliberately does not fix. | **File it now as a separate issue**, targeted at its own MINOR with its own changelog line, so it is not silently inherited. | Fix it inside PR 3 — rejected: it is a visible 8px breaking change under a non-breaking headline. |
| **D5** | **Segmented's SC 1.4.12 line-height collapse** (§8.5) is pre-existing on `main`, and its only fix needs a `.mat-button-toggle` selector, against the repo's standing no-`.mat-*` rule. | **File as a standalone a11y bug, out of this epic.** Fixing it requires a deliberate decision to breach the styling convention, which deserves its own review. | Grant the exception and fix it in PR 2 — rejected for the reason in §8.5. |
| **D6** ~~*(new in v3)*~~ **SETTLED 2026-07-20** | **§7.2 label-centring was wrong for the FILLED appearance.** The resting label anchors to the container height, so residual offset is `H/2 − padTop − L/2` — equal to v2's `(H − padTop − padBottom − L)/2` only when `padTop == padBottom` (true for outlined, false for filled-with-label). Comfortable `(64, 32/8)` drifted 4px. | **RESOLVED: comfortable filled = 28/12.** Restated size-independently as the **centring invariant `H/2 − padTop = 4px`** (§3.3) — `L` cancels, so it holds at `sm`/`md`/`lg` simultaneously. `padTop = 28` is the only satisfying value; the padding **sum stays 40**, so D7 is untouched. §3.3 and §7.2 updated. | ~~Ship 32/8~~ — rejected: comfortable is authored, so the centring invariant is the one thing it exists to preserve. |
| **D7** ~~*(new in v3)*~~ **SETTLED 2026-07-20** | **§7.2's "content floor = 50px" held only at `size="sm"`.** `L = 1.5 × font-size` gives 18/21/24px, so the floor is 50/53/56 — at `md`, the default for all eight components, the claimed 2px margin was **negative**. | **RESOLVED: restated per size, no values change.** §7.2 now carries the full 3×3 table showing slack is a **uniform 6/3/0 across all three levels** — a stronger proof that lockstep is mandatory than the figure it replaces. Two consequences documented: at `lg` slack is **zero at every level** (the box is content-sized; density is delivered by padding, and `min-height` never binds), and slack depends only on the padding **sum**, so D6 does not disturb it. | ~~Leave as-is~~ — rejected: an implementer trusting "2px of headroom at compact" would mis-size a future level. |
| **D8** *(new in v3)* | **The table-local `density="default"` escape does not cover the paginator.** §3.2 promises `'default'` restores default geometry inside a globally-compact app, and §7.3 emits real blocks for header/footer/row — but the only paginator rebinds are for `compact` and `dense`. Under a global compact, a table with `density="default"` gets 52px rows and a 56px header but a **52px paginator bar**; symmetrically `density="comfortable"` in a default app gives 60px rows and a 56px bar. | **Give `--mat-paginator-container-size` the same four-step treatment** the three table heights get in §7.3's SCSS (`default` 3.5rem / `comfortable` 3.75rem / `compact` 3.25rem / `dense` 3rem). It is four lines and it makes the escape actually complete. Deferred here because it adds emitted CSS in a pass whose mandate was to fix defects, not extend behaviour. | Document the paginator as outside the table-local escape. Rejected — §3.2's promise would then be false as written. |
| **D9** *(new in v3)* | **`_density.scss`'s `&` nesting silently no-ops unless `material-bridge()` is included at `:root`/`html`.** `_bridge.scss:20-22` documents the include point as "whatever selector the caller includes it under", and `index.scss:5` as "the element that carries `data-theme`". A consumer including it at `.app` compiles `.app[data-density='compact']`, which never matches — the service writes the attribute on `documentElement` only. §11.4's caveat covers *whether* the bridge is included, never *where*. | **State it as a hard constraint** in §4.3 and §11.4: for density, `material-bridge()` MUST be included at `:root` or `html`. Optionally add a dev-mode assertion alongside the §11.5 probe — if `data-density` is set and `getComputedStyle(documentElement).getPropertyValue('--mat-form-field-container-height')` does not change between levels, warn. | Leave implicit. Rejected — this is a silent total no-op for a consumer who followed the bridge's own documentation. |
| **D10** *(new, raised while settling D6/D7)* | **`L = 1.5 × font-size` held by accident.** Material reads `var(--mat-form-field-container-text-line-height, var(--mat-sys-body-large-line-height))`; `_bridge.scss` sets neither (its typescale at `:107-137` stops short of `body-large`), so the declaration is invalid at computed-value time, `line-height` inherits, and picks up the unitless `1.5` from `_reset.scss:20`. Completing the typescale with `body-large` — an obvious tidy-up — would turn it into a fixed `rem`, stop it tracking `size`, and break every D6/D7 number with no build error and no test failure. | **RESOLVED — but the fix was WRONG and is reverted (v3.2).** v3.1 pinned `container-text-line-height: 1.5em`, reasoning that `em` reproduces today's value. Measured in one context only. An inherited value varies by ancestor and **no fixed declaration can reproduce it**: 24px at the root (where pin and inheritance coincide), but 20px inside `mat-dialog-content` / `.mat-mdc-row` where `1.5em` gives 21px — growing a `rows="3"` textarea in a dialog 92px → 95px at DEFAULT density. Reverted. The hazard is guarded **statically** in `tools/verify-component-styles.mjs`, which fails if either token is ever declared; a rendered assertion provably cannot, since the values coincide exactly where the showcase measures. | Leave it inherited. Rejected: the entire form-field calibration rests on it, and nothing would catch the break. |

**Closed by this revision (v3) — recorded so they are not reopened:**

- **`mat.density` coexistence — CLOSED: unsupported.** Documented in full at §11.5, dev-mode detected via the `--mat-checkbox-state-layer-size` sentinel, and **not blocked, because it cannot be** — component-class rebinds beat any `:root` or `html` declaration unconditionally. The mitigations are documentation plus a probe plus a CHANGELOG line on the PR 2 MINOR.
- **Segmented's compact value — CLOSED: stays 36px** (Material −3), not 40px. A "true −1" would mean segmented has no compact step at all, reproducing the exact `mat.density` deficiency §11.2 sells against. The invariant is restated instead (§4.4).
- **The `dense` table header — CLOSED: 40px**, Material's own header clamp floor, not 36px (§7.3, §1.2 M6).
- **PR 1's barrel timing — CLOSED: moves to PR 2.** A frozen symbol is harder to walk back than a delayed one (§1.2 M3).
- **The three-line list ramp — CLOSED: dropped**, not shipped unverified (§7.4, §1.2 M5).
- **The golden baseline — DROPPED entirely (§9.2)**, replaced by a named-value gate. It was disproportionate, and it rested on a false premise about `<app-example>` coverage that only surfaced on contact with the code.

**Closed by the previous revision (v2) — recorded so they are not reopened:**

- **v1 D1 (per-level values for `--control-pad-x`, `--control-pad-y`, `--stack-gap`) — CLOSED.** Those three names are **deleted** (§4.2). Their per-level values are internal implementation living in each component's own SCSS (§7.1's `@each` map is the worked example), not frozen tokens, so there is nothing left to freeze and nothing to decide. This is the single largest structural change from v1.
- **v1 D2 (the icon `em` retrofit as a blocking prerequisite) — CLOSED.** The primitive is **not** retrofitted (§7.13). It cannot be driven from a parent stylesheet at all (the size is an inline host style binding), an icon is not itself a pointer target, and the two components that genuinely break are fixable locally. Recorded as a follow-up MINOR.
- **v1 D3 (a selection-list `density` input) — CLOSED: no** (§7.4), with the reasoning stated so the omission is a decision.
- **v1 D4 (table row 52 → 48 at default) — CLOSED: does not arise.** `--row-height` default is **3.25rem / 52px**, provably equal to Material's shipped row height. There is no default-density delta to disclose.
- **v1 D5 (the toolbar no-op) — CLOSED: out of scope**, moved to D4 above as a separate bug.
- **v1 D6 (adding `mat.expansion-overrides()` / `mat.stepper-overrides()`) — CLOSED: no**, and not merely by preference — accordion and stepper are hand-rolled and read **no** Material token (§7.11, §7.12), so both calls would emit dead CSS.
- **v1 D7 (`target-size` in the axe helper) — CLOSED: yes, disable it with a pointer comment** (§8.8).

---

## 14. Risk register

| # | Risk | Where | Mitigation |
|---|---|---|---|
| **R1** | **`verify-tokens` duplicate scrape** — 5 names × 3 blocks = 15 entries, 10 duplicated, written into the frozen snapshot. **It does not hard-fail** (the diff at `:86-89` is `Set`-based), so the public snapshot rots silently | `tools/verify-tokens.mjs:26-29`, `:43` | The `[...new Set(...)]` dedupe (§5.3) is **mandatory** |
| **R2** | **`generate-design-tokens` types unknown families as `'color'`** — forgetting `primitiveType()` produces a valid, passing, **wrong** artifact: five dimension tokens exported to Figma and MCP as colours | `tools/generate-design-tokens.mjs:48` | Add the three `'dimension'` arms **and** the §9.1 row-2b test cases in the same commit |
| **R3** | **Specificity trap** — a plain rule loses to Material's fixed geometry on source order | documented at `rhombus-button.component.scss:30-35` | §2.4 + the per-component verdicts in §7. Needs (0,4,0): button padding. Needs (0,3,0): nav-list section and `--list` rules. Needs none: form-field, tabs, pagination, toolbar, chip, segmented, and every rebind that declares a `--mat-*` name on an ancestor |
| **R4** | **api-snapshot union-order non-determinism on Windows** — `RhombusDensity = 'compact' \| 'default' \| 'comfortable'` is exactly the shape that triggers it | `tools/api-snapshot.mjs`, `etc/core.api.md`; gated at `ci.yml:128-129` | Inspect the diff for reordering of **unrelated** unions (SheetSide, StepperOrientation, ButtonVariant) and restore those to `main`'s order. **Do not commit a reordering "fix."** Author the union semantically in source regardless |
| **R5** | **Nine docstring edits force an `api-metadata.ts` regen** — 8 copies are checked in at lines 243, 1218, 1311, 1613, 1922, 2663, 3600, 3710 | `apps/showcase/src/generated/api-metadata.ts` | Regenerate in the same commit; expect and resist the spurious reordering diff (R4) |
| **R6** | **88% branch floor** — `jest.config.ts:11-16` counts every file under `src/lib` whether imported or not | `packages/core/jest.config.ts:23-30` | One conditional (§3.1); ship the four tests in the same commit; **do not** put the service in `theme-engine` or the showcase, which have no `coverageThreshold` |
| **R7** | **Nav-regex fragility** — both generators parse `navigation.ts` with `/\{\s*path:\s*'([^']+)',\s*label:\s*'([^']+)'\s*\}/g`. If Prettier reflows the new line across two lines, both **silently drop the entry** and the `--check` gates pass while the artifacts are wrong | `generate-llms.mjs:41-44` (regex at `:42`); `generate-mcp-data.mjs:48` | Keep the exact single-line form; grep `llms.txt` for `/density` after regen |
| **R8** | **CRLF churn on generated tokens** — `generate-tokens.mjs` does not normalize CRLF on read, unlike its two siblings | `packages/tokens/src/generated/*` | §10.3 step 8's restore-before-commit dance |
| **R9** | **CDK overlays escape subtree scoping** — menu/select panels, datepicker calendar, dialog, sheet, tooltip, toast render body-appended | the same caveat the colour bridge documents | Non-issue for global density by construction: `data-density` sits on `<html>`, so overlays inherit it. It **is** the reason a component-scoped attribute (§3.2) cannot reach an overlay — hence the explicit `.rhombus-data-table__paginator` rebind in §7.3 rather than an echoed primitive |
| **R10** | **SSR / prerender** — showcase is `outputMode: "static"`; `app.config.server.ts` merges the full `appConfig`, so **every provider runs at prerender time.** The `document` **global** does not exist there | `apps/showcase/project.json:16-17` | **Inject `DOCUMENT`; do not guard.** Writes through the injected document are serialised into the emitted HTML, so density is *correct* at prerender rather than merely safe. A platform guard would trade a build failure for a hydration **layout** shift (§1.2 B1b). Enforced by the prerender assertion, §9.1 row 7 |
| **R11** | **`_density.scss` is a new file in a copy allowlist** — an un-allowlisted SCSS partial silently would not ship, and the source tree still works via path mapping, so there is **no local signal** | `tools/copy-material-preset-assets.mjs:13` | Add `'_density.scss'` to the `files` array **and** `@forward 'density'` to `index.scss` in PR 1; verify by inspecting `packages/material-preset/dist/scss/` after a build |
| **R12** | **The bridge is a single 327-line point of failure.** One malformed value degrades silently to Material's fallback with no build error and no test failure | `packages/material-preset/src/styles/_bridge.scss`, `_density.scss` | Assert in Playwright that each of the five primitives resolves to a non-empty length at each level (`getComputedStyle(document.documentElement).getPropertyValue('--field-height')`), so a rotted override fails loudly |
| **R13** | **Contrast e2e** — `/density` is the first foundation page besides `/theming` under the gate; a 3-column table + segmented control introduce never-scanned colour pairs | `apps/showcase-e2e/tests/contrast.spec.ts` | Run `nx run showcase-e2e:e2e` locally before pushing. **Do not** add density as a third axis to the existing 280-test matrix |
| **R14** | **`CONTRAST_VERIFIED` hard-fails on non-component slugs** | `accessibility-page.component.spec.ts:29-37` | `/density` in ROUTES only; `a11y-coverage.ts` untouched (§10.2) |
| **R15** | **`.finder__group` length === 2** is the most likely accidental break in PR 3 | `migrate-page.component.spec.ts:22-23`; template hard-codes two fieldsets at `migrate-page.component.ts:46-66` | The `mat.density` row goes **inside** the existing Material group with `pkg: 'material'`, separated by a source comment banner only |
| **R16** | **`theming.md` is a generator input** — editing it without a regen fails **both** `--check` gates | `generate-mcp-data.mjs:154` (v2 cited `:155`, which is `design-tokens.json`); `ci.yml:130-131`, `:138-139` | Docs edits are part of the same regen run (§10.3) |
| **R17** | **stackblitz smoke gate** — a new `@angular/*` import in core that is not in core's `peerDependencies` fails with `ERR_MODULE_NOT_FOUND`, in a job far from the change | `ci.yml:160`, `tools/smoke-test-pack.mjs` | The service imports **`@angular/core` only** (`inject`, `signal`, `effect`, `DOCUMENT`, `InjectionToken`, `makeEnvironmentProviders`, `provideEnvironmentInitializer`) — `DOCUMENT` moved to `@angular/core` in v20 (`core.d.ts:9437`), so no `@angular/common` import is needed. Both are already peers regardless, so nothing can fail here; §1.1, §3.1, §12 PR-2 exit 10 and §15 all state core-only and are correct. *(v3: this row was stale from v2.)* Verify before pushing |
| **R18** | **The e2e post-load write assumes the effect never re-runs.** If the implementation ever adds a second dependency (a media query, a resize listener, a route hook), the effect re-fires, clobbers the test's attribute, and the whole suite goes **green-but-meaningless** | `apps/showcase-e2e/tests/density.spec.ts` | Pin the assumption in a comment on `setDensity` and re-read the attribute after the last action in each test |
| **R20** | **`tokens-page.component.ts:102-112` goes stale with no gate** — there is no spec file in that directory and the strings are hard-coded template literals, so nothing in CI fails | `apps/showcase/src/app/pages/tokens/tokens-page.component.ts` | It is item 6 of §10.1's change-set. Same silent-rot class as R2, and v1 missed it entirely |
| **R21** | **A future refactor reintroduces `isPlatformBrowser` in the density service**, silently restoring the hydration layout shift. Or someone adds `TestBed.inject(RhombusDensityService)` to `rhombus-density.providers.spec.ts` and **re-blinds the B1 gate** — the test would then pass against a broken provider, exactly as v2's whole test plan did | `packages/core/src/lib/density/` | The prerender assertion (§9.1 row 7) fails on the first; the file-level docstring plus a grep in the PR checklist covers the second. **Note the residual:** `TestBed.createComponent` forcing the environment injector into existence is TestBed *internals*, not a documented contract — the prerender assertion is the independent backstop |
| **R25** | **A case-(b) `mat.density` consumer gets no warning at all.** They use `mat.density`, use `[rhombusChip]`, and never adopt RhombusKit density — so `provideRhombusDensity()` never runs and the probe never fires. They get a silent +4px chip | §11.5.3 | Non-code only: a CHANGELOG line on the PR 2 MINOR and the §11.5 doc. **The alternative was considered and rejected** — gating `.rhombus-chip`'s height rebind behind `:root[data-density]` would break §2.3's bridge-independence for the component that most benefits from it, and the exposure is 4px on one component |
| **R26** | **Rule T is stated but not mechanically enforced.** Nothing fails CI if a future contributor adds a Tier 3 component, shrinks a control below 48px and forgets the rebind; and **Rule T2 has no lint** — a `:root`-scoped `*-touch-target-size` in `_density.scss` would compile, ship, and pass every gate except the specific leak assertion in §9.1 row 7b, which covers only checkbox and radio | §8.3 | The per-component gates in §9.1 rows 7b are what exist today. A `stylelint` rule forbidding `touch-target-size` inside `:root` blocks would generalise T2 and is the recommended follow-up; a general T1 invariant would need a component registry the spec does not have |
| **R27** | **The M6 header correction must land BEFORE the baseline is captured.** If PR 3's golden records `dense`'s header at 36px, the 40px correction reads as a regression on the next diff | §7.3 | Sequence the §7.3 edit ahead of baseline capture, or regenerate with a reviewed diff. Called out inline at §7.3's measured line |

---

## 15. Sequencing & release summary

**Three MINOR trains.** PR 1 → PR 2 → PR 3, in that order. PR 1's geometry baseline gates the other two; nothing after it may land with a non-empty *default-density* diff.

| PR | Contents | The gate that decides it |
|---|---|---|
| **1 — Foundation** | Token spec (typed) + generator scoped emission (all three artefacts) + three prefix registrations + `verify-tokens` dedupe + service/provider/type/barrel + `_density.scss` wiring + the named-value geometry gate (§9.2). **Zero component geometry change and zero `packages/core` TypeScript.** | `geometry.spec.ts` green against untouched `main` (10/10, both failure modes exercised); `verify-tokens` reports **22**; §9.1 row 1's A1+A2 pair green; api-snapshot delta is `etc/tokens.api.md` only |
| **2 — Tier 1** | data-table (+ `density` input) · form-field family · selection-list · nav-list · button (padding ramp + Rule T) · segmented · chip | **Empty default-density baseline diff**; compact/comfortable deltas match §7 line by line; the Playwright a11y assertions; **the B1 jest gate** (row 4b); the Rule T leak gate (row 7b); branches ≥ 88%. *(The prerender assertion is PR 3 — its inputs land there; §12 PR 2 exit 5.)* |
| **3 — Tier 2 + surface** | tabs · toolbar · pagination · accordion · stepper · nine docstrings · `/density` page + route + nav · tokens-page prose · roadmap promote-and-refill · migrate row · docs · full regen | Nine `--check` gates; `/density` passes the contrast gate in both themes; roadmap `next` non-empty |

### Global invariants

- **An app that never calls `provideRhombusDensity` renders byte-identical to `main`. Zero exceptions.** Mechanically proved by §9.2, not asserted in prose. Every one of v1's ~15 documented and undocumented default-density deltas is eliminated: after §7's inventory the count is **zero**.
- **CONTRACT stays frozen at 60.** Density adds **five** primitives (17 → 22 published), append-only forever.
- **The public surface is `provideRhombusDensity()` plus five names.** Everything else is internal and unfrozen.
- **The provider is eager and writes at prerender.** Registering it *is* what constructs the service; the attribute is baked into statically rendered HTML, so there is no hydration shift and no pre-paint script (§3.1).
- **`size` is untouched.** All nine `size` inputs keep their current behaviour (font-size only); only their docstrings change.
- **Font-size is out of scope,** matching Material's own density, which changes zero font sizes.
- **Global compact is a true Material −1 in value wherever Material's −1 moves the value** (§4.4). Segmented is the single documented exception, at Material's index 4, safe because we never emit a Material density *scale* and button-toggle carries no display token.
- **Every level clears WCAG 2.2 SC 2.5.8's 24×24 floor**, the smallest box being `--control-height-sm` at compact (28px). **Touch targets are governed by Rule T** (§8.3), which fires at exactly two sites — compact buttons and `dense` table rows — and forbids `:root`-scoped rebinds outright.
- **Coexistence with a Material density scale is unsupported, documented and dev-mode detected** (§11.5). `provideRhombusDensity('compact')` is value-identical to `mat.theme((density: -1))` for twelve of thirteen in-scope components.
- **No new `@angular/*` peer.** The service imports `@angular/core` only.
