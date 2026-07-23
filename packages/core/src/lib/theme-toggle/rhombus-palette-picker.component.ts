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
 * Palette picker: a standalone switcher for the palette (colour-family) axis.
 * Items call `setPalette`, which switches family while keeping the current mode
 * (and preserving "follow OS" if active). The active palette is highlighted and
 * exposed as `aria-checked`.
 *
 * Renders nothing until more than one palette is registered (via
 * `provideRhombusThemes()`), so an app with a single palette shows no control
 * at all — pair it with `<rhombus-mode-menu>` and the header degrades to just
 * the mode picker. For a single combined control, use `<rhombus-theme-menu>`.
 */
@Component({
  selector: 'rhombus-palette-picker',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-palette-picker.component.scss',
  template: `
    @if (palettes().length > 1) {
      <button
        matIconButton
        [matMenuTriggerFor]="menu"
        [attr.aria-label]="ariaLabel()"
        class="rhombus-palette-picker__trigger"
      >
        <rhombus-icon [name]="currentIcon()" />
      </button>
      <mat-menu #menu="matMenu" class="rhombus-palette-picker__panel">
        <div role="group" aria-label="Palette">
          @for (p of palettes(); track p.palette) {
            <button
              mat-menu-item
              role="menuitemradio"
              [attr.aria-checked]="theme.palette() === p.palette"
              (click)="theme.setPalette(p.palette)"
              [class.rhombus-palette-picker__item--active]="
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
      </mat-menu>
    }
  `,
})
export class RhombusPalettePickerComponent {
  protected readonly theme = inject(RhombusThemeService);

  /** Optional per-palette icon overrides, keyed by palette id (items + trigger). */
  readonly themeIcons = input<Record<string, string>>({});
  /** Trigger icon when the active palette has no `themeIcons` entry; defaults to `'palette'`. */
  readonly defaultIcon = input<string>('palette');

  /** Registered palettes; the control renders only when there's more than one. */
  protected readonly palettes = this.theme.palettes;

  protected readonly currentIcon = computed(
    () => this.themeIcons()[this.theme.palette()] ?? this.defaultIcon(),
  );

  protected readonly ariaLabel = computed(() => {
    const active = this.theme
      .palettes()
      .find((p) => p.palette === this.theme.palette());
    return `Palette: ${active?.label ?? this.theme.palette()}. Open palette menu.`;
  });
}
