import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import {
  RhombusStatComponent,
  StatSentiment,
  StatSize,
  StatTrend,
} from './rhombus-stat.component';

@Component({
  standalone: true,
  imports: [RhombusStatComponent],
  template: `<rhombus-stat
    [label]="label"
    [value]="value"
    [delta]="delta"
    [trend]="trend"
    [sentiment]="sentiment"
    [caption]="caption"
    [size]="size"
    [deltaLabel]="deltaLabel"
    [live]="live"
  >
    @if (withIcon) {
      <span slot="icon" data-testid="icon-slot">icon</span>
    }
    @if (withExtra) {
      <span data-testid="extra-slot">spark</span>
    }
  </rhombus-stat>`,
})
class HostComponent {
  label = 'Revenue';
  value: string | number | null = 12345;
  delta: string | number | null = null;
  trend: StatTrend = 'auto';
  sentiment: StatSentiment = 'auto';
  caption: string | null = null;
  size: StatSize = 'md';
  deltaLabel: string | null = null;
  live = false;
  withIcon = false;
  withExtra = false;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  root: () => HTMLElement;
  pill: () => HTMLElement | null;
} {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    el,
    root: () => el.querySelector('.rhombus-stat') as HTMLElement,
    pill: () => el.querySelector('.rhombus-stat__delta'),
  };
}

describe('rhombus-stat', () => {
  it('renders label in <dt> and value in <dd> via a definition list', () => {
    const { el } = setup();
    const dt = el.querySelector('dt');
    const dd = el.querySelector('dd');
    expect(el.querySelector('dl')).not.toBeNull();
    expect(dt?.textContent?.trim()).toBe('Revenue');
    expect(dd?.textContent).toContain('12345');
  });

  it('renders a zero value (guards value != null, not truthiness)', () => {
    const { fixture, host, el } = setup();
    host.value = 0;
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-stat__value')?.textContent?.trim()).toBe(
      '0'
    );
  });

  it('omits the value element when value is null', () => {
    const { fixture, host, el } = setup();
    host.value = null;
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-stat__value')).toBeNull();
  });

  it('shows no delta pill when delta is null', () => {
    const { pill } = setup();
    expect(pill()).toBeNull();
  });

  it('shows the delta pill with its text when delta is set', () => {
    const { fixture, host, pill } = setup();
    host.delta = '+12%';
    fixture.detectChanges();
    expect(pill()).not.toBeNull();
    expect(pill()?.textContent).toContain('+12%');
  });

  it('auto-derives trend direction from the numeric sign of delta', () => {
    const { fixture, host, pill } = setup();
    host.delta = 12;
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-trend')).toBe('up');

    host.delta = -3;
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-trend')).toBe('down');

    host.delta = 0;
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-trend')).toBe('neutral');
  });

  it('parses a signed/percent string delta for the auto trend', () => {
    const { fixture, host, pill } = setup();
    host.delta = '-3.2%';
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-trend')).toBe('down');

    host.delta = 'steady';
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-trend')).toBe('neutral');
  });

  it('lets an explicit trend override the auto direction', () => {
    const { fixture, host, pill } = setup();
    host.delta = -5;
    host.trend = 'up';
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-trend')).toBe('up');
  });

  it('renders the matching trend glyph (registered SVG)', () => {
    const { fixture, host, pill } = setup();
    host.delta = 8;
    fixture.detectChanges();
    const path = pill()
      ?.querySelector('.rhombus-icon svg path')
      ?.getAttribute('d');
    // trending_up path (registered in RHOMBUS_DEFAULT_GLYPHS).
    expect(path).toContain('M16 6');
  });

  it('auto-derives sentiment colour from the resolved trend', () => {
    const { fixture, host, pill } = setup();
    host.delta = 10;
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-sentiment')).toBe('positive');

    host.delta = -10;
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-sentiment')).toBe('negative');
  });

  it('decouples sentiment from trend for inverted metrics (D8)', () => {
    const { fixture, host, pill } = setup();
    // Churn dropped: down arrow, but that is a *good* thing.
    host.delta = -8;
    host.trend = 'auto';
    host.sentiment = 'positive';
    fixture.detectChanges();
    expect(pill()?.getAttribute('data-trend')).toBe('down');
    expect(pill()?.getAttribute('data-sentiment')).toBe('positive');
  });

  it('provides a visually-hidden direction phrase, overridable via deltaLabel', () => {
    const { fixture, host, el, pill } = setup();
    host.delta = '12%';
    fixture.detectChanges();
    const sr = pill()?.querySelector('.rhombus-stat__sr');
    expect(sr?.textContent?.trim()).toBe('Increased');

    host.deltaLabel = 'en hausse';
    fixture.detectChanges();
    expect(
      el.querySelector('.rhombus-stat__sr')?.textContent?.trim()
    ).toBe('en hausse');
  });

  it('renders a caption when provided', () => {
    const { fixture, host, el } = setup();
    host.caption = 'vs. last month';
    fixture.detectChanges();
    expect(
      el.querySelector('.rhombus-stat__caption')?.textContent?.trim()
    ).toBe('vs. last month');
  });

  it('reflects the size to data-size', () => {
    const { fixture, host, root } = setup();
    host.size = 'lg';
    fixture.detectChanges();
    expect(root().getAttribute('data-size')).toBe('lg');
  });

  it('exposes a polite live region only when live is set', () => {
    const { fixture, host, el } = setup();
    expect(el.querySelector('[aria-live]')).toBeNull();
    host.live = true;
    fixture.detectChanges();
    expect(
      el.querySelector('.rhombus-stat__value-row')?.getAttribute('aria-live')
    ).toBe('polite');
  });

  it('projects the icon and default (extra) slots', () => {
    const { fixture, host, el } = setup();
    host.withIcon = true;
    host.withExtra = true;
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="icon-slot"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="extra-slot"]')).not.toBeNull();
  });

  it('has no accessibility violations (full tile)', async () => {
    const { fixture, host, el } = setup();
    host.delta = '+12%';
    host.caption = 'vs. last month';
    host.withIcon = true;
    host.withExtra = true;
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
