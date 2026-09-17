# Quantity Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `<rhombus-quantity-input>` — `label · (−) n (+)`, a chrome-less count control with round outlined ± buttons — alongside the unchanged `<rhombus-number-input>`, both running on one shared internal spinbox core.

**Architecture:** The step / clamp / keyboard / blur / control-mirror logic that lives inside `RhombusNumberInputComponent` today is extracted to an internal `createSpinbox()` helper (same idiom as `mirrorControl`: a function called from a component's injection context that returns the pieces the template binds). Number-input is refactored onto it with **no public-API change** — its existing spec is the refactor's safety net. The new component is a plain inline-flex row (visible `<label>`, round − `<button>`, borderless native `<input type="number">`, round + `<button>`) with `role="group"` on the host, sized from `--control-height-md`, coloured only from existing tokens. Showcase page + registries, e2e rows and the regenerated artifacts complete the gated-lane delivery for proposal **#151**.

**Tech Stack:** Angular 21 standalone / OnPush / signals · Reactive Forms · nx monorepo · Sass component styles (`styleUrl`) · Jest + jest-axe · Playwright (`apps/showcase-e2e`) · `tools/*.mjs` gates.

**Spec:** `docs/superpowers/specs/2026-09-16-quantity-input-design.md` (merged in #150). **Proposal issue:** #151.

## Global Constraints

- **Run every nx / pnpm command through Corepack** (`corepack pnpm exec nx <…>`) — it works in every shell here. (The `pnpm` shim does resolve from cmd.exe on this machine, which is what lets the Playwright `webServer` command in `apps/showcase-e2e/playwright.config.ts:44` spawn — do not "fix" that command.)
- **`node tools/api-snapshot.mjs` (check mode) compares bytes with no EOL normalisation.** On this Windows checkout `etc/tokens.api.md` and `etc/theme-builder.api.md` are CRLF on disk, so a check run on a fresh tree reports false "drift". Run the check only **immediately after** `--update`; judge real drift with `git diff --ignore-cr-at-eol -- etc/`; discard CRLF→LF-only rewrites of untouched reports with `git checkout -- etc/tokens.api.md etc/theme-builder.api.md` before committing.
- **`nx test` does not type-check spec files** (isolatedModules). The only gate that does is CI's `typecheck` job: `corepack pnpm exec tsc --noEmit -p packages/core/tsconfig.spec.json` — run it before claiming the new specs are green (Task 5 Step 2b).
- **Zero new tokens.** Every colour, radius, width, gap and duration is an existing CONTRACT token or published primitive: `--radius-full`, `--radius-sm`, `--border-width`, `--border-width-strong`, `--border`, `--border-strong`, `--surface-1/2/3`, `--text-primary/secondary/disabled`, `--focus-border`, `--motion-duration-fast`, `--motion-ease-standard`, `--space-1/2` (via `space.space()`), `--control-height-md`. `tools/verify-tokens.mjs` must stay green with no snapshot update.
- **No new exported type.** The barrel gains exactly one class export. `etc/core.api.md` gains one block (the new component); number-input's block must be **byte-identical** before/after Task 2.
- **Every literal fallback equals the primitive's default** (`var(--control-height-md, 2.5rem)`), so an app that never calls `provideRhombusDensity()` renders identically.
- **A11y model (D7):** the native `<input type="number">` is the single tab stop and implicit spinbutton — **no `role`/`aria-*` on the input**. ± are `tabindex="-1"` native buttons with `aria-label`. Host is `role="group"` + `aria-labelledby`.
- **Focus returns to the input after every ± click** (`(mousedown)` default-prevented; `increment()`/`decrement()` end with `input.focus({ preventScroll: true })`).
- **Glyphs stay inline SVG** (identical paths to number-input). Do **not** seed `add`/`remove` in the icon registry — the R1 font-less-icons PR owns that.
- **Component SCSS uses `styleUrl`**, so `//` comments are fine there (Sass strips them; `tools/verify-component-styles.mjs` scans the published `dist/packages/*/fesm2022` for leaked `//`). Showcase pages' inline `styles:` strings use `/* */` only, for consistency with every other page.
- **Regen order after a core build:** `navigation.ts` edits → `node tools/api-snapshot.mjs --update` → `node tools/generate-llms.mjs` → `node tools/generate-mcp-data.mjs`. LF line endings; if Windows CRLF noise appears in a generated file, `git add --renormalize <file>` before committing.
- **Do not run `nx build core` while `nx serve showcase` is running** (ng-packagr cleans `dist`).
- **Conventional Commits**, commitlint wraps body lines at **100 chars**. Never hand-edit `CHANGELOG.md` or versions. End every commit message with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Gated lane:** every commit references `#151`.
- **RTL / wording:** flex follows `direction`; all docs say *before/after* the number, never left/right.

---

## File Structure

**Create**

| File | Responsibility |
|---|---|
| `packages/core/src/lib/forms/spinbox.ts` | `createSpinbox()` — the shared numeric core (mirror, seed, disabled tracking, step/clamp/commit, keyboard map, blur). Internal, not barrel-exported. |
| `packages/core/src/lib/forms/spinbox.spec.ts` | Semantics of the core, tested once through a host component. |
| `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.ts` | The component: template + host bindings + ids + focus restore; delegates every numeric concern to the helper. |
| `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.scss` | Row, label, round buttons, borderless field — tokens only. |
| `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.spec.ts` | DOM / wiring / a11y of the component (not numeric semantics). |
| `apps/showcase/src/app/pages/quantity-input/quantity-input-page.component.ts` | 4-tab showcase page. |
| `apps/showcase-e2e/tests/quantity-input-contrast.spec.ts` | Computed-style contrast of glyph and ring, both themes. |

**Modify**

| File | Change |
|---|---|
| `packages/core/src/lib/number-input/rhombus-number-input.component.ts` | Constructor + private numeric methods replaced by one `createSpinbox()` call; docblock example `Quantity` → `Seats`. Template and inputs unchanged. |
| `packages/core/src/index.ts:93-99` | Boundary sentence on the number-input comment; new export block after it. |
| `apps/showcase/src/app/app.routes.ts:106-111` | `quantity-input` route after `number-input`. |
| `apps/showcase/src/app/shared/navigation.ts:59` | Nav entry after Number Input. |
| `apps/showcase/src/app/pages/accessibility/a11y-coverage.ts:31` | Coverage entry after number-input. |
| `apps/showcase/src/app/pages/number-input/number-input-page.component.ts` | `Quantity` → `Seats` (lines 47, 151, 281–293); cross-links to Quantity Input. |
| `apps/showcase-e2e/tests/geometry.spec.ts` | New route block. |
| `apps/showcase-e2e/tests/density.spec.ts` | One MOVED row, one CONTROLS row. |
| Generated (commit, never hand-edit): `etc/core.api.md`, `apps/showcase/src/generated/api-metadata.ts`, `apps/showcase/public/llms.txt`, `apps/showcase/public/llms-full.txt`, `packages/mcp/src/generated/mcp-data.ts` | Regenerated in Task 5. |

---

### Task 0: Branch

**Files:** none.

- [ ] **Step 1: Start from current main on the feature branch** (the branch already exists from the spec PR; it is behind `main`, so reset it onto `main`)

```bash
cd C:/GitHub/RhombusKit
git fetch origin
git checkout -B feat/quantity-input origin/main
git log --oneline -1
git status --short
```

Expected: the one-line log shows main's head (`143e78f` or later); `git status` shows only this plan file as untracked.

- [ ] **Step 2: Commit the plan** (repo precedent: `77b176c`, `18ab1ef` commit implementation plans)

```bash
git add docs/superpowers/plans/2026-09-17-quantity-input.md
git commit -m "docs(plans): quantity input implementation plan (#151)" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 1: `createSpinbox()` helper

**Files:**
- Create: `packages/core/src/lib/forms/spinbox.ts`
- Test: `packages/core/src/lib/forms/spinbox.spec.ts`

**Interfaces:**
- Consumes: `mirrorControl` from `packages/core/src/lib/forms/mirror-control.ts` (signature: `mirrorControl<Ext, Int>({ external, internal, toInternal, toExternal, onExternalChange?, disabled? }): void`).
- Produces (used by Tasks 2 and 3):

```ts
export interface SpinboxConfig {
  control: () => FormControl<number | null> | null;
  value: ModelSignal<number | null>;
  disabled: () => boolean;
  min: () => number | null;
  max: () => number | null;
  step: () => number;
  largeStep: () => number | null;
  valueChange: OutputEmitterRef<number | null>;
}
export interface Spinbox {
  readonly internal: FormControl<number | null>;
  readonly fieldDisabled: Signal<boolean>;
  increment(): void;
  decrement(): void;
  onKeydown(event: KeyboardEvent): void;
  onBlur(): void;
}
export function createSpinbox(config: SpinboxConfig): Spinbox;
```

- [ ] **Step 1: Write the failing spec**

Create `packages/core/src/lib/forms/spinbox.spec.ts`:

```ts
import { Component, model, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { createSpinbox, Spinbox } from './spinbox';

/**
 * Host that wires createSpinbox() exactly the way a component does: signal
 * inputs for the bounds, a model for the lightweight value, an explicit output
 * for valueChange, and an optional bound control. No template — the numeric
 * semantics are what is under test, not any DOM.
 */
@Component({ standalone: true, template: '' })
class HostComponent {
  readonly control = signal<FormControl<number | null> | null>(null);
  readonly value = model<number | null>(5);
  readonly disabled = signal(false);
  readonly min = signal<number | null>(0);
  readonly max = signal<number | null>(10);
  readonly step = signal(1);
  readonly largeStep = signal<number | null>(null);
  readonly valueChange = output<number | null>();
  readonly emitted: (number | null)[] = [];

  readonly spin: Spinbox = createSpinbox({
    control: this.control,
    value: this.value,
    disabled: this.disabled,
    min: this.min,
    max: this.max,
    step: this.step,
    largeStep: this.largeStep,
    valueChange: this.valueChange,
  });

  constructor() {
    this.valueChange.subscribe((v) => this.emitted.push(v));
  }
}

function setup(): { fixture: ComponentFixture<HostComponent>; host: HostComponent } {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return { fixture, host: fixture.componentInstance };
}

function keydown(host: HostComponent, key: string): KeyboardEvent {
  const ev = new KeyboardEvent('keydown', { key, cancelable: true });
  host.spin.onKeydown(ev);
  return ev;
}

describe('createSpinbox', () => {
  it('seeds the internal control from the value model (lightweight)', () => {
    const { host } = setup();
    expect(host.spin.internal.value).toBe(5);
  });

  it('follows later value-model writes without emitting', () => {
    const { fixture, host } = setup();
    host.value.set(7);
    fixture.detectChanges();
    expect(host.spin.internal.value).toBe(7);
    expect(host.emitted).toEqual([]);
  });

  it('increment / decrement step by `step`, update the model and emit', () => {
    const { host } = setup();
    host.spin.increment();
    expect(host.value()).toBe(6);
    expect(host.emitted).toEqual([6]);
    host.spin.decrement();
    expect(host.value()).toBe(5);
    expect(host.emitted).toEqual([6, 5]);
  });

  it('clamps steps to max and min', () => {
    const { fixture, host } = setup();
    host.value.set(10);
    fixture.detectChanges();
    host.spin.increment();
    expect(host.value()).toBe(10);
    host.value.set(0);
    fixture.detectChanges();
    host.spin.decrement();
    expect(host.value()).toBe(0);
  });

  it('increments from an empty value to the minimum (or 0 without a min)', () => {
    const { fixture, host } = setup();
    host.value.set(null);
    fixture.detectChanges();
    host.spin.increment();
    expect(host.value()).toBe(0);
    host.min.set(null);
    host.value.set(null);
    fixture.detectChanges();
    host.spin.increment();
    expect(host.value()).toBe(0);
  });

  it('does not clamp a typed value until blur, and leaves empty null on blur', () => {
    const { host } = setup();
    host.spin.internal.setValue(999);
    expect(host.value()).toBe(999);
    host.spin.onBlur();
    expect(host.value()).toBe(10);
    host.spin.internal.setValue(null);
    host.spin.onBlur();
    expect(host.value()).toBeNull();
  });

  it('maps ArrowUp / ArrowDown to ±step and prevents the native default', () => {
    const { host } = setup();
    const up = keydown(host, 'ArrowUp');
    expect(host.value()).toBe(6);
    expect(up.defaultPrevented).toBe(true);
    keydown(host, 'ArrowDown');
    expect(host.value()).toBe(5);
  });

  it('maps PageUp / PageDown to ±largeStep, defaulting to step * 10', () => {
    const { fixture, host } = setup();
    host.max.set(100);
    host.value.set(20);
    fixture.detectChanges();
    keydown(host, 'PageUp');
    expect(host.value()).toBe(30);
    host.largeStep.set(25);
    fixture.detectChanges();
    keydown(host, 'PageDown');
    expect(host.value()).toBe(5);
  });

  it('maps Home / End to min / max and ignores them when the bound is null', () => {
    const { fixture, host } = setup();
    keydown(host, 'Home');
    expect(host.value()).toBe(0);
    keydown(host, 'End');
    expect(host.value()).toBe(10);
    host.min.set(null);
    fixture.detectChanges();
    const home = keydown(host, 'Home');
    expect(host.value()).toBe(10);
    expect(home.defaultPrevented).toBe(true);
  });

  it('ignores unrelated keys', () => {
    const { host } = setup();
    const ev = keydown(host, 'a');
    expect(host.value()).toBe(5);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('drives a bound control instead of the model, and does not emit (control mode)', () => {
    const { fixture, host } = setup();
    const ctrl = new FormControl<number | null>(3);
    host.control.set(ctrl);
    fixture.detectChanges();
    expect(host.spin.internal.value).toBe(3);
    host.spin.increment();
    expect(ctrl.value).toBe(4);
    expect(host.value()).toBe(5); // untouched in control mode
    expect(host.emitted).toEqual([]);
  });

  it('reports fieldDisabled from the lightweight input, and disables the internal control', () => {
    const { fixture, host } = setup();
    expect(host.spin.fieldDisabled()).toBe(false);
    host.disabled.set(true);
    fixture.detectChanges();
    expect(host.spin.fieldDisabled()).toBe(true);
    expect(host.spin.internal.disabled).toBe(true);
  });

  it('reports fieldDisabled from the bound control, following status changes and swaps', () => {
    const { fixture, host } = setup();
    host.disabled.set(true); // ignored once a control is bound
    const a = new FormControl<number | null>(1);
    host.control.set(a);
    fixture.detectChanges();
    expect(host.spin.fieldDisabled()).toBe(false);
    a.disable();
    expect(host.spin.fieldDisabled()).toBe(true);
    const b = new FormControl<number | null>(2);
    host.control.set(b);
    fixture.detectChanges();
    expect(host.spin.fieldDisabled()).toBe(false);
    b.disable();
    expect(host.spin.fieldDisabled()).toBe(true);
    // Order matters: a leaked subscription to the OLD control would now write
    // `false` over the `true` we just observed — that is what proves the cleanup.
    a.enable();
    expect(host.spin.fieldDisabled()).toBe(true);
  });
});
```

- [ ] **Step 2: Run the spec to verify it fails**

```bash
corepack pnpm exec nx test core --testFile=packages/core/src/lib/forms/spinbox.spec.ts
```

Expected: FAIL — `Cannot find module './spinbox'`.

- [ ] **Step 3: Write the helper**

Create `packages/core/src/lib/forms/spinbox.ts`:

```ts
import {
  effect,
  ModelSignal,
  OutputEmitterRef,
  Signal,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { mirrorControl } from './mirror-control';

/** Configuration for {@link createSpinbox} — the component's own signal inputs, passed as accessors. */
export interface SpinboxConfig {
  /** The public reactive-forms control input; `null` in lightweight mode. */
  control: () => FormControl<number | null> | null;
  /** The public `value` model (lightweight mode). */
  value: ModelSignal<number | null>;
  /** The public `disabled` input; ignored once a control is bound. */
  disabled: () => boolean;
  min: () => number | null;
  max: () => number | null;
  /** Increment for the ± buttons and the arrow keys. */
  step: () => number;
  /** Increment for PageUp / PageDown; `null` means `step * 10`. */
  largeStep: () => number | null;
  /** The public `valueChange` output (lightweight mode). */
  valueChange: OutputEmitterRef<number | null>;
}

/** What {@link createSpinbox} hands back for the component's template to bind. */
export interface Spinbox {
  /** The private control bound to the `<input type="number">`. */
  readonly internal: FormControl<number | null>;
  /** Disabled state for the ± buttons (the mirror disables the input silently). */
  readonly fieldDisabled: Signal<boolean>;
  increment(): void;
  decrement(): void;
  /** Arrow ±step · PageUp/PageDown ±largeStep · Home/End → bounds. */
  onKeydown(event: KeyboardEvent): void;
  /** Clamp the typed value into range; an empty field stays `null`. */
  onBlur(): void;
}

/**
 * The shared numeric core behind every RhombusKit spinbox (`rhombus-number-input`,
 * `rhombus-quantity-input`). One owner for the behaviour the two components must
 * keep identical:
 *
 * - `[control]` / `[(value)]` mirrored onto one private `FormControl` via
 *   {@link mirrorControl} (identity mapping), plus the lightweight value seed;
 * - disabled tracking for the ± buttons — the lightweight input, or the bound
 *   control's status (re-subscribing when the instance swaps);
 * - step / clamp / commit, `largeStep ?? step * 10`, the keyboard map, and
 *   clamp-on-blur (never per keystroke).
 *
 * Must be called from an injection context (a component field initializer or
 * constructor): it registers `effect`s and `mirrorControl` uses `takeUntilDestroyed`.
 */
export function createSpinbox(config: SpinboxConfig): Spinbox {
  const { control, value, disabled, min, max, step, largeStep, valueChange } = config;
  const internal = new FormControl<number | null>(null);
  const fieldDisabled = signal(false);

  const clamp = (input: number): number => {
    const lo = min();
    const hi = max();
    let result = input;
    if (lo != null) result = Math.max(lo, result);
    if (hi != null) result = Math.min(hi, result);
    return result;
  };

  const commit = (next: number): void => {
    if (internal.value !== next) {
      internal.setValue(next);
    }
  };

  const stepBy = (delta: number): void => {
    const current = internal.value;
    const base = current == null ? (min() ?? 0) : current + delta;
    commit(clamp(base));
  };

  const toBound = (bound: number | null): void => {
    if (bound != null) {
      commit(bound);
    }
  };

  const largeStepValue = (): number => largeStep() ?? step() * 10;

  mirrorControl<number, number>({
    external: control,
    internal,
    toInternal: (v) => v,
    toExternal: (v) => v,
    onExternalChange: (v) => {
      // In control mode the bound control is the source of truth (the mirror
      // already wrote to it); value / valueChange belong to lightweight mode.
      if (control()) return;
      value.set(v);
      valueChange.emit(v);
    },
    disabled,
  });

  // Seed the internal control from the lightweight value model (the mirror only
  // seeds from a bound control). Silent write — no echo back through the emit.
  effect(() => {
    if (control()) return;
    const v = value();
    if (internal.value !== v) {
      internal.setValue(v, { emitEvent: false });
    }
  });

  // Track disabled for the ± buttons: the lightweight input, or the bound
  // control's status (re-subscribing when its instance swaps).
  effect((onCleanup) => {
    const ctrl = control();
    if (!ctrl) {
      fieldDisabled.set(disabled());
      return;
    }
    fieldDisabled.set(ctrl.disabled);
    const sub = ctrl.statusChanges.subscribe(() => fieldDisabled.set(ctrl.disabled));
    onCleanup(() => sub.unsubscribe());
  });

  return {
    internal,
    fieldDisabled: fieldDisabled.asReadonly(),
    increment: () => stepBy(step()),
    decrement: () => stepBy(-step()),
    onKeydown: (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          stepBy(step());
          break;
        case 'ArrowDown':
          event.preventDefault();
          stepBy(-step());
          break;
        case 'PageUp':
          event.preventDefault();
          stepBy(largeStepValue());
          break;
        case 'PageDown':
          event.preventDefault();
          stepBy(-largeStepValue());
          break;
        case 'Home':
          event.preventDefault();
          toBound(min());
          break;
        case 'End':
          event.preventDefault();
          toBound(max());
          break;
      }
    },
    onBlur: (): void => {
      const current = internal.value;
      if (current != null) {
        commit(clamp(current));
      }
    },
  };
}
```

- [ ] **Step 4: Run the spec to verify it passes**

```bash
corepack pnpm exec nx test core --testFile=packages/core/src/lib/forms/spinbox.spec.ts
```

Expected: PASS, 13 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/forms/spinbox.ts packages/core/src/lib/forms/spinbox.spec.ts
git commit -m "feat(core): createSpinbox() — shared numeric core for the spinbox components (#151)" -m "Extracts the step / clamp / keyboard / blur / control-mirror behaviour into one internal
helper (the mirrorControl idiom) so rhombus-number-input and the upcoming
rhombus-quantity-input cannot drift. Internal only — not barrel-exported.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Refactor number-input onto the helper (no API change)

**Files:**
- Modify: `packages/core/src/lib/number-input/rhombus-number-input.component.ts` (docblock line 36; class body lines 157–291)
- Test (unchanged, must stay green): `packages/core/src/lib/number-input/rhombus-number-input.component.spec.ts`

**Interfaces:**
- Consumes: `createSpinbox`, `Spinbox` from Task 1.
- Produces: nothing new. Template bindings `internal`, `fieldDisabled()`, `increment()`, `decrement()`, `onKeydown($event)`, `onBlur()` keep their names.

- [ ] **Step 1: Confirm the spec is green before touching anything**

```bash
corepack pnpm exec nx test core --testFile=packages/core/src/lib/number-input/rhombus-number-input.component.spec.ts
```

Expected: PASS, 24 tests. (This is the safety net — the refactor must keep it exactly so.)

- [ ] **Step 2: Replace the numeric core with the helper**

In `packages/core/src/lib/number-input/rhombus-number-input.component.ts`:

(a) Change the import block at the top of the file — drop `effect` and `signal`, replace the `mirrorControl` import with `createSpinbox`, and **keep `computed`** (`hostClasses` still uses it). The block as it must read:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { createSpinbox } from '../forms/spinbox';
```

(b) In the class docblock, change the example line

```
 *   <rhombus-number-input label="Quantity" [min]="0" [max]="99" [(value)]="qty" />
```
to
```
 *   <rhombus-number-input label="Seats" [min]="0" [max]="99" [(value)]="seats" />
```

and change the sentence `The public `[control]` / `[(value)]` is mirrored to a private `FormControl<number | null>` bound to the input via the shared {@link mirrorControl} helper (identity mapping) — a spinbox must read the current value to clamp and write the stepped one back, so a single internal control is the natural home for that. Clamping runs on blur and on a step, never per keystroke.` to:

```
 * The public `[control]` / `[(value)]`, the ± / step / clamp logic and the keyboard
 * map all come from the shared {@link createSpinbox} core (one owner for every
 * RhombusKit spinbox, so this and `rhombus-quantity-input` cannot drift). Clamping
 * runs on blur and on a step, never per keystroke.
```

(c) Replace **everything in the class from `/** The control bound to the inner input …` (line 160) to the end of the class** with:

```ts
  /** The shared numeric core: control mirror, value seed, disabled tracking, step/clamp/keys. */
  private readonly spin = createSpinbox({
    control: this.control,
    value: this.value,
    disabled: this.disabled,
    min: this.min,
    max: this.max,
    step: this.step,
    largeStep: this.largeStep,
    valueChange: this.valueChange,
  });

  /** The control bound to the inner input; the public `control` / `value` mirror onto it. */
  protected readonly internal = this.spin.internal;

  /** Disabled state surfaced to the ± buttons (the mirror disables the input silently). */
  protected readonly fieldDisabled = this.spin.fieldDisabled;

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-form-field',
      `rhombus-form-field--${this.appearance()}`,
      `rhombus-form-field--${this.size()}`,
    ].join(' ')
  );

  protected increment(): void {
    this.spin.increment();
  }

  protected decrement(): void {
    this.spin.decrement();
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.spin.onKeydown(event);
  }

  protected onBlur(): void {
    this.spin.onBlur();
  }
}
```

The `constructor()`, `largeStepValue`, `stepBy`, `toBound`, `clamp`, `commit` and `emitAndSync` members are gone. The `spin` field must sit **after** `valueChange` (class fields initialise in declaration order).

- [ ] **Step 3: Run the number-input spec — it must still pass unchanged**

```bash
corepack pnpm exec nx test core --testFile=packages/core/src/lib/number-input/rhombus-number-input.component.spec.ts
```

Expected: PASS, 24 tests, spec file untouched (`git status` shows only the component `.ts` modified).

- [ ] **Step 4: Prove the public surface is unchanged (and absorb the docblock drift)**

`tools/api-snapshot.mjs` regenerates **all four** package reports and throws `Entry not found — build first` if any `dist` is missing, so build everything, not just core:

```bash
corepack pnpm exec nx run-many --target=build --all
node tools/api-snapshot.mjs --update
node tools/api-snapshot.mjs
git diff --ignore-cr-at-eol --stat -- etc/
git status --short
```

Expected: the check (third line) exits 0 — run it **immediately after** `--update`, because the check compares bytes and `etc/tokens.api.md` / `etc/theme-builder.api.md` are CRLF on disk on this Windows checkout (a check run on a freshly checked-out tree reports false "drift"). The `--ignore-cr-at-eol` diff prints **nothing** — in particular nothing for `etc/core.api.md` (protected/private members are filtered out of the snapshot). `git status` shows the component `.ts`, `apps/showcase/src/generated/api-metadata.ts`, and possibly the two CRLF-only `etc/*.api.md` files. `api-metadata.ts` changes only because it embeds JSDoc text — the docblock edits from Step 2 — which is expected and not API drift. Finally drop the line-ending-only rewrites so the commit stays honest:

```bash
git checkout -- etc/tokens.api.md etc/theme-builder.api.md
git status --short
```

Expected: exactly `rhombus-number-input.component.ts` and `api-metadata.ts` modified.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/number-input/rhombus-number-input.component.ts apps/showcase/src/generated/api-metadata.ts
git commit -m "refactor(core): run number-input on createSpinbox() (#151)" -m "Behaviour-preserving: the component spec is unchanged and green; etc/core.api.md is
byte-identical. The docblock example now says Seats so the word Quantity names the new
quantity-input component (api-metadata.ts picks up that docblock text — not API drift).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: `<rhombus-quantity-input>` component

**Files:**
- Create: `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.ts`
- Create: `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.scss`
- Test: `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.spec.ts`
- Modify: `packages/core/src/index.ts:93-99`

**Interfaces:**
- Consumes: `createSpinbox` (Task 1).
- Produces: `RhombusQuantityInputComponent` (selector `rhombus-quantity-input`), inputs `label` (required), `min`, `max`, `step`, `largeStep`, `value` (model), `control`, `disabled`, `incrementLabel`, `decrementLabel`; output `valueChange`. BEM classes used by Tasks 4 and 6: `.rhombus-quantity-input` (host), `__label`, `__btn`, `__btn--dec`, `__btn--inc`, `__glyph`, `__field`.

- [ ] **Step 1: Write the failing spec**

Create `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.spec.ts`:

```ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { axe } from '../../testing/axe';
import { RhombusQuantityInputComponent } from './rhombus-quantity-input.component';

@Component({
  standalone: true,
  imports: [RhombusQuantityInputComponent, ReactiveFormsModule],
  template: `
    <rhombus-quantity-input
      [label]="label"
      [min]="min"
      [max]="max"
      [step]="step"
      [disabled]="disabled"
      [control]="control"
      [incrementLabel]="incrementLabel"
      [decrementLabel]="decrementLabel"
      [(value)]="value"
      (valueChange)="lastValue = $event"
    />
  `,
})
class HostComponent {
  label = 'Quantity';
  min: number | null = 0;
  max: number | null = 10;
  step = 1;
  disabled = false;
  control: FormControl<number | null> | null = null;
  incrementLabel = 'Increment';
  decrementLabel = 'Decrement';
  value: number | null = 5;
  lastValue: number | null | undefined = undefined;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function root(el: HTMLElement): HTMLElement {
  return el.querySelector('rhombus-quantity-input') as HTMLElement;
}
function input(el: HTMLElement): HTMLInputElement {
  return el.querySelector('input') as HTMLInputElement;
}
function label(el: HTMLElement): HTMLLabelElement {
  return el.querySelector('label') as HTMLLabelElement;
}
function incBtn(el: HTMLElement): HTMLButtonElement {
  return el.querySelector('.rhombus-quantity-input__btn--inc') as HTMLButtonElement;
}
function decBtn(el: HTMLElement): HTMLButtonElement {
  return el.querySelector('.rhombus-quantity-input__btn--dec') as HTMLButtonElement;
}

describe('rhombus-quantity-input', () => {
  it('renders a visible label wired to the input by for/id', () => {
    const { el } = setup();
    expect(label(el).textContent?.trim()).toBe('Quantity');
    expect(label(el).getAttribute('for')).toBe(input(el).id);
    expect(input(el).id).toMatch(/^rhombus-quantity-input-\d+-input$/);
  });

  it('names the host group after the label', () => {
    const { el } = setup();
    expect(root(el).getAttribute('role')).toBe('group');
    expect(root(el).getAttribute('aria-labelledby')).toBe(label(el).id);
    expect(label(el).id).toMatch(/^rhombus-quantity-input-\d+-label$/);
  });

  it('gives each instance distinct ids', () => {
    const a = setup();
    const b = setup();
    expect(input(a.el).id).not.toBe(input(b.el).id);
    expect(label(a.el).id).not.toBe(label(b.el).id);
  });

  it('renders a native number input carrying min/max/step with no manual ARIA', () => {
    const { el } = setup();
    const field = input(el);
    expect(field.type).toBe('number');
    expect(field.getAttribute('min')).toBe('0');
    expect(field.getAttribute('max')).toBe('10');
    expect(field.getAttribute('step')).toBe('1');
    expect(field.getAttribute('inputmode')).toBe('decimal');
    expect(field.hasAttribute('role')).toBe(false);
    expect(field.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('seeds the input from the value model', () => {
    const { el } = setup();
    expect(input(el).value).toBe('5');
  });

  it('renders exactly two ± buttons, out of the tab order, with aria-labels and hidden glyphs', () => {
    const { el } = setup();
    expect(el.querySelectorAll('.rhombus-quantity-input__btn')).toHaveLength(2);
    expect(decBtn(el).getAttribute('aria-label')).toBe('Decrement');
    expect(incBtn(el).getAttribute('aria-label')).toBe('Increment');
    expect(decBtn(el).getAttribute('tabindex')).toBe('-1');
    expect(incBtn(el).getAttribute('tabindex')).toBe('-1');
    expect(decBtn(el).getAttribute('type')).toBe('button');
    expect(incBtn(el).querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('orders the DOM label → − → input → + (reading order = visual order)', () => {
    const { el } = setup();
    const kids = Array.from(root(el).children);
    expect(kids.map((c) => c.tagName.toLowerCase())).toEqual(['label', 'button', 'input', 'button']);
    expect(kids[1]).toBe(decBtn(el));
    expect(kids[2]).toBe(input(el));
    expect(kids[3]).toBe(incBtn(el));
  });

  it('uses the custom increment / decrement labels', () => {
    const { fixture, host, el } = setup();
    host.incrementLabel = 'Add one';
    host.decrementLabel = 'Remove one';
    fixture.detectChanges();
    expect(incBtn(el).getAttribute('aria-label')).toBe('Add one');
    expect(decBtn(el).getAttribute('aria-label')).toBe('Remove one');
  });

  it('steps the value and emits when a button is clicked (wiring reaches the core)', () => {
    const { host, el } = setup();
    incBtn(el).click();
    expect(host.value).toBe(6);
    expect(host.lastValue).toBe(6);
    decBtn(el).click();
    expect(host.value).toBe(5);
  });

  it('clamps at the bounds (wiring reaches the core)', () => {
    const { fixture, host, el } = setup();
    host.value = 10;
    fixture.detectChanges();
    incBtn(el).click();
    expect(host.value).toBe(10);
  });

  it('moves focus to the input after a ± click', () => {
    const { el } = setup();
    expect(document.activeElement).not.toBe(input(el));
    incBtn(el).click();
    expect(document.activeElement).toBe(input(el));
    input(el).blur();
    decBtn(el).click();
    expect(document.activeElement).toBe(input(el));
  });

  it('prevents the default of mousedown on the ± buttons so a focused input never blurs', () => {
    const { el } = setup();
    const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    incBtn(el).dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('drives a bound control (control mode)', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl<number | null>(3);
    fixture.detectChanges();
    expect(input(el).value).toBe('3');
    incBtn(el).click();
    expect(host.control.value).toBe(4);
  });

  it('disables the input and buttons via the lightweight disabled input', () => {
    const { fixture, host, el } = setup();
    host.disabled = true;
    fixture.detectChanges();
    expect(input(el).disabled).toBe(true);
    expect(incBtn(el).disabled).toBe(true);
    expect(decBtn(el).disabled).toBe(true);
    incBtn(el).click();
    expect(host.value).toBe(5);
  });

  it('ignores the lightweight disabled input once a control is bound', () => {
    const { fixture, host, el } = setup();
    host.disabled = true;
    host.control = new FormControl<number | null>(2);
    fixture.detectChanges();
    expect(input(el).disabled).toBe(false);
    expect(incBtn(el).disabled).toBe(false);
    host.control.disable();
    fixture.detectChanges();
    expect(input(el).disabled).toBe(true);
    expect(incBtn(el).disabled).toBe(true);
  });

  it('follows the NEW control after a swap, not the old one', () => {
    const { fixture, host, el } = setup();
    const a = new FormControl<number | null>({ value: 1, disabled: true });
    host.control = a;
    fixture.detectChanges();
    expect(incBtn(el).disabled).toBe(true);
    const b = new FormControl<number | null>(2);
    host.control = b;
    fixture.detectChanges();
    expect(incBtn(el).disabled).toBe(false);
    expect(input(el).disabled).toBe(false);
    a.enable(); // must not touch the buttons any more
    a.disable();
    fixture.detectChanges();
    expect(incBtn(el).disabled).toBe(false);
    b.disable();
    fixture.detectChanges();
    expect(incBtn(el).disabled).toBe(true);
    expect(input(el).disabled).toBe(true);
  });

  it('wires keydown and blur on the input to the core', () => {
    const { host, el } = setup();
    const up = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    input(el).dispatchEvent(up);
    expect(host.value).toBe(6);
    expect(up.defaultPrevented).toBe(true);
    input(el).value = '999';
    input(el).dispatchEvent(new Event('input'));
    expect(host.value).toBe(999); // unclamped while typing
    input(el).dispatchEvent(new Event('blur'));
    expect(host.value).toBe(10); // clamped on blur
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run the spec to verify it fails**

```bash
corepack pnpm exec nx test core --testFile=packages/core/src/lib/quantity-input/rhombus-quantity-input.component.spec.ts
```

Expected: FAIL — `Cannot find module './rhombus-quantity-input.component'`.

- [ ] **Step 3: Write the component**

Create `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { createSpinbox } from '../forms/spinbox';

/** Per-instance id seed for label ↔ input ↔ group ARIA wiring (SSR-safe, deterministic). */
let nextId = 0;

/**
 * `<rhombus-quantity-input>` — a compact, chrome-less count control:
 * `label · (−) n (+)`. A visible inline label, a round − button, a borderless
 * editable number and a round + button in one row. For quantities that live in
 * rows, cards, lists and toolbars (cart quantity, seats, sets/reps).
 *
 * It is deliberately NOT a form field: no floating label, hint, error subscript,
 * currency prefix or `appearance`. For labelled numeric entry inside a form use
 * `<rhombus-number-input>`; both components share one numeric core
 * ({@link createSpinbox}), so stepping, clamping and the keyboard map are identical.
 *
 * The native `type="number"` input is the single tab stop and an implicit ARIA
 * `spinbutton` (`aria-valuemin/max/now` derive from `min` / `max` / `step`), so no
 * manual `role`/`aria-*` is added to it. The host is a `group` named by the label,
 * so the − and + buttons announce with context. The buttons are `tabindex="-1"`
 * pointer/touch helpers; after every click focus returns to the input so the
 * keyboard set (Arrow ±step · PageUp/PageDown ±largeStep · Home/End → bounds) is
 * live and a screen reader hears the new value.
 *
 *   <rhombus-quantity-input label="Quantity" [min]="0" [max]="10" [(value)]="qty" />
 *
 * Clamping runs on blur and on a step, never per keystroke. In RTL the row mirrors
 * with the reading direction: − stays *before* the number, + *after* it.
 */
@Component({
  selector: 'rhombus-quantity-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-quantity-input.component.scss',
  // A host class, not `:host {}` — under ViewEncapsulation.None a `:host` rule is
  // emitted literally and matches nothing in light DOM.
  host: {
    class: 'rhombus-quantity-input',
    role: 'group',
    '[attr.aria-labelledby]': 'labelId',
  },
  template: `
    <label class="rhombus-quantity-input__label" [id]="labelId" [for]="inputId">{{
      label()
    }}</label>

    <button
      type="button"
      class="rhombus-quantity-input__btn rhombus-quantity-input__btn--dec"
      tabindex="-1"
      [attr.aria-label]="decrementLabel()"
      [disabled]="fieldDisabled()"
      (mousedown)="$event.preventDefault()"
      (click)="decrement()"
    >
      <svg class="rhombus-quantity-input__glyph" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14" />
      </svg>
    </button>

    <input
      #field
      type="number"
      class="rhombus-quantity-input__field"
      [id]="inputId"
      [formControl]="internal"
      [attr.min]="min()"
      [attr.max]="max()"
      [attr.step]="step()"
      inputmode="decimal"
      (keydown)="onKeydown($event)"
      (blur)="onBlur()"
    />

    <button
      type="button"
      class="rhombus-quantity-input__btn rhombus-quantity-input__btn--inc"
      tabindex="-1"
      [attr.aria-label]="incrementLabel()"
      [disabled]="fieldDisabled()"
      (mousedown)="$event.preventDefault()"
      (click)="increment()"
    >
      <svg class="rhombus-quantity-input__glyph" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  `,
})
export class RhombusQuantityInputComponent {
  /** Visible label rendered before the − button; also the accessible name of the input and of the group. Required. */
  readonly label = input.required<string>();
  /** Minimum value; `null` (default) for no lower bound. */
  readonly min = input<number | null>(null);
  /** Maximum value; `null` (default) for no upper bound. */
  readonly max = input<number | null>(null);
  /** Increment for the ± buttons and arrow keys. Defaults to `1`. */
  readonly step = input<number>(1);
  /** Increment for PageUp / PageDown; `null` (default) uses `step * 10`. */
  readonly largeStep = input<number | null>(null);
  /** Value in lightweight (`[(value)]`) mode; ignored when `control` is set. */
  readonly value = model<number | null>(null);
  /** Reactive-forms `FormControl<number | null>`; when set, `value`/`disabled` are ignored. */
  readonly control = input<FormControl<number | null> | null>(null);
  /** Disables the control in lightweight mode; ignored when `control` is set. Defaults to `false`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name for the + button. Defaults to `'Increment'`. */
  readonly incrementLabel = input<string>('Increment');
  /** Accessible name for the − button. Defaults to `'Decrement'`. */
  readonly decrementLabel = input<string>('Decrement');

  /** Emits on each user change in lightweight mode (completes `[(value)]`). */
  readonly valueChange = output<number | null>();

  private readonly base = `rhombus-quantity-input-${nextId++}`;
  protected readonly labelId = `${this.base}-label`;
  protected readonly inputId = `${this.base}-input`;

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /** The shared numeric core: control mirror, value seed, disabled tracking, step/clamp/keys. */
  private readonly spin = createSpinbox({
    control: this.control,
    value: this.value,
    disabled: this.disabled,
    min: this.min,
    max: this.max,
    step: this.step,
    largeStep: this.largeStep,
    valueChange: this.valueChange,
  });

  /** The control bound to the `<input>`; the public `control` / `value` mirror onto it. */
  protected readonly internal = this.spin.internal;

  /** Disabled state surfaced to the ± buttons (the mirror disables the input silently). */
  protected readonly fieldDisabled = this.spin.fieldDisabled;

  protected increment(): void {
    this.spin.increment();
    this.focusField();
  }

  protected decrement(): void {
    this.spin.decrement();
    this.focusField();
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.spin.onKeydown(event);
  }

  protected onBlur(): void {
    this.spin.onBlur();
  }

  // The buttons are tabindex=-1 and their mousedown is default-prevented, so a
  // click never takes focus away; if the input was not focused, put it there so
  // the keyboard set is live and assistive tech reads the new value.
  private focusField(): void {
    this.field().nativeElement.focus({ preventScroll: true });
  }
}
```

- [ ] **Step 4: Write the stylesheet**

Create `packages/core/src/lib/quantity-input/rhombus-quantity-input.component.scss`:

```scss
// Quantity input — label · round − · borderless number · round +. Chrome-less on
// purpose: Number Input owns the form-field shell. Density owns every box below
// (--control-height-md on both axes of the circles and the field); nothing here
// is sized by type. All colour flows through CONTRACT tokens, every dimension
// through published primitives, and each fallback equals the primitive's default.
@use '../../styles/space';

.rhombus-quantity-input {
  display: inline-flex;
  align-items: center;
  gap: space.space(2);
  color: var(--text-primary);
}

.rhombus-quantity-input__label {
  color: var(--text-secondary);
  margin-inline-end: space.space(1);
}

// The kit's round outlined icon button (the carousel-arrow recipe) with a
// transparent rest fill so the circle adopts whatever surface it sits on. The
// ring is --border-strong: --border on a white page is ~1.2:1 and would vanish.
.rhombus-quantity-input__btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-height-md, 2.5rem);
  height: var(--control-height-md, 2.5rem);
  padding: 0;
  border: var(--border-width) solid var(--border-strong);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard);

  &:hover:not(:disabled) {
    background: var(--surface-2);
  }

  &:active:not(:disabled) {
    background: var(--surface-3);
  }

  // tabindex=-1 keeps these out of the tab order, so this only ever shows for
  // programmatic focus; kept for parity with every other kit icon button. The
  // global --focus-ring halo paints beneath the outline on purpose.
  &:focus-visible {
    outline: var(--border-width-strong) solid var(--focus-border);
    outline-offset: 2px;
  }

  // One disabled mechanism: colour + native [disabled]. No opacity.
  &:disabled {
    color: var(--text-disabled);
    border-color: var(--border);
    cursor: not-allowed;
  }
}

// Same paths as number-input's ±; 1.25rem = rhombus-icon `sm`, so the planned
// font-less-icons swap to <rhombus-icon> is geometry-neutral.
.rhombus-quantity-input__glyph {
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

// A bare number between two buttons reads as static text; the hover wash and
// the focus ring are what say "you can type here". 3rem fits 3–4 tabular digits —
// wider counts belong in Number Input.
.rhombus-quantity-input__field {
  width: 3rem;
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
  // Hide the native spinner — the ± buttons replace it.
  appearance: textfield;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:hover:not(:disabled) {
    background: var(--surface-1);
  }

  &:focus-visible {
    outline: var(--border-width-strong) solid var(--focus-border);
    outline-offset: 2px;
  }

  &:disabled {
    color: var(--text-disabled);
  }
}
```

- [ ] **Step 5: Run the spec to verify it passes**

```bash
corepack pnpm exec nx test core --testFile=packages/core/src/lib/quantity-input/rhombus-quantity-input.component.spec.ts
```

Expected: PASS, 18 tests. If the `moves focus` test fails because `document.activeElement` is `body`: TestBed's default renderer appends the fixture root to `document.body`, so `focus()` must work — check the `#field` template ref and `viewChild.required` name match.

- [ ] **Step 6: Export from the barrel**

In `packages/core/src/index.ts`, replace the number-input comment + export (lines 93–99):

```ts
// Number input — a numeric spinbox: mat-form-field chrome + a bespoke ± / step /
// clamp / keyboard layer over a native <input type=number> (an implicit ARIA
// spinbutton). [control]/[(value)] control model via the internal mirrorControl
// helper; min/max/step/largeStep, clamp-on-blur, and inline ± glyphs. Exposes no
// new public type (reuses FormFieldAppearance/FormFieldSize). Distinct from Slider
// (a draggable bounded range) and a plain Input type=number (unbounded free text).
export { RhombusNumberInputComponent } from './lib/number-input/rhombus-number-input.component';
```

with:

```ts
// Number input — a numeric spinbox: mat-form-field chrome + a bespoke ± / step /
// clamp / keyboard layer over a native <input type=number> (an implicit ARIA
// spinbutton). [control]/[(value)] control model and the ± / clamp / keyboard
// behaviour come from the internal createSpinbox core; min/max/step/largeStep,
// clamp-on-blur, and inline ± glyphs. Exposes no new public type (reuses
// FormFieldAppearance/FormFieldSize). Distinct from Slider (a draggable bounded
// range), a plain Input type=number (unbounded free text), and Quantity input
// (the same spinbox without the form-field shell — a compact count).
export { RhombusNumberInputComponent } from './lib/number-input/rhombus-number-input.component';

// Quantity input — a compact, chrome-less count: visible inline label · round −
// button · borderless native <input type=number> (the implicit spinbutton and the
// single tab stop) · round + button, with role=group on the host. Same numeric
// core as Number input (createSpinbox), no form-field shell: no floating label,
// hint, error subscript, prefix or appearance — for labelled entry inside forms
// use Number input. Exposes no new public type.
export { RhombusQuantityInputComponent } from './lib/quantity-input/rhombus-quantity-input.component';
```

- [ ] **Step 7: Run the whole core test suite and lint**

```bash
corepack pnpm exec nx test core
corepack pnpm exec nx lint core
```

Expected: all green. (`kit-glyph-coverage.spec.ts` stays green because the template uses inline `<svg>`, not `<rhombus-icon>`.)

- [ ] **Step 8: Commit**

```bash
git add packages/core/src/lib/quantity-input packages/core/src/index.ts
git commit -m "feat(core): rhombus-quantity-input — round − / + count control (#151)" -m "label · (−) n (+): visible inline label, round outlined ± (tabindex=-1, aria-labelled, focus
returns to the input after every click), a borderless native number input as the single tab
stop / implicit spinbutton, role=group on the host. Sized from --control-height-md; zero new
tokens; same numeric core as number-input via createSpinbox().

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Showcase page, registries, number-input cross-links

**Files:**
- Create: `apps/showcase/src/app/pages/quantity-input/quantity-input-page.component.ts`
- Modify: `apps/showcase/src/app/shared/navigation.ts:59`
- Modify: `apps/showcase/src/app/app.routes.ts:106-111`
- Modify: `apps/showcase/src/app/pages/accessibility/a11y-coverage.ts:31`
- Modify: `apps/showcase/src/app/pages/number-input/number-input-page.component.ts`
- Test: `apps/showcase/src/app/pages/accessibility/accessibility-page.component.spec.ts` (existing — used as the RED gate)

**Interfaces:**
- Consumes: `RhombusQuantityInputComponent` from `@rhombuskit/core` (Task 3); `ComponentPageComponent` (`app-component-page` with `title`, `[hasUsage]`, `apiKey`) and `ExampleComponent` (`app-example [code]`) from `apps/showcase/src/app/shared/`.
- Produces: route `/components/quantity-input` (used by Task 6 rows), examples-tab elements `.rhombus-quantity-input__btn--inc` etc.

- [ ] **Step 1: Add the nav entry (this is what turns the coverage gate RED)**

In `apps/showcase/src/app/shared/navigation.ts`, after line 59:

```ts
      { path: '/components/number-input', label: 'Number Input' },
      { path: '/components/quantity-input', label: 'Quantity Input' },
```

- [ ] **Step 2: Run the coverage spec to verify it fails**

```bash
corepack pnpm exec nx test showcase --testFile=apps/showcase/src/app/pages/accessibility/accessibility-page.component.spec.ts
```

Expected: FAIL — `covers every component route exactly` reports `quantity-input` in the route slugs but not in `CONTRAST_VERIFIED`.

- [ ] **Step 3: Add the coverage entry and the route**

In `apps/showcase/src/app/pages/accessibility/a11y-coverage.ts`, after line 31:

```ts
  { slug: 'number-input', label: 'Number Input' },
  { slug: 'quantity-input', label: 'Quantity Input' },
```

In `apps/showcase/src/app/app.routes.ts`, after the `number-input` route (line 111):

```ts
      {
        path: 'quantity-input',
        title: 'Quantity Input',
        loadComponent: () =>
          import('./pages/quantity-input/quantity-input-page.component'),
      },
```

- [ ] **Step 4: Create the page**

Create `apps/showcase/src/app/pages/quantity-input/quantity-input-page.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  RhombusCodeBlockComponent,
  RhombusQuantityInputComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

interface CartLine {
  readonly name: string;
  readonly qty: WritableSignal<number | null>;
}

@Component({
  selector: 'app-quantity-input-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    RhombusCodeBlockComponent,
    RhombusQuantityInputComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Quantity Input"
      [hasUsage]="true"
      apiKey="RhombusQuantityInputComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A quantity input is a compact count — a label, a round − button, the
          number, and a round + button in one row. RhombusKit's
          <code>&lt;rhombus-quantity-input&gt;</code> has no form-field chrome at
          all: the number is a borderless native
          <code>&lt;input type="number"&gt;</code> (an accessible spinbutton out
          of the box), the buttons are round outlined circles sized from the
          density scale, and every colour routes through the token contract. It
          shares its stepping, clamping and keyboard behaviour with
          <a routerLink="/components/number-input">Number Input</a>.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-quantity-input
              label="Quantity"
              [min]="0"
              [max]="10"
              [(value)]="qty"
            />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              For a <strong>count in a row, card, list or toolbar</strong> — cart
              quantity, seats, sets and reps — where a full form field would be
              too heavy.
            </li>
            <li>
              When the value is a <strong>small bounded integer</strong> that is
              mostly stepped, occasionally typed.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For <strong>labelled numeric entry inside a form</strong> — with a
              hint, an error message, a currency prefix or a fill/outline
              appearance — use a
              <a routerLink="/components/number-input">Number Input</a>.
            </li>
            <li>
              For choosing a value along a <strong>visible range</strong> where
              the exact number is secondary, use a
              <a routerLink="/components/slider">Slider</a>.
            </li>
            <li>
              For values wider than four digits: the number box is fixed at three
              rem; use a <a routerLink="/components/number-input">Number Input</a>.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/number-input">Number Input</a> — the same spinbox inside a Material form field.</li>
            <li><a routerLink="/components/slider">Slider</a> — pick a value along a draggable range.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Bind <code>[(value)]</code> or a reactive
          <code>FormControl&lt;number | null&gt;</code> via <code>[control]</code>.
          <code>label</code> is required — it is the visible text before the −
          button and the accessible name of both the input and the group. Set
          <code>min</code>, <code>max</code>, and <code>step</code>; the value
          clamps on blur and on every step.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li><code>label</code> (required) — rendered inline <em>before</em> the − button as a real <code>&lt;label for&gt;</code>; also names the <code>role="group"</code> host.</li>
            <li><code>min</code> / <code>max</code> — the clamp range (reflected as the native <code>min</code>/<code>max</code>, so the spinbutton announces them); <code>step</code> for the ± buttons and arrow keys; <code>largeStep</code> for <kbd>PageUp</kbd>/<kbd>PageDown</kbd> (defaults to <code>step × 10</code>).</li>
            <li><code>[(value)]</code> / <code>[control]</code> — the numeric value (<code>number | null</code>); <code>(valueChange)</code> emits on every change in lightweight mode.</li>
            <li><code>incrementLabel</code> / <code>decrementLabel</code> — the accessible names of the + and − buttons.</li>
            <li>No projected slots: there is no hint, error, prefix or <code>appearance</code> — that is <a routerLink="/components/number-input">Number Input</a>'s job.</li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <ul>
            <li><code>--text-primary</code> / <code>--text-secondary</code> — number and glyphs / the label.</li>
            <li><code>--text-disabled</code> — glyphs and number when disabled (colour only; no opacity is applied).</li>
            <li><code>--border-strong</code> — the button ring at rest; <code>--border</code> when disabled.</li>
            <li><code>--surface-2</code> / <code>--surface-3</code> — button hover / active; <code>--surface-1</code> — the number's hover wash.</li>
            <li><code>--control-height-md</code> — the diameter of the circles and the height of the number box (40px; 36px compact, 48px comfortable).</li>
            <li><code>--focus-border</code> / <code>--focus-ring</code> — keyboard focus ring and halo.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The number is a native <code>&lt;input type="number"&gt;</code>, which
            is an implicit ARIA <code>spinbutton</code> and derives
            <code>aria-valuemin</code>, <code>aria-valuemax</code>, and
            <code>aria-valuenow</code> from the reflected <code>min</code>,
            <code>max</code>, and value — no manual ARIA is added. The
            <code>label</code> is a real <code>&lt;label&gt;</code>, and the host
            is a <code>group</code> named by it, so the − and + buttons are
            announced with context. The input is the single tab stop: arrow keys
            step by <code>step</code>, <kbd>Page</kbd> keys by
            <code>largeStep</code>, and <kbd>Home</kbd>/<kbd>End</kbd> jump to
            min/max. The round buttons are pointer and touch helpers
            (<code>tabindex="-1"</code> with <code>aria-label</code>s); after every
            click focus returns to the input, so the keyboard set stays live and
            a screen reader hears the new value. Buttons are 40 × 40 px at the
            default density (36 px compact), above the 24 px WCAG 2.2 target
            floor. The ring uses <code>--border-strong</code>; the high-contrast
            glyph is what identifies the control.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Basic</h2>
          <div class="qi-row">
            <rhombus-quantity-input
              label="Quantity"
              [min]="0"
              [max]="10"
              [(value)]="qty"
              (valueChange)="lastValue.set($event)"
            />
          </div>
          <p class="qi-output">Value: <strong>{{ lastValue() ?? qty() ?? '(empty)' }}</strong></p>
        </section>

        <section class="showcase-section">
          <h2>Step &amp; large step</h2>
          <p class="showcase-section__lead">
            Buttons and arrow keys step by <code>5</code>;
            <kbd>PageUp</kbd>/<kbd>PageDown</kbd> by <code>25</code>.
          </p>
          <div class="qi-row">
            <rhombus-quantity-input
              label="Reps"
              [min]="0"
              [max]="100"
              [step]="5"
              [largeStep]="25"
              [(value)]="reps"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Reactive forms</h2>
          <p class="showcase-section__lead">
            Bind a <code>FormControl</code> via <code>[control]</code>; disabling
            the control disables the whole row.
          </p>
          <div class="qi-form">
            <rhombus-quantity-input
              label="Seats"
              [min]="1"
              [max]="8"
              [control]="seats"
            />
            <button mat-flat-button type="button" (click)="toggleSeats()">
              {{ seats.disabled ? 'Enable' : 'Disable' }}
            </button>
            <p class="qi-output">Control value: <strong>{{ seats.value ?? '(empty)' }}</strong></p>
          </div>
        </section>

        <section class="showcase-section">
          <h2>At a bound</h2>
          <p class="showcase-section__lead">
            The buttons stay enabled at <code>min</code> / <code>max</code>; the
            value simply clamps. Typing past a bound clamps on blur.
          </p>
          <div class="qi-row">
            <rhombus-quantity-input
              label="Tickets"
              [min]="1"
              [max]="4"
              [(value)]="tickets"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>Disabled</h2>
          <div class="qi-row">
            <rhombus-quantity-input
              label="Locked"
              [min]="0"
              [max]="10"
              [value]="3"
              [disabled]="true"
            />
          </div>
        </section>

        <section class="showcase-section">
          <h2>In a list</h2>
          <p class="showcase-section__lead">
            Each row carries its own label, so every group is announced by the
            item it counts.
          </p>
          <ul class="qi-cart">
            @for (line of cart; track line.name) {
              <li class="qi-cart__line">
                <rhombus-quantity-input
                  [label]="line.name"
                  [min]="0"
                  [max]="20"
                  [(value)]="line.qty"
                />
              </li>
            }
          </ul>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .qi-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 2rem;
      align-items: center;
    }
    .qi-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 320px;
      align-items: flex-start;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .qi-output {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      margin-top: 0.75rem;
    }
    .qi-cart {
      list-style: none;
      margin: 0;
      padding: 0;
      max-width: 480px;
    }
    /* The component's own inline label IS the product name, so the row needs no
       second label of its own. (Page styles are encapsulated: they can reach the
       child's host element, not its inner label, which is why the row does not
       try to restyle it.) */
    .qi-cart__line {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
    }
  `,
})
export default class QuantityInputPageComponent {
  protected readonly usage = `import { RhombusQuantityInputComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-cart-line',
  imports: [RhombusQuantityInputComponent],
  template: \`
    <rhombus-quantity-input
      label="Quantity"
      [min]="0"
      [max]="10"
      [(value)]="qty"
    />
  \`,
})
export class CartLineComponent {
  qty = signal<number | null>(1);
}`;

  protected readonly qty = signal<number | null>(1);
  protected readonly reps = signal<number | null>(10);
  protected readonly tickets = signal<number | null>(4);
  protected readonly lastValue = signal<number | null>(null);

  protected readonly seats = new FormControl<number | null>(2);

  protected readonly cart: readonly CartLine[] = [
    { name: 'Resistance band', qty: signal<number | null>(2) },
    { name: 'Chalk block', qty: signal<number | null>(1) },
    { name: 'Lifting straps', qty: signal<number | null>(1) },
  ];

  protected toggleSeats(): void {
    if (this.seats.disabled) {
      this.seats.enable();
    } else {
      this.seats.disable();
    }
  }
}
```

Note the `styles:` string uses `/* */` comments only (consistent with every other showcase page).

- [ ] **Step 5: Update the number-input page (rename + cross-links)**

In `apps/showcase/src/app/pages/number-input/number-input-page.component.ts`:

(a) Line 47 (the Overview hero) and line 151 (the Basic example): `label="Quantity"` → `label="Seats"`.

(b) In *When to use* (line 60) change `quantities, ages, counts, prices.` → `seats, ages, prices, years.`

(c) Add a third bullet to *When not to use* after the Slider bullet (line 76):

```html
            <li>
              For a <strong>compact count without form-field chrome</strong> — a
              cart row, seats, sets and reps — use a
              <a routerLink="/components/quantity-input">Quantity Input</a>.
            </li>
```

(d) Add to *Related components* (after line 90):

```html
            <li><a routerLink="/components/quantity-input">Quantity Input</a> — the same spinbox without the form-field shell.</li>
```

(e) Replace the usage snippet (lines 278–294) so the consumer is not called "Quantity":

```ts
  protected readonly usage = `import { RhombusNumberInputComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-seats',
  imports: [RhombusNumberInputComponent],
  template: \`
    <rhombus-number-input
      label="Seats"
      [min]="0"
      [max]="10"
      [(value)]="seats"
    />
  \`,
})
export class SeatsComponent {
  seats = signal<number | null>(1);
}`;
```

- [ ] **Step 6: Run the showcase unit tests**

```bash
corepack pnpm exec nx test showcase
```

Expected: PASS — the coverage list equals the route set again; everything else unchanged.

- [ ] **Step 7: Look at it**

```bash
corepack pnpm exec nx serve showcase
```

Open `http://localhost:4200/components/quantity-input`, check the Overview, Usage and Examples tabs in light and dark (the API tab reads `api-metadata.ts` and only fills in after Task 5 regenerates it), then **stop the server before Task 5** (a core build while it runs wedges `dist`). Confirm: − and + are circles of equal size beside the number, the label sits before −, clicking + leaves the number focused (ring visible on the number), the *In a list* rows announce as "Resistance band, group" etc. in the accessibility tree.

- [ ] **Step 8: Commit**

```bash
git add apps/showcase/src/app/pages/quantity-input apps/showcase/src/app/shared/navigation.ts apps/showcase/src/app/app.routes.ts apps/showcase/src/app/pages/accessibility/a11y-coverage.ts apps/showcase/src/app/pages/number-input/number-input-page.component.ts
git commit -m "feat(showcase): quantity input page, nav, coverage; number-input cross-links (#151)" -m "Number-input's canonical examples now say Seats so the word Quantity names one component.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Build, gates, regenerated artifacts

**Files:**
- Modify (generated — never by hand): `etc/core.api.md`, `apps/showcase/src/generated/api-metadata.ts`, `apps/showcase/public/llms.txt`, `apps/showcase/public/llms-full.txt`, `packages/mcp/src/generated/mcp-data.ts`

**Interfaces:** none — this task proves Tasks 1–4 against every CI gate and commits their generated fallout.

- [ ] **Step 1: Build everything**

```bash
corepack pnpm exec nx run-many --target=build --all
```

Expected: all projects build. (The showcase prerender includes `/components/quantity-input`.)

- [ ] **Step 2: Run the static gates**

```bash
node tools/verify-tokens.mjs
corepack pnpm run test:tokens
node tools/verify-component-styles.mjs
node tools/verify-setup-docs.mjs
```

Expected: each exits 0. `verify-tokens` must pass **without** `--update-snapshot` (no new CONTRACT names).

- [ ] **Step 2b: Type-check the new specs** — the only gate that does; `nx test` does not type-check spec files (isolatedModules), so a bad type in `spinbox.spec.ts` or the component spec only surfaces here (CI `typecheck` job, `ci.yml:54`):

```bash
corepack pnpm exec tsc --noEmit -p packages/core/tsconfig.spec.json
```

Expected: exit 0, no output.

- [ ] **Step 3: Regenerate the public-surface artifacts, in this order**

```bash
node tools/api-snapshot.mjs --update
node tools/generate-llms.mjs
node tools/generate-mcp-data.mjs
git status --short
```

Expected `git status` lists: `etc/core.api.md`, `apps/showcase/src/generated/api-metadata.ts`, `apps/showcase/public/llms.txt`, `apps/showcase/public/llms-full.txt`, `packages/mcp/src/generated/mcp-data.ts` — plus, possibly, `etc/tokens.api.md` / `etc/theme-builder.api.md` as CRLF→LF-only rewrites (Step 4 discards those). If the api-snapshot union order differs from `main`'s on Windows (a known non-determinism), keep `main`'s order for untouched entries — only the new `RhombusQuantityInputComponent` block and number-input's docblock text may change.

- [ ] **Step 4: Verify the checks are green and the diffs are what the spec says** — this is CI's `build` job sequence (`ci.yml:123-143`), in CI's order; run the api-snapshot check **immediately after** Step 3's `--update` (byte comparison; see Global Constraints on CRLF)

```bash
node tools/api-snapshot.mjs
node tools/generate-llms.mjs --check
corepack pnpm run test:design-tokens
corepack pnpm exec tsx tools/generate-design-tokens.mjs --check
corepack pnpm run test:mcp-data
node tools/generate-mcp-data.mjs --check
git diff --ignore-cr-at-eol -- etc/core.api.md | grep '^[+-]' | grep -v '^[+-][+-]' | head -40
git checkout -- etc/tokens.api.md etc/theme-builder.api.md
```

Expected: every check exits 0. The `core.api.md` diff contains **only additions** for `RhombusQuantityInputComponent` (its inputs `label`, `min`, `max`, `step`, `largeStep`, `value`, `control`, `disabled`, `incrementLabel`, `decrementLabel`, output `valueChange`) — **no line touching `RhombusNumberInputComponent`**. The final `git checkout` discards CRLF→LF-only rewrites of the two untouched reports (they show as modified with an empty `--ignore-cr-at-eol` diff).

- [ ] **Step 5: Run the remaining PR gates exactly as CI does** (`ci.yml:37, 71, 89, 103, 163`)

```bash
corepack pnpm exec nx run-many --target=lint --all
corepack pnpm run test:schematics
corepack pnpm run test:mcp
corepack pnpm exec nx run-many --target=test --all --configuration=ci
corepack pnpm run test:stackblitz
```

Expected: all green. `--configuration=ci` matters: it turns on coverage and core's `coverageThreshold` (`packages/core/jest.config.ts:24-31`), which a plain `nx test` never evaluates. (`node tools/smoke-test-pack.mjs` is a publish-time gate, not a PR gate; optional here — no new `@angular/*` peer was introduced.)

- [ ] **Step 6: Commit the generated artifacts**

```bash
git add etc/core.api.md apps/showcase/src/generated/api-metadata.ts apps/showcase/public/llms.txt apps/showcase/public/llms-full.txt packages/mcp/src/generated/mcp-data.ts
git commit -m "chore(api): snapshot, llms and mcp data for rhombus-quantity-input (#151)" -m "api-metadata.ts also picks up number-input's docblock example rename (Quantity → Seats);
etc/core.api.md has no number-input change.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Playwright rows — geometry, density, contrast

**Files:**
- Modify: `apps/showcase-e2e/tests/geometry.spec.ts` (add a route block to `CASES`)
- Modify: `apps/showcase-e2e/tests/density.spec.ts` (one `MOVED` row, one `CONTROLS` row)
- Create: `apps/showcase-e2e/tests/quantity-input-contrast.spec.ts`

**Interfaces:**
- Consumes: route `/components/quantity-input?tab=examples` and the BEM classes from Task 3; `alphaComposite`, `contrastRatio` from `packages/theme-builder/src/color-math` (same import as `button-contrast.spec.ts`); the `STORAGE_KEY` / theme-preference convention from `button-contrast.spec.ts:27-32`.

There is no RED step in this task: the rows are written against the finished component and must pass on their first run. If one is red, the component or the row is wrong — never "fix" a row by changing its expected value to whatever the page happens to render.

- [ ] **Step 1: Add the default-geometry rows**

In `apps/showcase-e2e/tests/geometry.spec.ts`, append a block to the `CASES` array (before its closing `];`):

```ts
  {
    route: '/components/quantity-input?tab=examples',
    rows: [
      // The host class replaces an inert `:host` — a regression to a `:host`
      // rule collapses the row with nothing else noticing. `display` itself is
      // NOT assertable: the host is a flex item of the page's `.qi-row` and
      // blockifies to `flex` at computed-value time. `align-items` and
      // `column-gap` are the rule's other declarations and both read `normal`
      // if the rule is dead.
      { sel: '.rhombus-quantity-input', prop: 'align-items', expect: 'center', why: 'scss host row' },
      { sel: '.rhombus-quantity-input', prop: 'column-gap', expect: '8px', why: 'space.space(2)' },
      // The circles take --control-height-md on BOTH axes (M3's 40px icon-button
      // box); the fallback literal equals the default, per the density promise.
      { sel: '.rhombus-quantity-input__btn--inc', prop: 'width', expect: '40px', why: 'var(--control-height-md) default 2.5rem' },
      { sel: '.rhombus-quantity-input__btn--inc', prop: 'height', expect: '40px', why: 'var(--control-height-md) default 2.5rem' },
      { sel: '.rhombus-quantity-input__btn--inc', prop: 'border-top-left-radius', expect: '9999px', why: 'var(--radius-full)' },
      { sel: '.rhombus-quantity-input__field', prop: 'height', expect: '40px', why: 'var(--control-height-md) default 2.5rem' },
      { sel: '.rhombus-quantity-input__field', prop: 'width', expect: '48px', why: 'scss 3rem — 3–4 tabular digits' },
    ],
  },
```

- [ ] **Step 2: Add the density rows**

In `apps/showcase-e2e/tests/density.spec.ts`, append to the `MOVED` array (before its closing `];`):

```ts
    {
      route: '/components/quantity-input?tab=examples',
      sel: '.rhombus-quantity-input__btn--inc',
      prop: 'width',
      compact: '36px',
      why: 'quantity-input round ± on --control-height-md (=40 at default)',
    },
```

and to the `CONTROLS` array (before its closing `];`):

```ts
    { route: '/components/quantity-input?tab=examples', sel: '.rhombus-quantity-input__btn--inc', what: 'quantity-input round ± (36px at compact)' },
```

- [ ] **Step 3: Write the contrast spec**

Create `apps/showcase-e2e/tests/quantity-input-contrast.spec.ts`:

```ts
import { test, expect, type Page } from '@playwright/test';
import {
  alphaComposite,
  contrastRatio,
} from '../../../packages/theme-builder/src/color-math';

/**
 * Rendered contrast of the quantity input's round ± buttons, in BOTH themes.
 *
 * Why a computed-style check and not axe: the page-level `color-contrast` scan
 * (contrast.spec.ts) evaluates TEXT nodes. The ± glyphs are aria-hidden SVG and
 * the ring is a border, so nothing in that sweep measures them. This spec reads
 * the pixels' inputs instead: the button's computed `color` (the glyph, via
 * currentColor) and `border-top-color` (the ring), each composited over the
 * first opaque ancestor.
 *
 * Floors (spec §4): glyph 4.5:1 (AA text — it is what identifies the control,
 * so it carries WCAG 1.4.11); ring 2.25:1 — a documented DESIGN floor, not a
 * conformance one. --border-strong measures 2.34–2.56:1 in light and
 * 3.07–4.24:1 in dark; a stronger ring is a token-value change, not this file's.
 */

// Public, semver-covered preference key (see the tokens/theme-engine contract).
const STORAGE_KEY = 'rhombuskit:theme-preference';

const THEMES = [
  { name: 'light', preference: 'rhombus-light' },
  { name: 'dark', preference: 'rhombus-dark' },
] as const;

const GLYPH_FLOOR = 4.5;
const RING_FLOOR = 2.25;

interface Sample {
  index: number;
  glyph: string;
  ring: string;
  background: string;
}

function sample(page: Page): Promise<Sample[]> {
  return page.evaluate(() => {
    const isTransparent = (bg: string): boolean =>
      bg === 'transparent' || /^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/.test(bg);
    return Array.from(
      document.querySelectorAll<HTMLElement>('.rhombus-quantity-input__btn:not(:disabled)')
    ).map((btn, index) => {
      let node: HTMLElement | null = btn;
      let background = 'rgba(0, 0, 0, 0)';
      while (node) {
        background = getComputedStyle(node).backgroundColor;
        if (!isTransparent(background)) break;
        node = node.parentElement;
      }
      const cs = getComputedStyle(btn);
      return { index, glyph: cs.color, ring: cs.borderTopColor, background };
    });
  });
}

function under(samples: Sample[], pick: (s: Sample) => string, floor: number, what: string): string[] {
  return samples
    .map((s) => {
      const fg = alphaComposite(pick(s), s.background);
      return { s, ratio: contrastRatio(fg, s.background) };
    })
    .filter(({ ratio }) => ratio === null || ratio < floor)
    .map(
      ({ s, ratio }) =>
        `  ${what} #${s.index}: ${ratio?.toFixed(2) ?? 'unmeasurable'}:1 (${pick(s)} on ${s.background})`
    );
}

for (const theme of THEMES) {
  test.describe(`quantity-input ± contrast — ${theme.name} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => window.localStorage.setItem(key, value),
        [STORAGE_KEY, theme.preference] as [string, string]
      );
    });

    test('every enabled ± button clears the glyph and ring floors', async ({ page }) => {
      await page.goto('/components/quantity-input?tab=examples', { waitUntil: 'networkidle' });
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme.preference);
      await page.locator('.rhombus-quantity-input__btn').first().waitFor({ state: 'visible' });

      const samples = await sample(page);
      // Exactly the enabled controls on the Examples tab — Basic, Step & large
      // step, Reactive forms (enabled at load), At a bound, and the 3 cart lines
      // = 7 controls × 2 buttons. The Disabled example is excluded by the
      // selector. Keep this in step with the page: a silent drop here would mean
      // a control stopped being measured.
      expect(samples).toHaveLength(14);

      const glyphFails = under(samples, (s) => s.glyph, GLYPH_FLOOR, 'glyph');
      const ringFails = under(samples, (s) => s.ring, RING_FLOOR, 'ring');
      expect(
        [...glyphFails, ...ringFails],
        `quantity-input ± under floor (${theme.name}):\n${[...glyphFails, ...ringFails].join('\n')}`
      ).toEqual([]);
    });
  });
}
```

- [ ] **Step 3b: Amend the spec's test list to match** — spec §7.1 item 5 names a `display = inline-flex` row that cannot pass (see Step 1). In `docs/superpowers/specs/2026-09-16-quantity-input-design.md`, in §7.1 item 5, replace `` `.rhombus-quantity-input` `display` = `inline-flex`, `column-gap` = `8px` `` with `` `.rhombus-quantity-input` `align-items` = `center` (its `display` blockifies inside the page's flex row, so it is not assertable), `column-gap` = `8px` ``. Include the spec file in this task's commit.

- [ ] **Step 4: Run the three specs (the web server builds and serves the showcase itself)**

```bash
corepack pnpm exec playwright test --config=apps/showcase-e2e/playwright.config.ts apps/showcase-e2e/tests/geometry.spec.ts apps/showcase-e2e/tests/density.spec.ts apps/showcase-e2e/tests/quantity-input-contrast.spec.ts apps/showcase-e2e/tests/contrast.spec.ts
```

Expected: all pass, including the pre-existing `contrast.spec.ts` sweep (which now scans `/components/quantity-input` on three tabs in both themes because Task 4 added it to `CONTRAST_VERIFIED`). If the geometry `width` row for the field reads a value other than `48px`, the root font size is not 16px in the harness — fix the harness assumption, not the row.

- [ ] **Step 5: Run the whole e2e project once**

```bash
corepack pnpm exec nx e2e showcase-e2e
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add apps/showcase-e2e/tests/geometry.spec.ts apps/showcase-e2e/tests/density.spec.ts apps/showcase-e2e/tests/quantity-input-contrast.spec.ts docs/superpowers/specs/2026-09-16-quantity-input-design.md
git commit -m "test(e2e): geometry, density and ± contrast rows for rhombus-quantity-input (#151)" -m "Pins the host row (align-items/column-gap — display blockifies inside the page's flex row),
the 40px circles (36px at compact, ≥24px floor) and the 3rem number box, and measures glyph
(≥4.5:1) and ring (≥2.25:1 documented floor) in both themes — the axe sweep only evaluates
text nodes. Spec §7.1 item 5 amended to match.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Pull request

**Files:** none.

- [ ] **Step 1: Capture the visual record** (no screenshot baselines exist in `apps/showcase-e2e`, so PNGs in the PR body are the visual record)

Serve the showcase, open `/components/quantity-input?tab=examples`, and screenshot the Examples tab in **light and dark** at **default, compact and comfortable** density (`document.documentElement.setAttribute('data-density', 'compact')` in the console flips it). Six PNGs. Stop the server afterwards.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin feat/quantity-input --force-with-lease
gh pr create --base main --head feat/quantity-input --title "feat(core): rhombus-quantity-input — round − / + count control (#151)" --body-file - <<'EOF'
## What & why

Adds **`<rhombus-quantity-input>`** — `label · (−) n (+)`: a visible inline label, a round outlined − button, a borderless editable number, and a round outlined + button in one row — for counts in rows, cards, lists and toolbars. `<rhombus-number-input>` is unchanged and stays the form-field version; both now run on one internal `createSpinbox()` core.

Design: `docs/superpowers/specs/2026-09-16-quantity-input-design.md` (#150). Proposal: #151.

Closes #151

### Reviewer notes
- **Number-input refactor is behaviour-preserving**: its spec is untouched and green; `etc/core.api.md` has no number-input change. `api-metadata.ts` shows number-input's docblock example renamed Quantity → Seats (so the word names one component) — docblock text, not API drift.
- **A11y model**: native input = single tab stop / implicit spinbutton, no manual ARIA on it (D7); host `role="group"` named by the label; ± are `tabindex=-1` pointer helpers and **focus returns to the input after every click** (number-input only gets that from Material's container-click handler today — a bare layout has to do it itself).
- **Tokens**: zero new; circles sized from `--control-height-md` (40/36/48). The `--border-strong` ring measures 2.34–2.56:1 light / 3.07–4.24:1 dark; documented 2.25:1 design floor (the 17:1 glyph carries 1.4.11), gated by a computed-style e2e row. A stronger ring is a token-value change reserved for the Spotter R2 colour wave.
- **Icons**: inline SVG, identical paths to number-input; no registry seeding (D13 stands) — the R1 font-less-icons PR gains one more `<svg>` site.
- Rendered-geometry: new component only; nothing existing moves.

### Visual record
<!-- six PNGs: light/dark × default/compact/comfortable -->

## Type of change

- [ ] Fast lane
- [x] Gated — new component (proposal #151)

## Surface-contract self-check

- [ ] This change does **not** alter any `etc/*.api.md` snapshot or the token CONTRACT
- [x] …or, if it does: I ran the regeneration and committed the updated snapshot (`etc/core.api.md` +1 block; CONTRACT untouched)

## Checklist

- [x] `pnpm exec nx run-many --target=lint --all` passes
- [x] `pnpm exec nx run-many --target=test --all` passes
- [x] `pnpm exec nx run-many --target=build --all` passes (`verify-tokens` / `verify-component-styles` / `api-snapshot` green)
- [ ] Touched a type-fixture spec? — n/a
- [x] Accessibility considered (keyboard, ARIA, contrast) where relevant
- [x] Commits follow Conventional Commits

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```

- [ ] **Step 3: Attach the six PNGs** to the PR body's *Visual record* section (drag into the GitHub editor), then watch CI. The Cloudflare Pages preview check gives a live URL for `/components/quantity-input`.

---

## Self-review (done while writing)

**Spec coverage** — §1 boundary/table → Task 3 docblock + barrel comments + Task 4 pages · §2 API → Task 3 inputs/outputs (no `size`, no new type) · §3 anatomy/ids/host bindings → Task 3 template · §4 a11y (group, `<label for>`, tabindex=-1, focus restore + mousedown, ring, target, contrast floor, disabled without opacity, RTL wording) → Task 3 spec/template/SCSS + Task 6 rows · §5 SCSS → Task 3 Step 4 verbatim · §6 helper owning lines 166–291 + number-input refactor under its unchanged spec → Tasks 1–2 · §7.1 tests 1–7 → Tasks 1, 2, 3, 4, 6 · §7.2 showcase/registries/rename → Task 4 · §7.3 gates/regen order → Task 5 · §8 PR/issue/sequencing → Task 7 (issue #151 already filed).

**Type consistency** — `SpinboxConfig`/`Spinbox`/`createSpinbox` names and shapes are identical in Task 1 (definition), Task 2 and Task 3 (call sites); BEM classes `__btn--inc/--dec/__field/__label` match between Task 3 template, SCSS, spec, and Task 6 selectors; route `/components/quantity-input` matches Task 4 route/nav/coverage and Task 6.

**Placeholders** — none; every code step is complete.

**Adversarial pass (three read-only skeptics, 2026-09-17)** — every code block verified against the installed Angular 21.2 / Material 21.2 / Jest 30 / @nx/jest 22.7 / jsdom 26 / Playwright 1.60. Folded in: Task 2's import prose contradicted its code (`computed` stays); `api-snapshot --update` needs all four dists built; the geometry `display` row could never pass (the host blockifies inside the page's flex row → `align-items`); the spinbox swap test's assertion order was vacuous; the component spec lacked keydown/blur wiring and a control-swap case; Task 5's gate list was not CI's (added `tsc --noEmit -p packages/core/tsconfig.spec.json`, `--configuration=ci`, design-tokens / mcp-data / schematics / mcp / stackblitz checks); the plan file itself is now committed in Task 0; `--text-disabled` added to the Theming list; the api-snapshot CRLF false-drift gotcha recorded.
