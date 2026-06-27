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
  template: `<rhombus-avatar
    [name]="name"
    [src]="src"
    [srcDark]="srcDark"
    [size]="size"
  />`,
})
class HostComponent {
  name = 'Ada Lovelace';
  src: string | null = null;
  srcDark: string | null = null;
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

  it('sets the size/font CSS vars for each preset', () => {
    const { fixture, host, el } = setup();
    const avatar = el.querySelector<HTMLElement>('.rhombus-avatar');
    const read = (prop: string) => avatar?.style.getPropertyValue(prop).trim();

    // md (default)
    expect(read('--rhombus-avatar-size')).toBe('40px');
    expect(read('--rhombus-avatar-font')).toBe('14px');

    host.size = 'xl';
    fixture.detectChanges();
    expect(read('--rhombus-avatar-size')).toBe('96px');
    expect(read('--rhombus-avatar-font')).toBe('32px');
    expect(el.querySelector('.rhombus-avatar--xl')).not.toBeNull();
  });

  it('supports a numeric size without a BEM size class', () => {
    const { fixture, host, el } = setup();
    host.size = 120;
    fixture.detectChanges();
    const avatar = el.querySelector<HTMLElement>('.rhombus-avatar');
    expect(avatar?.style.getPropertyValue('--rhombus-avatar-size').trim()).toBe(
      '120px'
    );
    // round(120 * 0.35) = 42
    expect(avatar?.style.getPropertyValue('--rhombus-avatar-font').trim()).toBe(
      '42px'
    );
    expect(avatar?.classList).not.toContain('rhombus-avatar--sm');
    expect(avatar?.classList).not.toContain('rhombus-avatar--md');
    expect(avatar?.classList).not.toContain('rhombus-avatar--lg');
    expect(avatar?.classList).not.toContain('rhombus-avatar--xl');
  });

  it('renders a single img (no light/dark modifiers) when srcDark is unset', () => {
    const { fixture, host, el } = setup();
    host.src = 'https://example.com/ada.png';
    fixture.detectChanges();
    const imgs = el.querySelectorAll('img.rhombus-avatar__img');
    expect(imgs.length).toBe(1);
    expect(imgs[0].classList).not.toContain('rhombus-avatar__img--light');
    expect(imgs[0].classList).not.toContain('rhombus-avatar__img--dark');
  });

  it('renders a light + dark img (both with alt) when srcDark is set', () => {
    const { fixture, host, el } = setup();
    host.src = 'https://example.com/light.png';
    host.srcDark = 'https://example.com/dark.png';
    fixture.detectChanges();
    const imgs = el.querySelectorAll<HTMLImageElement>('img.rhombus-avatar__img');
    expect(imgs.length).toBe(2);
    expect(imgs[0].classList).toContain('rhombus-avatar__img--light');
    expect(imgs[1].classList).toContain('rhombus-avatar__img--dark');
    expect(imgs[0].getAttribute('alt')).toBe('Ada Lovelace');
    expect(imgs[1].getAttribute('alt')).toBe('Ada Lovelace');
    expect(imgs[1].getAttribute('src')).toBe('https://example.com/dark.png');
  });

  it('has no accessibility violations for initials, image, and dark-swap modes', async () => {
    const { fixture, host, el } = setup();
    expect(await axe(el)).toHaveNoViolations();
    host.src = 'https://example.com/ada.png';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
    host.srcDark = 'https://example.com/ada-dark.png';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
