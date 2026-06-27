import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import {
  RhombusTagComponent,
  TagSize,
  TagVariant,
} from './rhombus-tag.component';

@Component({
  standalone: true,
  imports: [RhombusTagComponent],
  template: `<rhombus-tag [variant]="variant" [size]="size">{{ label }}</rhombus-tag>`,
})
class HostComponent {
  variant: TagVariant = 'default';
  size: TagSize = 'md';
  label = 'Published';
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  const fixture = TestBed.createComponent(HostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function tag(el: HTMLElement): HTMLElement {
  return el.querySelector('rhombus-tag') as HTMLElement;
}

describe('rhombus-tag', () => {
  it('projects its label content', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(tag(el).textContent?.trim()).toBe('Published');
  });

  it('carries the rhombus-tag class', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(tag(el).classList).toContain('rhombus-tag');
  });

  it('defaults to the default variant and md size', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(tag(el).getAttribute('data-variant')).toBe('default');
    expect(tag(el).getAttribute('data-size')).toBe('md');
  });

  it('reflects variant to data-variant', () => {
    const { fixture, host, el } = setup();
    host.variant = 'published';
    fixture.detectChanges();
    expect(tag(el).getAttribute('data-variant')).toBe('published');
  });

  it('reflects size to data-size', () => {
    const { fixture, host, el } = setup();
    host.size = 'sm';
    fixture.detectChanges();
    expect(tag(el).getAttribute('data-size')).toBe('sm');
  });

  it('supports every variant', () => {
    const variants: TagVariant[] = [
      'default',
      'info',
      'success',
      'warning',
      'error',
      'draft',
      'published',
      'scheduled',
      'archived',
    ];
    const { fixture, host, el } = setup();
    for (const v of variants) {
      host.variant = v;
      fixture.detectChanges();
      expect(tag(el).getAttribute('data-variant')).toBe(v);
    }
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
