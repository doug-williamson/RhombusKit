import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RhombusButtonComponent } from '@rhombuskit/core';

type ThemeName = 'rhombus-light' | 'rhombus-dark';

/**
 * Inline theme toggle for the showcase shell.
 * Phase 2 keeps this local to the app; in a later phase it moves into
 * `@rhombuskit/theme-engine` as a `ThemeService` + directive.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [RhombusButtonComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <rhombus-button
      variant="secondary"
      size="sm"
      appearance="outlined"
      (click)="toggle()"
      attr.aria-label="Switch to {{ theme() === 'rhombus-dark' ? 'light' : 'dark' }} theme"
    >
      <mat-icon aria-hidden="true">
        {{ theme() === 'rhombus-dark' ? 'light_mode' : 'dark_mode' }}
      </mat-icon>
      {{ theme() === 'rhombus-dark' ? 'Light' : 'Dark' }}
    </rhombus-button>
  `,
})
export class ThemeToggleComponent {
  private readonly doc = inject(DOCUMENT);

  readonly theme = signal<ThemeName>(
    (this.doc.documentElement.getAttribute('data-theme') as ThemeName) ??
      'rhombus-light'
  );

  toggle(): void {
    const next: ThemeName =
      this.theme() === 'rhombus-dark' ? 'rhombus-light' : 'rhombus-dark';
    this.doc.documentElement.setAttribute('data-theme', next);
    this.theme.set(next);
  }
}
