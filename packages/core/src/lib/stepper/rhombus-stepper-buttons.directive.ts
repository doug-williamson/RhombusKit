import { Directive } from '@angular/core';
import { CdkStepperNext, CdkStepperPrevious } from '@angular/cdk/stepper';

/**
 * `button[rhombusStepperNext]` — advances the enclosing `<rhombus-stepper>` to
 * the next step. Extends `CdkStepperNext`, which injects the stepper (resolved
 * to `RhombusStepperComponent` through its `useExisting` `CdkStepper` provider)
 * and supplies the inherited `(click)` → `next()` and `[type]` host bindings.
 */
@Directive({
  selector: 'button[rhombusStepperNext]',
  standalone: true,
  host: { class: 'rhombus-stepper-next' },
})
export class RhombusStepperNextDirective extends CdkStepperNext {}

/**
 * `button[rhombusStepperPrevious]` — returns the enclosing `<rhombus-stepper>`
 * to the previous step. Inherits `(click)` → `previous()` from
 * `CdkStepperPrevious`.
 */
@Directive({
  selector: 'button[rhombusStepperPrevious]',
  standalone: true,
  host: { class: 'rhombus-stepper-previous' },
})
export class RhombusStepperPreviousDirective extends CdkStepperPrevious {}
