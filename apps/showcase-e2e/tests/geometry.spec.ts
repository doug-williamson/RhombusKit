import { test, expect } from '@playwright/test';

/**
 * Default-geometry gate for the density epic
 * (`docs/superpowers/specs/2026-07-19-density-modes-design.md`).
 *
 * Density modes replace hard-coded geometry literals with CSS custom
 * properties. The load-bearing promise is that an app which never calls
 * `provideRhombusDensity()` renders **exactly** as it does today — every
 * substitution's default must equal the shipped value. The design review found
 * ~15 places where that silently failed, so the promise needs a machine check.
 *
 * This is that check, and it is deliberately dumb: a list of named selectors,
 * properties, and the literal value that ships today. No golden file, no
 * generated keys, no regenerator. The expected values are transcribed from §7
 * of the spec, which audited each one against source with a file:line citation.
 *
 * WHAT IT DOES NOT DO: catch a regression in something not on the list. That is
 * accepted — §7 *is* the enumeration of what density touches, so a change
 * outside it means someone went off-plan, which code review owns. An earlier
 * draft built a full DOM-walking golden baseline to close that gap; it was
 * dropped as disproportionate (§9.2).
 *
 * Every row runs at DEFAULT density. Compact/comfortable are asserted by the
 * a11y probes in §8, not here — a green run here means "nothing moved", which
 * is only the non-breaking half.
 */

interface Row {
  /** CSS selector, resolved against the route. Must match ≥1 element. */
  sel: string;
  /** Computed property to read. */
  prop: string;
  /** The value that ships today. */
  expect: string;
  /** Where the value comes from — kept so a failure is diagnosable. */
  why: string;
}

const CASES: ReadonlyArray<{ route: string; rows: readonly Row[] }> = [
  {
    route: '/components/button?tab=examples',
    rows: [
      // rhombus-button.component.scss:36-38 — the sm/md/lg ramp, anchored on
      // .mdc-button to out-specify Material's pinned 40px height.
      { sel: '.rhombus-button--sm', prop: 'min-height', expect: '32px', why: 'scss:36' },
      { sel: '.rhombus-button--md', prop: 'min-height', expect: '40px', why: 'scss:37' },
      { sel: '.rhombus-button--lg', prop: 'min-height', expect: '48px', why: 'scss:38' },
      // The per-size padding ramp §7.1 keeps as per-level rules rather than
      // flattening onto one token — v1 flattened it and lost 12/16/24.
      { sel: '.rhombus-button--sm', prop: 'padding-left', expect: '12px', why: 'scss:36' },
      { sel: '.rhombus-button--md', prop: 'padding-left', expect: '16px', why: 'scss:37' },
      { sel: '.rhombus-button--lg', prop: 'padding-left', expect: '24px', why: 'scss:38' },
      // The icon-only square takes the SAME primitive on both axes — that is what
      // keeps it square as density moves, and why the preset needs no density
      // rule of its own. An authored width, so the used value is deterministic.
      {
        sel: '.rhombus-button--icon-button.rhombus-button--sm',
        prop: 'width',
        expect: '32px',
        why: 'scss:50 — var(--control-height-sm) default 2rem',
      },
      {
        sel: '.rhombus-button--icon-button.rhombus-button--lg',
        prop: 'height',
        expect: '48px',
        why: 'scss:52 — var(--control-height-lg) default 3rem',
      },
    ],
  },
  {
    route: '/components/input',
    rows: [
      // Material's infix: min-height + border-box. §7.2's whole point is that
      // container-height alone never binds downward, so this is the value that
      // must not drift when the bridge starts driving it.
      {
        sel: '.mat-mdc-form-field-infix',
        prop: 'min-height',
        expect: '56px',
        why: '_m3-form-field.scss:129 default',
      },
      // The form field's line-height is INHERITED, because Material reads two
      // custom properties the bridge deliberately leaves unset and the
      // declaration is therefore invalid at computed-value time. That
      // inheritance is load-bearing: every height calculation in the density
      // design assumes L = 24px here.
      //
      // SCOPE, stated precisely: this catches completing the bridge's typescale
      // with `body-large` (which would resolve the declaration to a rem value
      // and change this number). It does NOT catch re-pinning
      // `container-text-line-height: 1.5em` — verified by trying it, and the
      // suite stayed green, because at the document root 1.5em and the
      // inherited 1.5 both compute to 24px. They diverge only under an ancestor
      // with an absolute line-height (mat-dialog-content, .mat-mdc-row), and the
      // showcase renders no form field in either. That hazard is guarded
      // statically instead — see tools/verify-component-styles.mjs.
      {
        sel: '.mat-mdc-form-field',
        prop: 'line-height',
        expect: '24px',
        why: 'inherited 1.5 x 16px; bridge must leave both tokens unset',
      },
    ],
  },
  {
    route: '/components/data-table',
    rows: [
      // rhombus-data-table sets NO row geometry; 52px comes straight from
      // Material. v1 proposed a 48px default here, which would have shrunk
      // every shipped table — the single largest regression the review caught.
      { sel: '.mat-mdc-row', prop: 'height', expect: '52px', why: '_m3-table.scss:50' },
      { sel: '.mat-mdc-header-row', prop: 'height', expect: '56px', why: '_m3-table.scss:48' },
    ],
  },
  {
    route: '/components/nav-list',
    rows: [
      // rhombus-nav-list.component.scss:80-81. v1 substituted --control-pad-x
      // (16px) here and grew every nav item by 4px per side at default.
      { sel: '.rhombus-nav-list__item', prop: 'padding-left', expect: '12px', why: 'scss:81' },
      { sel: '.rhombus-nav-list__item', prop: 'padding-top', expect: '8px', why: 'scss:81' },
      { sel: '.rhombus-nav-list__item', prop: 'column-gap', expect: '10px', why: 'scss:80' },
      // The base root gap at default. This pins ONE endpoint of ONE ramp — it is
      // NOT a gate on the base-vs---list inversion the SCSS comment worries
      // about (that needs both gaps compared at compact and comfortable, which
      // no row here does). Its job is narrower: catch a default-density
      // regression of the base root gap, the value most likely to be
      // accidentally tokenized.
      { sel: '.rhombus-nav-list', prop: 'row-gap', expect: '4px', why: 'scss:9' },
    ],
  },
  {
    // The disclosure toggle renders ONLY for a navigable parent (an item with
    // `children`), which the Overview hero does not build — verified by probing
    // both tabs: 0 matches on the base route, 2 here. Its own route entry rather
    // than a lucky selector.
    route: '/components/nav-list?tab=examples',
    rows: [
      // The one substitute-var in this file. Every other nav-list value is
      // per-level-override-only, so a default regression here is the only kind
      // nav-list can produce.
      {
        sel: '.rhombus-nav-list__disclosure',
        prop: 'width',
        expect: '32px',
        why: 'scss:151 — var(--control-height-sm) default 2rem',
      },
    ],
  },
  {
    route: '/components/selection-list',
    rows: [
      // RhombusKit declares NO heights here — both values come straight from
      // Material, and both line counts are reachable through the component's own
      // API (a conditional matListItemLine for `description`). An earlier draft
      // fed both from one 48px token, collapsing every described row by 16px at
      // DEFAULT density with no opt-in. These two rows are what make that
      // visible.
      {
        sel: '.mat-mdc-list-option:not(.mdc-list-item--with-two-lines)',
        prop: 'height',
        expect: '48px',
        why: '_m3-list.scss:86-87 one-line default',
      },
      {
        sel: '.mat-mdc-list-option.mdc-list-item--with-two-lines',
        prop: 'height',
        expect: '64px',
        why: '_m3-list.scss:88-89 two-line default',
      },
    ],
  },
  {
    route: '/components/accordion',
    rows: [
      // rhombus-accordion.component.scss:28-30. v1's --control-pad-y default
      // (0.5rem) would have cut 6px off the trigger's block padding.
      { sel: '.rhombus-accordion__trigger', prop: 'padding-top', expect: '14px', why: 'scss:30' },
      { sel: '.rhombus-accordion__trigger', prop: 'column-gap', expect: '12px', why: 'scss:28' },
    ],
  },
  {
    route: '/components/stepper',
    rows: [
      // rhombus-stepper.component.scss:93-94 — the indicator bubble is a fixed
      // authored square, so its used width is machine-independent.
      { sel: '.rhombus-stepper__indicator', prop: 'width', expect: '28px', why: 'scss:93' },
    ],
  },
  {
    route: '/components/chip',
    rows: [
      { sel: '.mat-mdc-standard-chip', prop: 'height', expect: '32px', why: '_m3-chip.scss:79' },
      // per-level-override-only. An earlier draft substituted a shared gap token
      // whose default was 0.75rem — a silent +4px at default density.
      {
        sel: '.rhombus-chip-group',
        prop: 'column-gap',
        expect: '8px',
        why: '_chip.scss:64 — literal 0.5rem, kept',
      },
    ],
  },
  {
    route: '/components/tabs',
    rows: [
      // Tabs ship no RhombusKit scss at all; 48px is entirely Material's.
      { sel: '.mat-mdc-tab', prop: 'height', expect: '48px', why: '_m3-tabs.scss:56' },
    ],
  },
  {
    route: '/components/segmented',
    rows: [
      // Segmented's box is LINE-HEIGHT driven, not height driven:
      //   .mat-button-toggle-appearance-standard .mat-button-toggle-label-content
      //     { line-height: var(--mat-button-toggle-height, 40px) }
      // The token is unset today, so the 40px fallback applies — and §7.6's
      // substitute-var is default-equal because var(--control-height-md, 2.5rem)
      // resolves to the same 40px. Assert the LINE-HEIGHT, not the rendered box:
      // the box measures 41.5px (inline-block descender overflow) and is
      // font-metric dependent, so it would flake across machines. Assert the
      // property density drives, never the box that merely depends on it.
      {
        sel: '.mat-button-toggle-appearance-standard .mat-button-toggle-label-content',
        prop: 'line-height',
        expect: '40px',
        why: 'button-toggle.mjs; token unset → 40px fallback',
      },
    ],
  },
  {
    route: '/components/pagination',
    rows: [
      // Material pins the paginator's INNER field at 40px at every density
      // level by design — it sits inside a 56px bar. §7.10 must not bind it to
      // --field-height, which would grow it 16px at default.
      {
        sel: '.mat-mdc-paginator-container',
        prop: 'min-height',
        expect: '56px',
        why: '_m3-paginator.scss:40',
      },
    ],
  },
  {
    route: '/components/app-shell?tab=examples',
    rows: [
      // Toolbar height is Material's own (64px on desktop) — PR 3 drives it only
      // at compact/comfortable in _density.scss, so default must stay Material's.
      // The app-shell's own inert 56px min-height literal is a separate,
      // pre-existing bug that this epic deliberately does not touch.
      {
        sel: '.mat-toolbar-single-row',
        prop: 'height',
        expect: '64px',
        why: '_m3-toolbar.scss:38 (Material default; no density override at default)',
      },
    ],
  },
];

for (const { route, rows } of CASES) {
  test(`default geometry — ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });

    // Density must not be active; otherwise this asserts the wrong baseline.
    // Written as an assertion rather than "the attribute is absent" so it keeps
    // biting once the showcase registers provideRhombusDensity('default').
    const level = await page.evaluate(() =>
      document.documentElement.getAttribute('data-density')
    );
    // `null` today (no provider registered); `'default'` once the showcase
    // registers provideRhombusDensity('default'). Both mean default geometry.
    expect([null, 'default'], 'baseline must be collected at default density').toContain(level);

    for (const row of rows) {
      const found = await page.evaluate(
        ({ sel, prop }) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          return getComputedStyle(el).getPropertyValue(prop).trim();
        },
        { sel: row.sel, prop: row.prop }
      );

      // A selector that matches nothing must FAIL, not skip. Silent
      // non-matching is how a gate reports green while measuring nothing —
      // the exact defect that shipped five non-existent custom-property names
      // in an earlier draft of this epic.
      expect(found, `${row.sel} matched no element on ${route}`).not.toBeNull();
      expect(found, `${row.sel} { ${row.prop} } — ships as ${row.expect} (${row.why})`).toBe(
        row.expect
      );
    }
  });
}
