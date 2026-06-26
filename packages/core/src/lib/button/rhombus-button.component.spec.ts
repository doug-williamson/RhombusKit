import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { axe } from '../../testing/axe';
import {
  ButtonAppearance,
  ButtonSize,
  ButtonVariant,
  RhombusButtonComponent,
} from './rhombus-button.component';

@Component({
  standalone: true,
  imports: [RhombusButtonComponent],
  template: `
    <rhombus-button
      [variant]="variant"
      [size]="size"
      [appearance]="appearance"
      [disabled]="disabled"
      [leadingIcon]="leadingIcon"
      [trailingIcon]="trailingIcon"
      [routerLink]="routerLink"
      [href]="href"
      [target]="target"
      [rel]="rel"
    >
      {{ label }}
    </rhombus-button>
  `,
})
class HostComponent {
  variant: ButtonVariant = 'primary';
  size: ButtonSize = 'md';
  appearance: ButtonAppearance = 'filled';
  disabled = false;
  leadingIcon: string | null = null;
  trailingIcon: string | null = null;
  label = 'Save';
  routerLink: string | unknown[] | null = null;
  href: string | null = null;
  target: string | null = null;
  rel: string | null = null;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({
    providers: [provideNoopAnimations(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(HostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function button(el: HTMLElement): HTMLButtonElement {
  return el.querySelector('button') as HTMLButtonElement;
}

function anchor(el: HTMLElement): HTMLAnchorElement {
  return el.querySelector('a') as HTMLAnchorElement;
}

function icons(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>('mat-icon'));
}

describe('rhombus-button', () => {
  it('renders a native button hosting the projected label', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(button(el)).toBeTruthy();
    expect(button(el).textContent?.trim()).toContain('Save');
  });

  it('applies the default host classes', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    const cls = button(el).classList;
    expect(cls).toContain('rhombus-button');
    expect(cls).toContain('rhombus-button--primary');
    expect(cls).toContain('rhombus-button--md');
    expect(cls).toContain('rhombus-button--filled');
  });

  it('reflects variant, size, and appearance into the host classes', () => {
    const { fixture, host, el } = setup();
    host.variant = 'danger';
    host.size = 'lg';
    host.appearance = 'outlined';
    fixture.detectChanges();
    const cls = button(el).classList;
    expect(cls).toContain('rhombus-button--danger');
    expect(cls).toContain('rhombus-button--lg');
    expect(cls).toContain('rhombus-button--outlined');
    expect(cls).not.toContain('rhombus-button--primary');
    expect(cls).not.toContain('rhombus-button--filled');
  });

  it('disables the native button when disabled is set', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(button(el).disabled).toBe(false);
    host.disabled = true;
    fixture.detectChanges();
    expect(button(el).disabled).toBe(true);
  });

  it('renders no icons by default', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(icons(el).length).toBe(0);
  });

  it('renders a leading icon before the label', () => {
    const { fixture, host, el } = setup();
    host.leadingIcon = 'add';
    fixture.detectChanges();
    const rendered = icons(el);
    expect(rendered.length).toBe(1);
    expect(rendered[0].textContent?.trim()).toBe('add');
    expect(rendered[0].hasAttribute('iconpositionend')).toBe(false);
  });

  it('renders a trailing icon flagged with iconPositionEnd', () => {
    const { fixture, host, el } = setup();
    host.trailingIcon = 'arrow_forward';
    fixture.detectChanges();
    const rendered = icons(el);
    expect(rendered.length).toBe(1);
    expect(rendered[0].textContent?.trim()).toBe('arrow_forward');
    expect(rendered[0].hasAttribute('iconpositionend')).toBe(true);
  });

  it('renders both icons around the label when both are set', () => {
    const { fixture, host, el } = setup();
    host.leadingIcon = 'add';
    host.trailingIcon = 'arrow_forward';
    fixture.detectChanges();
    const texts = icons(el).map((i) => i.textContent?.trim());
    expect(texts).toEqual(['add', 'arrow_forward']);
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });

  describe('link variant', () => {
    it('renders an anchor (not a button) when routerLink is set', () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/dashboard';
      fixture.detectChanges();
      expect(button(el)).toBeNull();
      const a = anchor(el);
      expect(a).toBeTruthy();
      expect(a.textContent?.trim()).toContain('Save');
      expect(a.classList).toContain('rhombus-button');
      expect(a.classList).toContain('rhombus-button--primary');
      expect(a.getAttribute('href')).toBe('/dashboard');
    });

    it('renders an anchor with href when href is set', () => {
      const { fixture, host, el } = setup();
      host.href = 'https://rhombuskit.online';
      fixture.detectChanges();
      expect(button(el)).toBeNull();
      expect(anchor(el).getAttribute('href')).toBe('https://rhombuskit.online');
    });

    it('prefers routerLink over href when both are set', () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/a';
      host.href = '/b';
      fixture.detectChanges();
      expect(anchor(el).getAttribute('href')).toBe('/a');
    });

    it('still carries appearance/size/variant/icons on the anchor', () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/x';
      host.variant = 'ghost';
      host.size = 'lg';
      host.appearance = 'outlined';
      host.leadingIcon = 'home';
      host.trailingIcon = 'arrow_forward';
      fixture.detectChanges();
      const a = anchor(el);
      expect(a.classList).toContain('rhombus-button--ghost');
      expect(a.classList).toContain('rhombus-button--lg');
      expect(a.classList).toContain('rhombus-button--outlined');
      expect(icons(el).map((i) => i.textContent?.trim())).toEqual([
        'home',
        'arrow_forward',
      ]);
    });

    it('marks a disabled routerLink anchor inert (aria-disabled, no tab, no href)', () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/x';
      host.disabled = true;
      fixture.detectChanges();
      const a = anchor(el);
      expect(a.getAttribute('aria-disabled')).toBe('true');
      expect(a.getAttribute('tabindex')).toBe('-1');
      expect(a.hasAttribute('href')).toBe(false);
    });

    it('marks a disabled href anchor inert', () => {
      const { fixture, host, el } = setup();
      host.href = 'https://rhombuskit.online';
      host.disabled = true;
      fixture.detectChanges();
      const a = anchor(el);
      expect(a.getAttribute('aria-disabled')).toBe('true');
      expect(a.getAttribute('tabindex')).toBe('-1');
      expect(a.hasAttribute('href')).toBe(false);
    });

    it('passes target through and hardens rel for _blank by default', () => {
      const { fixture, host, el } = setup();
      host.href = 'https://example.com';
      host.target = '_blank';
      fixture.detectChanges();
      const a = anchor(el);
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('respects an explicit rel over the _blank default', () => {
      const { fixture, host, el } = setup();
      host.href = 'https://example.com';
      host.target = '_blank';
      host.rel = 'external';
      fixture.detectChanges();
      expect(anchor(el).getAttribute('rel')).toBe('external');
    });

    it('has no accessibility violations as a link', async () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/x';
      host.label = 'Go to dashboard';
      fixture.detectChanges();
      expect(await axe(el)).toHaveNoViolations();
    });
  });
});
