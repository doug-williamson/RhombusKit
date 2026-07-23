import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RhombusThemeService } from '@rhombuskit/theme-engine';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';

/**
 * Mode menu: a standalone Light / Dark / System picker (the mode axis on its
 * own). The items set the MODE within the active palette (`setMode`), so
 * choosing one never discards a non-default palette. The active mode is
 * highlighted and exposed as `aria-checked`; the trigger icon reflects it.
 *
 * This is the mode half of the split theme controls — pair it with
 * `<rhombus-palette-picker>` for the palette axis. For a single combined
 * control, use `<rhombus-theme-menu>`; for a compact icon cycle, use
 * `<rhombus-theme-toggle>`.
 */
@Component({
  selector: 'rhombus-mode-menu',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-mode-menu.component.scss',
  template: `
    <button
      matIconButton
      [matMenuTriggerFor]="menu"
      [attr.aria-label]="ariaLabel()"
      class="rhombus-mode-menu__trigger"
    >
      <rhombus-icon [name]="currentIcon()" />
    </button>
    <mat-menu #menu="matMenu" class="rhombus-mode-menu__panel">
      <div role="group" aria-label="Mode">
        <button
          mat-menu-item
          role="menuitemradio"
          [attr.aria-checked]="activeMode() === 'light'"
          (click)="theme.setMode('light')"
          [class.rhombus-mode-menu__item--active]="activeMode() === 'light'"
        >
          <rhombus-icon [name]="lightIcon()" />
          <span>Light</span>
        </button>
        <button
          mat-menu-item
          role="menuitemradio"
          [attr.aria-checked]="activeMode() === 'dark'"
          (click)="theme.setMode('dark')"
          [class.rhombus-mode-menu__item--active]="activeMode() === 'dark'"
        >
          <rhombus-icon [name]="darkIcon()" />
          <span>Dark</span>
        </button>
        <button
          mat-menu-item
          role="menuitemradio"
          [attr.aria-checked]="activeMode() === 'system'"
          (click)="theme.setMode('system')"
          [class.rhombus-mode-menu__item--active]="activeMode() === 'system'"
        >
          <rhombus-icon [name]="systemIcon()" />
          <span>System</span>
        </button>
      </div>
    </mat-menu>
  `,
})
export class RhombusModeMenuComponent {
  protected readonly theme = inject(RhombusThemeService);

  // Icon overrides — consumers can substitute brand-specific icons.
  /** Icon for the Light item and the trigger in light mode; defaults to `'light_mode'`. */
  readonly lightIcon = input<string>('light_mode');
  /** Icon for the Dark item and the trigger in dark mode; defaults to `'dark_mode'`. */
  readonly darkIcon = input<string>('dark_mode');
  /** Icon for the System item and the trigger when following the OS; defaults to `'contrast'`. */
  readonly systemIcon = input<string>('contrast');

  /** `'system'` when following the OS (any palette), else the resolved light/dark mode. */
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

  protected readonly ariaLabel = computed(
    () => `Theme mode: ${this.activeMode()}. Open mode menu.`,
  );
}
