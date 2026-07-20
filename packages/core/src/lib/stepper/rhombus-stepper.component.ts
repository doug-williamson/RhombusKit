import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CdkStep,
  CdkStepHeader,
  CdkStepper,
  STEPPER_GLOBAL_OPTIONS,
} from '@angular/cdk/stepper';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusStepComponent } from './rhombus-step.component';
import { StepperLabelPosition } from './stepper.types';

/**
 * `<rhombus-stepper>` — an accessible wizard that walks the user through a
 * sequence of `<rhombus-step>`s. It **extends `CdkStepper`**, inheriting the
 * CDK's linear gating, `stepControl` validation, selection state, and
 * roving-focus keyboard model for free — no `@angular/material`, no
 * `--mat-sys-*`, no new peer. The chrome (a `role="tablist"` of step headers
 * plus `role="tabpanel"` content) is themed entirely off the
 * `@rhombuskit/tokens` contract.
 *
 * A single DOM structure serves both orientations; CSS lays the tablist out as
 * a row above the content (`horizontal`) or a rail beside it (`vertical`).
 * Activation is **manual** (arrows roam focus, Enter/Space commit), inherited
 * from `CdkStepper._onKeydown`.
 *
 * `orientation`, `linear`, `[(selectedIndex)]`, and `selected` are **inherited
 * CDK decorator inputs** — a documented exception to the signal-inputs house
 * rule, since the base class owns them (and its `selectedIndex` setter already
 * throws on an out-of-range assignment). `useExisting` re-provides `CdkStepper`
 * so `[rhombusStepperNext]`/`[rhombusStepperPrevious]` resolve this instance.
 *
 * Boundary: use a Stepper for a **sequential** flow that gates progress. For
 * peer sections the user visits in any order use Tabs; for independent
 * collapsible disclosure use Accordion.
 */
@Component({
  selector: 'rhombus-stepper',
  standalone: true,
  imports: [NgTemplateOutlet, CdkStepHeader, RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-stepper.component.scss',
  providers: [
    { provide: CdkStepper, useExisting: RhombusStepperComponent },
    // Show the error indicator once a linear step's control is invalid AND the
    // user has attempted to move past it (CdkStep gates on `interacted`).
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
  ],
  host: {
    class: 'rhombus-stepper',
    '[class.rhombus-stepper--horizontal]': "orientation === 'horizontal'",
    '[class.rhombus-stepper--vertical]': "orientation === 'vertical'",
    '[class.rhombus-stepper--label-bottom]':
      "orientation === 'horizontal' && labelPosition() === 'bottom'",
  },
  template: `
    <!-- SSR hydration anchor for the projected steps (browser renders nothing). -->
    @if (_isServer) {
      <ng-content />
    }

    <div
      class="rhombus-stepper__header"
      role="tablist"
      [attr.aria-orientation]="orientation"
    >
      @for (step of steps; track step; let i = $index) {
        <button
          cdkStepHeader
          type="button"
          class="rhombus-stepper__tab"
          role="tab"
          [id]="_getStepLabelId(i)"
          [attr.aria-controls]="_getStepContentId(i)"
          [attr.aria-selected]="step.isSelected()"
          [attr.aria-disabled]="step.isNavigable() ? null : 'true'"
          [tabindex]="_getFocusIndex() === i ? 0 : -1"
          [class.rhombus-stepper__tab--selected]="step.isSelected()"
          [class.rhombus-stepper__tab--disabled]="!step.isNavigable()"
          [class.rhombus-stepper__tab--error]="step.indicatorType() === 'error'"
          (click)="step.select()"
          (keydown)="_onKeydown($event)"
        >
          <span
            class="rhombus-stepper__indicator"
            [attr.data-state]="step.indicatorType()"
          >
            @switch (step.indicatorType()) {
              @case ('edit') {
                <rhombus-icon name="edit" />
                <span class="rhombus-stepper__sr">Editable step. </span>
              }
              @case ('done') {
                <rhombus-icon name="done" />
                <span class="rhombus-stepper__sr">Completed step. </span>
              }
              @case ('error') {
                <rhombus-icon name="error" />
                <span class="rhombus-stepper__sr">Step with an error. </span>
              }
              @default {
                <span aria-hidden="true">{{ i + 1 }}</span>
              }
            }
          </span>

          <span class="rhombus-stepper__label">
            <span class="rhombus-stepper__title">
              @if (step.stepLabel) {
                <ng-container
                  [ngTemplateOutlet]="step.stepLabel.template"
                />
              } @else {
                {{ step.label }}
              }
            </span>
            @if (step.optional) {
              <span class="rhombus-stepper__optional">{{
                asStep(step).optionalLabel()
              }}</span>
            }
            @if (step.indicatorType() === 'error' && step.errorMessage) {
              <span class="rhombus-stepper__error">{{ step.errorMessage }}</span>
            }
          </span>
        </button>
      }
    </div>

    <div class="rhombus-stepper__content">
      @for (step of steps; track step; let i = $index) {
        <div
          class="rhombus-stepper__panel"
          role="tabpanel"
          [id]="_getStepContentId(i)"
          [attr.aria-labelledby]="_getStepLabelId(i)"
          [class.rhombus-stepper__panel--active]="selectedIndex === i"
          [attr.inert]="selectedIndex === i ? null : ''"
        >
          <ng-container [ngTemplateOutlet]="step.content" />
        </div>
      }
    </div>
  `,
})
export class RhombusStepperComponent extends CdkStepper {
  /**
   * Where a horizontal stepper draws each step's label relative to its
   * indicator. Ignored when vertical. (A new signal input; `orientation`,
   * `linear`, `selectedIndex`, and `selected` are inherited from `CdkStepper`.)
   */
  readonly labelPosition = input<StepperLabelPosition>('end');

  /** Emits the newly selected step index whenever the selection changes. */
  readonly stepChange = output<number>();

  /**
   * Headers live in this component's view, so override the CDK content query
   * with a view query. The empty-`QueryList` initializer satisfies the base
   * property override; Angular replaces it once the view is queried.
   */
  @ViewChildren(CdkStepHeader)
  override _stepHeader: QueryList<CdkStepHeader> = new QueryList<CdkStepHeader>();

  protected readonly _isServer = !isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    super();
    this.selectionChange
      .pipe(takeUntilDestroyed())
      .subscribe((event) => this.stepChange.emit(event.selectedIndex));
  }

  /** Narrow a CDK step back to the Rhombus subclass for its extra inputs. */
  protected asStep(step: CdkStep): RhombusStepComponent {
    return step as RhombusStepComponent;
  }
}
