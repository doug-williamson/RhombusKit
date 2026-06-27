import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { axe } from '../../testing/axe';
import { RhombusNavListComponent } from './rhombus-nav-list.component';
import {
  NavListAppearance,
  RhombusNavItem,
  RhombusNavSection,
} from './nav-list.types';

@Component({
  standalone: true,
  imports: [RhombusNavListComponent],
  template: `<rhombus-nav-list
    [sections]="sections"
    [ariaLabel]="ariaLabel"
    [appearance]="appearance"
    (itemAction)="onItemAction($event)"
  />`,
})
class HostComponent {
  sections: RhombusNavSection[] = [];
  ariaLabel = 'Primary';
  appearance: NavListAppearance = 'sidebar';
  actioned: RhombusNavItem[] = [];
  onItemAction(item: RhombusNavItem): void {
    this.actioned.push(item);
  }
}

function setup(sections: RhombusNavSection[]): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({
    providers: [
      provideNoopAnimations(),
      provideRouter([
        { path: '', children: [] },
        { path: 'dashboard', children: [] },
        { path: 'settings', children: [] },
      ]),
    ],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.sections = sections;
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('rhombus-nav-list', () => {
  it('wraps the list in a labelled nav landmark', () => {
    const { el } = setup([{ items: [{ label: 'Home', routerLink: '/' }] }]);
    const nav = el.querySelector('nav.rhombus-nav-list');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Primary');
  });

  it('honours a custom aria-label', () => {
    const { fixture, host, el } = setup([
      { items: [{ label: 'Home', routerLink: '/' }] },
    ]);
    host.ariaLabel = 'Docs';
    fixture.detectChanges();
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Docs');
  });

  it('renders section headings and groups', () => {
    const { el } = setup([
      { heading: 'Main', items: [{ label: 'Home', routerLink: '/' }] },
      { heading: 'Admin', items: [{ label: 'Settings', routerLink: '/settings' }] },
    ]);
    const headings = Array.from(
      el.querySelectorAll('.rhombus-nav-list__heading')
    ).map((h) => h.textContent?.trim());
    expect(headings).toEqual(['Main', 'Admin']);
    expect(el.querySelectorAll('.rhombus-nav-list__group').length).toBe(2);
  });

  it('renders router items as anchors with an href', () => {
    const { el } = setup([
      { items: [{ label: 'Dashboard', routerLink: '/dashboard' }] },
    ]);
    const a = el.querySelector<HTMLAnchorElement>('a.rhombus-nav-list__item');
    expect(a).toBeTruthy();
    expect(a?.getAttribute('href')).toBe('/dashboard');
    expect(a?.textContent).toContain('Dashboard');
  });

  it('marks the active router item with aria-current', async () => {
    const { fixture, el } = setup([
      {
        items: [
          { label: 'Home', routerLink: '/', exact: true },
          { label: 'Dashboard', routerLink: '/dashboard' },
        ],
      },
    ]);
    await TestBed.inject(Router).navigateByUrl('/dashboard');
    fixture.detectChanges();
    const active = el.querySelector('.rhombus-nav-list__item--active');
    expect(active?.textContent).toContain('Dashboard');
    expect(active?.getAttribute('aria-current')).toBe('page');
  });

  it('renders href items and honours the manual active flag', () => {
    const { el } = setup([
      {
        items: [
          { label: 'Blog', href: 'https://example.com', active: true },
        ],
      },
    ]);
    const a = el.querySelector<HTMLAnchorElement>('a.rhombus-nav-list__item');
    expect(a?.getAttribute('href')).toBe('https://example.com');
    expect(a?.classList).toContain('rhombus-nav-list__item--active');
    expect(a?.getAttribute('aria-current')).toBe('page');
  });

  it('passes target/rel through on href items', () => {
    const { el } = setup([
      {
        items: [
          {
            label: 'GitHub',
            href: 'https://github.com',
            target: '_blank',
            rel: 'noopener',
          },
        ],
      },
    ]);
    const a = el.querySelector<HTMLAnchorElement>('a.rhombus-nav-list__item');
    expect(a?.getAttribute('target')).toBe('_blank');
    expect(a?.getAttribute('rel')).toBe('noopener');
  });

  it('makes a disabled item inert', () => {
    const { el } = setup([
      { items: [{ label: 'Soon', routerLink: '/dashboard', disabled: true }] },
    ]);
    const a = el.querySelector<HTMLAnchorElement>('a.rhombus-nav-list__item');
    expect(a?.getAttribute('aria-disabled')).toBe('true');
    expect(a?.getAttribute('tabindex')).toBe('-1');
    expect(a?.hasAttribute('href')).toBe(false);
    expect(a?.classList).toContain('rhombus-nav-list__item--disabled');
  });

  it('renders a leading icon and a trailing count badge', () => {
    const { el } = setup([
      {
        items: [
          { label: 'Inbox', routerLink: '/dashboard', icon: 'inbox', badge: 5 },
        ],
      },
    ]);
    expect(el.querySelector('rhombus-icon.rhombus-nav-list__icon')).toBeTruthy();
    const badge = el.querySelector('.rhombus-nav-list__badge');
    expect(badge?.textContent?.trim()).toBe('5');
    expect(badge?.classList).not.toContain('rhombus-nav-list__badge--dot');
  });

  it('renders a dot badge with no text', () => {
    const { el } = setup([
      { items: [{ label: 'Alerts', routerLink: '/dashboard', badge: 'dot' }] },
    ]);
    const badge = el.querySelector('.rhombus-nav-list__badge');
    expect(badge?.classList).toContain('rhombus-nav-list__badge--dot');
    expect(badge?.textContent?.trim()).toBe('');
  });

  it('has no accessibility violations', async () => {
    const { el } = setup([
      {
        heading: 'Main',
        items: [
          { label: 'Home', routerLink: '/', icon: 'home' },
          { label: 'Dashboard', routerLink: '/dashboard', icon: 'dashboard', badge: 3 },
          { label: 'Docs', href: 'https://example.com', icon: 'book' },
        ],
      },
    ]);
    expect(await axe(el)).toHaveNoViolations();
  });

  describe('locked items', () => {
    it('renders a locked item as a focusable button (not an anchor)', () => {
      const { el } = setup([
        { items: [{ label: 'Pro feature', routerLink: '/dashboard', locked: true }] },
      ]);
      const btn = el.querySelector<HTMLButtonElement>(
        'button.rhombus-nav-list__item'
      );
      expect(btn).toBeTruthy();
      expect(btn?.classList).toContain('rhombus-nav-list__item--locked');
      // It must not navigate — no anchor / href is rendered.
      expect(el.querySelector('a.rhombus-nav-list__item')).toBeNull();
      // Buttons are focusable by default (no tabindex removal).
      expect(btn?.getAttribute('tabindex')).not.toBe('-1');
    });

    it('shows a trailing lock affordance on locked items', () => {
      const { el } = setup([
        { items: [{ label: 'Pro feature', locked: true }] },
      ]);
      expect(el.querySelector('rhombus-icon.rhombus-nav-list__lock')).toBeTruthy();
    });

    it('fires both item.action and (itemAction) on click, without navigating', () => {
      let actionCalls = 0;
      const item: RhombusNavItem = {
        label: 'Pro feature',
        routerLink: '/dashboard',
        locked: true,
        action: () => actionCalls++,
      };
      const { fixture, host, el } = setup([{ items: [item] }]);
      const btn = el.querySelector<HTMLButtonElement>(
        'button.rhombus-nav-list__item'
      );
      btn?.click();
      fixture.detectChanges();
      expect(actionCalls).toBe(1);
      expect(host.actioned).toEqual([item]);
    });

    it('lets disabled win over locked (stays inert)', () => {
      const { el } = setup([
        {
          items: [
            { label: 'Gated', routerLink: '/dashboard', locked: true, disabled: true },
          ],
        },
      ]);
      // No locked button — falls through to the inert anchor rendering.
      expect(el.querySelector('button.rhombus-nav-list__item')).toBeNull();
      const a = el.querySelector<HTMLAnchorElement>('a.rhombus-nav-list__item');
      expect(a?.getAttribute('aria-disabled')).toBe('true');
      expect(a?.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('collapsible sections', () => {
    it('renders the heading as a disclosure button wired to the group', () => {
      const { el } = setup([
        {
          heading: 'Admin',
          collapsible: true,
          items: [{ label: 'Settings', routerLink: '/settings' }],
        },
      ]);
      const toggle = el.querySelector<HTMLButtonElement>(
        'button.rhombus-nav-list__heading'
      );
      expect(toggle).toBeTruthy();
      expect(toggle?.getAttribute('aria-expanded')).toBe('true');
      const controls = toggle?.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      const group = el.querySelector('ul.rhombus-nav-list__group');
      expect(group?.id).toBe(controls);
    });

    it('honours expanded: false and keeps the group in the DOM but hidden', () => {
      const { el } = setup([
        {
          heading: 'Admin',
          collapsible: true,
          expanded: false,
          items: [{ label: 'Settings', routerLink: '/settings' }],
        },
      ]);
      const toggle = el.querySelector('button.rhombus-nav-list__heading');
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
      const group = el.querySelector<HTMLElement>('ul.rhombus-nav-list__group');
      expect(group).toBeTruthy(); // still present (aria-controls target)
      expect(group?.hidden).toBe(true);
    });

    it('toggles expanded state on click', () => {
      const { fixture, el } = setup([
        {
          heading: 'Admin',
          collapsible: true,
          items: [{ label: 'Settings', routerLink: '/settings' }],
        },
      ]);
      const toggle = el.querySelector<HTMLButtonElement>(
        'button.rhombus-nav-list__heading'
      );
      const group = el.querySelector<HTMLElement>('ul.rhombus-nav-list__group');
      expect(group?.hidden).toBe(false);
      toggle?.click();
      fixture.detectChanges();
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
      expect(group?.hidden).toBe(true);
    });

    it('leaves a non-collapsible heading as a static paragraph', () => {
      const { el } = setup([
        { heading: 'Main', items: [{ label: 'Home', routerLink: '/' }] },
      ]);
      expect(el.querySelector('p.rhombus-nav-list__heading')).toBeTruthy();
      expect(el.querySelector('button.rhombus-nav-list__heading')).toBeNull();
    });
  });

  describe('list appearance', () => {
    it('adds the list modifier and preserves active-state styling', async () => {
      const { fixture, host, el } = setup([
        {
          items: [
            { label: 'Dashboard', routerLink: '/dashboard', icon: 'dashboard' },
          ],
        },
      ]);
      host.appearance = 'list';
      fixture.detectChanges();
      expect(el.querySelector('nav.rhombus-nav-list--list')).toBeTruthy();
      await TestBed.inject(Router).navigateByUrl('/dashboard');
      fixture.detectChanges();
      expect(el.querySelector('.rhombus-nav-list__item--active')).toBeTruthy();
    });

    it('renders a per-item trailing icon', () => {
      const { el } = setup([
        {
          items: [
            {
              label: 'Portfolio',
              href: 'https://example.com',
              trailingIcon: 'chevron_right',
            },
          ],
        },
      ]);
      expect(
        el.querySelector('rhombus-icon.rhombus-nav-list__trailing-icon')
      ).toBeTruthy();
    });

    it('has no accessibility violations in list appearance with locked + collapsible', async () => {
      const { fixture, host, el } = setup([
        {
          heading: 'Links',
          collapsible: true,
          items: [
            { label: 'Home', href: 'https://example.com', icon: 'home', trailingIcon: 'chevron_right' },
            { label: 'Pro', icon: 'star', locked: true },
          ],
        },
      ]);
      host.appearance = 'list';
      fixture.detectChanges();
      expect(await axe(el)).toHaveNoViolations();
    });
  });
});
