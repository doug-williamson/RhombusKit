import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import {
  AvatarSize,
  RhombusAvatarComponent,
} from './rhombus-avatar.component';

@Component({
  standalone: true,
  imports: [RhombusAvatarComponent],
  template: `<rhombus-avatar [name]="name" [src]="src" [size]="size" />`,
})
class HostComponent {
  name = 'Ada Lovelace';
  src: string | null = null;
  size: AvatarSize = 'md';
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('rhombus-avatar', () => {
  it('renders initials derived from the name when there is no image', () => {
    const { el } = setup();
    expect(
      el.querySelector('.rhombus-avatar__initials')?.textContent?.trim()
    ).toBe('AL');
  });

  it('exposes the name as the accessible label in initials mode', () => {
    const { el } = setup();
    const avatar = el.querySelector('.rhombus-avatar');
    expect(avatar?.getAttribute('role')).toBe('img');
    expect(avatar?.getAttribute('aria-label')).toBe('Ada Lovelace');
  });

  it('renders an <img> with alt and drops the initials when src is set', () => {
    const { fixture, host, el } = setup();
    host.src = 'https://example.com/ada.png';
    fixture.detectChanges();
    const img = el.querySelector<HTMLImageElement>('img.rhombus-avatar__img');
    expect(img?.getAttribute('alt')).toBe('Ada Lovelace');
    expect(el.querySelector('.rhombus-avatar__initials')).toBeNull();
    // No redundant role/aria-label when the <img> already names the avatar.
    expect(el.querySelector('.rhombus-avatar')?.getAttribute('role')).toBeNull();
  });

  it('applies the size modifier class', () => {
    const { fixture, host, el } = setup();
    host.size = 'lg';
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-avatar--lg')).not.toBeNull();
  });

  it('has no accessibility violations for initials and image modes', async () => {
    const { fixture, host, el } = setup();
    expect(await axe(el)).toHaveNoViolations();
    host.src = 'https://example.com/ada.png';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
