import { Component, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import { RhombusCarouselComponent } from './rhombus-carousel.component';
import { RhombusCarouselSlideComponent } from './rhombus-carousel-slide.component';

@Component({
  standalone: true,
  imports: [RhombusCarouselComponent, RhombusCarouselSlideComponent],
  template: `
    <rhombus-carousel
      label="Featured"
      [autoplay]="autoplay()"
      [interval]="interval()"
      [loop]="loop()"
      [pauseOnHover]="pauseOnHover()"
      [showArrows]="showArrows()"
      [showDots]="showDots()"
      [transition]="transition()"
      [swipe]="swipe()"
      [(selectedIndex)]="index"
      (playingChange)="playingLog.push($event)"
    >
      @for (s of slides(); track s) {
        <rhombus-carousel-slide>{{ s }}</rhombus-carousel-slide>
      }
    </rhombus-carousel>
  `,
})
class HostComponent {
  slides = signal(['One', 'Two', 'Three']);
  autoplay = signal(false);
  interval = signal(5000);
  loop = signal(true);
  pauseOnHover = signal(true);
  showArrows = signal(true);
  showDots = signal(true);
  transition = signal<'slide' | 'fade'>('slide');
  swipe = signal(true);
  index = 0;
  playingLog: boolean[] = [];
}

function stubMatchMedia(matches = false): void {
  (window as unknown as { matchMedia: unknown }).matchMedia = jest
    .fn()
    .mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
}

interface Api {
  next(): void;
  previous(): void;
  select(i: number): void;
  play(): void;
  pause(): void;
  togglePlay(): void;
  count(): number;
  playing(): boolean;
  maybeAutoplay(): void;
  onPointerDown(e: { clientX: number }): void;
  onPointerUp(e: { clientX: number }): void;
  onDotKeydown(e: KeyboardEvent, i: number): void;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  api: Api;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  const api = fixture.debugElement.query(By.directive(RhombusCarouselComponent))
    .componentInstance as unknown as Api;
  return { fixture, host: fixture.componentInstance, el: fixture.nativeElement, api };
}

beforeEach(() => stubMatchMedia(false));

afterEach(() => {
  document.body
    .querySelectorAll('[ng-version]')
    .forEach((n) => n.parentElement?.removeChild(n));
});

function slides(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll('rhombus-carousel-slide'));
}
function dots(el: HTMLElement): HTMLButtonElement[] {
  return Array.from(el.querySelectorAll('.rhombus-carousel__dot'));
}
function activeSlideText(el: HTMLElement): string | undefined {
  return slides(el)
    .find((s) => !s.hasAttribute('inert'))
    ?.textContent?.trim();
}

describe('rhombus-carousel', () => {
  it('is a labelled carousel region containing slide groups', () => {
    const { el } = setup();
    const region = el.querySelector('[role="region"]')!;
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
    expect(region.getAttribute('aria-label')).toBe('Featured');
    const ss = slides(el);
    expect(ss.length).toBe(3);
    ss.forEach((s) => {
      expect(s.getAttribute('role')).toBe('group');
      expect(s.getAttribute('aria-roledescription')).toBe('slide');
    });
  });

  it('gives each slide a default "N of M" accessible name', () => {
    const { el } = setup();
    expect(slides(el)[0].getAttribute('aria-label')).toBe('1 of 3');
    expect(slides(el)[2].getAttribute('aria-label')).toBe('3 of 3');
  });

  it('hides every slide except the active one from AT and the tab order', () => {
    const { el } = setup();
    const ss = slides(el);
    expect(ss[0].hasAttribute('inert')).toBe(false);
    expect(ss[0].getAttribute('aria-hidden')).toBeNull();
    expect(ss[1].hasAttribute('inert')).toBe(true);
    expect(ss[1].getAttribute('aria-hidden')).toBe('true');
  });

  it('advances and rewinds with next()/previous() (loop wraps by index)', () => {
    const { fixture, host, el, api } = setup();
    api.next();
    fixture.detectChanges();
    expect(host.index).toBe(1);
    expect(activeSlideText(el)).toBe('Two');
    api.select(2);
    fixture.detectChanges();
    api.next(); // wraps to 0
    fixture.detectChanges();
    expect(host.index).toBe(0);
    api.previous(); // wraps to last
    fixture.detectChanges();
    expect(host.index).toBe(2);
  });

  it('does not wrap when loop is false', () => {
    const { fixture, host, el, api } = setup();
    host.loop.set(false);
    fixture.detectChanges();
    api.previous(); // already first — stays
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('clamps an out-of-range selectedIndex', () => {
    const { fixture, host } = setup();
    host.index = 9;
    fixture.detectChanges();
    expect(host.index).toBe(2);
  });

  it('renders one dot per slide with aria-current + roving tabindex', () => {
    const { el } = setup();
    const ds = dots(el);
    expect(ds.length).toBe(3);
    expect(ds[0].getAttribute('aria-current')).toBe('true');
    expect(ds[0].getAttribute('tabindex')).toBe('0');
    expect(ds[1].getAttribute('aria-current')).toBeNull();
    expect(ds[1].getAttribute('tabindex')).toBe('-1');
  });

  it('selects a slide when its dot is clicked', () => {
    const { fixture, host, el } = setup();
    dots(el)[2].click();
    fixture.detectChanges();
    expect(host.index).toBe(2);
  });

  it('moves the selection with arrow keys on the dots', () => {
    const { fixture, host, el } = setup();
    const ds = dots(el);
    ds[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.index).toBe(1);
    dots(el)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('advances via the next/previous arrow buttons', () => {
    const { fixture, host, el } = setup();
    el.querySelector<HTMLButtonElement>('.rhombus-carousel__arrow--next')!.click();
    fixture.detectChanges();
    expect(host.index).toBe(1);
    el.querySelector<HTMLButtonElement>('.rhombus-carousel__arrow--prev')!.click();
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('exposes count() and playing() signals', () => {
    const { api } = setup();
    expect(api.count()).toBe(3);
    expect(api.playing()).toBe(false);
  });

  it('toggles aria-live off while playing and polite while idle', () => {
    const { fixture, el, api } = setup();
    const liveEl = el.querySelector('[aria-live]')!;
    expect(liveEl.getAttribute('aria-live')).toBe('polite');
    api.play();
    fixture.detectChanges();
    expect(liveEl.getAttribute('aria-live')).toBe('off');
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('drops the track transform in fade mode', () => {
    const { fixture, host, el } = setup();
    host.transition.set('fade');
    fixture.detectChanges();
    const track = el.querySelector<HTMLElement>('.rhombus-carousel__track')!;
    expect(track.classList.contains('rhombus-carousel__track--fade')).toBe(true);
    expect(track.style.transform).toBe('none');
  });

  it('clamps a negative selectedIndex up to zero', () => {
    const { fixture, host } = setup();
    host.index = -5;
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('next() stops at the last slide when loop is false', () => {
    const { fixture, host, api } = setup();
    host.loop.set(false);
    fixture.detectChanges();
    api.select(2);
    api.next(); // already last — stays
    fixture.detectChanges();
    expect(host.index).toBe(2);
  });

  it('is a no-op with no slides', () => {
    const { fixture, host, api } = setup();
    host.slides.set([]);
    fixture.detectChanges();
    expect(api.count()).toBe(0);
    api.next();
    api.previous();
    api.select(1);
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('swipes left to advance and right to go back', () => {
    const { fixture, host, api } = setup();
    api.onPointerDown({ clientX: 200 });
    api.onPointerUp({ clientX: 100 }); // dragged left → next
    fixture.detectChanges();
    expect(host.index).toBe(1);
    api.onPointerDown({ clientX: 100 });
    api.onPointerUp({ clientX: 200 }); // dragged right → previous
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('ignores a swipe under the threshold and a stray pointerup', () => {
    const { fixture, host, api } = setup();
    api.onPointerDown({ clientX: 100 });
    api.onPointerUp({ clientX: 90 }); // 10px < 40px threshold
    fixture.detectChanges();
    expect(host.index).toBe(0);
    api.onPointerUp({ clientX: 999 }); // no matching down → ignored
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('does not track swipes when swipe is disabled', () => {
    const { fixture, host, api } = setup();
    host.swipe.set(false);
    fixture.detectChanges();
    api.onPointerDown({ clientX: 200 });
    api.onPointerUp({ clientX: 20 });
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('supports Home/End on the dots and ignores other keys', () => {
    const { fixture, host, api } = setup();
    api.onDotKeydown(new KeyboardEvent('keydown', { key: 'End' }), 0);
    fixture.detectChanges();
    expect(host.index).toBe(2);
    api.onDotKeydown(new KeyboardEvent('keydown', { key: 'Home' }), 2);
    fixture.detectChanges();
    expect(host.index).toBe(0);
    api.onDotKeydown(new KeyboardEvent('keydown', { key: 'x' }), 0); // ignored
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('restores focus to the selected dot after arrow navigation', async () => {
    const { fixture, el } = setup();
    dots(el)[0].focus();
    dots(el)[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(document.activeElement).toBe(dots(el)[1]);
  });

  it('pause() when idle is a harmless no-op', () => {
    const { fixture, host, api } = setup();
    api.pause();
    fixture.detectChanges();
    expect(api.playing()).toBe(false);
    expect(host.playingLog).toEqual([]);
  });
});

describe('rhombus-carousel autoplay', () => {
  beforeEach(() => {
    stubMatchMedia(false);
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    document.body
      .querySelectorAll('[ng-version]')
      .forEach((n) => n.parentElement?.removeChild(n));
  });

  it('play() rotates on the interval and loops', () => {
    const { fixture, host, api } = setup();
    api.play();
    fixture.detectChanges();
    expect(api.playing()).toBe(true);
    expect(host.playingLog).toEqual([true]);

    jest.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(host.index).toBe(1);

    jest.advanceTimersByTime(5000);
    jest.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(host.index).toBe(0); // wrapped
  });

  it('pause() stops rotation and emits playingChange', () => {
    const { fixture, host, api } = setup();
    api.play();
    api.pause();
    fixture.detectChanges();
    expect(api.playing()).toBe(false);
    expect(host.playingLog).toEqual([true, false]);
    jest.advanceTimersByTime(15000);
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('togglePlay() flips the playing state', () => {
    const { fixture, api } = setup();
    api.togglePlay();
    fixture.detectChanges();
    expect(api.playing()).toBe(true);
    api.togglePlay();
    fixture.detectChanges();
    expect(api.playing()).toBe(false);
  });

  it('never auto-starts under prefers-reduced-motion', () => {
    stubMatchMedia(true);
    const { fixture, host, api } = setup();
    host.autoplay.set(true);
    fixture.detectChanges();
    api.maybeAutoplay();
    fixture.detectChanges();
    expect(api.playing()).toBe(false);
  });

  it('auto-starts when autoplay is set and motion is allowed', () => {
    const { fixture, host, api } = setup();
    host.autoplay.set(true);
    fixture.detectChanges();
    api.maybeAutoplay();
    fixture.detectChanges();
    expect(api.playing()).toBe(true);
  });

  it('never auto-starts with a single slide', () => {
    const { fixture, host, api } = setup();
    host.slides.set(['Only']);
    host.autoplay.set(true);
    fixture.detectChanges();
    api.maybeAutoplay();
    api.play();
    fixture.detectChanges();
    expect(api.playing()).toBe(false);
  });

  it('pauses on hover and resumes on leave', () => {
    const { fixture, el, api } = setup();
    api.play();
    fixture.detectChanges();
    const viewport = el.querySelector('.rhombus-carousel__viewport')!;
    viewport.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(api.playing()).toBe(false);
    viewport.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(api.playing()).toBe(true);
  });

  it('play() is idempotent while already rotating', () => {
    const { fixture, host, api } = setup();
    api.play();
    api.play(); // no second timer, no second emit
    fixture.detectChanges();
    expect(host.playingLog).toEqual([true]);
  });

  it('auto-starts when the reduced-motion query is unavailable', () => {
    (window as unknown as { matchMedia: unknown }).matchMedia =
      undefined as unknown;
    const { fixture, host, api } = setup();
    host.autoplay.set(true);
    fixture.detectChanges();
    api.maybeAutoplay();
    fixture.detectChanges();
    expect(api.playing()).toBe(true);
  });
});

describe('rhombus-carousel on the server (SSR guards)', () => {
  it('never starts the timer or tracks swipes off the browser', () => {
    stubMatchMedia(false);
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const api = fixture.debugElement.query(By.directive(RhombusCarouselComponent))
      .componentInstance as unknown as Api;

    api.play();
    api.maybeAutoplay();
    fixture.detectChanges();
    expect(api.playing()).toBe(false);

    api.onPointerDown({ clientX: 200 });
    api.onPointerUp({ clientX: 20 }); // swipe ignored (never armed)
    fixture.detectChanges();
    expect(fixture.componentInstance.index).toBe(0);
    fixture.nativeElement.remove();
  });
});
