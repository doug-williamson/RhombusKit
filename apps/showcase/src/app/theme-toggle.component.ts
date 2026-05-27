import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

type ThemeName = 'rhombus-light' | 'rhombus-dark';

/**
 * Icon-only theme toggle for the showcase shell header.
 * Phase 2 keeps this local; in a later phase it moves into
 * `@rhombuskit/theme-engine` as a `ThemeService` + directive.
 *
 * Uses Material 21's `<button matIconButton>` directly (rather than
 * wrapping rhombus-button) because the icon-only variant has its own
 * sizing / padding tokens and reads cleanly in a header.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      matIconButton
      class="theme-toggle"
      (click)="toggle()"
      [attr.aria-label]="ariaLabel()"
      [title]="ariaLabel()"
    >
      <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
    </button>
  `,
  styles: `
    .theme-toggle {
      color: var(--text-primary);

      &:hover {
        color: var(--text-accent);
      }
    }
  `,
})
export class ThemeToggleComponent {
  private readonly doc = inject(DOCUMENT);

  readonly theme = signal<ThemeName>(
    (this.doc.documentElement.getAttribute('data-theme') as ThemeName) ??
      'rhombus-light'
  );

  /** Icon name shows the theme the toggle will switch TO. */
  protected readonly icon = computed(() =>
    this.theme() === 'rhombus-dark' ? 'light_mode' : 'dark_mode'
  );

  protected readonly ariaLabel = computed(
    () =>
      `Switch to ${this.theme() === 'rhombus-dark' ? 'light' : 'dark'} theme`
  );

  toggle(): void {
    const next: ThemeName =
      this.theme() === 'rhombus-dark' ? 'rhombus-light' : 'rhombus-dark';
    this.doc.documentElement.setAttribute('data-theme', next);
    this.theme.set(next);
  }
}
