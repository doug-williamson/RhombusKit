import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import {
  MatProgressBarModule,
  ProgressBarMode,
} from '@angular/material/progress-bar';

/**
 * `<rhombus-progress-bar>` — a linear progress indicator wrapping
 * `<mat-progress-bar>`. Determinate by default; also supports
 * `'indeterminate'`, `'buffer'`, and `'query'`. The indicator is themed via
 * `--text-accent` and the track via `--surface-2`.
 *
 * ```html
 * <rhombus-progress-bar [value]="uploadPercent()" />
 * <rhombus-progress-bar mode="indeterminate" ariaLabel="Saving" />
 * ```
 */
@Component({
  selector: 'rhombus-progress-bar',
  standalone: true,
  imports: [MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-progress-bar.component.scss',
  template: `
    <mat-progress-bar
      class="rhombus-progress-bar"
      [mode]="mode()"
      [value]="value()"
      [bufferValue]="bufferValue()"
      [attr.aria-label]="ariaLabel()"
    />
  `,
})
export class RhombusProgressBarComponent {
  /** `'determinate'` (default), `'indeterminate'`, `'buffer'`, or `'query'`. */
  readonly mode = input<ProgressBarMode>('determinate');
  /** Progress 0–100, used in determinate / buffer modes. */
  readonly value = input<number>(0);
  /** Secondary progress 0–100, used in buffer mode. */
  readonly bufferValue = input<number>(0);
  /** Accessible label. Defaults to `'Progress'`. */
  readonly ariaLabel = input<string>('Progress');
}
