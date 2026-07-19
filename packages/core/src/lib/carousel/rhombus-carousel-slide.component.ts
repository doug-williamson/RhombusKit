import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  signal,
} from '@angular/core';

/**
 * `<rhombus-carousel-slide>` — one slide inside a `<rhombus-carousel>`. Its host
 * carries `role="group"` + `aria-roledescription="slide"` (APG Carousel: slides
 * are groups, **not** tabpanels) and an accessible name — the `label` input, or
 * an auto "N of M" fallback the parent supplies. Non-active slides are marked
 * `aria-hidden` and `inert` so they're skipped by assistive tech and the tab
 * order.
 */
@Component({
  selector: 'rhombus-carousel-slide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'rhombus-carousel-slide',
    role: 'group',
    'aria-roledescription': 'slide',
    '[class.rhombus-carousel-slide--active]': 'active()',
    '[attr.aria-label]': 'computedLabel()',
    '[attr.aria-hidden]': 'active() ? null : "true"',
    '[attr.inert]': 'active() ? null : ""',
  },
  template: `<ng-content />`,
})
export class RhombusCarouselSlideComponent {
  /** Accessible name for the slide; overrides the default "N of M" phrasing. */
  readonly label = input<string>('');

  private readonly index = signal(0);
  private readonly total = signal(0);
  /** Whether this slide is the currently-shown one. */
  protected readonly active = signal(false);

  protected readonly computedLabel = computed(
    () => this.label() || `${this.index() + 1} of ${this.total()}`
  );

  /** @internal Wire this slide's position and active state from the carousel. */
  setContext(index: number, total: number, active: boolean): void {
    this.index.set(index);
    this.total.set(total);
    this.active.set(active);
  }
}
