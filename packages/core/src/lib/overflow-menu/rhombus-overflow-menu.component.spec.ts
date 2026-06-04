import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { axe } from '../../testing/axe';
import { RhombusOverflowMenuComponent } from './rhombus-overflow-menu.component';
import type { OverflowMenuItem } from './overflow-menu.types';

@Component({
  standalone: true,
  imports: [RhombusOverflowMenuComponent],
  template: `<rhombus-overflow-menu [items]="items()" [ariaLabel]="ariaLabel" />`,
})
class HostComponent {
  ariaLabel = 'More actions';
  readonly log: string[] = [];
  readonly items = signal<OverflowMenuItem[]>([
    { label: 'Edit', icon: 'edit', action: () => this.log.push('Edit') },
    { label: 'Archive', icon: 'archive', action: () => this.log.push('Archive') },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      dividerBefore: true,
      action: () => this.log.push('Delete'),
    },
  ]);
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  loader: HarnessLoader;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
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

describe('rhombus-overflow-menu', () => {
  it('renders a trigger labelled by ariaLabel', () => {
    const { el } = setup();
    const trigger = el.querySelector('button[aria-label="More actions"]');
    expect(trigger).not.toBeNull();
  });

  it('opens to reveal one item per entry', async () => {
    const { loader } = setup();
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    expect((await menu.getItems()).length).toBe(3);
  });

  it('fires the item action on click', async () => {
    const { loader, host } = setup();
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const items = await menu.getItems();
    const texts = await Promise.all(items.map((i) => i.getText()));
    await items[texts.findIndex((t) => t.includes('Edit'))].click();
    expect(host.log).toEqual(['Edit']);
  });

  it('has no accessibility violations on the trigger or the open panel', async () => {
    const { loader, el } = setup();
    const menu = await loader.getHarness(MatMenuHarness);
    expect(await axe(el)).toHaveNoViolations();
    await menu.open();
    const overlay = el.ownerDocument.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    expect(await axe(overlay)).toHaveNoViolations();
  });
});
