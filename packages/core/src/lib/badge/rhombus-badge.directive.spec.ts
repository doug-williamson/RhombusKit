import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  MatBadge,
  MatBadgePosition,
  MatBadgeSize,
} from '@angular/material/badge';
import { axe } from '../../testing/axe';
import { BadgeVariant, RhombusBadgeDirective } from './rhombus-badge.directive';

@Component({
  standalone: true,
  imports: [RhombusBadgeDirective],
  template: `
    <button
      type="button"
      [rhombusBadge]="content"
      [rhombusBadgeVariant]="variant"
      [rhombusBadgePosition]="position"
      [rhombusBadgeSize]="size"
      [rhombusBadgeHidden]="hidden"
      [rhombusBadgeOverlap]="overlap"
    >
      Inbox
    </button>
  `,
})
class HostComponent {
  content: string | number | null = 3;
  variant: BadgeVariant = 'default';
  position: MatBadgePosition = 'above after';
  size: MatBadgeSize = 'medium';
  hidden = false;
  overlap = true;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  hostEl: HTMLElement;
  badge: MatBadge;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const de = fixture.debugElement.query(By.directive(RhombusBadgeDirective));
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    hostEl: de.nativeElement as HTMLElement,
    badge: de.injector.get(MatBadge),
  };
}

describe('rhombusBadge', () => {
  it('adds the stable host class and default data-variant', () => {
    const { hostEl } = setup();
    expect(hostEl.classList).toContain('rhombus-badge');
    expect(hostEl.getAttribute('data-variant')).toBe('default');
  });

  it('reflects the variant to the data-variant host attribute', () => {
    const { fixture, host, hostEl } = setup();
    host.variant = 'primary';
    fixture.detectChanges();
    expect(hostEl.getAttribute('data-variant')).toBe('primary');
  });

  it('forwards content to the composed MatBadge and renders it', () => {
    const { hostEl, badge } = setup();
    // Material normalizes badge content to a string when rendering.
    expect(String(badge.content)).toBe('3');
    expect(hostEl.querySelector('.mat-badge-content')?.textContent).toContain(
      '3'
    );
  });

  it('forwards position, size, hidden, and overlap to MatBadge', () => {
    const { fixture, host, badge } = setup();
    host.position = 'below before';
    host.size = 'large';
    host.hidden = true;
    host.overlap = false;
    fixture.detectChanges();
    expect(badge.position).toBe('below before');
    expect(badge.size).toBe('large');
    expect(badge.hidden).toBe(true);
    expect(badge.overlap).toBe(false);
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
