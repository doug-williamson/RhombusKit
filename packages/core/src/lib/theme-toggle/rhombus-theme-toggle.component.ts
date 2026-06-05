import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RHOMBUS_THEME_CONFIG, RhombusThemeService } from '@rhombuskit/theme-engine';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';

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
  imports: [MatButtonModule, MatTooltipModule, RhombusIconComponent],
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
      <rhombus-icon [name]="currentIcon()" />
    </button>
  `,
})
export class RhombusThemeToggleComponent {
  private readonly theme = inject(RhombusThemeService);
  /** Resolved theme names (rhombus-* unless provideRhombusTheme overrides). */
  private readonly config = inject(RHOMBUS_THEME_CONFIG);

  // Icon overrides — consumers can substitute brand-specific icons.
  /** Icon shown when the light theme is active; defaults to `'light_mode'`. */
  readonly lightIcon = input<string>('light_mode');
  /** Icon shown when the dark theme is active; defaults to `'dark_mode'`. */
  readonly darkIcon = input<string>('dark_mode');
  /** Icon shown when the system preference is active; defaults to `'contrast'`. */
  readonly systemIcon = input<string>('contrast');

  // Tooltip + a11y override.
  /** Whether to show the hover tooltip describing the current/next theme. */
  readonly showTooltip = input<boolean>(true);

  protected readonly currentIcon = computed(() => {
    const pref = this.theme.preference();
    if (pref === this.config.light) return this.lightIcon();
    if (pref === this.config.dark) return this.darkIcon();
    return this.systemIcon(); // 'system'
  });

  protected readonly tooltipText = computed(() => {
    if (!this.showTooltip()) return '';
    const pref = this.theme.preference();
    if (pref === this.config.light) return 'Light mode (click for dark)';
    if (pref === this.config.dark) return 'Dark mode (click for system)';
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
