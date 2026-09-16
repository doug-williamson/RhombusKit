import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Params, provideRouter } from '@angular/router';
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
      [iconButton]="iconButton"
      [ariaLabel]="ariaLabel"
      [routerLink]="routerLink"
      [queryParams]="queryParams"
      [fragment]="fragment"
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
  iconButton = false;
  ariaLabel: string | null = null;
  label = 'Save';
  routerLink: string | unknown[] | null = null;
  queryParams: Params | null = null;
  fragment: string | null = null;
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

  describe('icon-only mode + ariaLabel', () => {
    it('adds the icon-button class when iconButton is set', () => {
      const { fixture, host, el } = setup();
      host.iconButton = true;
      fixture.detectChanges();
      expect(button(el).classList).toContain('rhombus-button--icon-button');
    });

    it('carries the icon-button class on the routerLink and href anchors', () => {
      const { fixture, host, el } = setup();
      host.iconButton = true;
      host.routerLink = '/x';
      fixture.detectChanges();
      expect(anchor(el).classList).toContain('rhombus-button--icon-button');

      host.routerLink = null;
      host.href = 'https://example.com';
      fixture.detectChanges();
      expect(anchor(el).classList).toContain('rhombus-button--icon-button');
    });

    it('suppresses the trailing icon in icon-only mode', () => {
      const { fixture, host, el } = setup();
      host.iconButton = true;
      host.leadingIcon = 'edit';
      host.trailingIcon = 'arrow_forward';
      host.ariaLabel = 'Edit';
      host.label = '';
      fixture.detectChanges();
      const rendered = icons(el);
      expect(rendered.length).toBe(1);
      expect(rendered[0].textContent?.trim()).toBe('edit');
    });

    it('forwards ariaLabel to the button and removes it when null', () => {
      const { fixture, host, el } = setup();
      host.ariaLabel = 'Edit row';
      fixture.detectChanges();
      expect(button(el).getAttribute('aria-label')).toBe('Edit row');

      host.ariaLabel = null;
      fixture.detectChanges();
      expect(button(el).hasAttribute('aria-label')).toBe(false);
    });

    it('forwards ariaLabel to the link anchor', () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/x';
      host.ariaLabel = 'Back';
      fixture.detectChanges();
      expect(anchor(el).getAttribute('aria-label')).toBe('Back');
    });

    it('an icon-only button is accessible when ariaLabel supplies the name', async () => {
      const { fixture, host, el } = setup();
      host.iconButton = true;
      host.leadingIcon = 'delete';
      host.ariaLabel = 'Delete item';
      host.label = '';
      fixture.detectChanges();
      expect(await axe(el)).toHaveNoViolations();
    });
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

    it('composes queryParams into the routerLink anchor href', () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/settings';
      host.queryParams = { tab: 'billing' };
      fixture.detectChanges();
      expect(anchor(el).getAttribute('href')).toBe('/settings?tab=billing');
    });

    it('composes a fragment into the routerLink anchor href', () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/settings';
      host.fragment = 'billing';
      fixture.detectChanges();
      expect(anchor(el).getAttribute('href')).toBe('/settings#billing');
    });

    it('composes queryParams and fragment together', () => {
      const { fixture, host, el } = setup();
      host.routerLink = '/settings';
      host.queryParams = { tab: 'billing' };
      host.fragment = 'invoices';
      fixture.detectChanges();
      expect(anchor(el).getAttribute('href')).toBe(
        '/settings?tab=billing#invoices'
      );
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
  describe('variant label colour (outlined / text appearances)', () => {
    // Material paints the outlined/text LABEL from
    // `--mat-button-outlined-label-text-color` / `--mat-button-text-label-text-color`,
    // each defaulting to `--mat-sys-primary` at (0,2,0). Rebinding --mat-sys-primary to
    // carry a variant's FILL (surface-2, transparent, --error) therefore paints the
    // label in the fill colour too — 1.23:1 for secondary, 1.00:1 for ghost — unless
    // the two label tokens are bound per variant. jsdom cannot cascade Material's
    // runtime-injected CSS, so assert on the authored SCSS; the rendered ratio is
    // gated by apps/showcase-e2e/tests/button-contrast.spec.ts.
    const scss = readFileSync(
      join(__dirname, 'rhombus-button.component.scss'),
      'utf8'
    );
    const LABEL_TOKENS = [
      '--mat-button-outlined-label-text-color',
      '--mat-button-text-label-text-color',
    ];

    function variantBlock(variant: ButtonVariant): string {
      const start = scss.indexOf(`&--${variant} {`);
      if (start === -1) {
        throw new Error(`no "&--${variant} {" block in rhombus-button.component.scss`);
      }
      // Variant blocks sit at one indent inside `.rhombus-button {` and close with
      // "\n  }"; nested state blocks close deeper, so this captures the whole block.
      const end = scss.indexOf('\n  }', start);
      return scss.slice(start, end);
    }

    it.each<ButtonVariant>(['primary', 'secondary', 'ghost', 'danger'])(
      'binds both Material label tokens for the %s variant',
      (variant) => {
        const block = variantBlock(variant);
        const missing = LABEL_TOKENS.filter((t) => !block.includes(`${t}:`));
        expect(missing).toEqual([]);
      }
    );

    it('does not rely on a plain `color:` declaration Material outranks', () => {
      // `color: var(--text-accent)` at (0,1,0) loses to Material's (0,2,0) label
      // rule regardless of source order — a dead declaration that reads as a fix.
      expect(variantBlock('ghost')).not.toMatch(
        /\n\s*color:\s*var\(--text-accent\)/
      );
    });
  });
});
