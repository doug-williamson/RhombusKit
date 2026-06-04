import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { axe } from '../../testing/axe';
import {
  BreadcrumbItem,
  RhombusBreadcrumbsComponent,
} from './rhombus-breadcrumbs.component';

@Component({
  standalone: true,
  imports: [RhombusBreadcrumbsComponent],
  template: `<rhombus-breadcrumbs [items]="items" />`,
})
class HostComponent {
  items: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Projects', link: '/projects' },
    { label: 'RhombusKit' },
  ];
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('rhombus-breadcrumbs', () => {
  it('renders a nav labelled "Breadcrumb" wrapping an ordered list', () => {
    const { el } = setup();
    const nav = el.querySelector('nav[aria-label="Breadcrumb"]');
    expect(nav?.querySelector('ol')).not.toBeNull();
  });

  it('renders one list item per entry', () => {
    const { el } = setup();
    expect(el.querySelectorAll('.rhombus-breadcrumbs__item').length).toBe(3);
  });

  it('renders linked entries as anchors with the routerLink href', () => {
    const { el } = setup();
    const links = el.querySelectorAll<HTMLAnchorElement>(
      'a.rhombus-breadcrumbs__link'
    );
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/');
    expect(links[1].getAttribute('href')).toBe('/projects');
  });

  it('marks the last entry as the current page and not a link', () => {
    const { el } = setup();
    const current = el.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('RhombusKit');
    expect(current?.tagName).not.toBe('A');
  });

  it('renders a separator between entries but not after the last', () => {
    const { el } = setup();
    expect(
      el.querySelectorAll('.rhombus-breadcrumbs__separator').length
    ).toBe(2);
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
