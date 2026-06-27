import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RhombusAvatarComponent,
  RhombusCodeBlockComponent,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-avatar-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusAvatarComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
    ExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Avatar"
      [hasUsage]="true"
      apiKey="RhombusAvatarComponent"
    >
      <div overview class="overview">
        <p class="overview__lead">
          An avatar is a compact, circular representation of a person or entity.
          <code>&lt;rhombus-avatar&gt;</code> renders the <code>src</code> image
          when given (with <code>name</code> as its <code>alt</code>) and
          otherwise falls back to initials derived from <code>name</code>. It is
          bespoke &mdash; no Material primitive &mdash; and adds no new tokens.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <app-example [code]="usage">
            <rhombus-avatar name="Ada Lovelace" />
          </app-example>
        </section>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use an avatar to <strong>identify a user or entity</strong> beside
              their name &mdash; in a comment, a list row, a header. It is
              decorative shorthand, not a control.
            </li>
            <li>
              When you have a photo, pass <code>src</code>; otherwise let the
              <strong>initials fallback</strong> carry the identity. Match its
              <code>size</code> to the surrounding density.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>When not to use</h2>
          <ul>
            <li>
              For a small status or count next to a label, use a
              <a routerLink="/components/badge">Badge</a> &mdash; it is built for
              counts and statuses, not identity.
            </li>
            <li>
              For a clickable, labelled tag or person token that can be removed,
              use a <a routerLink="/components/chip">Chip</a>.
            </li>
            <li>
              For a tappable identity entry point in a header or shell, place the
              avatar inside a <a routerLink="/components/button">Button</a> rather
              than making the avatar itself the control.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Related components</h2>
          <ul>
            <li><a routerLink="/components/badge">Badge</a> &mdash; counts and statuses.</li>
            <li><a routerLink="/components/chip">Chip</a> &mdash; removable person/tag tokens.</li>
            <li><a routerLink="/components/card">Card</a> &mdash; profile and entity surfaces.</li>
          </ul>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          The avatar is driven entirely by three inputs &mdash;
          <code>name</code>, optional <code>src</code>, and <code>size</code>
          &mdash; with no content projection.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Anatomy &amp; slots</h2>
          <ul>
            <li>
              <code>[name]</code> &mdash; the display name. Always supply it: it
              seeds the initials fallback and the accessible label.
            </li>
            <li>
              <code>[src]</code> &mdash; an image URL. When set, the image
              replaces the initials and <code>name</code> becomes its
              <code>alt</code> text.
            </li>
            <li>
              <code>[size]</code> &mdash; a preset (<code>'sm'</code> 24 /
              <code>'md'</code> 40 (default) / <code>'lg'</code> 64 /
              <code>'xl'</code> 96px) or an explicit pixel number for
              profile-photo previews and upload widgets.
            </li>
            <li>
              <code>[srcDark]</code> &mdash; an optional dark-theme image. When
              set, the avatar swaps to it under a dark theme &mdash; pure CSS, so
              it is SSR-safe with no flash.
            </li>
            <li>
              <strong>No content slots.</strong> The component has no
              <code>&lt;ng-content&gt;</code>; it renders an internal
              <code>&lt;img&gt;</code> or an initials <code>&lt;span&gt;</code>
              and projects nothing.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Theming</h2>
          <p>
            The avatar renders inline in the normal DOM (no CDK overlay), so it
            reads these contract tokens directly:
          </p>
          <ul>
            <li><code>--surface-2</code> &mdash; fallback (initials) background</li>
            <li><code>--text-secondary</code> &mdash; initials colour</li>
            <li><code>--font-sans</code> &mdash; initials font family</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            With a <code>src</code>, the avatar is an <code>&lt;img&gt;</code>
            whose <code>alt</code> is the <code>name</code>. Without one, the host
            takes <code>role="img"</code> with the <code>name</code> as its
            <code>aria-label</code> and the initials <code>&lt;span&gt;</code> is
            <code>aria-hidden</code> &mdash; so the person is announced by name,
            never as stray letters. If <code>name</code> is empty, the host
            exposes no <code>aria-label</code>, so always supply a meaningful
            <code>name</code> to keep the avatar announced.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Initials fallback</h2>
        <p class="showcase-section__lead">Presets <code>sm</code> / <code>md</code> / <code>lg</code> / <code>xl</code>.</p>
        <div class="showcase-row" style="align-items: center; gap: 1rem;">
          <rhombus-avatar name="Ada Lovelace" size="sm" />
          <rhombus-avatar name="Ada Lovelace" size="md" />
          <rhombus-avatar name="Ada Lovelace" size="lg" />
          <rhombus-avatar name="Ada Lovelace" size="xl" />
          <rhombus-avatar name="Grace Hopper" />
          <rhombus-avatar name="Linus" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Custom (numeric) size</h2>
        <p class="showcase-section__lead">
          Pass a pixel number to <code>[size]</code> for profile-photo previews
          and upload widgets — the initials font scales with the box.
        </p>
        <div class="showcase-row" style="align-items: center; gap: 1rem;">
          <rhombus-avatar name="Ada Lovelace" [size]="96" />
          <rhombus-avatar name="Ada Lovelace" [size]="120" src="https://i.pravatar.cc/240?img=5" />
        </div>
      </section>

      <section class="showcase-section">
        <h2>Dark-mode source</h2>
        <p class="showcase-section__lead">
          Set <code>srcDark</code> to swap the photo when a dark theme is active
          — toggle the theme above to see it switch. Pure CSS, no flash.
        </p>
        <div class="showcase-row" style="align-items: center; gap: 1rem;">
          <rhombus-avatar
            name="Ada Lovelace"
            size="xl"
            src="https://i.pravatar.cc/192?img=12"
            srcDark="https://i.pravatar.cc/192?img=68"
          />
        </div>
        <rhombus-code-block language="html" [code]="darkUsage" />
      </section>

      <section class="showcase-section">
        <h2>Image</h2>
        <p class="showcase-section__lead">
          With <code>src</code>, the image fills the avatar (<code>object-fit:
          cover</code>) and <code>name</code> becomes its alt text.
        </p>
        <div class="showcase-row" style="align-items: center; gap: 1rem;">
          <rhombus-avatar
            name="Ada Lovelace"
            src="https://i.pravatar.cc/96?img=5"
            size="lg"
          />
          <rhombus-avatar
            name="Grace Hopper"
            src="https://i.pravatar.cc/96?img=32"
          />
        </div>
      </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
  `,
})
export default class AvatarPageComponent {
  /** Dark-mode-source snippet shown in the Examples tab. */
  protected readonly darkUsage = `<!-- Swaps to srcDark under a dark theme (pure CSS, SSR-safe, no flash) -->
<rhombus-avatar
  name="Ada Lovelace"
  size="xl"
  src="/avatar-light.png"
  srcDark="/avatar-dark.png"
/>`;

  /** Minimal import + usage snippet shown in the Overview tab. */
  protected readonly usage = `import { RhombusAvatarComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-comment-author',
  imports: [RhombusAvatarComponent],
  template: \`
    <rhombus-avatar name="Ada Lovelace" />
  \`,
})
export class CommentAuthorComponent {}`;
}
