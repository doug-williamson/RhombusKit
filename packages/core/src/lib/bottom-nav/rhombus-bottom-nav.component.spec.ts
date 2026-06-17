// packages/core/src/lib/bottom-nav/rhombus-bottom-nav.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { axe } from '../../testing/axe';
import {
  BottomNavIndicator,
  RhombusBottomNavComponent,
  RhombusBottomNavItem,
} from './rhombus-bottom-nav.component';

// ---------------------------------------------------------------------------
// Controlled (non-router) host
// ---------------------------------------------------------------------------

@Component({
  standalone: true,
  imports: [RhombusBottomNavComponent],
  template: `
    <rhombus-bottom-nav
      [items]="items"
      [activeId]="activeId"
      [indicator]="indicator"
      (activeChange)="onChange($event)"
    />
  `,
})
class HostComponent {
  items: RhombusBottomNavItem[] = [
    { id: 'workout', label: 'Workout', icon: 'home' },
    { id: 'mesos', label: 'Mesos', icon: 'folder', badge: 3 },
    { id: 'more', label: 'More', icon: 'more_horiz', disabled: true },
  ];
  activeId = 'workout';
  indicator: BottomNavIndicator = 'color';
  changed: string[] = [];
  onChange(id: string): void {
    this.changed.push(id);
  }
}

function setup(): { fixture: ComponentFixture<HostComponent>; host: HostComponent; el: HTMLElement } {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return { fixture, host: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
}

// ---------------------------------------------------------------------------
// Router host
// ---------------------------------------------------------------------------

@Component({
  standalone: true,
  imports: [RhombusBottomNavComponent],
  template: `<rhombus-bottom-nav [items]="items" />`,
})
class RouterHostComponent {
  items: RhombusBottomNavItem[] = [
    { id: 'workout', label: 'Workout', icon: 'home', routerLink: '/workout' },
    { id: 'mesos', label: 'Mesos', icon: 'folder', routerLink: '/mesos' },
  ];
}

// ---------------------------------------------------------------------------
// Controlled suite
// ---------------------------------------------------------------------------

describe('rhombus-bottom-nav', () => {
  it('renders a labelled nav with one item per entry', () => {
    const { el } = setup();
    const nav = el.querySelector('nav.rhombus-bottom-nav');
    expect(nav?.getAttribute('aria-label')).toBe('Primary');
    expect(el.querySelectorAll('.rhombus-bottom-nav__item').length).toBe(3);
  });

  it('marks the controlled active item with aria-current and the active class', () => {
    const { el } = setup();
    const items = el.querySelectorAll('.rhombus-bottom-nav__item');
    const workout = items[0];
    expect(workout.classList.contains('rhombus-bottom-nav__item--active')).toBe(true);
    expect(workout.getAttribute('aria-current')).toBe('page');
  });

  it('emits activeChange with the item id on click', () => {
    const { fixture, host, el } = setup();
    const mesos = el.querySelectorAll('.rhombus-bottom-nav__item')[1] as HTMLButtonElement;
    mesos.click();
    fixture.detectChanges();
    expect(host.changed).toEqual(['mesos']);
  });

  it('does not emit for a disabled item', () => {
    const { fixture, host, el } = setup();
    const more = el.querySelectorAll('.rhombus-bottom-nav__item')[2] as HTMLButtonElement;
    more.click();
    fixture.detectChanges();
    expect(host.changed).toEqual([]);
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('reflects the indicator on the nav as a data attribute', () => {
    const { fixture, host, el } = setup();
    expect(el.querySelector('.rhombus-bottom-nav')?.getAttribute('data-indicator')).toBe('color');
    host.indicator = 'pill';
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-bottom-nav')?.getAttribute('data-indicator')).toBe('pill');
  });

  // provideNoopAnimations() is in setup() — badge content is available synchronously
  it('renders a badge for items that declare one', () => {
    const { el } = setup();
    const badge = el.querySelector('.mat-badge-content');
    expect(badge?.textContent).toContain('3');
  });
});

// ---------------------------------------------------------------------------
// Router suite
// ---------------------------------------------------------------------------

describe('rhombus-bottom-nav (router)', () => {
  it('renders router items as links and marks the active one via routerLinkActive', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideRouter([
          { path: 'workout', component: RouterHostComponent },
          { path: 'mesos', component: RouterHostComponent },
        ]),
      ],
    });

    const fixture = TestBed.createComponent(RouterHostComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/workout');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('a.rhombus-bottom-nav__item')
    ) as HTMLElement[];
    expect(links.length).toBe(2);

    const workout = links.find((a) => a.textContent?.includes('Workout'))!;
    expect(workout.classList.contains('rhombus-bottom-nav__item--active')).toBe(true);
    expect(workout.getAttribute('aria-current')).toBe('page');
  });
});
