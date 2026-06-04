import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RhombusAvatarComponent } from '@rhombuskit/core';

@Component({
  selector: 'app-avatar-page',
  standalone: true,
  imports: [RhombusAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page">
      <header class="showcase-page__header">
        <h1>Avatar</h1>
        <p>
          <code>&lt;rhombus-avatar&gt;</code> renders a circular avatar from an
          image (<code>src</code>, with <code>name</code> as its
          <code>alt</code>) or, when no image is given, initials derived from
          <code>name</code> — exposing the name as the accessible label
          (<code>role="img"</code>). Bespoke; no new tokens.
        </p>
      </header>

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
  `,
  styles: `
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
      max-width: 70ch;
    }
  `,
})
export default class AvatarPageComponent {}
