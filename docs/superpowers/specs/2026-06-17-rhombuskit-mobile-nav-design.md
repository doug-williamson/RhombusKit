# Mobile-first navigation for RhombusKit — design

- **Date:** 2026-06-17
- **Status:** Approved (brainstorm); pending implementation plan
- **Branch:** `feat/mobile-first-nav`

## Context

A new Angular PWA (phase one of an eventual iOS/Android native app) for a hypertrophy
training tracker needs two UI patterns that RhombusKit does not yet provide. They are
modelled on RP Hypertrophy:

1. A **Material-style bottom navigation bar** as the app's primary navigation. The app is
   mobile-specific even on laptop/desktop, so it leans on a bottom bar rather than the
   hamburger/sidenav app shell RhombusKit ships today.
2. A **toolbar calendar icon that opens a floating panel** showing every day of a
   mesocycle (weeks as columns, days as rows, cells colour-coded by status).

RhombusKit today (Angular 21, Nx + pnpm monorepo; packages `tokens` → `theme-engine` →
`material-preset` → `core`) has:

- `RhombusAppShellComponent`: a structure-only shell wrapping `mat-sidenav-container` +
  `mat-toolbar` with six content-projection slots and breakpoint-driven sidenav modes
  (overlay drawer ≤767px, icon rail, full sidenav ≥1024px). **No bottom navigation exists.**
- An overlay stack of `RhombusMenu` (config-array `MenuItem[]`, label+icon items only),
  `RhombusOverflowMenu`, `RhombusThemeMenu`, `RhombusTooltipDirective`, and
  `RhombusDialogService`. **No primitive can hang arbitrary projected content off a
  trigger** — `RhombusMenu` is restricted to menu items and exposes no `(opened)`/`(closed)`.

## Decisions

Resolved during brainstorming:

| Question | Decision |
|---|---|
| Where does the mesocycle day-grid live? | **The consuming app**, not RhombusKit. The kit stays domain-agnostic and ships only generic primitives. |
| Desktop presentation | **Centered phone frame** — mobile-first even on wide screens; cleanest runway to a native port. |
| Bottom-nav ↔ shell relationship | **Extend `RhombusAppShellComponent`** with a mobile/app-locked mode *and* ship `RhombusBottomNav` standalone. |
| Bottom-nav active indicator | **Color-only by default** (matches RP); Material-3 pill available via an `indicator` input. |
| Popover attachment API | **Trigger directive** `[rhombusPopoverTriggerFor]` + a `<rhombus-popover>` panel (mirrors `matMenuTriggerFor`). |

## Goals

- Ship two reusable, domain-agnostic `@rhombuskit/core` primitives: `RhombusBottomNav` and
  `RhombusPopover`.
- Add an additive, non-breaking bottom-nav mode to `RhombusAppShellComponent`.
- Reuse existing contract tokens and existing peer dependencies — **no new contract
  tokens, no new peer deps** — so `verify-tokens`, `contract.snapshot.json`, and
  `smoke-test-pack` are unaffected.
- Follow the established per-component house recipe (standalone, `OnPush`,
  `ViewEncapsulation.None`, signal inputs, jest + jest-axe + type-fixture specs, public-API
  export, `api-metadata` regen, and a showcase doc page).

## Non-goals (YAGNI)

- No fitness-specific kit component (`RhombusMesocycleGrid` or similar).
- No refactor of the existing `RhombusMenu` onto `RhombusPopover`.
- No new design tokens; no new motion/spacing/safe-area contract tokens (safe-area handled
  via CSS `env()`).
- No new `@angular/*` peer dependencies (router and CDK are already declared).

## Architecture overview

```
screenshot 1 (bottom tab bar) ──> RhombusBottomNav (core)  + RhombusAppShell bottom mode (core)
screenshot 2 (toolbar calendar) ─> RhombusPopover (core)   + app-owned mesocycle grid (PWA)
```

The app composes its mesocycle grid as projected content inside a `RhombusPopover` whose
trigger is a toolbar icon button; RhombusKit never learns the training domain.

## Component 1 — `RhombusBottomNav`

A Material-style bottom navigation bar: a horizontal row of 3–5 icon+label destinations,
one active, router-driven.

### Public API

```ts
export interface RhombusBottomNavItem {
  id: string;                       // stable key; used for controlled active state
  label: string;                    // visible text AND the accessible name
  icon: string;                     // RhombusIcon glyph name (falls back to mat-icon)
  routerLink?: string | unknown[];  // omit for non-router (controlled) usage
  badge?: number | 'dot';           // optional count or dot; reuses RhombusBadge
  disabled?: boolean;
}

// <rhombus-bottom-nav>
items        = input.required<RhombusBottomNavItem[]>();
activeId     = input<string>();                       // optional controlled mode
indicator    = input<'color' | 'pill'>('color');      // active-indicator treatment
activeChange = output<string>();                      // emits the selected item id
```

### Behaviour

- **Active detection** is router-driven by default: each item renders an `<a routerLink>`
  with `routerLinkActive` (mirrors `RhombusBreadcrumbs`). When an item omits `routerLink`,
  selection is controlled via `activeId` / `activeChange`.
- `indicator='color'` (default) recolours the active item to `--nav-active-text`;
  `indicator='pill'` additionally wraps the active icon in a pill filled with
  `--nav-active-bg` (Material-3 style).
- Optional per-item `badge` reuses the existing `RhombusBadge` directive.
- Standalone, `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`, signal inputs.

### Layout & tokens

- Bar background `--surface-1`, top divider `--border`, active `--nav-active-bg` /
  `--nav-active-text`, inactive `--text-secondary`, focus `--focus-ring`.
- Reserves `env(safe-area-inset-bottom)` so the iOS home indicator never overlaps.
- 44px minimum touch target per item.
- **No new contract tokens.**

### Accessibility

- `<nav aria-label="Primary">` wrapping a list of `<a>` (router) or `<button>` (controlled).
- `aria-current="page"` on the active router link.
- Icons `aria-hidden`; the label is the accessible name.
- Visible focus ring; full keyboard tab order.

## Component 2 — `RhombusPopover`

A generic overlay that attaches arbitrary projected content to a trigger element. Fills the
gap left by `RhombusMenu` (which only renders menu items).

### Public API

```ts
// Trigger directive — on any element:
@Directive({ selector: '[rhombusPopoverTriggerFor]' })
// sets aria-haspopup="dialog" + aria-expanded; toggles the CDK overlay; restores focus
rhombusPopoverTriggerFor = input.required<RhombusPopoverComponent>();
disabled                 = input<boolean>(false);

// <rhombus-popover>
position   = input<'below-start' | 'below-end' | 'above-start' | 'above-end' | 'auto'>('below-start');
offset     = input<number>(8);
panelWidth = input<number | 'trigger' | 'auto'>('auto');  // 'trigger' matches trigger width
ariaLabel  = input<string>();
opened     = output<void>();
closed     = output<void>();
```

Closing from inside the panel: a `[rhombusPopoverClose]` directive on any element, and/or an
injected `RhombusPopoverRef` with a `close()` method (so a day-cell click can dismiss).

### Behaviour

- Built on **CDK Overlay** with a `ConnectedPositionStrategy` that flips when there is no
  room. Deliberately *not* built on `MatMenu`, which constrains content to menu items.
- Focus-trapped panel; closes on `Esc` and outside pointer-down; focus returns to the
  trigger on close.
- Emits `(opened)` / `(closed)` — the hooks `RhombusMenu` lacks.
- Standalone, `OnPush`, `ViewEncapsulation.None`, signal inputs.

### Theming & tokens

- Renders in the `cdk-overlay-container`; themed through the existing `material-preset`
  bridge: `--surface-0` / `--surface-1`, `--border`, `--radius-*`, elevation via
  `--shadow-md`.
- **No new contract tokens.**

### Accessibility

- Trigger: `aria-haspopup="dialog"` + `aria-expanded` reflecting open state.
- Panel: `role="dialog"` with the supplied `ariaLabel` (or `aria-labelledby`).

## Shell change — `RhombusAppShellComponent`

Additive and non-breaking. New, all-optional surface:

- `navMode = input<'sidenav' | 'bottom'>('sidenav')` — `'sidenav'` preserves today's
  behaviour exactly.
- `frame = input<'fill' | 'phone'>('fill')` — `'phone'` centers content at a phone-width
  column on wide screens.
- A presence-gated `[shellBottomNav]` projection slot (marker directive, matching the
  existing `[shellNavFooter]` / `[shellAuthSlot]` / `[shellAside]` pattern).
- In `navMode='bottom'`: suppress the hamburger and sidenav, render the projected bottom nav
  fixed to the bottom of the content column, and reserve `env(safe-area-inset-bottom)`.

Existing consumers that set none of these see no change.

## App layer (consuming PWA — out of kit scope)

- An `app-mesocycle-grid` component: weeks as columns (with RIR/deload labels), days as
  rows, cells styled `done` / `current` / `upcoming` via RhombusKit status tokens
  (`--status-*`) or app tokens; emits a day-selection event.
- A toolbar icon button wired with `[rhombusPopoverTriggerFor]` to a `<rhombus-popover>`
  that projects the grid.
- Bottom-nav items mapped to the app's feature routes (Workout, Mesos, Templates,
  Exercises, More).

## Per-component delivery checklist (house recipe)

For each of `RhombusBottomNav` and `RhombusPopover`:

- `packages/core/src/lib/<name>/` — `*.component.ts` (and `*.directive.ts`, `*.types.ts`
  as needed).
- SCSS partial in `packages/core/scss/_<name>.scss`, forwarded from
  `packages/core/scss/index.scss` (for any directive-global styles).
- Export from `packages/core/src/index.ts`; validate against `etc/core.api.md`.
- jest unit spec with a HostComponent fixture; ends with a `jest-axe` check via
  `packages/core/src/testing/axe.ts`.
- Type-fixture spec gated by `tsc --noEmit -p tsconfig.spec.json` for the input surface.
- Regenerate `apps/showcase/src/generated/api-metadata.ts` via `tools/api-snapshot.mjs`.
- Showcase page under `apps/showcase/src/app/pages/<name>/` using the shared
  `ComponentPageComponent` (Overview / Examples / API) + the standard Overview anatomy;
  add the route in `app.routes.ts` (title `<Page> · RhombusKit`) and a nav entry in
  `app.component.ts`.

For the shell change: extend the existing app-shell spec (reuse `FakeBreakpointObserver` /
`FakeRouter` helpers) to cover `navMode='bottom'` and `frame='phone'`; update the app-shell
showcase page to demo the bottom-nav mode.

## Packaging & release

- **No new `@angular/*` peer dependencies:** `@angular/router` (bottom-nav) and
  `@angular/cdk` (popover overlay) are already declared in `packages/core/package.json`,
  so `smoke-test-pack.mjs` stays green.
- **No contract-token changes:** `verify-tokens.mjs` and `contract.snapshot.json` are
  untouched.
- Purely additive public API → **minor** version bump via release-please.

## Build sequence

`RhombusPopover` and `RhombusBottomNav` are independent and can be built in parallel. The
shell mode depends on `RhombusBottomNav`; the app layer depends on all three.

1. `RhombusPopover` (+ trigger directive, `rhombusPopoverClose`, showcase page).
2. `RhombusBottomNav` (+ showcase page).
3. `RhombusAppShellComponent` bottom-nav mode (+ updated shell showcase).
4. App PWA: mesocycle grid + popover wiring + bottom-nav route wiring.

## Risks

- `RhombusPopover` is the only non-trivial piece: CDK Overlay positioning, focus trap,
  dismissal, and the close handle need careful spec coverage.
- The shell change touches a shipped, widely-used component — it must remain strictly
  additive; the default `navMode='sidenav'` / `frame='fill'` path must be byte-for-byte
  unchanged in tests.

## Open questions

None blocking. Deferred to implementation: exact `position` enum coverage for
`RhombusPopover`, and whether the shell's `frame='phone'` width is a fixed value or an input.
