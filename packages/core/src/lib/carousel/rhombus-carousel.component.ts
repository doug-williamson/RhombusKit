import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  PLATFORM_ID,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { RhombusCarouselSlideComponent } from './rhombus-carousel-slide.component';
import { RhombusCarouselTransition } from './carousel.types';

/** Per-instance id seed for the live-region wiring. */
let nextId = 0;

/**
 * `<rhombus-carousel>` — a bespoke, accessible slide carousel following the APG
 * Auto-Rotating Carousel pattern. The host is a `role="region"` +
 * `aria-roledescription="carousel"`; projected `<rhombus-carousel-slide>`s are
 * groups (not tabpanels). Transitions are CSS-only (no `@angular/animations`).
 *
 * **SSR-safe:** every browser-only concern — the autoplay timer, the
 * reduced-motion `matchMedia` query, and pointer swiping — is gated behind
 * `afterNextRender` + `isPlatformBrowser`, so the component prerenders cleanly
 * under `outputMode: static`. Autoplay never starts under
 * `prefers-reduced-motion` or with a single slide, and the live region flips to
 * `off` only while auto-rotating.
 *
 * Boundary: a carousel cycles *equivalent, browsable* content — never put a
 * critical, one-time call to action on an auto-rotating slide; use Tabs or an
 * Accordion when each section must be individually reachable and persistent.
 */
@Component({
  selector: 'rhombus-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-carousel.component.scss',
  host: {
    class: 'rhombus-carousel',
    role: 'region',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'label()',
  },
  template: `
    <div
      class="rhombus-carousel__viewport"
      [attr.aria-live]="playing() ? 'off' : 'polite'"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (pointerdown)="onPointerDown($event)"
      (pointerup)="onPointerUp($event)"
    >
      <div
        class="rhombus-carousel__track"
        [class.rhombus-carousel__track--fade]="transition() === 'fade'"
        [style.transform]="trackTransform()"
      >
        <ng-content />
      </div>
    </div>

    @if (showArrows() && count() > 1) {
      <button
        type="button"
        class="rhombus-carousel__arrow rhombus-carousel__arrow--prev"
        aria-label="Previous slide"
        (click)="previous()"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>
      <button
        type="button"
        class="rhombus-carousel__arrow rhombus-carousel__arrow--next"
        aria-label="Next slide"
        (click)="next()"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    }

    <div class="rhombus-carousel__controls">
      @if (autoplay() && count() > 1) {
        <button
          type="button"
          class="rhombus-carousel__play"
          [attr.aria-label]="playing() ? 'Stop automatic rotation' : 'Start automatic rotation'"
          (click)="togglePlay()"
        >
          @if (playing()) {
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M8 5v14l11-7z" />
            </svg>
          }
        </button>
      }

      @if (showDots() && count() > 1) {
        <div class="rhombus-carousel__dots" role="group" aria-label="Choose slide to display">
          @for (slide of slides(); track slide; let i = $index) {
            <button
              #dot
              type="button"
              class="rhombus-carousel__dot"
              [class.rhombus-carousel__dot--active]="selectedIndex() === i"
              [attr.aria-label]="'Slide ' + (i + 1) + ' of ' + count()"
              [attr.aria-current]="selectedIndex() === i ? 'true' : null"
              [tabindex]="selectedIndex() === i ? 0 : -1"
              (click)="select(i)"
              (keydown)="onDotKeydown($event, i)"
            ></button>
          }
        </div>
      }
    </div>
  `,
})
export class RhombusCarouselComponent {
  /** Accessible name for the carousel region. */
  readonly label = input<string>('Carousel');
  /** Auto-rotate the slides (never under reduced-motion or with ≤1 slide). */
  readonly autoplay = input(false, { transform: booleanAttribute });
  /** Auto-rotation interval in milliseconds. */
  readonly interval = input(5000, { transform: numberAttribute });
  /** Whether next/previous wrap around the ends (index rewind). */
  readonly loop = input(true, { transform: booleanAttribute });
  /** Transition style between slides. */
  readonly transition = input<RhombusCarouselTransition>('slide');
  /** Pause auto-rotation while the pointer is over the carousel. */
  readonly pauseOnHover = input(true, { transform: booleanAttribute });
  /** Enable pointer/touch swiping (no-op during SSR). */
  readonly swipe = input(true, { transform: booleanAttribute });
  /** Show the previous/next arrow buttons. */
  readonly showArrows = input(true, { transform: booleanAttribute });
  /** Show the slide-picker dots. */
  readonly showDots = input(true, { transform: booleanAttribute });
  /** Two-way index of the shown slide (clamped to the slide count). */
  readonly selectedIndex = model<number>(0);

  /** Emitted when auto-rotation starts or stops. */
  readonly playingChange = output<boolean>();

  protected readonly slides = contentChildren(RhombusCarouselSlideComponent);
  private readonly dotEls = viewChildren<ElementRef<HTMLButtonElement>>('dot');

  /** Number of slides. */
  readonly count = computed(() => this.slides().length);
  private readonly _playing = signal(false);
  /** Whether the carousel is currently auto-rotating. */
  readonly playing = this._playing.asReadonly();

  protected readonly liveId = `rhombus-carousel-${nextId++}`;
  protected readonly trackTransform = computed(() =>
    this.transition() === 'slide'
      ? `translateX(-${this.selectedIndex() * 100}%)`
      : 'none'
  );

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly injector = inject(Injector);
  private readonly host = inject(ElementRef<HTMLElement>);
  private timer: ReturnType<typeof setInterval> | null = null;
  private resumeAfterHover = false;
  private pointerStartX: number | null = null;

  constructor() {
    // Keep selectedIndex clamped, then push position/active state to the slides.
    effect(() => {
      const total = this.count();
      const current = this.selectedIndex();
      if (total > 0 && current > total - 1) {
        this.selectedIndex.set(total - 1);
        return;
      }
      if (current < 0) {
        this.selectedIndex.set(0);
        return;
      }
      this.slides().forEach((slide, i) => slide.setContext(i, total, i === current));
    });

    afterNextRender(() => this.maybeAutoplay(), { injector: this.injector });
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  // ---- Imperative navigation -------------------------------------------------

  next(): void {
    const n = this.count();
    if (n === 0) return;
    const cur = this.selectedIndex();
    const to = cur + 1 >= n ? (this.loop() ? 0 : cur) : cur + 1;
    this.select(to);
  }

  previous(): void {
    const n = this.count();
    if (n === 0) return;
    const cur = this.selectedIndex();
    const to = cur - 1 < 0 ? (this.loop() ? n - 1 : cur) : cur - 1;
    this.select(to);
  }

  select(index: number): void {
    const n = this.count();
    if (n === 0) return;
    this.selectedIndex.set(Math.max(0, Math.min(index, n - 1)));
  }

  // ---- Playback --------------------------------------------------------------

  play(): void {
    if (!this.isBrowser || this.count() <= 1 || this._playing()) return;
    this._playing.set(true);
    this.playingChange.emit(true);
    this.timer = setInterval(() => this.next(), this.interval());
  }

  pause(): void {
    this.clearTimer();
    if (this._playing()) {
      this._playing.set(false);
      this.playingChange.emit(false);
    }
  }

  togglePlay(): void {
    if (this._playing()) {
      this.pause();
    } else {
      this.play();
    }
  }

  /** @internal Start auto-rotation if the inputs and environment allow it. */
  protected maybeAutoplay(): void {
    if (this.autoplay() && this.count() > 1 && !this.prefersReducedMotion()) {
      this.play();
    }
  }

  private prefersReducedMotion(): boolean {
    return (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ---- Interaction handlers --------------------------------------------------

  protected onMouseEnter(): void {
    if (this.pauseOnHover() && this._playing()) {
      this.resumeAfterHover = true;
      this.pause();
    }
  }

  protected onMouseLeave(): void {
    if (this.resumeAfterHover) {
      this.resumeAfterHover = false;
      this.play();
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.swipe() || !this.isBrowser) return;
    this.pointerStartX = event.clientX;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerStartX === null) return;
    const dx = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    const threshold = 40;
    if (dx <= -threshold) this.next();
    else if (dx >= threshold) this.previous();
  }

  protected onDotKeydown(event: KeyboardEvent, index: number): void {
    let to = index;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        to = index + 1 >= this.count() ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        to = index - 1 < 0 ? this.count() - 1 : index - 1;
        break;
      case 'Home':
        to = 0;
        break;
      case 'End':
        to = this.count() - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.select(to);
    this.focusDot(to);
  }

  private focusDot(index: number): void {
    afterNextRender(
      () => this.dotEls()[index]?.nativeElement.focus(),
      { injector: this.injector }
    );
  }
}
