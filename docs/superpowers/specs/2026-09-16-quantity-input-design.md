# Quantity input — design spec

**Date:** 2026-09-16
**Status:** **Approved design** (brainstormed with the maintainer; every codebase claim below was verified against source by a three-lens exploration and a three-skeptic critique pass). Awaiting the gated-lane proposal issue, then implementation.
**Type:** Additive. Ships a **new core component** `<rhombus-quantity-input>` plus an internal shared spinbox helper, in the next lockstep MINOR. **No change** to any existing component's public API, the 60-token CONTRACT, the primitives, or the default rendering of `<rhombus-number-input>`.
**Scope:** `packages/core` (new component, new internal helper, number-input refactored onto the helper) · `apps/showcase` (new page + 3 registry lines + number-input page copy) · `apps/showcase-e2e` (3 new rows) · the 5 regenerated artifacts. **Does not touch** `@rhombuskit/tokens`, `theme-engine`, `material-preset`, or the icon registry.
**Lane:** 🔒 gated (new selector + exported class — `CONTRIBUTING.md:72-82`). One *New component proposal* issue → one `feat(core)` PR.
**Origin:** maintainer feedback — *"Number Input feels too boxy. Minus as a round button on the left of the quantity, plus as a round button on the right. Would that go against protocol?"*

---

## 1. Summary

A compact, chrome-less count control: **`label · (−) n (+)`**. A visible inline label, a round outlined − button, a borderless editable number, and a round outlined + button, in one row. It keeps Number Input's exact numeric behaviour (step, large step, clamp on step and blur, Arrow/Page/Home/End, `[(value)]` or `[control]`) because both components run on **one shared spinbox core**.

`<rhombus-number-input>` is **not** changed visually or in API. The two components split cleanly by job:

| | Number Input | Quantity Input |
|---|---|---|
| Shell | Material `mat-form-field` (outline/fill, floating label, hint, error subscript, currency prefix) | none — label text, two circles, a number |
| Use | precise numeric entry **inside forms** | a **count** in a row, card, list, or toolbar (cart quantity, sets/reps) |
| ± | joined pill in the trailing suffix (#138) | round outlined buttons *before* and *after* the number |
| Height | `--field-height` (56 px) | `--control-height-md` (40 px) |

### 1.1 Does the round − / n / + layout go against protocol? **No.**

| Concern | Finding (verified) |
|---|---|
| "Round" is off-system | `--radius-full` is the M3 *corner-full* rung of the frozen radius ramp (`docs/theming.md:434-448`, `packages/tokens/src/spec/primitives.ts:70-78`). The kit already ships bordered round icon buttons (carousel arrows, `rhombus-carousel.component.scss:53-91`) and borderless ones (menu `--icon`), and the bridge maps every `matIconButton` to a circle (`_bridge.scss:84-90`). |
| M3 prescribes a spinbox anatomy | Material ships **no** spinbox; the ± layer was always bespoke (`2026-07-18-remaining-components-design.md` §6.3). "± live in the trailing suffix" is a recorded *decision* whose purpose was keeping the leading slot free for a currency prefix — not a rule. |
| APG / ARIA | The spinbutton pattern constrains the **input** (keyboard + ARIA live there), not where the buttons sit. The native input stays the single tab stop; ± stay `tabindex=-1` labelled buttons (D7, §6.3). |
| Frozen tokens | Zero new tokens. Every colour, radius, width, gap and duration below is an existing CONTRACT token or published primitive. |
| Density | The circles size from `--control-height-md` (density owns the box); nothing is sized by a `size` input. The density spec's "number-input ± out of scope, do not rewire" note (`2026-07-19-density-modes-design.md:1162`) is about number-input and is **not** superseded — number-input's pill is untouched. |
| Icon policy | D13 ("inline the one-off number-input ± paths", §3.3) **stands**: the new component inlines the same two SVG paths. No registry seeding, no conflict with the planned R1 font-less-icons PR. |

### 1.2 Why a second component, not a `layout` mode on number-input

Technically number-input *could* render this — it owns its own template. The reason for a separate component is **API shape**: in a chrome-less layout 7 of number-input's 17 inputs (`appearance`, `hint`, `placeholder`, `subscriptSizing`, `required`, `showButtons`, and the `[matTextPrefix]/[matIconPrefix]` slots) would be inert. The kit tolerates one "ignored when…" caveat (`disabled` when `control` is set); it should not tolerate seven. Two small, honest APIs beat one with half its surface conditional.

**Rejected alternatives** (recorded for the proposal issue):

- *Mode input on number-input* (`buttonLayout: 'inline' | 'bare'`): ~10 files, no new route/nav/coverage entry — cheaper, but the dead-input problem above, and `size` would mean "type only" in one mode and nothing in the other.
- *Replace number-input's default look*: every consumer loses floating label, hint, error subscript and prefix slots — a breaking semantic change to a form-field-family component.
- *Round buttons flanking the outlined field* (value box kept): answers "box-in-box" but leaves the outline the maintainer called boxy; the bare value was chosen explicitly.

---

## 2. Public API

Selector `rhombus-quantity-input` · class `RhombusQuantityInputComponent` · standalone · `OnPush` · `ViewEncapsulation.None` · `styleUrl`. **No new exported type.**

| Input | Type · default | Notes |
|---|---|---|
| `label` | `input.required<string>()` | Visible inline text before −; also the group's accessible name (§4). Required: an unlabelled spinbutton is an a11y trap. Precedent for required inputs: `empty-state.heading`, `code-block.code`. |
| `min` / `max` | `number \| null` · `null` | Clamp on step and on blur, exactly as number-input. |
| `step` | `number` · `1` | Arrow keys and the ± buttons. |
| `largeStep` | `number \| null` · `null` (→ `step × 10`) | PageUp / PageDown. |
| `value` | `model<number \| null>(null)` | Lightweight mode; `[(value)]`. |
| `control` | `FormControl<number \| null> \| null` · `null` | Reactive mode; when set, `value` and `disabled` are ignored (number-input precedent). |
| `disabled` | `input(false, { transform: booleanAttribute })` | Lightweight mode only. |
| `incrementLabel` / `decrementLabel` | `string` · `'Increment'` / `'Decrement'` | `aria-label` of the circles. |

| Output | Type |
|---|---|
| `valueChange` | `number \| null` — emits on each user change in lightweight mode (completes `[(value)]`). |

**Deliberately not in v1** — each is a later non-breaking MINOR if a consumer asks: `size` (v1 is md-only, §5), `hideLabel` / `labelPosition`, hold-to-repeat, disable-at-bound styling, `hint`/`required`.

Barrel: one line after the number-input block in `packages/core/src/index.ts` (after `:99`), with the boundary comment pattern already used there ("Distinct from …").

---

## 3. Anatomy

Host bindings (the carousel / radio-group pattern — `:host {}` rules are inert under `ViewEncapsulation.None`, so the class must be a real host attribute):

```ts
host: {
  class: 'rhombus-quantity-input',
  role: 'group',
  '[attr.aria-labelledby]': 'labelId',
}
```

Template (DOM order = reading order = visual order in LTR; flex follows `direction`, so RTL mirrors — the docs say *before/after*, never *left/right*):

```html
<label class="rhombus-quantity-input__label" [id]="labelId" [for]="inputId">{{ label() }}</label>

<button type="button"
        class="rhombus-quantity-input__btn rhombus-quantity-input__btn--dec"
        tabindex="-1"
        [attr.aria-label]="decrementLabel()"
        [disabled]="fieldDisabled()"
        (mousedown)="$event.preventDefault()"
        (click)="decrement()">
  <svg class="rhombus-quantity-input__glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
</button>

<input #field
       type="number"
       class="rhombus-quantity-input__field"
       [id]="inputId"
       [formControl]="internal"
       [attr.min]="min()" [attr.max]="max()" [attr.step]="step()"
       inputmode="decimal"
       (keydown)="onKeydown($event)"
       (blur)="onBlur()" />

<button type="button"
        class="rhombus-quantity-input__btn rhombus-quantity-input__btn--inc"
        tabindex="-1"
        [attr.aria-label]="incrementLabel()"
        [disabled]="fieldDisabled()"
        (mousedown)="$event.preventDefault()"
        (click)="increment()">
  <svg class="rhombus-quantity-input__glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
</button>
```

Ids come from a module-level counter (`let nextId = 0; … \`rhombus-quantity-input-${nextId++}\``) — the accordion / carousel / nav-list / radio-group pattern. The glyph paths are byte-identical to number-input's (`rhombus-number-input.component.ts:84-90, :100-106`) so the planned R1 font-less-icons PR swaps both sites the same way.

---

## 4. Accessibility model

- **The native `<input type="number">` is the single tab stop and the implicit `spinbutton`**; `aria-valuemin/max/now` derive from the reflected `min/max/step` attributes. **No manual `role`/`aria-*` on the input** (D7 — double announcement).
- **Accessible names.** `<label for>` names the input ("Quantity"). `role="group"` + `aria-labelledby` on the host names the trio, so a screen reader in browse mode hears *"Quantity, group → Decrement, button → Quantity, spinbutton, 3 → Increment, button"* rather than three context-less "Decrement" buttons in a form with three counts. (The APG spinbutton example wraps its trio the same way; D7 forbids manual ARIA on the *input* only. Kit precedents for a labelled group host: carousel `:122`, mode-menu `:42`.)
- **The circles are pointer/touch helpers**: native `<button type="button" tabindex="-1">` with `aria-label`; the keyboard path is Arrow ±step, PageUp/PageDown ±largeStep, Home/End → bounds, all on the input. Same ratified single-tab-stop model as number-input (§6.3 of the 2026-07-18 spec). The showcase Accessibility paragraph says this in one sentence.
- **Focus lands on the input after every ± click.** Number-input only gets this today as a side effect of Material's wrapper `(click)="_control.onContainerClick()"` → `MatInput.focus()`; a bare layout has no such handler. Without it, after clicking + focus sits on a `tabindex=-1` button with no visible ring (or nowhere, in Safari), every keyboard shortcut is dead until the user clicks the number, and a VoiceOver/TalkBack user who double-taps + hears no new value. So: `(mousedown)="$event.preventDefault()"` on both buttons (an already-focused input never blurs into a clamp-commit *then* step-commit double write), and `increment()`/`decrement()` end with `this.field().nativeElement.focus({ preventScroll: true })` via `viewChild.required<ElementRef<HTMLInputElement>>('field')`. **Exception — touch.** When the activating pointer is `touch`, the refocus is skipped (it would raise the on-screen keypad on every tap); the new value is announced instead through a visually-hidden `aria-live="polite"` region, which is a separate element, so D7 (no ARIA on the input) still holds.
- **Focus ring.** The input gets the kit-canonical `:focus-visible` treatment (`outline: var(--border-width-strong) solid var(--focus-border); outline-offset: 2px`, carousel `:79-82`) **plus** the global halo (`box-shadow: 0 0 0 4px var(--focus-ring)`, `packages/tokens/src/styles/_focus.scss:10-13`) — the halo is intentional; nothing sets `box-shadow: none`. The buttons carry the same rule for parity even though keyboard focus never reaches them.
- **Touch target.** 40 / 36 / 48 px at default / compact / comfortable (`--control-height-md`) — every level ≥ the 24 px WCAG 2.2 SC 2.5.8 floor, and the two targets are separated by the 8 px gap + the 48 px number so the Spacing exception never applies. Gated by a `density.spec.ts` CONTROLS row (jest-axe `target-size` is disabled under jsdom — `packages/core/src/testing/axe.ts:14-22`).
- **Contrast.** Glyph `--text-primary` on the page surface (17.1:1 light / 19.3:1 dark). Ring `--border-strong`: light slate-400 = **2.45:1 on `--bg`**, 2.56:1 on `--surface-0`, 2.34:1 on a `--surface-1` card; dark slate-500 = 4.24 / 3.75 / 3.07:1. `--border` was rejected because slate-200 on white is 1.2:1 and the circle would vanish. WCAG 1.4.11's 3:1 applies to the visual information *required* to identify the control — here the 17:1 glyph does that, so the ring is a design floor, not a conformance one: **documented floor 2.25:1 in both themes**, gated by a computed-style row (§7.1) because the axe sweep evaluates text nodes only and the glyphs are `aria-hidden` SVG. A stronger ring needs a token *value* change, which the Spotter cycle reserves for R2 — revisit there, not here.
- **Disabled.** Native `[disabled]` on both buttons and the input; glyph and number `--text-disabled`; ring `--border`; **no `opacity`** — one disabled mechanism (the double treatment on number-input is a separate Spotter-brief item).
- **Reduced motion.** Only `background`/`color` transitions; nothing moves.
- **jest-axe** runs on the rendered host in the component spec.

---

## 5. Visual, tokens, density

Zero new tokens. Every literal fallback equals the primitive's default (the "an app that never opts in renders identically" rule, `geometry.spec.ts:3-27`).

```scss
// Quantity input — label · round − · borderless number · round +. Chrome-less on
// purpose: Number Input owns the form-field shell. Density owns every box below
// (--control-height-md); nothing here is sized by type.
@use '../../styles/space';

.rhombus-quantity-input {
  display: inline-flex;
  align-items: center;
  gap: space.space(2);                         // 8px, on the 4px grid
  color: var(--text-primary);
}

.rhombus-quantity-input__label {
  color: var(--text-secondary);
  margin-inline-end: space.space(1);
}

.rhombus-quantity-input__btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-height-md, 2.5rem);     // 40 / 36 / 48 — the M3 icon-button box;
  height: var(--control-height-md, 2.5rem);    // same primitive on both axes keeps it a circle
  padding: 0;
  border: var(--border-width) solid var(--border-strong);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard);

  &:hover:not(:disabled)  { background: var(--surface-2); }
  &:active:not(:disabled) { background: var(--surface-3); }
  &:focus-visible { outline: var(--border-width-strong) solid var(--focus-border); outline-offset: 2px; }
  &:disabled { color: var(--text-disabled); border-color: var(--border); cursor: not-allowed; }
}

.rhombus-quantity-input__glyph {
  width: 1.25rem;                              // = rhombus-icon `sm`; R1's swap is geometry-neutral
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.rhombus-quantity-input__field {
  width: 3rem;                                 // 3–4 tabular digits; wider counts belong in Number Input
  height: var(--control-height-md, 2.5rem);
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 1rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
  appearance: textfield;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

  // A bare number between two buttons reads as static text; the hover wash and
  // the focus ring are what say "you can type here".
  &:hover:not(:disabled) { background: var(--surface-1); }
  &:focus-visible { outline: var(--border-width-strong) solid var(--focus-border); outline-offset: 2px; }
  &:disabled { color: var(--text-disabled); }
}
```

**Style decisions (maintainer-chosen from mockups):** bare value (no field chrome) · label inline before − · outlined circles (over tonal). Rest fill is transparent so the circle adopts whatever surface it sits on; `--surface-2` hover stays distinct from the `--border-strong` ring in both themes.

**Density.** md rung only in v1; `provideRhombusDensity()` moves it app-wide (40 → 36 → 48). No `[data-density]` rule in the component and no sixth density primitive (`primitives.ts:110-117`). `size` is intentionally absent: it would add an exported type, a Sizes showcase section, three geometry rows and a MOVED row for a rung nobody asked for.

**Typography.** `font-size: 1rem` (Material body-large, what number-input's digits render at). Core does not yet consume `--type-*` (that is R4 of the Spotter cycle); this component follows suit and migrates with the rest.

---

## 6. Shared spinbox core

**New internal helper** `packages/core/src/lib/forms/spinbox.ts` — not barrel-exported, so absent from `etc/core.api.md`. Same idiom as `mirrorControl` (`mirror-control.ts:46`): a function called from a component constructor's injection context.

```ts
export interface SpinboxConfig {
  control: () => FormControl<number | null> | null;   // the public `control` input
  value: ModelSignal<number | null>;                   // the public `value` model
  disabled: () => boolean;                             // the public `disabled` input
  min: () => number | null;
  max: () => number | null;
  step: () => number;
  largeStep: () => number | null;
  valueChange: OutputEmitterRef<number | null>;
}

export interface Spinbox {
  readonly internal: FormControl<number | null>;      // bind to the <input>
  readonly fieldDisabled: Signal<boolean>;            // bind to the ± [disabled]
  increment(): void;
  decrement(): void;
  onKeydown(event: KeyboardEvent): void;              // Arrow / Page / Home / End
  onBlur(): void;                                     // clamp on blur; empty stays null
}

export function createSpinbox(config: SpinboxConfig): Spinbox
```

It owns **everything** currently spread across `rhombus-number-input.component.ts:166-291`: the `mirrorControl` call (identity mapping), the lightweight value seed effect (`setValue(…, { emitEvent: false })`), disabled tracking via `statusChanges` (re-subscribing on control swap), the `largeStep ?? step * 10` default, `stepBy` / `toBound` / `clamp` / `commit`, blur clamping, and the "emit only in lightweight mode" rule. Three pure functions were considered and rejected: they would leave ~60 lines of that wiring duplicated — the first duplication of `statusChanges` / silent-seed wiring in the kit.

**Number-input is refactored onto it with no public-API change.** Its template keeps binding `internal`, `fieldDisabled()`, `increment()`, `decrement()`, `onKeydown`, `onBlur` — now thin protected delegates to the helper (protected members are filtered out of the api snapshot, `tools/api-snapshot.mjs:60-76`). Its existing spec stays green throughout and is the refactor's safety net. Its rendering, tokens, and the #138 pill are untouched.

Focus-after-click (§4) is a **component** concern (the helper has no DOM): `increment() { this.spin.increment(); this.field().nativeElement.focus({ preventScroll: true }); }`. Number-input keeps relying on Material's container click as today.

---

## 7. Showcase, tests, gates

### 7.1 Tests (RED first, in this order)

1. `packages/core/src/lib/forms/spinbox.spec.ts` — host-component style (`mirror-control.spec.ts` precedent): step/clamp/keys/blur/seed/disabled/emit semantics, both modes, control swap. **Semantics are tested once, here.**
2. `packages/core/src/lib/number-input/rhombus-number-input.component.spec.ts` — **unchanged**; must stay green across the refactor.
3. `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.spec.ts` — DOM/wiring only: `<label for>` ↔ input `id`; host `role="group"` + `aria-labelledby` = label id; ± `tabindex="-1"` + aria-labels from inputs; exactly two `.rhombus-quantity-input__btn`; `[disabled]` in lightweight and control mode (incl. control swap); **`incBtn.click()` → `document.activeElement === input`** and value stepped; mousedown default prevented; jest-axe clean.
4. `apps/showcase/src/app/pages/accessibility/accessibility-page.component.spec.ts` — goes red until the slug is in `a11y-coverage.ts` (it asserts the list equals the real route set).
5. `apps/showcase-e2e/tests/geometry.spec.ts` — new route block `/components/quantity-input?tab=examples`: `.rhombus-quantity-input` `align-items` = `center` (its `display` blockifies inside the page's flex row, so it is not assertable), `column-gap` = `8px`; `.rhombus-quantity-input__btn--inc` `width` = `40px`, `height` = `40px`, `border-top-left-radius` = `9999px`; `.rhombus-quantity-input__field` `height` = `40px`.
6. `apps/showcase-e2e/tests/density.spec.ts` — CONTROLS row (`sel: '.rhombus-quantity-input__btn--inc'`, ≥ 24 px at compact) and a MOVED row (36 px at compact).
7. A computed-style contrast row (the `button-contrast.spec.ts` pattern, `packages/theme-builder/src/color-math`): on `/components/quantity-input?tab=examples` in **both** themes, `.rhombus-quantity-input__btn` `color` composited over the first opaque ancestor ≥ 4.5:1 and `border-top-color` ≥ 2.25:1 (the documented ring floor from §4; measured 2.34–2.56 light, 3.07–4.24 dark). Lives in a sibling spec `quantity-input-contrast.spec.ts` so button-contrast stays about buttons.

### 7.2 Showcase

- New page `apps/showcase/src/app/pages/quantity-input/quantity-input-page.component.ts`, cloned from the number-input page (4 tabs: `[hasUsage]="true"`, `apiKey="RhombusQuantityInputComponent"`). Overview: lead, hero `<app-example>`, *When to use* (a count in a row/card/toolbar), *When not to use* (→ Number Input for labelled/hinted/validated entry or currency; → Slider for a visible range), *Related*, *Import & setup*, *Anatomy & slots*, *Theming* (the tokens actually used in §5 — not number-input's list, which is already stale), *Accessibility* (single tab stop; circles are pointer helpers; group name; keyboard set). Examples: **Basic** (Quantity 0–10), **Step & large step**, **Reactive forms** (FormControl with min/max, disabled toggle), **At a bound** (value pinned at min/max — buttons stay enabled, clamp is the behaviour), **Disabled**, **In a list** (three cart rows, each with its own label). Usage tab mirrors number-input's.
- `apps/showcase/src/app/app.routes.ts` — `quantity-input` route after `number-input` (`:107-110` pattern), title "Quantity Input".
- `apps/showcase/src/app/shared/navigation.ts:59` — `{ path: '/components/quantity-input', label: 'Quantity Input' }` after Number Input. **Edit before the llms/mcp regen.**
- `apps/showcase/src/app/pages/accessibility/a11y-coverage.ts:31` — `{ slug: 'quantity-input', label: 'Quantity Input' }` after number-input.
- Number-input page: *When not to use* gains "For a compact count without form-field chrome, use Quantity Input"; the canonical `label="Quantity"` examples (`:47`, `:151`, `:285`) and the Usage snippet's `app-quantity` / `QuantityComponent` (`:281-292`) are renamed to **Seats** (`app-seats` / `SeatsComponent`) so "quantity" names one component. The component docblock example (`rhombus-number-input.component.ts:36`) likewise.
- Barrel comment on both exports states the boundary (§1).

### 7.3 Gates and regeneration (explicit — the root `build` script does not chain them; mirror `.github/workflows/ci.yml:123-143`)

```
corepack pnpm exec nx run-many --target=build --all
node tools/verify-tokens.mjs
node tools/verify-component-styles.mjs
node tools/verify-setup-docs.mjs
node tools/api-snapshot.mjs --update      # then: node tools/api-snapshot.mjs (check)
node tools/generate-llms.mjs               # after navigation.ts; LF endings
node tools/generate-mcp-data.mjs
corepack pnpm exec nx test core
corepack pnpm exec nx test showcase
corepack pnpm exec nx e2e showcase-e2e     # geometry, density, contrast, quantity-input-contrast
```

Regenerated artifacts that will drift and are committed: `etc/core.api.md` (+1 block), `apps/showcase/src/generated/api-metadata.ts` (+ the new component, and number-input's docblock example rename), `apps/showcase/public/llms.txt` + `llms-full.txt`, `packages/mcp/src/generated/mcp-data.ts`. Restore generated-token CRLF before committing (dev-gotcha). No new `@angular/*` import in core → `tools/smoke-test-pack.mjs` unaffected. No `@angular/animations` → `verify-setup-docs` unaffected.

---

## 8. Release and sequencing

- **Proposal issue first** (gated lane): *New component proposal* form — title names `rhombus-quantity-input`; body = §1.1 (protocol answer), §1.2 (why not a mode; rejected alternatives), §2 API, §4 a11y model incl. the `tabindex=-1` + focus-restore decision, token impact = none. Note the feature-request dropdown lacks a Number Input entry (stale; separate fast-lane docs fix).
- **One PR**, conventional commit `feat(core): quantity input — round − / + count control (#<issue>)`. The body lists: the number-input refactor is behaviour-preserving (spec unchanged, green); the "Quantity → Seats" example rename; the `api-metadata.ts` diff on number-input is docblock text, not API drift; no screenshot baselines exist in `apps/showcase-e2e` (only computed-style specs) so before/after PNGs in the PR (both themes × three density levels) are the visual record.
- Ships in the **next MINOR** via release-please; never hand-edit `CHANGELOG.md` or versions.
- **Spotter R1 (font-less icons)** is unaffected: this PR seeds nothing in the registry. R1's icon PR gains one more inline-`<svg>` site to swap (`rhombus-quantity-input.component.ts`), same 1.25 rem box, same `add`/`remove` seeds it already plans.

---

## 9. Decisions log

| # | Decision | Why |
|---|---|---|
| Q1 | New component, not a mode on number-input | 7 of 17 inputs would be inert in a bare layout (§1.2). |
| Q2 | Bare value — no `mat-form-field` | Maintainer choice from mockups; the outline *was* the "boxy". |
| Q3 | Label visible, inline, before − ; `input.required` | Always an accessible name; one row; `hideLabel` can come later non-breaking. |
| Q4 | Outlined circles, `--border-strong` ring, floor 2.25:1 | Matches the carousel-arrow idiom; `--border` is 1.2:1 on white; the glyph carries 1.4.11, the ring is a design floor (2.34–2.56 light, ≥3.07 dark). |
| Q5 | `tabindex=-1` on ± + explicit focus-restore on click | Ratified single-tab-stop model kept; the bare layout must reproduce what Material's container click gave number-input. |
| Q6 | `role="group"` + `aria-labelledby` on the host | Context for the leading "Decrement" button; D7 forbids ARIA on the *input* only. |
| Q7 | `--control-height-md` (40 px), md-only, no `size` | M3 icon-button box; YAGNI on rungs; no exported type. |
| Q8 | One `createSpinbox()` helper owning the whole numeric core | Three pure functions would leave ~60 lines of wiring duplicated. |
| Q9 | Inline SVG glyphs, no registry seeding | D13 stands; zero conflict with the R1 icon PR. |
| Q10 | No `opacity` on disabled | One disabled mechanism. |
| Q11 | Number-input's "Quantity" examples renamed | The word must point at one component. |
| Q12 | `width: 3rem` on the number | 3–4 tabular digits; wider counts are Number Input's job; BEM overrides are not semver-covered. |
| Q13 | Skip the refocus on touch; polite live region announces the value | The refocus would pop the keypad on every tap of − / + on phones — the headline use case. |
