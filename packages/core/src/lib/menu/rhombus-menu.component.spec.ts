import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { axe } from '../../testing/axe';
import { RhombusMenuComponent } from './rhombus-menu.component';
import type { MenuItem } from './menu.types';

@Component({
  standalone: true,
  imports: [RhombusMenuComponent],
  template: `
    <rhombus-menu [items]="items()">
      <span>Open</span>
    </rhombus-menu>
  `,
})
class HostComponent {
  readonly log: string[] = [];
  readonly items = signal<MenuItem[]>([
    { label: 'Edit', icon: 'edit', action: () => this.log.push('Edit') },
    { label: 'Duplicate', action: () => this.log.push('Duplicate') },
    {
      label: 'Delete',
      variant: 'danger',
      dividerBefore: true,
      action: () => this.log.push('Delete'),
    },
    { label: 'Locked', disabled: true, action: () => this.log.push('Locked') },
  ]);
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  loader: HarnessLoader;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({
    providers: [provideNoopAnimations(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(HostComponent);
  const loader = TestbedHarnessEnvironment.loader(fixture);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    loader,
    el: fixture.nativeElement as HTMLElement,
  };
}

async function itemTexts(menu: MatMenuHarness): Promise<string[]> {
  const items = await menu.getItems();
  return Promise.all(items.map((i) => i.getText()));
}

describe('rhombus-menu', () => {
  it('renders one menu item per config entry', async () => {
    const { loader } = setup();
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    expect((await menu.getItems()).length).toBe(4);
  });

  it('invokes the item action on click', async () => {
    const { loader, host } = setup();
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const items = await menu.getItems();
    const texts = await itemTexts(menu);
    await items[texts.findIndex((t) => t.includes('Edit'))].click();
    expect(host.log).toEqual(['Edit']);
  });

  it('disables a disabled item', async () => {
    const { loader } = setup();
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const items = await menu.getItems();
    const texts = await itemTexts(menu);
    const locked = items[texts.findIndex((t) => t.includes('Locked'))];
    expect(await locked.isDisabled()).toBe(true);
  });

  it('marks a danger item with the danger class', async () => {
    const { loader } = setup();
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const danger = overlay.querySelector('.rhombus-menu__item--danger');
    expect(danger?.textContent).toContain('Delete');
  });

  it('renders routerLink and href items as anchors', async () => {
    const { fixture, host, loader } = setup();
    host.items.set([
      { label: 'Docs', routerLink: '/docs' },
      { label: 'GitHub', href: 'https://github.com', target: '_blank' },
      { label: 'Run', action: () => host.log.push('Run') },
    ]);
    fixture.detectChanges();
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const anchors = Array.from(
      overlay.querySelectorAll<HTMLAnchorElement>('a.rhombus-menu__item')
    );
    expect(anchors.length).toBe(2);
    expect(
      anchors.find((a) => a.textContent?.includes('Docs'))?.getAttribute('href')
    ).toBe('/docs');
    const gh = anchors.find((a) => a.textContent?.includes('GitHub'));
    expect(gh?.getAttribute('href')).toBe('https://github.com');
    expect(gh?.getAttribute('target')).toBe('_blank');
    // The plain command item stays a <button>.
    expect(overlay.querySelectorAll('button.rhombus-menu__item').length).toBe(1);
  });

  it('has no accessibility violations on the trigger or the open panel', async () => {
    const { loader, el } = setup();
    const menu = await loader.getHarness(MatMenuHarness);
    expect(await axe(el)).toHaveNoViolations();
    await menu.open();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(await axe(overlay)).toHaveNoViolations();
  });
});
