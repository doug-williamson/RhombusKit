import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { CdkStep } from '@angular/cdk/stepper';

/**
 * `<rhombus-step>` — one step inside a `<rhombus-stepper>`. Extends `CdkStep`,
 * inheriting its decorator inputs (`label`, `stepControl`, `optional`,
 * `editable`, `completed`, `state`, `errorMessage`, `aria-label` /
 * `aria-labelledby`) — a documented exception to the signal-inputs house rule,
 * since they are supplied by the CDK base.
 *
 * The projected content is captured into `<ng-template>` (the CdkStep
 * contract) so the parent stepper renders it lazily in the matching panel.
 * `useExisting` re-provides `CdkStep` so the stepper's inherited
 * `@ContentChildren(CdkStep)` query resolves this subclass.
 */
@Component({
  selector: 'rhombus-step',
  standalone: true,
  template: '<ng-template><ng-content /></ng-template>',
  providers: [{ provide: CdkStep, useExisting: RhombusStepComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RhombusStepComponent extends CdkStep {
  /** Sub-label shown under an optional step's title. */
  readonly optionalLabel = input<string>('Optional');
}
