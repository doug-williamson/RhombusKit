import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Visual variant — picks the colour role applied to the button.
 * `primary` and `secondary` use the system token bridge defaults;
 * `ghost` and `danger` locally rebind `--mat-sys-primary` for their look.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Padding scale. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Material 21 button appearance. `tonal` and `elevated` are accepted by
 * MatButton but intentionally not part of RhombusKit's public API in
 * Phase 2 — we ship a curated subset.
 */
export type ButtonAppearance = 'filled' | 'outlined' | 'text';

@Component({
  selector: 'rhombus-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-button.component.scss',
  template: `
    <button
      [matButton]="appearance()"
      [disabled]="disabled()"
      [class]="hostClasses()"
    >
      @if (leadingIcon()) {
        <mat-icon>{{ leadingIcon() }}</mat-icon>
      }
      <ng-content />
      @if (trailingIcon()) {
        <mat-icon iconPositionEnd>{{ trailingIcon() }}</mat-icon>
      }
    </button>
  `,
})
export class RhombusButtonComponent {
  /** Colour role: `primary` (default) | `secondary` | `ghost` | `danger`. */
  readonly variant = input<ButtonVariant>('primary');
  /** Padding scale: `sm` | `md` (default) | `lg`. */
  readonly size = input<ButtonSize>('md');
  /** MatButton appearance: `filled` (default) | `outlined` | `text`. */
  readonly appearance = input<ButtonAppearance>('filled');
  /** Disables the button when `true`. Defaults to `false`. */
  readonly disabled = input<boolean>(false);
  /** Material icon name rendered before the projected label; `null` (default) hides it. */
  readonly leadingIcon = input<string | null>(null);
  /** Material icon name rendered after the projected label; `null` (default) hides it. */
  readonly trailingIcon = input<string | null>(null);

  protected readonly hostClasses = computed(() =>
    [
      'rhombus-button',
      `rhombus-button--${this.variant()}`,
      `rhombus-button--${this.size()}`,
      `rhombus-button--${this.appearance()}`,
    ].join(' ')
  );
}
