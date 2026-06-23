import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tokens } from '@rhombuskit/tokens';

interface MotionToken {
  name: string; // e.g. "--motion-duration-fast"
  value: string; // e.g. "120ms"
}

const PRIM = tokens.primitives;

// Derived from the generated primitives so this reference tracks the source.
const DURATIONS: MotionToken[] = Object.keys(PRIM)
  .filter((k) => k.startsWith('motion-duration-'))
  .map((k) => ({ name: `--${k}`, value: PRIM[k as keyof typeof PRIM] }));

const EASINGS: MotionToken[] = Object.keys(PRIM)
  .filter((k) => k.startsWith('motion-ease-'))
  .map((k) => ({ name: `--${k}`, value: PRIM[k as keyof typeof PRIM] }));

@Component({
  selector: 'app-motion-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './motion-page.component.scss',
  template: `
    <div class="showcase-page motion">
      <header class="showcase-page__header">
        <h1>Motion</h1>
        <p>
          RhombusKit motion is tokenized, not hand-tuned per component. Two
          primitive scales — <strong>durations</strong> and
          <strong>easings</strong> — drive every transition, so timing stays
          consistent and is changed in one place. Motion is theme-independent,
          so it lives in the palette-level <a routerLink="/theming">primitives</a>,
          not the semantic contract.
        </p>
        <p class="motion__a11y-note">
          Every transition honors <code>prefers-reduced-motion: reduce</code>
          globally — when a visitor opts out of motion, durations collapse to
          near-zero and the UI updates instantly.
        </p>
      </header>

      <section class="showcase-section">
        <h2>Durations</h2>
        <p>Hover a row to play a background transition at that duration.</p>
        <div class="motion-table">
          @for (d of durations; track d.name) {
            <div class="motion-row" [style.--demo-duration]="'var(' + d.name + ')'">
              <code class="motion-row__name">{{ d.name }}</code>
              <code class="motion-row__value">{{ d.value }}</code>
              <div class="motion-row__swatch"></div>
            </div>
          }
        </div>
      </section>

      <section class="showcase-section">
        <h2>Easings</h2>
        <p>
          Hover a track to send the marker across using that curve (at
          <code>--motion-duration-slow</code>).
        </p>
        <div class="motion-demos">
          @for (e of easings; track e.name) {
            <div class="motion-demo" [style.--demo-ease]="'var(' + e.name + ')'">
              <code>{{ e.name }}</code>
              <div class="motion-demo__track">
                <span class="motion-demo__marker"></span>
              </div>
              <small>{{ e.value }}</small>
            </div>
          }
        </div>
      </section>

      <section class="showcase-section">
        <h2>Usage</h2>
        <p>
          Reference the tokens in any component stylesheet — never hard-code a
          duration or curve:
        </p>
        <pre class="motion-usage"><code>.thing {{ '{' }}
  transition: background var(--motion-duration-base) var(--motion-ease-standard);
{{ '}' }}</code></pre>
        <p>
          Use <code>--motion-ease-decelerate</code> for things entering the
          screen and <code>--motion-ease-accelerate</code> for things leaving;
          <code>--motion-ease-standard</code> for in-place state changes.
        </p>
      </section>
    </div>
  `,
})
export default class MotionPageComponent {
  protected readonly durations = DURATIONS;
  protected readonly easings = EASINGS;
}
