import { Directive, input } from '@angular/core';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';

/**
 * `[rhombusTooltip]` — RhombusKit's wrapper over Angular Material's
 * `[matTooltip]`, composed via `hostDirectives` so consumers import only one
 * directive. Inputs are aliased with the `rhombusTooltip*` prefix (matching the
 * badge convention) so they don't collide with host-component inputs.
 *
 * The tooltip surface renders in the CDK overlay; its colour is themed through
 * the `--tooltip-bg` / `--tooltip-text` contract tokens, bridged in
 * `@rhombuskit/material-preset`.
 *
 * ```html
 * <button [rhombusTooltip]="'Archive this item'">Archive</button>
 * ```
 */
@Directive({
  selector: '[rhombusTooltip]',
  standalone: true,
  hostDirectives: [
    {
      directive: MatTooltip,
      inputs: [
        'matTooltip: rhombusTooltip',
        'matTooltipPosition: rhombusTooltipPosition',
        'matTooltipDisabled: rhombusTooltipDisabled',
        'matTooltipShowDelay: rhombusTooltipShowDelay',
        'matTooltipHideDelay: rhombusTooltipHideDelay',
      ],
    },
  ],
})
export class RhombusTooltipDirective {
  /** Tooltip text. Aliased `rhombusTooltip` for one-shot binding. */
  readonly message = input<string>('', { alias: 'rhombusTooltip' });
  /** Position relative to the host: `above` | `below` | `left` | `right` | `before` | `after` (default `below`). */
  readonly position = input<TooltipPosition>('below', {
    alias: 'rhombusTooltipPosition',
  });
  /** Disables the tooltip when `true` (default `false`). */
  readonly disabled = input<boolean>(false, {
    alias: 'rhombusTooltipDisabled',
  });
  /** Delay in ms before the tooltip shows on hover/focus (default `0`). */
  readonly showDelay = input<number>(0, { alias: 'rhombusTooltipShowDelay' });
  /** Delay in ms before the tooltip hides after the trigger ends (default `0`). */
  readonly hideDelay = input<number>(0, { alias: 'rhombusTooltipHideDelay' });
}
