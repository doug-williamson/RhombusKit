/** Public type surface for the RhombusKit stepper family. */

/** Layout axis of a {@link RhombusStepperComponent}. */
export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Where a horizontal stepper renders each step's text label relative to its
 * indicator: `'end'` (beside) or `'bottom'` (underneath). Ignored when the
 * stepper is vertical.
 */
export type StepperLabelPosition = 'end' | 'bottom';

/**
 * The indicator a step header renders. `'number'` shows the 1-based step index;
 * `'edit'` / `'done'` / `'error'` render the matching registered glyph. Mirrors
 * the CDK step-state contract, narrowed to the states RhombusKit draws.
 */
export type RhombusStepState = 'number' | 'edit' | 'done' | 'error';
