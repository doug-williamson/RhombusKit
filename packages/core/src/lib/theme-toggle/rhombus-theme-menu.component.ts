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
 * Theme menu: a Light / Dark / System mode picker, plus a palette picker that
 * appears when more than one theme palette is registered (via
 * provideRhombusThemes()).
 *
 * Wraps Material's MatMenu. The Light/Dark/System items set the MODE within the
 * active palette (`setMode`), so choosing one never discards a non-default
 * palette; the palette section switches palette family (`setPalette`) while
 * keeping the current mode. Each axis is a radio group: the active mode and
 * palette are highlighted and exposed as `aria-checked`.
 *
 * Prefer this in headers and toolbars. For a compact icon row, use
 * RhombusThemeToggleComponent.
 */
@Component({
  selector: 'rhombus-theme-menu',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, RhombusIconComponent],
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
      <rhombus-icon [name]="currentIcon()" />
    </button>
    <mat-menu #menu="matMenu" class="rhombus-theme-menu__panel">
      <div role="group" aria-label="Mode">
        <button
          mat-menu-item
          role="menuitemradio"
          [attr.aria-checked]="activeMode() === 'light'"
          (click)="theme.setMode('light')"
          [class.rhombus-theme-menu__item--active]="activeMode() === 'light'"
        >
          <rhombus-icon [name]="lightIcon()" />
          <span>Light</span>
        </button>
        <button
          mat-menu-item
          role="menuitemradio"
          [attr.aria-checked]="activeMode() === 'dark'"
          (click)="theme.setMode('dark')"
          [class.rhombus-theme-menu__item--active]="activeMode() === 'dark'"
        >
          <rhombus-icon [name]="darkIcon()" />
          <span>Dark</span>
        </button>
        <button
          mat-menu-item
          role="menuitemradio"
          [attr.aria-checked]="activeMode() === 'system'"
          (click)="theme.setMode('system')"
          [class.rhombus-theme-menu__item--active]="activeMode() === 'system'"
        >
          <rhombus-icon [name]="systemIcon()" />
          <span>System</span>
        </button>
      </div>

      @if (palettes().length > 1) {
        <div
          role="group"
          aria-label="Palette"
          class="rhombus-theme-menu__palettes"
        >
          @for (p of palettes(); track p.palette) {
            <button
              mat-menu-item
              role="menuitemradio"
              [attr.aria-checked]="theme.palette() === p.palette"
              (click)="theme.setPalette(p.palette)"
              [class.rhombus-theme-menu__item--active]="
                theme.palette() === p.palette
              "
            >
              @if (themeIcons()[p.palette]; as icon) {
                <rhombus-icon [name]="icon" />
              }
              <span>{{ p.label }}</span>
            </button>
          }
        </div>
      }
    </mat-menu>
  `,
})
export class RhombusThemeMenuComponent {
  protected readonly theme = inject(RhombusThemeService);

  // Icon overrides — consumers can substitute brand-specific icons.
  /** Icon for the Light menu item; defaults to `'light_mode'`. */
  readonly lightIcon = input<string>('light_mode');
  /** Icon for the Dark menu item; defaults to `'dark_mode'`. */
  readonly darkIcon = input<string>('dark_mode');
  /** Icon for the System menu item; defaults to `'contrast'`. */
  readonly systemIcon = input<string>('contrast');
  /** Optional per-palette icon overrides for the palette section, keyed by palette id. */
  readonly themeIcons = input<Record<string, string>>({});

  /** Registered palettes (a palette section renders only when there's >1). */
  protected readonly palettes = this.theme.palettes;

  /** `'system'` when following the OS, else the resolved light/dark mode. */
  protected readonly activeMode = computed<'light' | 'dark' | 'system'>(() =>
    this.theme.preference() === 'system' ? 'system' : this.theme.mode(),
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

  protected readonly ariaLabel = computed(() => {
    const mode = this.activeMode();
    if (mode === 'system') return 'Theme: System. Open theme menu.';
    if (this.theme.palettes().length <= 1) {
      return `Theme: ${mode}. Open theme menu.`;
    }
    const active = this.theme
      .palettes()
      .find((p) => p.palette === this.theme.palette());
    return `Theme: ${active?.label ?? this.theme.palette()}, ${mode}. Open theme menu.`;
  });
}
