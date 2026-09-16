import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tokens } from '@rhombuskit/tokens';

const PRIM = tokens.primitives;
type PrimKey = keyof typeof PRIM;

// `tokens.primitives` is an `as const` map with no index signature, so a plain
// string index is a TS7053 error under strict mode. Same cast the motion and
// density pages use.
const val = (key: string): string => PRIM[key as PrimKey];

/** Every metric on this page is authored in rem against a 16px root. */
const toPx = (rem: string): string => `${Math.round(Number.parseFloat(rem) * 16)}px`;

interface TypeRow {
  role: string;
  name: string;
  size: string;
  sizePx: string;
  lineHeight: string;
  lineHeightPx: string;
  weight: string;
  tracking: string;
  prominent: string | undefined;
}

// Derived from the generated primitives rather than restated, so a role added to
// the token spec appears here with no edit to this page — and, more importantly,
// so the page can never claim a value the tokens don't actually ship.
const TYPE_ROWS: TypeRow[] = Object.keys(PRIM)
  .filter((k) => k.startsWith('type-') && k.endsWith('-size'))
  .map((k) => k.slice('type-'.length, -'-size'.length))
  .map((role) => ({
    role,
    name: `--type-${role}`,
    size: val(`type-${role}-size`),
    sizePx: toPx(val(`type-${role}-size`)),
    lineHeight: val(`type-${role}-line-height`),
    lineHeightPx: toPx(val(`type-${role}-line-height`)),
    weight: val(`type-${role}-weight`),
    tracking: val(`type-${role}-tracking`),
    // Only label-large and label-medium carry one; undefined for the other 13.
    prominent: PRIM[`type-${role}-weight-prominent` as PrimKey] as string | undefined,
  }));

const SPACE_ROWS = Object.keys(PRIM)
  .filter((k) => k.startsWith('space-'))
  .map((k) => ({ name: `--${k}`, value: val(k), px: toPx(val(k)) }));

// `--radius-full` is 9999px, not rem — render its raw value, never toPx().
const RADIUS_ROWS = Object.keys(PRIM)
  .filter((k) => k.startsWith('radius-'))
  .map((k) => ({
    name: `--${k}`,
    value: val(k),
    label: val(k).endsWith('rem') ? toPx(val(k)) : val(k),
  }));

const STATE_ROWS = Object.keys(PRIM)
  .filter((k) => k.startsWith('state-'))
  .map((k) => ({
    name: `--${k}`,
    value: val(k),
    pct: `${Math.round(Number(val(k)) * 100)}%`,
  }));

@Component({
  selector: 'app-foundations-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './foundations-page.component.scss',
  template: `
    <div class="showcase-page foundations">
      <header class="showcase-page__header">
        <h1>Foundations</h1>
        <p>
          The four scales every RhombusKit component is built from —
          <strong>type</strong>, <strong>spacing</strong>,
          <strong>corner radius</strong> and <strong>state layers</strong>. All
          four are the Material 3 baseline, and all four are theme-independent:
          a 14px label is 14px in every theme, so they live in the palette-level
          <a routerLink="/theming">primitives</a> rather than the semantic
          contract. Their names are frozen append-only, exactly like the
          contract's.
        </p>
        <p>
          Every specimen below is rendered from the published token values
          themselves, so this page cannot drift from what the package ships. See
          also <a routerLink="/motion">Motion</a> and
          <a routerLink="/density">Density</a>, the other two primitive scales.
        </p>
      </header>

      <section class="showcase-section">
        <h2>Type scale</h2>
        <p>
          The 15 M3 roles, each as
          <code>--type-&lt;role&gt;-{{ '{' }}size,line-height,weight,tracking{{ '}' }}</code>.
          The M3 read comes from the three values travelling together — a bare
          size scale discards exactly the part that makes it look like M3.
          Sizes are exact rem at a 16px root.
        </p>
        <p class="foundations__note">
          Font <em>family</em> is deliberately not part of this scale. Family is
          themed (<code>--font-sans</code> is a contract token), so freezing it
          into a primitive would stop a theme from changing it.
        </p>

        <div class="type-table">
          @for (t of typeRows; track t.role) {
            <div class="type-row">
              <code class="type-row__name">{{ t.name }}-*</code>
              <p
                class="type-row__specimen"
                [style.font-size]="t.size"
                [style.line-height]="t.lineHeight"
                [style.font-weight]="t.weight"
                [style.letter-spacing]="t.tracking"
              >
                Sphinx of black quartz, judge my vow
              </p>
              <dl class="type-row__metrics">
                <div><dt>size</dt><dd>{{ t.size }} · {{ t.sizePx }}</dd></div>
                <div><dt>line-height</dt><dd>{{ t.lineHeight }} · {{ t.lineHeightPx }}</dd></div>
                <div>
                  <dt>weight</dt>
                  <dd>
                    {{ t.weight }}@if (t.prominent) {<span> · {{ t.prominent }} prominent</span>}
                  </dd>
                </div>
                <div><dt>tracking</dt><dd>{{ t.tracking }}</dd></div>
              </dl>
            </div>
          }
        </div>

        <p class="foundations__note">
          <code>--type-body-large-*</code> is published like every other role,
          but the <a routerLink="/theming">Material bridge</a> deliberately
          leaves <code>--mat-sys-body-large-*</code> unset: Material resolves the
          form field's container text, the select trigger and selection-list rows
          through it, and those must keep <em>inheriting</em> their line-height.
          Setting it silently regrows every nested form field.
        </p>
      </section>

      <section class="showcase-section">
        <h2>Spacing</h2>
        <p>
          A 4px grid on a numeric multiplier. The ramp is dense at the bottom and
          coarse above <code>--space-6</code>; odd steps are deliberately absent,
          because a complete 4px ladder is a utility framework, not a design
          system.
        </p>
        <div class="space-table">
          @for (s of spaceRows; track s.name) {
            <div class="space-row">
              <code class="space-row__name">{{ s.name }}</code>
              <div class="space-row__track">
                <div class="space-row__bar" [style.width]="s.value"></div>
              </div>
              <code class="space-row__value">{{ s.value }} · {{ s.px }}</code>
            </div>
          }
        </div>
      </section>

      <section class="showcase-section">
        <h2>Corner radius</h2>
        <p>
          The M3 corner ramp. These seven names map one-to-one onto Angular
          Material's <code>--mat-sys-corner-*</code> scale, which is what lets the
          bridge express Material's whole shape system in tokens instead of
          hard-coded pixels — so overriding a radius re-shapes RhombusKit and
          Material components alike.
        </p>
        <div class="radius-table">
          @for (r of radiusRows; track r.name) {
            <div class="radius-cell">
              <div class="radius-cell__swatch" [style.border-radius]="r.value"></div>
              <code class="radius-cell__name">{{ r.name }}</code>
              <code class="radius-cell__value">{{ r.label }}</code>
            </div>
          }
        </div>
      </section>

      <section class="showcase-section">
        <h2>State layers</h2>
        <p>
          The translucent overlays M3 paints on hover, focus and press. Their
          absence is what makes controls feel flat and un-Material even when the
          colours are right.
        </p>
        <div class="state-table">
          @for (s of stateRows; track s.name) {
            <div class="state-cell">
              <div class="state-cell__swatch">
                <div class="state-cell__layer" [style.opacity]="s.value"></div>
              </div>
              <code class="state-cell__name">{{ s.name }}</code>
              <code class="state-cell__value">{{ s.value }} · {{ s.pct }}</code>
            </div>
          }
        </div>
        <p class="foundations__note">
          Focus and pressed are <strong>0.12</strong>, not the 0.10 in the current
          M3 spec. Angular Material 21 hard-codes 0.12, and RhombusKit wraps
          Material primitives — matching Material is what keeps a wrapped control
          and an unwrapped one looking the same.
        </p>
      </section>
    </div>
  `,
})
export default class FoundationsPageComponent {
  protected readonly typeRows = TYPE_ROWS;
  protected readonly spaceRows = SPACE_ROWS;
  protected readonly radiusRows = RADIUS_ROWS;
  protected readonly stateRows = STATE_ROWS;
}
