import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import {
  MatProgressSpinnerModule,
  ProgressSpinnerMode,
} from '@angular/material/progress-spinner';

/**
 * `<rhombus-spinner>` — a circular activity indicator wrapping
 * `<mat-progress-spinner>`. Indeterminate by default; pass
 * `mode="determinate"` with a `value` for progress. The arc is themed via
 * `--text-accent` in `@rhombuskit/material-preset`.
 *
 * ```html
 * <rhombus-spinner ariaLabel="Loading results" />
 * <rhombus-spinner mode="determinate" [value]="uploadPercent()" />
 * ```
 */
@Component({
  selector: 'rhombus-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-spinner.component.scss',
  template: `
    <mat-progress-spinner
      class="rhombus-spinner"
      [mode]="mode()"
      [value]="value()"
      [diameter]="diameter()"
      [strokeWidth]="strokeWidth()"
      [attr.aria-label]="ariaLabel()"
    />
  `,
})
export class RhombusSpinnerComponent {
  /** `'indeterminate'` (default) or `'determinate'`. */
  readonly mode = input<ProgressSpinnerMode>('indeterminate');
  /** Progress 0–100, used in determinate mode. */
  readonly value = input<number>(0);
  /** Diameter in px. Defaults to `40`. */
  readonly diameter = input<number>(40);
  /** Stroke width in px. Defaults to `4`. */
  readonly strokeWidth = input<number>(4);
  /** Accessible label. Defaults to `'Loading'`. */
  readonly ariaLabel = input<string>('Loading');
}
