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
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly appearance = input<ButtonAppearance>('filled');
  readonly disabled = input<boolean>(false);
  readonly leadingIcon = input<string | null>(null);
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
