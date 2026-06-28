import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  viewChild,
} from '@angular/core';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusAccordionDescriptionDirective } from './rhombus-accordion-description.directive';

/** Per-instance id seed for header ↔ region ARIA wiring (SSR-safe, deterministic). */
let nextId = 0;

/**
 * `<rhombus-accordion-panel>` — one collapsible section inside
 * `<rhombus-accordion>`. A native `<button>` header (inside an `<h3>`) toggles a
 * `role="region"` body, wired with `aria-expanded` / `aria-controls` /
 * `aria-labelledby`. The panel owns its own open state via the two-way
 * `expanded` model; the parent accordion enforces single- vs multi-expand and
 * arrow-key roving. Themed entirely off the @rhombuskit/tokens contract.
 *
 * Header content: use the `title` / `description` string inputs for the simple
 * case, or project `[rhombusAccordionTitle]` / `[rhombusAccordionDescription]`
 * for rich content. Body content is the default slot.
 */
@Component({
  selector: 'rhombus-accordion-panel',
  standalone: true,
  imports: [RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      class="rhombus-accordion__panel"
      [class.rhombus-accordion__panel--expanded]="expanded()"
      [class.rhombus-accordion__panel--disabled]="disabled()"
    >
      <h3 class="rhombus-accordion__heading">
        <button
          #trigger
          type="button"
          class="rhombus-accordion__trigger"
          [id]="headerId"
          [attr.aria-expanded]="expanded()"
          [attr.aria-controls]="regionId"
          [attr.aria-disabled]="disabled() ? 'true' : null"
          (click)="toggle()"
        >
          <span class="rhombus-accordion__heading-text">
            <span class="rhombus-accordion__title">
              @if (title()) {
                {{ title() }}
              } @else {
                <ng-content select="[rhombusAccordionTitle]" />
              }
            </span>
            @if (description()) {
              <span class="rhombus-accordion__description">{{ description() }}</span>
            } @else if (hasProjectedDescription()) {
              <span class="rhombus-accordion__description">
                <ng-content select="[rhombusAccordionDescription]" />
              </span>
            }
          </span>
          <rhombus-icon
            class="rhombus-accordion__chevron"
            [class.rhombus-accordion__chevron--open]="expanded()"
            name="chevron_right"
          />
        </button>
      </h3>

      <div
        class="rhombus-accordion__region"
        [id]="regionId"
        role="region"
        [attr.aria-labelledby]="headerId"
        [attr.inert]="expanded() ? null : ''"
      >
        <div class="rhombus-accordion__region-inner">
          <div class="rhombus-accordion__content">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RhombusAccordionPanelComponent {
  /** Two-way open state. Defaults to collapsed. */
  readonly expanded = model(false);
  /** Disables the panel: the header stays focusable (per APG) but won't toggle. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Plain-text header title; for rich content project `[rhombusAccordionTitle]`. */
  readonly title = input<string>('');
  /** Plain-text secondary header line; for rich content project `[rhombusAccordionDescription]`. */
  readonly description = input<string>('');

  private readonly descriptionRef = contentChild(
    RhombusAccordionDescriptionDirective
  );
  protected readonly hasProjectedDescription = computed(
    () => !!this.descriptionRef()
  );

  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  private readonly base = `rhombus-accordion-${nextId++}`;
  protected readonly headerId = `${this.base}-header`;
  protected readonly regionId = `${this.base}-region`;

  /** Toggle open/closed unless disabled. Called from the header click + Enter/Space. */
  toggle(): void {
    if (this.disabled()) return;
    this.expanded.update((v) => !v);
  }

  /** The header button element — used by the parent accordion for arrow-key roving. */
  headerElement(): HTMLButtonElement {
    return this.trigger().nativeElement;
  }

  /** Move focus to this panel's header (parent-driven roving). */
  focusHeader(): void {
    this.headerElement().focus();
  }
}
