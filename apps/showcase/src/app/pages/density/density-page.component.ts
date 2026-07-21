import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tokens } from '@rhombuskit/tokens';
import {
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusDensityService,
  RhombusSegmentedComponent,
  type RhombusDensity,
  type SegmentOption,
} from '@rhombuskit/core';

interface DensityRow {
  name: string;
  compact: string;
  default: string;
  comfortable: string;
}

const PRIM = tokens.primitives;
const DENSITY_PREFIXES = ['control-height-', 'field-height', 'row-height'];
const NAMES = Object.keys(PRIM).filter((k) =>
  DENSITY_PREFIXES.some((p) => k.startsWith(p))
);

// Derived from the generated tokens so this table tracks the source, never a
// hand-copied set of values. The `as keyof typeof` casts are MANDATORY, not
// stylistic: `tokens.density.compact` and `tokens.primitives` are `as const`
// maps with no index signature, so indexing them with a plain `string` is TS7053
// under `strict`, which turns the lint and build jobs red. Same pattern as
// motion-page.component.ts.
const ROWS: DensityRow[] = NAMES.map((k) => ({
  name: `--${k}`,
  compact: tokens.density.compact[k as keyof typeof tokens.density.compact],
  default: PRIM[k as keyof typeof PRIM],
  comfortable:
    tokens.density.comfortable[k as keyof typeof tokens.density.comfortable],
}));

@Component({
  selector: 'app-density-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusSegmentedComponent,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './density-page.component.scss',
  template: `
    <div class="showcase-page density">
      <header class="showcase-page__header">
        <h1>Density</h1>
        <p>
          Density is a single app-wide choice of control geometry —
          <strong>compact</strong>, <strong>default</strong>, or
          <strong>comfortable</strong> — set once at bootstrap with
          <code>provideRhombusDensity()</code>. It owns the <strong>box</strong>
          (heights, padding, gaps) and never the <strong>type</strong>: the
          per-instance <code>size</code> input still owns font size, so density
          and size are orthogonal and adding density is non-breaking. Like
          <a routerLink="/motion">motion</a>, geometry is theme-invariant, so it
          lives in the palette-level
          <a routerLink="/theming">primitives</a>, not the semantic contract.
        </p>
        <p class="density__a11y-note">
          Every level clears the WCAG 2.2 24&times;24 target floor — there is
          deliberately no equivalent of Material's <code>-2</code> / <code>-3</code>
          steps, which drop touch targets and the floating label.
        </p>
      </header>

      <section class="showcase-section">
        <h2>Try it</h2>
        <p>
          Switch the level below. It writes <code>data-density</code> on
          <code>&lt;html&gt;</code>, so the whole page reflows — the sidebar, the
          header, this control, and the demo row all move together.
        </p>
        <rhombus-segmented
          ariaLabel="Density"
          [options]="levels"
          [value]="current()"
          (valueChange)="setDensity($event)"
        />
        <p class="density__note">
          The toggle is <strong>global and not persisted</strong> — reload and it
          returns to default. RhombusKit does not ship a page-local density or a
          stored preference: an app bakes in one level, and density is a
          <em>layout</em> value, so a flash on reload would be a worse shift than
          a colour one.
        </p>
        <div class="density-demo" aria-label="Controls that track density">
          <rhombus-button size="sm">Small</rhombus-button>
          <rhombus-button size="md">Medium</rhombus-button>
          <rhombus-button size="lg">Large</rhombus-button>
        </div>
      </section>

      <section class="showcase-section">
        <h2>The scale</h2>
        <p>
          Five frozen primitives are the entire public surface. Each rebinds per
          level; components read them through the Material bridge and directly.
          Everything else — per-component paddings, list-row heights, form-field
          vertical padding — is internal plumbing you never reference.
        </p>
        <div class="density-table" role="table" aria-label="Density scale">
          <div class="density-table__row density-table__row--head" role="row">
            <span role="columnheader">Primitive</span>
            <span role="columnheader">Compact</span>
            <span role="columnheader">Default</span>
            <span role="columnheader">Comfortable</span>
          </div>
          @for (r of rows; track r.name) {
            <div class="density-table__row" role="row">
              <code role="cell" class="density-table__name">{{ r.name }}</code>
              <span role="cell">{{ r.compact }}</span>
              <span role="cell" class="density-table__default">{{ r.default }}</span>
              <span role="cell">{{ r.comfortable }}</span>
            </div>
          }
        </div>
      </section>

      <section class="showcase-section">
        <h2>Setup</h2>
        <p>
          Register the provider once. Passing <code>'default'</code> is the same
          as omitting it — it documents the choice and makes the level assertable.
        </p>
        <rhombus-code-block language="typescript" [code]="providerSetup" />
        <p>
          For Material-backed controls (the form-field family, data table,
          selection list, tabs, toolbar, and paginator) the opt-in Material bridge is
          <strong>required</strong> — include it once on <code>:root</code> or
          <code>html</code>. Without it, density still moves RhombusKit's own
          components (button, segmented, chip, nav list, accordion, stepper) but
          not the Material-backed ones.
        </p>
        <rhombus-code-block language="scss" [code]="bridgeSetup" />
        <p>
          Migrating off <code>mat.density</code>? See
          <a
            href="https://github.com/doug-williamson/RhombusKit/blob/main/docs/theming.md#migrating-from-mat-density"
            target="_blank"
            rel="noopener"
            >Migrating from <code>mat.density</code></a
          >
          — <code>provideRhombusDensity('compact')</code> is value-identical to
          <code>mat.theme((density: -1))</code> for twelve of thirteen components,
          adds a comfortable direction and runtime switching, and needs the box
          restored by hand only on the handful it leaves alone.
        </p>
      </section>

      <section class="showcase-section">
        <h2>What density leaves alone</h2>
        <p>
          Density is scoped on purpose. It does not touch checkbox, radio, or
          switch state layers; slider, menu, dialog, datepicker, card, or
          snackbar (Material no-ops these too); or any font size. Those are stated
          exclusions, not gaps — a compact app keeps them at their default size.
        </p>
      </section>
    </div>
  `,
})
export default class DensityPageComponent {
  private readonly densityService = inject(RhombusDensityService);

  protected readonly rows = ROWS;

  protected readonly levels: SegmentOption<RhombusDensity>[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'default', label: 'Default' },
    { value: 'comfortable', label: 'Comfortable' },
  ];

  /** The live level — the same WritableSignal the service publishes to `<html>`. */
  protected readonly current = this.densityService.density;

  protected setDensity(mode: RhombusDensity | RhombusDensity[] | null): void {
    // Single-select segmented emits one value; ignore the array/null shapes the
    // shared output type allows for multi-select mode.
    if (typeof mode === 'string') this.densityService.density.set(mode);
  }

  protected readonly providerSetup = `import { provideRhombusDensity } from '@rhombuskit/core';

bootstrapApplication(App, {
  providers: [
    provideRhombusDensity('compact'), // 'compact' | 'default' | 'comfortable'
  ],
});`;

  protected readonly bridgeSetup = `@use '@rhombuskit/material-preset/scss' as rhombus;

:root {
  @include rhombus.material-bridge();
}`;
}
