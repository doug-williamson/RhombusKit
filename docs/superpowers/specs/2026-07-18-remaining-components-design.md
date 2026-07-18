# RhombusKit — Remaining Roadmap Components: Design & Implementation Plan

**Date:** 2026-07-18
**Status:** Approved structure; per-component API recommendations pending maintainer review of the Open Decisions register (§4).
**Scope:** The 13 components remaining in the public roadmap's **Up Next** (Date range picker) and **Considering** columns, grouped into four themed release trains. Non-component "Foundations" work is a roadmap-only appendix here (§10); it gets its own specs later.

---

## 1. Summary

Thirteen components, four themed packs, one repeatable recipe, **zero new contract tokens** across the entire set (verified per component — every brief reuses the existing 60-token contract). Current version is `1.10.0`; the packs map to `v1.11 → v1.14`.

| Pack | Version | Theme | Components | Net effort |
|---|---|---|---|---|
| **1** | v1.11 | **Parity primitives** | Divider · Slider · Date range picker · Segmented | S + 3×M (+ shared util) |
| **2** | v1.12 | **Selection & entry** | Autocomplete · Selection list · Number input | 3×M |
| **3** | v1.13 | **Dashboard & surfaces** | Skeleton · Stat · Sheet / Drawer | S–M + M + M |
| **4** | v1.14 | **Rich interaction** | Stepper · Reorder list · Carousel | 3×L |

**Naming/scope decisions already ratified:** `rhombus-stat` is a real component; the wizard is `rhombus-stepper` and the spinbox is `rhombus-number-input` (distinct selectors); Sheet is a standalone CDK-Overlay/CDK-Dialog panel separate from the app-shell sidenav and popover.

---

## 2. Ground rules — the recipe (verified against current source)

Every component follows the same path. Deviations are called out per component.

**Component shape:** `standalone: true`, `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`, `styleUrl` scss. Signal APIs only — `input()`, `input(false, { transform: booleanAttribute })` for bare boolean attrs, `model()` for two-way, `output()`, `computed()`. **No `@Input`/`@Output` decorators.** No `ControlValueAccessor` is ever implemented — form controls take an explicit `[control]` `FormControl` input instead.

**Control models (two shapes):**
- **(A) Form-field wrappers** over `mat-form-field` (input, select, date-picker): `control = input<FormControl | null>(null)` only, plus a standalone `disabled` input that is **ignored when control is set**. No two-way. The date-picker is the special case that mirrors a public `FormControl<string|null>` to a private Material-typed control via a `syncing` guard + `valueChanges` + `effect((onCleanup) => …)` re-subscribe.
- **(B) Selection controls** (checkbox, radio, switch): a two-way `model` (`[(value)]`/`[(checked)]`) **plus** an optional `[control]`. Lightweight `disabled` ignored when control is set.

**Colour bridging:** RhombusKit components carry **no `--mat-sys-*`**. Material's M3 roles are mapped onto the contract globally by the opt-in `material-bridge()` SCSS mixin. Component scss references only contract tokens (or rebinds `--mat-<component>-*` custom-props to contract tokens, keyed off the host class). Density/appearance ride shared `.rhombus-form-field--*` classes from `@rhombuskit/core/scss`.

**Recipe touchpoints (per component):**

| File | Change |
|---|---|
| `packages/core/src/lib/<name>/*.{ts,scss,spec.ts}` | New component + co-located axe spec |
| `packages/core/src/index.ts` | Flat barrel: `export {…}` + `export type {…}`, preceded by a one-line comment |
| `packages/core/package.json` | **Only** if a new `@angular/*` import (not already a peer). Current peers: core, common, cdk, forms, material, platform-browser, router (+ rxjs, highlight.js optional). `@angular/animations` is **not** a peer. |
| `apps/showcase/src/app/app.routes.ts` | Lazy child route under `components`; keep the `''` redirect last |
| `apps/showcase/src/app/pages/<name>/<name>-page.component.ts` | Showcase page: `<app-component-page title apiKey [hasUsage]>` with `[overview]/[usage]/[examples]` slots |
| `apps/showcase/src/app/shared/navigation.ts` | Nav entry (feeds sidebar **and** Cmd-K) |
| `apps/showcase/src/app/pages/migrate/material-map.ts` | Flip the relevant Material row `gap→full/partial`; **count reconciled once per pack** (see §3.4) |
| `apps/showcase/src/app/pages/accessibility/a11y-coverage.ts` | Add `{ slug, label }` to `CONTRAST_VERIFIED` (must mirror the contrast spec) |
| `apps/showcase-e2e/tests/contrast.spec.ts` | Add `'/components/<name>'` to `COMPONENTS` |

**Auto-generated (never hand-edit), regen in order after a core build:**
1. `node tools/api-snapshot.mjs --update` → `apps/showcase/src/generated/api-metadata.ts` + `etc/core.api.md`
2. `node tools/generate-llms.mjs` → `apps/showcase/public/llms.txt` + `llms-full.txt`
3. `node tools/generate-mcp-data.mjs` → `packages/mcp/src/generated/mcp-data.ts`

**Testing:** `import { axe } from '../../testing/axe'`; assert `expect(await axe(el)).toHaveNoViolations()`. Colour-contrast is **not** covered by jest (no jsdom layout) — it runs in `apps/showcase-e2e` (Playwright, both themes, all three tabs). `@ts-expect-error` compile-error fixtures need a raw `tsc --noEmit -p tsconfig.spec.json` gate (nx test/build skip specs under isolatedModules). Specs use `provideNoopAnimations()`.

**Env:** `pnpm` isn't on PATH — use `corepack pnpm`. Don't `nx build core` while `nx serve showcase` runs (ng-packagr wipes dist and wedges the global `@use '@rhombuskit/core/scss'`). Generated files normalize CRLF→LF — on Windows restore/commit LF or the `--check` guards flake. commitlint caps body lines at 100 chars.

---

## 3. Cross-cutting decisions & shared prerequisites

The critic pass surfaced several issues that span components. These are the load-bearing "do this once" items — **build them before or alongside the components that consume them.**

### 3.1 Extract a shared `mirrorControl` util (Pack 1 prerequisite)

The date-picker's private-mirror machinery — `syncing` guard + `internal.valueChanges` write-back + `effect((onCleanup) => re-subscribe on control-instance swap)` — is otherwise **hand-cloned four times** (date-range, slider range, number-input, autocomplete). That is four divergent copies of the same subtle UTC/re-subscribe logic.

**Decision:** extract a single `mirrorControl` helper into core (e.g. `packages/core/src/lib/forms/mirror-control.ts`, internal — not barrel-exported) that encapsulates: seed-from-external, guarded write-back, disabled/status sync, and onCleanup re-subscribe on instance swap. Build it **first in Pack 1**, then have date-range, slider, number-input, and autocomplete consume it instead of re-cloning. This is an internal refactor of the shipped date-picker too (make it the first consumer), so the guard logic lives in exactly one place.

### 3.2 Range-value API house rule (freeze together)

The two "range" components diverge because their underlying primitives differ — **that's acceptable, but the surface must be deliberate and documented, not accidental:**

- **Date range picker:** public `control` is `FormGroup<{ start: FormControl<string|null>; end: FormControl<string|null> }>` (Material's `mat-date-range-input` binds `[formGroup]` 1:1). Emitted/consumed pair `DateRange = { start: string|null; end: string|null }`. **Endpoints nullable** (a range can be half-entered).
- **Slider (range mode):** public `rangeControl` is `FormControl<SliderRange>` where `SliderRange = { start: number; end: number }` (two native range inputs can't bind a FormGroup, so it mirrors to two internal controls). **Endpoints non-nullable** (a thumb always has a position).

**House rule:** date-shaped ranges are nullable-per-endpoint; numeric slider ranges are not. Output naming: date-range emits `rangeChange` (control-only family); slider emits `rangeValueChange` to pair with two-way `[(rangeValue)]` (selection-control family). The divergence is real and justified by the two control models — **document it in both Overviews** so a consumer generalizing over "a RhombusKit range" isn't surprised.

### 3.3 Functional icon glyphs (shared registry addition)

`RHOMBUS_DEFAULT_GLYPHS` currently ships only `more_vert / light_mode / dark_mode / contrast`. Several new components need **functional** glyphs that must render on a font-less host (unregistered names fall back to the `<mat-icon>` font and vanish):

| Glyph(s) | Needed by | Recommendation |
|---|---|---|
| `arrow_upward`, `arrow_downward`, `drag_indicator` | Reorder list (functional) | **Register** in `RHOMBUS_DEFAULT_GLYPHS` |
| `trending_up`, `trending_down`, `trending_flat` | Stat (decorative but themed) | **Register** (reused if data-viz lands later) |
| number/edit/done/error step indicators | Stepper | Register the step-state glyphs |
| `add` / `remove` (± spinbox) | Number input | **Inline SVG** in-template (one-off, self-contained) |

**Decision:** batch-register the multi-consumer functional glyphs in the registry (internal change, no public-API/`etc` impact); inline the truly one-off number-input ± paths. Do this as a shared step in the pack that first needs each glyph (Stat/Reorder in Packs 3–4; number-input inline in Pack 2).

### 3.4 Coordinated migrate-map count (per-pack, single owner)

Every brief independently says "bump the COMPARISON Components count `~33 → ~34`." Thirteen independent `+1` edits **clobber** and land wrong (final should be ~46, not 34). **Decision:** the count is reconciled **once per pack** by whoever integrates that pack — set it to the correct running total after all the pack's components land, not per-component. The same applies to any count derived from `CONTRAST_VERIFIED`.

### 3.5 Contrast-gate pre-verification (protect the zero-new-tokens win)

Four semantic token borrows carry real risk of failing the axe colour-contrast gate in one theme, which would force a new token and break the pack-wide win. **Verify each in BOTH themes before committing the pack:**

- Date-range **in-range** calendar fill → `--surface-2` + `--text-primary` *(highest risk)*
- Segmented **selected-segment** fill → `--nav-active-bg` / `--nav-active-text` *(first reuse outside nav-list; also used by Selection-list)*
- Slider **value bubble** → `--tooltip-bg`/`--tooltip-text`; **track/ticks** → `--text-accent` (needs 3:1 non-text)
- Selection-list & Divider **small secondary text** → `--text-secondary` (not `--text-muted`; the exact trap nav-list hit at small sizes)

### 3.6 Follow-up: extract `_datepicker-overlay.scss`

Date-range re-declares the date-picker's `.cdk-overlay-container { --mat-datepicker-*: var(--contract) }` bridge (a consumer may import only the range picker, so each scss must be self-sufficient). Track a follow-up to extract `packages/core/scss/_datepicker-overlay.scss` and `@use` it from both. Out of scope for the pack; do not block on it.

### 3.7 Boundary docs (Overview + migrate-map must draw these)

Several new components sit next to existing ones; each Overview and the migrate note must draw the distinction explicitly:

- **Segmented** vs **Chip group** (removable filters) vs **Radio group** (form input) — inline mutually-exclusive view/unit switch.
- **Selection list** vs **Nav list** (navigation, anchors/routerLink) vs **Select** (collapsed dropdown). Material forbids interactive elements inside listbox options, so Nav List cannot be folded in.
- **Number input** vs **Slider** (draggable range) vs **Input type=number** (unbounded free text).
- **Sheet** vs app-shell **sidenav** (persistent frame) vs **Dialog** (centred modal) vs **Popover** (small, non-modal, trigger-anchored).
- **Stepper** vs **Tabs** (peer sections) vs **Accordion** (disclosure).
- **Reorder list** vs **Nav list** vs **Data table** sort.
- **Carousel** vs **Tabs**/**Accordion** (never put critical CTAs on an auto-rotating slide).

### 3.8 Per-component regen discipline

`navigation.ts` must be edited **before** the llms/mcp generators (they read it). `api-snapshot` runs **after** a core build. All four generated artifacts have CI `--check` guards. Restore LF on Windows. A per-component checklist (§9) makes this mechanical.

---

## 4. Open decisions register (load-bearing — freeze into `etc/core.api.md`)

Each has a recommended default already baked into the per-component sections below; listed here for one consolidated review.

| # | Decision | Recommendation | Alternative |
|---|---|---|---|
| D1 | Date-range public control shape | `FormGroup<{start,end}>` of ISO strings (binds Material 1:1, group-level validation) | one `FormControl<DateRange>` object, or two independent controls |
| D2 | Slider range shape | one `FormControl<SliderRange>` mirrored to two internals | two `startControl`/`endControl` inputs (trivial, but splits the value) |
| D3 | Segmented: ship multi-select now? | Yes — `multiple` input (parity with Select + underlying mat-button-toggle); forces loose `FormControl` typing | single-select only for a tight `FormControl<T\|null>` |
| D4 | Autocomplete free-text vs must-select default | `requireSelection=false` (free text), control typed `FormControl<T\|string\|null>` | default `true`, cleaner `FormControl<T\|null>`, no free text |
| D5 | Selection-list: mode packaging | one component, `mode: 'selection'\|'action'` discriminator | split `RhombusActionListComponent` (action mode uses a different Material primitive) |
| D6 | Selection-list single-select value type | always `T[]` (matches Material `writeValue`; single = 0/1-length array) | normalize single → `T\|null` |
| D7 | Number-input semantics | native `<input type=number>` (implicit spinbutton + free aria-value*) | `type=text` + `role=spinbutton` + manual aria (enables thousands separators) |
| D8 | Stat: trend vs sentiment | two knobs (direction + colour, so inverted metrics keep the true arrow) | single `direction` + `invertSentiment` |
| D9 | Sheet: exit-animation ownership | ref drives a panel class + `transitionend` await + fallback timeout; `disableClose:true` on CDK so Escape/backdrop also animate | a dedicated container component owning an `open` signal |
| D10 | Stepper: extend CdkStepper vs hand-roll | **Extend `CdkStepper`** (linear gating + stepControl validation + focus mgmt for free, zero new peer, no `--mat-sys-*`) | fully hand-roll like accordion |
| D11 | Stepper vertical | ship horizontal + vertical together | horizontal-first, defer vertical |
| D12 | Reorder-list orientation | vertical-only v1 (keep the input, non-breaking to add horizontal) | full horizontal now |
| D13 | Icon glyphs | register multi-consumer functional glyphs; inline number-input ± | inline everything (duplicated markup) |
| D14 | Carousel loop | index-rewind wrap for v1 | seamless infinite via cloned edge slides |

---

## 5. Pack 1 — Parity primitives (v1.11)

**Build order (exploits reuse):** (0) extract `mirrorControl` §3.1 → (1) **Divider** (S, zero-dep, de-risks the registry/regen mechanics) → (2) **Slider** (consumes mirror for range) → (3) **Date range picker** (imports `isoToDate`/`dateToIso` from the shipped date-picker + mirror) → (4) **Segmented** (independent; can parallelize). Then reconcile the migrate count (§3.4) and run the contrast pre-check (§3.5).

### 5.1 Divider — `rhombus-divider` · `RhombusDividerComponent` · bespoke · **S**
- **Material target:** replaces `mat-divider` with a bespoke `role="separator"` styled rule (wrapping mat-divider buys nothing). Clone from `rhombus-tag` (host data-attribute reflection) + `rhombus-alert` (minimal bespoke shape).
- **Inputs:** `orientation: 'horizontal'|'vertical'` (`DividerOrientation`, default horizontal) · `inset` (booleanAttribute) · `accent` (booleanAttribute → swaps `--border`→`--border-accent`) · `label: string` (non-empty → labelled "OR"-style text divider; string not `ng-content`, because `role=separator` is children-presentational so a projected label is dropped from the a11y tree — `aria-label` is the only reliable name).
- **Outputs / types:** none / `export type DividerOrientation`.
- **Tokens (reused):** `--border`, `--border-accent`, `--text-secondary` (label — chosen over `--text-muted` for AA), `--font-sans`. **New: none.**
- **A11y:** host `role="separator"`, `[attr.aria-orientation]`, non-focusable, no keyboard. Labelled variant sets `aria-label` from `label`. jest-axe across plain/inset/accent/vertical/labelled.
- **Files:** `divider/rhombus-divider.component.{ts,scss,spec.ts}` + `pages/divider/divider-page.component.ts`.
- **Migrate-map:** flip Divider row `gap→full`.
- **Key risks/edges:** vertical needs a height context (flex/grid `align-self: stretch`) or it collapses to 0 — the showcase vertical demo must supply container height. RTL via logical props (`border-inline-start`, `margin-inline/block`). Labelled+vertical unsupported v1 (ignore `label` when vertical). Nav-group placement → **Primitives**.

### 5.2 Slider — `rhombus-slider` · `RhombusSliderComponent` · thin-wrapper · **M**
- **Material target:** `mat-slider` + `input matSliderThumb` (single) / `matSliderStartThumb`+`matSliderEndThumb` (range). Clone from `rhombus-switch` (control/lightweight `@if` branch, `[(value)]` naming) + date-picker mirror (range).
- **Inputs:** `mode: 'single'|'range'` · `min=0` · `max=100` · `step=1` · `discrete` (booleanAttr) · `showTickMarks` (booleanAttr) · `disabled` (booleanAttr, ignored when control set) · `displayWith: (v:number)=>string` (stable module-level default) · **single:** `value` (`[(value)]`), `control: FormControl<number>`, `ariaLabel` · **range:** `rangeValue` (`[(rangeValue)]`, `SliderRange`), `rangeControl: FormControl<SliderRange>` (mirrored to two internal `FormControl<number>` via §3.1), `startAriaLabel='Start'`, `endAriaLabel='End'`.
- **Outputs / types:** `valueChange: number` · `rangeValueChange: SliderRange` / `export interface SliderRange { start: number; end: number }`.
- **Tokens (reused):** `--text-accent` (active track/handle/ripple), `--border-strong` (inactive track), `--text-on-accent`/`--surface-0` (tick marks), `--tooltip-bg`/`--tooltip-text` (value bubble), `--font-sans`. **New: none.** Bridge via `@include mat.slider-overrides(...)`.
- **A11y:** each thumb is a native `input[type=range]` → `role="slider"` with `aria-valuemin/max/now/valuetext` for free; every thumb needs an `aria-label`. Keyboard handled natively (Arrows/Home/End/PageUp-Down). Material clamps start ≤ end.
- **Files:** `slider/rhombus-slider.component.{ts,scss,spec.ts}` + `pages/slider/slider-page.component.ts`. Migrate-map: flip Slider row `gap→full`.
- **Key risks:** **D2** range shape; verify `mat.slider-overrides()` token key names against the pinned v21 (MDC key names drift — grep the installed tokens first); confirm `[disabled]` on `<mat-slider>` + `[formControl]` on the child thumb doesn't trigger the reactive-forms disabled-attr warning.

### 5.3 Date range picker — `rhombus-date-range-picker` · `RhombusDateRangePickerComponent` · thin-wrapper · **M**
- **Material target:** `mat-date-range-input` + `mat-date-range-picker` + `matStartDate`/`matEndDate`; `providers: [provideNativeDateAdapter()]`. Near-verbatim clone of the shipped single date-picker; **import `isoToDate`/`dateToIso` from it** (do not duplicate) — local-midnight parsing, never `new Date(iso)`.
- **Inputs:** `label` · `startPlaceholder='Start date'` · `endPlaceholder='End date'` · `separator='–'` · `appearance` · `size` · `disabled` (ignored when control set) · `required` · `hint` · `subscriptSizing` · `min`/`max` (ISO strings) · `control: DateRangeControl` (= `FormGroup<{start,end}>` of ISO strings, mirrored to a private Date-typed group via §3.1).
- **Outputs / types:** `rangeChange: DateRange` / `export type DateRange`, `export type DateRangeControl`.
- **Content:** `[rhombusError]` → single `<mat-error>` (parity; one shared slot — see D-note in risks).
- **Tokens (reused):** calendar panel/dates/selected/today via `--surface-0/1/2`, `--text-primary/secondary`, `--btn-primary-bg/text`, `--text-accent`, `--border`, `--radius-xl`; **in-range fill → `--surface-2`+`--text-primary`** (contrast-verify §3.5). **New: none.**
- **A11y:** APG Date-Picker-Dialog (inherited from Material). Assert jest-axe on **both** the closed field and the open calendar overlay (`.cdk-overlay-container`).
- **Files:** `date-range-picker/rhombus-date-range-picker.component.{ts,scss,spec.ts}` + `pages/date-range-picker/…`. Migrate-map: flip the existing Datepicker row `partial→full`; update the stale "date ranges not covered yet" copy on the date-picker page.
- **Key risks:** **D1** control shape; `start>end` validity (recommend consumer group-validator, not fighting Material's internal `matStart/EndDateInvalid`); `rangeChange` emits on every endpoint change (half-range fires `end:null`) — document; overlay scss duplication (§3.6); `apiKey` is an array `['RhombusDateRangePickerComponent','DateRange']`.

### 5.4 Segmented — `rhombus-segmented` · `RhombusSegmentedComponent<T=string>` · thin-wrapper · **M**
- **Material target:** `mat-button-toggle-group` + `mat-button-toggle`. Clone from `rhombus-radio-group` (options-array over a Material group; `nextId` label wiring; dual-branch template) + `rhombus-chip` (rebind `--mat-button-toggle-*` custom-props to contract tokens).
- **Inputs:** `options: SegmentOption<T>[]` (`{value,label,disabled?,icon?,ariaLabel?}`) · `value: T|T[]|null` (`[(value)]`) · `control: FormControl` (loose, like select — single carries `T`, multi carries `T[]`) · `multiple` (booleanAttr) · `disabled` (booleanAttr) · `size: 'sm'|'md'|'lg'` · `fullWidth` (booleanAttr) · `vertical` (booleanAttr) · `label` · `ariaLabel`.
- **Outputs / types:** `valueChange: T|T[]|null` / `export interface SegmentOption<T=string>`, `export type SegmentedSize`.
- **Tokens (reused):** **selected → `--nav-active-bg`/`--nav-active-text`** (first reuse outside nav-list; contrast-verify §3.5), `--text-secondary` (unselected), `--text-disabled`, `--text-primary` (state layer), `--border` (divider), `--focus-ring`, `--font-sans`. **New: none.** Hardcode `[hideSingleSelectionIndicator]`/`[hideMultipleSelectionIndicator]="true"` for the segmented aesthetic.
- **A11y:** single mode → `role=radiogroup` + `role=radio`/`aria-checked` (arrow-key selection-follows-focus); multi mode → `role=group` + `aria-pressed`. Icon-only segments require `opt.ariaLabel` (assert in spec).
- **Files:** `segmented/…` + `pages/segmented/…`. Migrate-map: flip Button Toggle row `gap→full`. Nav-group → **Forms** (beside Radio).
- **Key risks:** **D3** multi-select; per-option `opt.icon` couples to the icon registry (unregistered → font fallback vanishes on font-less host); draw the 3-way boundary (§3.7).

---

## 6. Pack 2 — Selection & entry (v1.12)

All three are M. Number-input and Autocomplete consume the `mirrorControl` util (§3.1). Selection-list is independent. No new peers (all Material subpaths under the existing `@angular/material`).

### 6.1 Autocomplete — `rhombus-autocomplete` · `RhombusAutocompleteComponent<T=string>` · thin-wrapper · **M**
- **Material target:** `mat-autocomplete` + `matAutocomplete` on `<input matInput>` in an inlined `mat-form-field`. Clone from select (options-array + panel scss) + input (matPrefix/suffix slots) + date-picker (internal-control subscribe to derive the query).
- **Inputs (form-field family + type-ahead):** `label`, `placeholder`, `appearance`, `size`, `disabled` (ignored when control set), `required`, `hint`, `subscriptSizing` · `options: AutocompleteOption<T>[]` · `filterWith: AutocompleteFilterFn<T>|null` (default case-insensitive label substring; `null` = async/server, options treated as pre-filtered) · `displayWith` · `autoActiveFirstOption=true` · `requireSelection=false` (**D4**) · `minChars=0` · `debounceMs=0` · `loading` (booleanAttr) · `noResultsText='No results'` · `control: FormControl<T|string|null>`.
- **Outputs / types:** `optionSelected: T` · `queryChange: string` (debounced — the async hook) / `AutocompleteOption<T>`, `AutocompleteFilterFn<T>`, `AutocompleteDisplayFn<T>`.
- **Content:** `[rhombusError]`, `[matPrefix]/[matIconPrefix]`, `[matSuffix]/[matIconSuffix]`.
- **Tokens (reused):** `--surface-0/1/2`, `--text-primary/accent/muted`, `--border`, `--focus-ring`, `--font-sans`. Panel themed via `panelClass='rhombus-autocomplete-panel'` scope (overlay is body-appended). **New: none.**
- **A11y:** APG Combobox (list autocomplete) — `role=combobox` + `aria-autocomplete=list` + `aria-expanded`/`aria-controls`/`aria-activedescendant`; panel `role=listbox`. No-results/loading are **disabled** options → mirror count/loading into a visually-hidden `aria-live=polite` region (disabled options aren't reliably announced).
- **Files:** `autocomplete/…` (+ optional type-fixture spec) + `pages/autocomplete/…`. Migrate-map: flip Autocomplete row `gap→full`.
- **Key risks:** **D4** free-text/type union; both `filterWith` (sync) **and** `queryChange` (async) surfaces; `displayWith` mandatory for object-valued `T`; empty-query behaviour.

### 6.2 Selection list — `rhombus-selection-list` · `RhombusSelectionListComponent<T=string>` · thin-wrapper · **M**
- **Material target:** `mat-selection-list` + `mat-list-option` (role=listbox) for selection mode; `mat-action-list` + `button[mat-list-item]` for action mode (both `@angular/material/list`). Clone from nav-list (data-driven items, `nextId`, `(itemAction)`) + select (dual branch) + radio (label→`aria-labelledby`). It's the mat-list slice nav-list left open.
- **Inputs:** `options: SelectionListOption<T>[]` · `mode: 'selection'|'action'` (**D5**) · `multiple` (booleanAttr, default **true**, **D6**) · `value: model<T[]>([])` (always `T[]`; single = 0/1-length) · `control: FormControl<T[]|null>` (binds Material's native CVA directly — no private mirror) · `disabled` · `required` · `label`/`ariaLabel` (a listbox must be named) · `compareWith` (object equality) · `togglePosition: 'before'|'after'` · `hideSingleSelectionIndicator`.
- **Outputs / types:** `selectionChange: T[]` (both branches) · `itemAction: SelectionListOption<T>` (action mode) / `SelectionListOption<T>`, `SelectionListMode`.
- **Tokens (reused):** `--surface-2` (hover), `--nav-active-bg`/`--nav-active-text` (selected tint — contrast-verify), `--text-primary/secondary/muted/accent`, `--border`, `--error`/`--error-bg` (danger action rows), `--focus-border`, `--radius-md`, `--font-sans`, motion primitives. **New: none.**
- **A11y:** Material's `ListKeyManager` supplies roving tabindex + full APG listbox keyboard for free. **Description-line text → `--text-secondary`, not `--text-muted`** (the small-text AA trap; §3.5).
- **Files:** `selection-list/rhombus-selection-list.component.{ts,scss,spec.ts}` + `selection-list.types.ts` + `pages/selection-list/…`. Nav-group → **Forms**. Migrate-map: flip List row `gap→partial` (plain display list stays Material).
- **Key risks:** **D5**/**D6**; selected-tint reuse of nav-active outside nav (sign-off); boundary docs vs nav-list/select (§3.7).

### 6.3 Number input — `rhombus-number-input` · `RhombusNumberInputComponent` · hybrid · **M**
- **Material target:** `mat-form-field` + `input matInput type=number` **chrome only** (Material ships no spinbox; the ± / step / clamp / keyboard layer is bespoke). Clone from input (form-field shell + host classes) + date-picker (`mirrorControl` — a spinbox must read+write to clamp).
- **Inputs:** form-field family (`label`, `placeholder`, `appearance`, `size`, `disabled`, `required`, `hint`, `subscriptSizing`) · `min: number|null` · `max: number|null` · `step=1` · `largeStep: number|null` (PageUp/Down; default `step*10`) · `value: number|null` (`[(value)]`) · `control: FormControl<number|null>` · `showButtons=true` · `incrementLabel='Increment'` · `decrementLabel='Decrement'`.
- **Outputs / types:** `valueChange: number|null` / **no new public type** (reuses `FormFieldAppearance`/`FormFieldSize`).
- **Content:** `[rhombusError]`, `[matTextPrefix]/[matIconPrefix]` (unit/currency; ± live in the trailing suffix region).
- **Tokens (reused):** `--text-primary/secondary/disabled`, `--surface-1/2/3` (fill + button hover/active), `--border`/`--border-strong`, `--focus-border`, `--focus-ring`, `--font-mono` (optional tabular). **New: none.**
- **A11y (D7):** native `input[type=number]` → implicit `role=spinbutton` + free `aria-valuemin/max/now` from `min/max/step` attrs (**do not** add `role`/manual aria — double-announcement). ± are `tabindex=-1` native buttons with `aria-label` + aria-hidden inline-SVG glyphs (**inline, not rhombus-icon** — registry has no ±). Keyboard: Arrow (preventDefault to avoid native double-step), Page (largeStep), Home/End (min/max). Clamp on blur + step, never per-keystroke. Hide native spinner (`appearance:textfield` + `::-webkit-*-spin-button`).
- **Files:** `number-input/…` + `pages/number-input/…`. Migrate-map: optional informational row (no Material gap to flip).
- **Key risks:** **D7** native vs custom spinbox; hold-to-repeat = **defer** (YAGNI); ± glyphs inline (**D13**); ± focus (`tabindex=-1`, single tab stop); nullability (`number|null`).

---

## 7. Pack 3 — Dashboard & surfaces (v1.13)

Skeleton and Stat are independent bespoke primitives; Sheet is the heavier CDK-overlay piece. Build Skeleton → Stat → Sheet. Register Stat's `trending_*` glyphs (§3.3). Sheet's animation-free enter/exit pattern is a rehearsal for Carousel and dovetails with the motion **exit-animation** foundation work already in "Now."

### 7.1 Skeleton — `rhombus-skeleton` · `RhombusSkeletonComponent` · bespoke · **S–M**
- **Material target:** none (Material has no skeleton). Pure CSS shimmer. Clone from avatar (size→CSS-var pattern, conditional host a11y) + alert (live-region role) + card (surface tokens).
- **Inputs:** `variant: 'text'|'circle'|'rect'` (`SkeletonVariant`) · `width`/`height`/`radius: string|number|null` (number→px; null→variant default) · `lines=1` (text only) · `lastLineWidth='60%'` · `count=1` (repeat block) · `animated=true` (booleanAttr; shimmer, also force-off under reduced-motion) · `label: string|null` (null → decorative `aria-hidden`; string → `role=status` + `aria-busy` + `aria-label`, inner bars aria-hidden).
- **Outputs / types:** none / `export type SkeletonVariant`.
- **Tokens (reused):** `--surface-2` (base block), `--surface-3` (shimmer highlight), `--font-sans`, `--radius-xs/md/full`, `--motion-duration-slow`/`--motion-ease-standard`. **New: none.**
- **A11y:** two modes (decorative default vs labelled `role=status`); shimmer gated by `@media (prefers-reduced-motion: reduce)` → static (never blank) block; `transform: translateX()` sweep (compositor-only). No text → contrast gate finds nothing to flag.
- **Files:** `skeleton/…` + `pages/skeleton/…`. Migrate-map: no row (net-new; optional count bump).
- **Key risks:** `count` vs `lines` semantics (document); decorative-default a11y (consumer owns `aria-busy`) vs `role=status` always; shimmer luminance flips direction between themes (acceptable → keeps tokens empty).

### 7.2 Stat — `rhombus-stat` · `RhombusStatComponent` · bespoke · **M**
- **Material target:** none. Display-only KPI tile designed to sit inside `rhombus-card`. Clone from tag (delta pill = mini-tag) + alert (never-colour-only hidden prefix) + avatar (size→CSS-var).
- **Inputs:** `label` · `value: string|number` (verbatim; guard `!= null` so `0` renders) · `delta: string|number|null` (null → no pill) · `trend: 'up'|'down'|'neutral'|'auto'` (`StatTrend`; auto from numeric sign) · `sentiment: 'positive'|'negative'|'neutral'|'auto'` (`StatSentiment`; decoupled from direction for inverted metrics like churn) · `caption: string|null` · `size: 'sm'|'md'|'lg'` (`StatSize`) · `deltaLabel: string|null` (i18n hidden phrase) · `live` (booleanAttr → `aria-live=polite`).
- **Outputs / types:** none / `StatTrend`, `StatSentiment`, `StatSize`.
- **Content:** `[slot=icon]` (leading media, collapses `:empty`) + default slot (sparkline/secondary line).
- **Tokens (reused):** `--toast-success-*`/`--toast-error-*` (delta), `--surface-2`, `--text-primary/secondary/muted`, `--font-sans`, `--radius-full`, motion primitives. **New: none.**
- **A11y:** `<dl><dt>label</dt><dd>value + pill + caption</dd></dl>`; direction conveyed **three** ways — colour (sentiment) + decorative labelled arrow + visually-hidden phrase ("Increased by…"). `tabular-nums` on value.
- **Files:** `stat/…` + `pages/stat/…`. Nav-group → **Status & layout**. Migrate-map: no row (net-new).
- **Key risks:** **D8** trend/sentiment two-knob model; **D13** register `trending_*` glyphs vs inline; clickable/drill-down variant deferred; verbatim value formatting (no Intl v1).

### 7.3 Sheet / Drawer — `rhombus-sheet` + `RhombusSheetService` · cdk-overlay · **M**
- **Material target:** none — built on `@angular/cdk/dialog` `Dialog` (scrim/focus-trap/restore/scroll-block/aria-modal) + `@angular/cdk/overlay` `GlobalPositionStrategy` (edge anchor). **Not** MatDialog (centres + hardcodes an `@angular/animations` enter/exit). No new peer. Clone from dialog service (leak-free ref, central defaults) + popover (CDK overlay lifecycle, Escape/backdrop subscriptions) + dialog component (projected chrome) + the two marker directives.
- **Public API:**
  - `RhombusSheetService.open<R,D>(content: ComponentType|TemplateRef, config?: RhombusSheetConfig<D>): RhombusSheetRef<R>`
  - `RhombusSheetRef<R>` (exported class): `side`, `close(result?)` (animated: remove `--open` class → await `transitionend` w/ fallback timeout → `CdkDialogRef.close`), `afterClosed(): Observable<R|undefined>`, `@internal setLabelledBy(id)`.
  - `RhombusSheetConfig<D>`: `data?`, `side='right'` (`SheetSide 'left'|'right'|'bottom'`), `size='md'` (`SheetSize`|raw CSS), `disableClose=false`, `hasBackdrop=true`, `panelClass`, `ariaLabel`, `autoFocus='first-tabbable'`, `restoreFocus=true`.
  - `<rhombus-sheet>` chrome — inputs `title` (drives `aria-labelledby` via the ref), `dismissible=true` (header ×).
  - `RhombusSheetActionsDirective` `[rhombusSheetActions]`, `RhombusSheetCloseDirective` `[rhombusSheetClose]`.
- **Tokens (reused):** `--surface-0`, `--text-primary/secondary`, `--border`, `--shadow-xl`, `--font-sans`, `--focus-ring`, `--motion-duration-slow`/`--motion-ease-emphasized`. **New: none.** CDK dark backdrop scrim.
- **A11y:** CDK Dialog container already renders `role=dialog` + `aria-modal` — chrome must **not** re-declare; name via `aria-labelledby`(title) or `config.ariaLabel`. Escape/Tab-trap/restore-focus from CDK.
- **Files:** `sheet/` (service, ref, types, component, scss, 2 directives, 2 specs) + `pages/sheet/…`. Nav-group → **Data & overlays**. Migrate-map: flip Bottom Sheet row `gap→full`; update Sidenav + CDK-Dialog notes.
- **Key risks:** **D9** exit-animation ownership; modal-only (defer non-modal push drawer); single live sheet vs stacking; RTL semantics of `side` (recommend physical); couples to `CdkDialogRef.overlayRef`/panel-class (re-verify on CDK bumps); require an accessible name (fail-loud if neither title nor ariaLabel).

---

## 8. Pack 4 — Rich interaction (v1.14)

All three are **L** — the hardest, saved for last. Register the reorder/stepper glyphs (§3.3). Depends on the motion **exit-animation** foundation maturing (Sheet already rehearsed the CSS-only pattern).

### 8.1 Stepper — `rhombus-stepper` + `rhombus-step` · hybrid · **L**
- **Material target:** **extend** `CdkStepper`/`CdkStep`/`CdkStepLabel`/`CdkStepperNext`/`CdkStepperPrevious` from `@angular/cdk/stepper` (**D10** — behaviour only, no `--mat-sys-*`, zero new peer). **Not** `mat-stepper`. Clone chrome from accordion (id seed, `grid-rows 0fr→1fr` reveal, `inert`, reduced-motion guard) + tabs (extend-a-CDK-primitive so `@ContentChild(CdkStepLabel)` still resolves).
- **Family (5 symbols):** `RhombusStepperComponent`, `RhombusStepComponent`, `RhombusStepLabelDirective` `[rhombusStepLabel]`, `RhombusStepperNextDirective` `[rhombusStepperNext]`, `RhombusStepperPreviousDirective` `[rhombusStepperPrevious]`; types `StepperOrientation`, `StepperLabelPosition`, `RhombusStepState`.
- **Stepper inputs:** `orientation='horizontal'` (new signal, synced to CdkStepper via effect) · `linear` · `selectedIndex` (`[(selectedIndex)]`; setter **throws** out-of-range) · `selected` · `labelPosition='end'|'bottom'`. **Step inputs (inherited):** `label`, `stepControl` (FormGroup gating linear + error state), `optional`, `editable=true`, `completed`, `state`, `errorMessage`, `optionalLabel='Optional'` (new), `ariaLabel/ariaLabelledby`.
- **Outputs:** `selectedIndexChange: number`, `stepChange: number` (re-emitted from CdkStepper w/ takeUntilDestroyed — **do not** re-export CDK's `StepperSelectionEvent`).
- **Tokens (reused):** surfaces/text/border/`--btn-primary-*`/`--error`/`--error-bg`/focus. **New: none.**
- **A11y:** header `role=tablist`; each header `role=tab` + `aria-selected`/`aria-controls`/roving tabindex; content `role=tabpanel`; **manual activation** (Arrow roams without selecting, Enter/Space selects). Error state only after `stepControl` touched. Collapsed panels `inert`.
- **Files:** `stepper/` (7 files) + `pages/stepper/…`. Migrate-map: flip Stepper **and** CDK-Stepper rows `gap→full`.
- **Key risks:** **D10** extend vs hand-roll; **D11** ship vertical or defer; CdkStepper underscore-member coupling (pin an integration test, watch CDK majors); inherited decorator `@Input()`s break "signal inputs everywhere" (documented exception); `selectedIndex` throws out-of-range; lazy `[rhombusStepContent]` deferred; NEW deep entry point → run pack + stackblitz smoke.

### 8.2 Reorder list — `rhombus-reorder-list` · `RhombusReorderListComponent<T>` · cdk-dragdrop · **L**
- **Material target:** `@angular/cdk/drag-drop` (`CdkDropList`/`CdkDrag`/`CdkDragHandle`, `moveItemInArray`) + `@angular/cdk/a11y` `LiveAnnouncer`. cdk already a peer; no `@angular/animations`. **cdkDrag is pointer-only + invisible to AT — the keyboard + announcement layer IS the component.** Clone from accordion (keydown state machine, id seed, focus restore) + toast (`LiveAnnouncer`) + nav-list (template row projection) + data-table (generic `<T>` + CDK).
- **Inputs:** `items: model<T[]>([])` (`[(items)]`) · `itemLabel: (item,i)=>string` (announced name) · `ariaLabel='Reorderable list'` · `disabled` (booleanAttr) · `showHandle=true` · `showButtons=true` · `orientation='vertical'` (**D12**) · `trackBy` (default tracks item ref so DOM nodes MOVE, preserving focus) · `dragHandleLabel='Drag to reorder'` · `announce: (e)=>string` (i18n formatter).
- **Outputs / types:** `reordered: ReorderEvent<T>` (fires once per committed reorder; not per intermediate arrow move, not on Escape-cancel) / `ReorderEvent<T>`, `ReorderListOrientation`; optional public `move(prev,curr)`.
- **Content:** **required** `[rhombusReorderItem]` `<ng-template let-item let-i="index">` (generic `T`); optional `[rhombusReorderEmpty]`.
- **Tokens (reused):** surfaces/borders (`--border-strong` placeholder, `--border-accent` grabbed), focus, text, `--shadow-lg`/`--shadow-md` (preview/lift), `--font-sans`. **New: none.**
- **A11y:** `<ul role=list aria-describedby=instructions>` + visually-hidden instructions; rows `<li cdkDrag>`; handle/buttons native `<button>` with computed aria-labels; **no `aria-grabbed`** (deprecated) — state via `LiveAnnouncer` (assertive). Keyboard grab-mode (Space/Enter pick-up, Arrow move, Home/End, Escape cancel) is **independent** of pointer events. `afterNextRender()` refocus safety net.
- **Files:** `reorder-list/` (component, scss, spec, item directive, types) + `pages/reorder-list/…`. Nav-group → (Data & overlays or Layout). Migrate-map: flip Drag-and-Drop CDK row `gap→partial` (single-list only; cross-list stays CDK).
- **Key risks:** **D12** orientation; grab-on-blur commit vs cancel (recommend commit); connected/cross-list lists out of scope; **D13** register `drag_indicator`/`arrow_upward`/`arrow_downward`; duplicate/primitive items need a custom trackBy.

### 8.3 Carousel — `rhombus-carousel` + `rhombus-carousel-slide` · bespoke · **L**
- **Material target:** none. Hand-rolled on region + slide-group ARIA. CSS-only transitions (no `@angular/animations`). Clone from accordion (parent queries typed children via `contentChildren`, id seed, `inert`) + popover (CSS motion) + bottom-nav (token-only indicator dots).
- **Container inputs:** `label` (region name) · `autoplay` (booleanAttr; never auto-starts under reduced-motion or ≤1 slide) · `interval=5000` · `loop=true` · `transition: 'slide'|'fade'` (`RhombusCarouselTransition`) · `pauseOnHover=true` · `swipe=true` (Pointer Events; SSR no-op) · `showArrows=true` · `showDots=true` · `selectedIndex: model<number>` (clamped).
- **Container outputs/API:** `selectedIndexChange: number`; `playingChange: boolean`; imperative `next/previous/select/play/pause/togglePlay`; readonly signals `count`, `playing`.
- **Slide:** `RhombusCarouselSlideComponent`, input `label` (overrides default "N of M"); host `role=group` + `aria-roledescription=slide`; `@internal setContext(index,total,active)`.
- **Tokens (reused):** surfaces/text/accent/border/focus/shadows/`--font-sans`/`--radius-*`/motion primitives. **New: none.**
- **A11y (APG Auto-Rotating Carousel):** `role=region` + `aria-roledescription=carousel`; slides `role=group` (**not** tabpanels — keeps `aria-roledescription=slide`); `aria-live` toggles `off`↔`polite` (off while auto-rotating); rotation play/pause control; dots = `<button>` group with `aria-current` + roving tabindex; non-active slides `inert`+`aria-hidden`. **SSR-critical:** gate all `window`/`matchMedia`/timers/`PointerEvent` behind `afterNextRender` + `isPlatformBrowser` (showcase is `outputMode: static` prerendered).
- **Files:** `carousel/` (container + slide + 2 specs + scss) + `pages/carousel/…`. Nav-group → **Content**. Migrate-map: no row (net-new).
- **Key risks:** **D14** loop rewind vs infinite; slidesPerView=1 only (defer multi/peek); group/slide vs tablist ARIA model (mutually exclusive — keep group); autoplay resume policy; RTL swipe (defer); jsdom fake-timers + stubbed matchMedia/PointerEvent in the spec (the fiddliest test).

---

## 9. Per-component implementation checklist (the repeatable recipe)

Every component executes these in order (TDD-first, per the house recipe):

1. **Spec first** — co-located `.spec.ts` with `axe()`; host fixture + CDK/Material harnesses; assert roles, keyboard, control/lightweight branches, disabled-when-control, edge cases.
2. **Component** — thin wrapper or bespoke per the brief; standalone/OnPush/ViewEncapsulation.None; signal APIs; scss references contract tokens only (or rebinds `--mat-*` custom-props).
3. **Tokens** — reuse only (all 13 add none). If a contrast pre-check (§3.5) fails, escalate before adding a token.
4. **Barrel** — `packages/core/src/index.ts` export(s) + `export type` + lead comment; draw the boundary in the comment where relevant (§3.7).
5. **Showcase page + route + nav** — 4-tab page (`apiKey` = exported symbol name/array), lazy route (redirect stays last), nav entry.
6. **Contrast gate** — add to `contrast.spec.ts` COMPONENTS **and** `a11y-coverage.ts` CONTRAST_VERIFIED (keep in sync).
7. **Migrate-map** — flip the relevant row; **defer the count** to the per-pack reconciliation (§3.4).
8. **Verify** — `corepack pnpm` → build core → `api-snapshot --update` → `generate-llms` → `generate-mcp-data` → test/tsc/build/smoke; restore LF; confirm no new peer needed (or add it).
9. **Commit** — `feat(core): …` per component; the pack ships as a `feat:` minor (release-please lockstep bumps all packages).

---

## 10. Foundations track (roadmap-only appendix)

Per the two-track decision, these are **not** specced here — each gets its own spec later. Captured for the roadmap rewrite (§ roadmap update). The Component track (this doc) and the Foundations track advance in parallel.

**Foundations — active:** Motion exit animations · Icon migration follow-ups *(already "Now")*.
**Foundations — Next (headline):** **Density modes** (compact/comfortable) — highest enterprise-migration leverage after parity; the community won't build it unprompted.
**Foundations — Considering:** Theme registry (community themes, first-class in the theme controls) · Visual theme-builder/generator · High-contrast theme · RTL + logical-properties pass · DX toolkit (`ng generate` schematics, StackBlitz starters, VS Code snippets, visual-regression + bundle-size CI) · MCP docs server (#93) · Figma UI kit (#94).

**Component track — new "Composite" tier (Considering):** Command palette (Cmd-K) · Tree / virtual-scroll list · Calendar / scheduler · Kanban board · Data-viz primitives (sparkline / charts — pairs with the new Stat card). These are app-level components; they extend the component roadmap after the four packs.

---

## 11. Release & sequencing summary

| Order | Version | Pack | Components | Headline for the roadmap |
|---|---|---|---|---|
| 1 | v1.11 | Parity primitives | Divider, Slider, Date range picker, Segmented | "The last Material parity gaps, closed." |
| 2 | v1.12 | Selection & entry | Autocomplete, Selection list, Number input | "Richer input beyond the fixed-list Select." |
| 3 | v1.13 | Dashboard & surfaces | Skeleton, Stat, Sheet | "Dashboard building blocks + an edge slide-over." |
| 4 | v1.14 | Rich interaction | Stepper, Reorder list, Carousel | "Stateful, motion-forward, accessible-by-default." |

**Parallel (Foundations track):** v1.11-era → Density modes (Next); Theme registry / builder, RTL, DX toolkit, MCP #93, Figma #94 (Considering).

**Global invariants:** zero new contract tokens (contract stays frozen at 60); no new `@angular/*` peer for any of the 13 (all Material subpaths + CDK already peers; `@angular/animations` intentionally avoided); WCAG 2.1 AA + axe in CI, both themes; every component ships the full 4-tab showcase page + llms/mcp regen.
