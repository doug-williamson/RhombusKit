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
import { RhombusThemeService } from '@rhombuskit/theme-engine';
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

  /** `'system'` when following the OS (any palette), else the active theme's resolved mode. */
  protected readonly activeMode = computed<'light' | 'dark' | 'system'>(() =>
    this.theme.followsSystem() ? 'system' : this.theme.mode(),
  );

  protected readonly currentIcon = computed(() => {
    switch (this.activeMode()) {
      case 'light':
        return this.lightIcon();
      case 'dark':
        return this.darkIcon();
      default:
        return this.systemIcon();
    }
  });

  protected readonly tooltipText = computed(() => {
    if (!this.showTooltip()) return '';
    switch (this.activeMode()) {
      case 'light':
        return 'Light mode (click for dark)';
      case 'dark':
        return 'Dark mode (click for system)';
      default:
        return 'System mode (click for light)';
    }
  });

  protected readonly ariaLabel = computed(() => {
    const mode = this.activeMode();
    if (mode === 'system') return 'Switch theme — current: System';
    if (this.theme.palettes().length <= 1) {
      return `Switch theme — current: ${mode}`;
    }
    const active = this.theme
      .palettes()
      .find((p) => p.palette === this.theme.palette());
    return `Switch theme — current: ${active?.label ?? this.theme.palette()}, ${mode}`;
  });

  protected onToggle(): void {
    this.theme.toggle();
  }
}
