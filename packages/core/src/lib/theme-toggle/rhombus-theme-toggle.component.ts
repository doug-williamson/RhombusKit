import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RhombusThemeService } from '@rhombuskit/theme-engine';

/**
 * Three-state theme toggle: light → dark → system → light.
 *
 * Wraps Material's icon button. Click cycles the user's preference via
 * RhombusThemeService.toggle().
 *
 * For a 2-state toggle (light ↔ dark, no system option), don't use this
 * component — wire a custom button to RhombusThemeService.setTheme() directly.
 */
@Component({
  selector: 'rhombus-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-theme-toggle.component.scss',
  template: `
    <button
      matIconButton
      [matTooltip]="tooltipText()"
      [attr.aria-label]="ariaLabel()"
      class="rhombus-theme-toggle"
      (click)="onToggle()"
    >
      <mat-icon>{{ currentIcon() }}</mat-icon>
    </button>
  `,
})
export class RhombusThemeToggleComponent {
  private readonly theme = inject(RhombusThemeService);

  // Icon overrides — consumers can substitute brand-specific icons.
  readonly lightIcon = input<string>('light_mode');
  readonly darkIcon = input<string>('dark_mode');
  readonly systemIcon = input<string>('contrast');

  // Tooltip + a11y override.
  readonly showTooltip = input<boolean>(true);

  protected readonly currentIcon = computed(() => {
    const pref = this.theme.preference();
    if (pref === 'rhombus-light') return this.lightIcon();
    if (pref === 'rhombus-dark') return this.darkIcon();
    return this.systemIcon(); // 'system'
  });

  protected readonly tooltipText = computed(() => {
    if (!this.showTooltip()) return '';
    const pref = this.theme.preference();
    if (pref === 'rhombus-light') return 'Light mode (click for dark)';
    if (pref === 'rhombus-dark') return 'Dark mode (click for system)';
    return 'System mode (click for light)';
  });

  protected readonly ariaLabel = computed(() => {
    const pref = this.theme.preference();
    return `Switch theme — current: ${pref}`;
  });

  protected onToggle(): void {
    this.theme.toggle();
  }
}
