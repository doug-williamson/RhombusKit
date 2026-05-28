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
import { MatMenuModule } from '@angular/material/menu';
import { RhombusThemeService } from '@rhombuskit/theme-engine';

/**
 * Theme menu: explicit Light / Dark / System options.
 *
 * Wraps Material's MatMenu. Unlike the cycling toggle, each item calls
 * RhombusThemeService.setTheme() directly, so any preference is reachable in a
 * single click. The active preference is highlighted via an accent color;
 * clicking it is a visual no-op.
 *
 * Prefer this in headers and toolbars where there's room for a dropdown. For
 * compact contexts (a tight icon row), use RhombusThemeToggleComponent.
 */
@Component({
  selector: 'rhombus-theme-menu',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-theme-menu.component.scss',
  template: `
    <button
      matIconButton
      [matMenuTriggerFor]="menu"
      [attr.aria-label]="ariaLabel()"
      class="rhombus-theme-menu__trigger"
    >
      <mat-icon>{{ currentIcon() }}</mat-icon>
    </button>
    <mat-menu #menu="matMenu" class="rhombus-theme-menu__panel">
      <button
        mat-menu-item
        (click)="theme.setTheme('rhombus-light')"
        [class.rhombus-theme-menu__item--active]="
          theme.preference() === 'rhombus-light'
        "
      >
        <mat-icon>{{ lightIcon() }}</mat-icon>
        <span>Light</span>
      </button>
      <button
        mat-menu-item
        (click)="theme.setTheme('rhombus-dark')"
        [class.rhombus-theme-menu__item--active]="
          theme.preference() === 'rhombus-dark'
        "
      >
        <mat-icon>{{ darkIcon() }}</mat-icon>
        <span>Dark</span>
      </button>
      <button
        mat-menu-item
        (click)="theme.setTheme('system')"
        [class.rhombus-theme-menu__item--active]="
          theme.preference() === 'system'
        "
      >
        <mat-icon>{{ systemIcon() }}</mat-icon>
        <span>System</span>
      </button>
    </mat-menu>
  `,
})
export class RhombusThemeMenuComponent {
  protected readonly theme = inject(RhombusThemeService);

  // Icon overrides — consumers can substitute brand-specific icons.
  readonly lightIcon = input<string>('light_mode');
  readonly darkIcon = input<string>('dark_mode');
  readonly systemIcon = input<string>('contrast');

  protected readonly currentIcon = computed(() => {
    const pref = this.theme.preference();
    if (pref === 'rhombus-light') return this.lightIcon();
    if (pref === 'rhombus-dark') return this.darkIcon();
    return this.systemIcon(); // 'system'
  });

  protected readonly ariaLabel = computed(
    () => `Theme: ${this.theme.preference()}. Open theme menu.`,
  );
}
