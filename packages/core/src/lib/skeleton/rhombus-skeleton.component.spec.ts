import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import {
  RhombusSkeletonComponent,
  SkeletonVariant,
} from './rhombus-skeleton.component';

@Component({
  standalone: true,
  imports: [RhombusSkeletonComponent],
  template: `<rhombus-skeleton
    [variant]="variant"
    [width]="width"
    [height]="height"
    [radius]="radius"
    [lines]="lines"
    [lastLineWidth]="lastLineWidth"
    [count]="count"
    [animated]="animated"
    [label]="label"
  />`,
})
class HostComponent {
  variant: SkeletonVariant = 'text';
  width: string | number | null = null;
  height: string | number | null = null;
  radius: string | number | null = null;
  lines = 1;
  lastLineWidth = '60%';
  count = 1;
  animated = true;
  label: string | null = null;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  root: () => HTMLElement;
} {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    el,
    root: () => el.querySelector('.rhombus-skeleton') as HTMLElement,
  };
}

describe('rhombus-skeleton', () => {
  it('renders one text block with one bar by default', () => {
    const { el } = setup();
    expect(el.querySelectorAll('.rhombus-skeleton__block').length).toBe(1);
    expect(el.querySelectorAll('.rhombus-skeleton__bar').length).toBe(1);
    expect(el.querySelector('.rhombus-skeleton__shape')).toBeNull();
    expect(el.querySelector('.rhombus-skeleton')?.getAttribute('data-variant')).toBe(
      'text'
    );
  });

  it('is decorative by default: aria-hidden, no role, no label', () => {
    const { root } = setup();
    expect(root().getAttribute('aria-hidden')).toBe('true');
    expect(root().getAttribute('role')).toBeNull();
    expect(root().getAttribute('aria-label')).toBeNull();
    expect(root().getAttribute('aria-busy')).toBeNull();
  });

  it('becomes a labelled live region when label is set', () => {
    const { fixture, host, root, el } = setup();
    host.label = 'Loading profile';
    fixture.detectChanges();
    expect(root().getAttribute('role')).toBe('status');
    expect(root().getAttribute('aria-busy')).toBe('true');
    expect(root().getAttribute('aria-label')).toBe('Loading profile');
    expect(root().getAttribute('aria-hidden')).toBeNull();
    // Inner bars stay hidden from AT — the label names the whole region.
    expect(
      el.querySelector('.rhombus-skeleton__block')?.getAttribute('aria-hidden')
    ).toBe('true');
  });

  it('treats an empty-string label as decorative', () => {
    const { fixture, host, root } = setup();
    host.label = '';
    fixture.detectChanges();
    expect(root().getAttribute('aria-hidden')).toBe('true');
    expect(root().getAttribute('role')).toBeNull();
  });

  it('renders `lines` bars and shortens only the last line', () => {
    const { fixture, host, el } = setup();
    host.lines = 3;
    fixture.detectChanges();
    const bars = el.querySelectorAll<HTMLElement>('.rhombus-skeleton__bar');
    expect(bars.length).toBe(3);
    // Earlier bars have no inline width (fall back to the CSS default).
    expect(bars[0].style.width).toBe('');
    expect(bars[1].style.width).toBe('');
    // Last bar uses lastLineWidth.
    expect(bars[2].style.width).toBe('60%');
  });

  it('does not apply lastLineWidth when there is a single line', () => {
    const { el } = setup();
    const bar = el.querySelector<HTMLElement>('.rhombus-skeleton__bar');
    expect(bar?.style.width).toBe('');
  });

  it('honours a custom lastLineWidth', () => {
    const { fixture, host, el } = setup();
    host.lines = 2;
    host.lastLineWidth = '40%';
    fixture.detectChanges();
    const bars = el.querySelectorAll<HTMLElement>('.rhombus-skeleton__bar');
    expect(bars[1].style.width).toBe('40%');
  });

  it('renders a single shape for circle and rect variants', () => {
    const { fixture, host, el, root } = setup();
    host.variant = 'circle';
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-skeleton__shape')).not.toBeNull();
    expect(el.querySelector('.rhombus-skeleton__bar')).toBeNull();
    expect(root().getAttribute('data-variant')).toBe('circle');

    host.variant = 'rect';
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-skeleton__shape')).not.toBeNull();
    expect(root().getAttribute('data-variant')).toBe('rect');
  });

  it('maps numeric width/height/radius to px CSS vars', () => {
    const { fixture, host, root } = setup();
    host.width = 200;
    host.height = 16;
    host.radius = 4;
    fixture.detectChanges();
    expect(root().style.getPropertyValue('--rhombus-skeleton-w').trim()).toBe(
      '200px'
    );
    expect(root().style.getPropertyValue('--rhombus-skeleton-h').trim()).toBe(
      '16px'
    );
    expect(root().style.getPropertyValue('--rhombus-skeleton-radius').trim()).toBe(
      '4px'
    );
  });

  it('passes string width/height/radius through verbatim', () => {
    const { fixture, host, root } = setup();
    host.width = '50%';
    host.radius = 'var(--radius-full)';
    fixture.detectChanges();
    expect(root().style.getPropertyValue('--rhombus-skeleton-w').trim()).toBe(
      '50%'
    );
    expect(root().style.getPropertyValue('--rhombus-skeleton-radius').trim()).toBe(
      'var(--radius-full)'
    );
  });

  it('sets no sizing var when width/height/radius are null', () => {
    const { root } = setup();
    expect(root().style.getPropertyValue('--rhombus-skeleton-w')).toBe('');
    expect(root().style.getPropertyValue('--rhombus-skeleton-h')).toBe('');
    expect(root().style.getPropertyValue('--rhombus-skeleton-radius')).toBe('');
  });

  it('repeats the block `count` times', () => {
    const { fixture, host, el } = setup();
    host.count = 3;
    fixture.detectChanges();
    expect(el.querySelectorAll('.rhombus-skeleton__block').length).toBe(3);
  });

  it('toggles the shimmer class with `animated`', () => {
    const { fixture, host, root } = setup();
    expect(root().classList).toContain('rhombus-skeleton--animated');
    host.animated = false;
    fixture.detectChanges();
    expect(root().classList).not.toContain('rhombus-skeleton--animated');
  });

  it('has no accessibility violations in decorative and labelled modes', async () => {
    const { fixture, host, el } = setup();
    expect(await axe(el)).toHaveNoViolations();
    host.label = 'Loading';
    host.variant = 'circle';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
