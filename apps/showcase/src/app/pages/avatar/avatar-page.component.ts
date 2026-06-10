import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RhombusAvatarComponent } from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';
import { ExampleComponent } from '../../shared/example.component';

@Component({
  selector: 'app-avatar-page',
  standalone: true,
  imports: [RhombusAvatarComponent, ComponentPageComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page title="Avatar" apiKey="RhombusAvatarComponent">
      <div overview class="overview">
        <p class="overview__lead">
          An avatar is a compact, circular representation of a person or entity.
          <code>&lt;rhombus-avatar&gt;</code> renders the <code>src</code> image
          when given (with <code>name</code> as its <code>alt</code>) and
          otherwise falls back to initials derived from <code>name</code>. It is
          bespoke &mdash; no Material primitive &mdash; and adds no new tokens.
        </p>

        <section class="showcase-section">
          <h2>When to use</h2>
          <ul>
            <li>
              Use an avatar to <strong>identify a user or entity</strong> beside
              their name &mdash; in a comment, a list row, a header. It is
              decorative shorthand, not a control.
            </li>
            <li>
              Provide a <code>name</code> in every case; pass <code>src</code>
              when you have a photo and let the initials fallback cover the rest.
              Pick a <code>size</code> (<code>sm</code> / <code>md</code> /
              <code>lg</code>) to match its context.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Usage</h2>
          <app-example [code]="usage">
            <rhombus-avatar name="Ada Lovelace" />
          </app-example>
        </section>

        <section class="overview__a11y">
          <h2>Accessibility</h2>
          <p>
            With a <code>src</code>, the avatar is an <code>&lt;img&gt;</code>
            whose <code>alt</code> is the <code>name</code>. Without one, the host
            takes <code>role="img"</code> with the <code>name</code> as its
            <code>aria-label</code> and the initials are hidden from assistive
            tech &mdash; so the person is announced by name, never as stray
            letters. Always supply a meaningful <code>name</code>.
          </p>
        </section>
      </div>

      <div examples>
      <section class="showcase-section">
        <h2>Initials fallback</h2>
        <p class="showcase-section__lead">Sizes <code>sm</code> / <code>md</code> / <code>lg</code>.</p>
        <div class="showcase-row" style="align-items: center; gap: 1rem;">
          <rhombus-avatar name="Ada Lovelace" size="sm" />
          <rhombus-avatar name="Ada Lovelace" size="md" />
          <rhombus-avatar name="Ada Lovelace" size="lg" />
          <rhombus-avatar name="Grace Hopper" />
          <rhombus-avatar name="Linus" />
        </div>
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
