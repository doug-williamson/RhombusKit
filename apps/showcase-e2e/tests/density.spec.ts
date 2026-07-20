import { test, expect, type Page } from '@playwright/test';

/**
 * Density behaviour at NON-default levels
 * (`docs/superpowers/specs/2026-07-19-density-modes-design.md`).
 *
 * `geometry.spec.ts` is the other half of this pair and owns the opposite
 * question: it pins DEFAULT geometry so the "an app that never opts in renders
 * unchanged" promise is machine-checked. A green run there means "nothing
 * moved", which says nothing about whether compact and comfortable are correct.
 * This file owns that half.
 *
 * WHY THESE ASSERTIONS AND NOT A FULL GEOMETRY SWEEP. Every check here exists
 * because a specific defect was found and fixed during the design, and each
 * would go green again if the fix were reverted:
 *
 *  - Rule T. Material's touch-target span is absolutely positioned and does NOT
 *    shrink with its control, so compacting a button below 48px leaves overhang
 *    that makes two stacked buttons' targets overlap — a click in the overlap
 *    band resolves by paint order to the WRONG button. That is strictly worse
 *    than not shipping compact at all.
 *  - The leak gate. Every `*-touch-target-size` name is shared with components
 *    density does not move (bare matButton, rhombus-checkbox/radio/switch). An
 *    earlier draft put a rebind in the global level block, whose only selector
 *    form is `:root[data-density]` — it bound nothing where it was aimed and
 *    silently dropped every checkbox and radio in the document 48px -> 44px.
 *  - The paginator pin. Material deliberately holds its inner field at 40px at
 *    every density level; binding it to the form-field height would render a
 *    56px field inside a 56px bar.
 *  - Box/type orthogonality. "Density owns the box, size owns the type" is the
 *    claim that makes this release non-breaking. Font-size being level-invariant
 *    is its executable form.
 *
 * The prerender assertion and the /density toggle test are deliberately NOT
 * here: both need the `/density` route and `provideRhombusDensity('default')` in
 * the showcase's app config, which land in the next PR. In this PR no showcase
 * page registers the provider, so there is nothing for them to assert against.
 */

type Density = 'compact' | 'default' | 'comfortable';

/**
 * Post-load attribute write, deliberately NOT `addInitScript`.
 *
 * The service's effect runs at bootstrap and would clobber a pre-boot attribute.
 * Because the level signal never changes afterwards the effect never re-runs, so
 * a post-load write sticks. THAT ASSUMPTION IS LOad-BEARING: if the service ever
 * gains a second dependency (a media query, a resize listener, a route hook) the
 * effect re-fires, overwrites this attribute, and every test below goes
 * green-but-meaningless. Re-read the attribute after the last action if you add
 * one.
 *
 * This drives the PUBLIC contract (the attribute) rather than the service, so it
 * works on every route — compact target sizes can be asserted on
 * /components/button rather than only on a dedicated page. It is therefore NOT
 * cover for provider wiring; that is covered by the jest providers spec and, in
 * the next PR, by the prerender assertion.
 */
async function setDensity(page: Page, mode: Density): Promise<void> {
  await page.evaluate((m) => {
    document.documentElement.setAttribute('data-density', m);
  }, mode);
  // Required: without it the assertions race the style recalc.
  await page.waitForFunction(
    (m) => document.documentElement.getAttribute('data-density') === m,
    mode
  );
}

async function clearDensity(page: Page): Promise<void> {
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-density'));
}

/** Rect height of the first match, or null when the selector matches nothing. */
async function heightOf(page: Page, sel: string): Promise<number | null> {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? el.getBoundingClientRect().height : null;
  }, sel);
}

test.describe('Rule T — compact button touch targets track their box', () => {
  // Material renders <span class="mat-mdc-button-touch-target"> on every
  // matButton at `height: var(--mat-button-<appearance>-touch-target-size, 48px)`,
  // absolutely positioned and vertically centred. Unrebound, compact's 28/36/44px
  // boxes overhang it by 10/6/2px PER SIDE — worse than default at every size.
  const SIZES: ReadonlyArray<{ cls: string; compactPx: number }> = [
    { cls: 'rhombus-button--sm', compactPx: 28 },
    { cls: 'rhombus-button--md', compactPx: 36 },
    { cls: 'rhombus-button--lg', compactPx: 44 },
  ];

  for (const { cls, compactPx } of SIZES) {
    test(`${cls}: target height == button height at compact`, async ({ page }) => {
      await page.goto('/components/button?tab=examples', { waitUntil: 'networkidle' });
      await setDensity(page, 'compact');

      const measured = await page.evaluate((c) => {
        // Exclude icon-only buttons: they are a different box (a square driven
        // by the same primitive) and the padding ramp deliberately skips them.
        const btn = document.querySelector<HTMLElement>(
          `.${c}:not(.rhombus-button--icon-button)`
        );
        if (!btn) return null;
        const target = btn.querySelector<HTMLElement>('.mat-mdc-button-touch-target');
        if (!target) return { box: btn.getBoundingClientRect().height, target: null };
        return {
          box: btn.getBoundingClientRect().height,
          target: target.getBoundingClientRect().height,
        };
      }, cls);

      // A selector matching nothing must FAIL, never skip — silent non-matching
      // is how a gate reports green while measuring nothing.
      expect(measured, `.${cls} matched no button on /components/button`).not.toBeNull();
      // The span must EXIST. Rule T3: a density block must never emit a
      // *-touch-target-display token, because `none` deletes this element
      // outright — which is what Material itself does at -2.
      expect(
        measured?.target,
        'touch-target span is missing — did a density block emit touch-target-display?'
      ).not.toBeNull();

      expect(measured!.box, `${cls} should compact to ${compactPx}px`).toBeCloseTo(
        compactPx,
        0
      );
      // The gate. Equal box and target == zero overhang == no cross-button
      // overlap. Goes red if the touch-target rebind is dropped or mis-scoped.
      expect(
        measured!.target!,
        `target (${measured!.target}px) must equal the button box (${measured!.box}px) — ` +
          'overhang makes stacked buttons\' targets overlap'
      ).toBeCloseTo(measured!.box, 0);
    });
  }

  test('default level keeps Material\'s 48px target — compact-only is deliberate', async ({
    page,
  }) => {
    await page.goto('/components/button?tab=examples', { waitUntil: 'networkidle' });
    await clearDensity(page);

    const target = await heightOf(
      page,
      '.rhombus-button--sm:not(.rhombus-button--icon-button) .mat-mdc-button-touch-target'
    );
    expect(target, 'touch-target span not found at default').not.toBeNull();
    // Default-level overhang (32px box vs 48px target) is PRE-EXISTING on main
    // and deliberately not fixed here — that would be a rendered-geometry change
    // at default density, which this PR's whole premise forbids. Asserting it
    // keeps the carve-out honest rather than letting it drift silently.
    expect(target).toBeCloseTo(48, 0);
  });
});

test.describe('Rule T2 — touch-target rebinds never leak to the document', () => {
  test('compact declares no checkbox/radio touch-target size on :root', async ({ page }) => {
    await page.goto('/components/checkbox', { waitUntil: 'networkidle' });
    await setDensity(page, 'compact');

    const rootValues = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return {
        checkbox: cs.getPropertyValue('--mat-checkbox-touch-target-size').trim(),
        radio: cs.getPropertyValue('--mat-radio-touch-target-size').trim(),
        button: cs.getPropertyValue('--mat-button-filled-touch-target-size').trim(),
      };
    });

    // These names are app-global and shared with components density does not
    // move. A :root rebind is never merely redundant — it is always a silent
    // regression for everything out of scope.
    expect(rootValues.checkbox, '--mat-checkbox-touch-target-size leaked to :root').toBe('');
    expect(rootValues.radio, '--mat-radio-touch-target-size leaked to :root').toBe('');
    expect(rootValues.button, '--mat-button-*-touch-target-size leaked to :root').toBe('');
  });

  test('an out-of-scope checkbox keeps its 48px target under global compact', async ({
    page,
  }) => {
    await page.goto('/components/checkbox', { waitUntil: 'networkidle' });
    await setDensity(page, 'compact');

    const target = await heightOf(page, '.mat-mdc-checkbox-touch-target');
    expect(target, '.mat-mdc-checkbox-touch-target matched nothing').not.toBeNull();
    // Checkbox is explicitly out of density's scope: its box does not move, so
    // its target must not either. This is the assertion that would have caught
    // the leak an earlier draft shipped.
    expect(target).toBeCloseTo(48, 0);
  });
});

test.describe('paginator — the inner field stays pinned at every level', () => {
  test('global compact leaves the paginator field at 40px', async ({ page }) => {
    await page.goto('/components/pagination', { waitUntil: 'networkidle' });

    // Probe --mat-form-field-container-height, NOT
    // --mat-paginator-form-field-container-height. The latter is only ever READ
    // (with a 40px fallback) and never declared, so getPropertyValue returns ""
    // for it at every level — a probe that can never disagree with itself, which
    // is precisely the vacuous-assertion failure mode this epic keeps finding.
    // Verified by trying it: it read "" at both levels and the test "passed" the
    // comparison while measuring nothing.
    //
    // The token below IS declared, by paginator.mjs, on .mat-mdc-paginator:
    //   --mat-form-field-container-height:
    //     var(--mat-paginator-form-field-container-height, 40px)
    // so reading it tests the actual shielding mechanism — a local declaration on
    // an ancestor of the inner field, which is what stops the global form-field
    // binding reaching it.
    const read = async () =>
      page.evaluate(() => {
        const el = document.querySelector('.mat-mdc-paginator');
        if (!el) return null;
        return getComputedStyle(el)
          .getPropertyValue('--mat-form-field-container-height')
          .trim();
      });

    await clearDensity(page);
    const atDefault = await read();
    expect(atDefault, '.mat-mdc-paginator matched nothing').not.toBeNull();

    await setDensity(page, 'compact');
    const atCompact = await read();

    // Material pins this across levels 0..-4 on purpose: 40 + 8 + 8 = 56 = the
    // bar height. The paginator re-declares --mat-form-field-container-height
    // locally from it, which is what shields the inner field from the global
    // form-field binding. Binding it to --field-height would put a 56px field
    // inside a 56px bar at DEFAULT density.
    expect(atDefault).toBe('40px');
    expect(atCompact, 'global density must not reach the paginator field').toBe('40px');
  });
});

test.describe('box/type orthogonality — density never touches font-size', () => {
  test('form-field font-size is identical at all three levels', async ({ page }) => {
    await page.goto('/components/input', { waitUntil: 'networkidle' });

    const fontAt = async (mode: Density | null) => {
      if (mode === null) await clearDensity(page);
      else await setDensity(page, mode);
      return page.evaluate(() => {
        const el = document.querySelector('.mat-mdc-form-field');
        return el ? getComputedStyle(el).fontSize : null;
      });
    };

    const base = await fontAt(null);
    expect(base, '.mat-mdc-form-field matched nothing').not.toBeNull();

    // The executable form of the claim that makes this release non-breaking.
    // Material's own density scale changes zero font sizes; ours must too.
    expect(await fontAt('compact'), 'compact changed the type scale').toBe(base);
    expect(await fontAt('comfortable'), 'comfortable changed the type scale').toBe(base);
  });
});

test.describe('scoped density — a table-local level reaches its own subtree', () => {
  test('a compact-scoped table compacts its rows without touching the document', async ({
    page,
  }) => {
    await page.goto('/components/data-table', { waitUntil: 'networkidle' });
    await clearDensity(page);

    const rowAtDefault = await heightOf(page, '.mat-mdc-row');
    expect(rowAtDefault, '.mat-mdc-row matched nothing').not.toBeNull();
    expect(rowAtDefault).toBeCloseTo(52, 0);

    // Scope the attribute onto the table's own panel div — the same thing the
    // `density` input does. A scoped step MUST rebind the --mat-* token itself:
    // re-declaring --row-height here would be inert, because the bridge already
    // substituted it at :root and only the resolved value inherits.
    await page.evaluate(() => {
      document.querySelector('.rhombus-data-table')?.setAttribute('data-density', 'compact');
    });

    const rowScoped = await heightOf(page, '.mat-mdc-row');
    expect(rowScoped, 'scoped compact did not reach the row').toBeCloseTo(48, 0);

    // ...and the document is untouched, which is the whole point of scoping.
    const htmlLevel = await page.evaluate(() =>
      document.documentElement.getAttribute('data-density')
    );
    expect(htmlLevel).toBeNull();
  });

  test('a scoped subtree moves what CLASS rules own, not what the primitive owns', async ({
    page,
  }) => {
    await page.goto('/components/button?tab=examples', { waitUntil: 'networkidle' });
    await clearDensity(page);

    const read = () =>
      page.evaluate(() => {
        const b = document.querySelector<HTMLElement>(
          '.rhombus-button--md:not(.rhombus-button--icon-button)'
        );
        if (!b) return null;
        const cs = getComputedStyle(b);
        return {
          minHeight: cs.minHeight,
          paddingLeft: cs.paddingLeft,
          box: b.getBoundingClientRect().height,
        };
      });

    const atDefault = await read();
    expect(atDefault, '.rhombus-button--md matched nothing').not.toBeNull();
    expect(atDefault!.minHeight).toBe('40px');
    expect(atDefault!.paddingLeft).toBe('16px');

    // Scope the attribute onto an ancestor of the button, the way a
    // `<rhombus-data-table density="compact">` panel does for its own subtree.
    await page.evaluate(() => {
      const b = document.querySelector('.rhombus-button--md:not(.rhombus-button--icon-button)');
      b?.closest('section, div')?.setAttribute('data-density', 'compact');
    });
    const scoped = await read();

    // WHAT MOVES: the padding ramp and the touch-target rebind are ordinary
    // descendant CLASS rules, so an ancestor attribute is enough to fire them.
    // That is deliberate — a :root-anchored rule could never reach a subtree.
    expect(scoped!.paddingLeft, 'the ancestor-matched padding ramp must fire').toBe('14px');

    // WHAT DOES NOT: min-height reads --control-height-md, and that primitive is
    // rebound ONLY by the token generator's `:root[data-density]` block. An
    // arbitrary ancestor declares no primitive, so the height is unchanged.
    //
    // MEASURED, not assumed — and it corrects the design doc, which says a
    // scoped table "does compact the buttons inside it" without qualification.
    // Half of that is true. The box stays 40px while the padding tightens.
    //
    // This is exactly why §2.2's rule exists and why the data-table's own scoped
    // steps rebind the --mat-* tokens DIRECTLY on the panel instead of
    // re-declaring --row-height: a component that wants to work scoped must own
    // the token its geometry actually reads. The button's height does not, so it
    // is a global-only axis. Harmless (a 36px target inside a 40px box removes
    // nothing — the box is always clickable), but it must not be described as
    // full scoped density.
    expect(
      scoped!.minHeight,
      'a scoped ancestor must NOT move a primitive-driven height — if this ' +
        'changes, the generator started emitting a bare [data-density] block'
    ).toBe('40px');
    expect(scoped!.box).toBeCloseTo(40, 0);

    // ...and a GLOBAL level moves both, which is the contrast that makes the
    // limitation legible rather than looking like a bug.
    await setDensity(page, 'compact');
    const global = await read();
    expect(global!.minHeight).toBe('36px');
    expect(global!.paddingLeft).toBe('14px');
    expect(global!.box).toBeCloseTo(36, 0);
  });
});
