import { Directive } from '@angular/core';
import { CdkStepLabel } from '@angular/cdk/stepper';

/**
 * `[rhombusStepLabel]` — a rich (templated) label for a `<rhombus-step>` header.
 * Apply it to an `<ng-template>` inside the step to render markup in the step
 * header instead of the plain-text `label` input.
 *
 * Extends `CdkStepLabel` and re-provides it via `useExisting` so the inherited
 * `@ContentChild(CdkStepLabel)` query on the step resolves this directive.
 */
@Directive({
  selector: '[rhombusStepLabel]',
  standalone: true,
  providers: [{ provide: CdkStepLabel, useExisting: RhombusStepLabelDirective }],
})
export class RhombusStepLabelDirective extends CdkStepLabel {}
