import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  MatChipListbox,
  MatChipListboxChange,
  MatChipsModule,
} from '@angular/material/chips';
import { MatChipListboxHarness } from '@angular/material/chips/testing';
import { axe } from '../../testing/axe';
import { RhombusChipDirective } from './rhombus-chip.directive';
import {
  ChipGroupSelection,
  RhombusChipGroupDirective,
} from './rhombus-chip-group.directive';

@Component({
  standalone: true,
  imports: [MatChipsModule, RhombusChipGroupDirective, RhombusChipDirective],
  template: `
    <mat-chip-listbox
      rhombusChipGroup
      aria-label="Status"
      [selection]="selection"
      (selectionChange)="emitted.push($event)"
    >
      <mat-chip-option rhombusChip value="draft">Draft</mat-chip-option>
      <mat-chip-option rhombusChip value="published">Published</mat-chip-option>
    </mat-chip-listbox>
  `,
})
class HostComponent {
  selection: ChipGroupSelection = 'single';
  emitted: unknown[] = [];
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  groupEl: HTMLElement;
  listbox: MatChipListbox;
  loader: HarnessLoader;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  const loader = TestbedHarnessEnvironment.loader(fixture);
  fixture.detectChanges();
  const de = fixture.debugElement.query(By.directive(RhombusChipGroupDirective));
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    groupEl: de.nativeElement as HTMLElement,
    listbox: de.injector.get(MatChipListbox),
    loader,
  };
}

describe('rhombusChipGroup', () => {
  it('adds the stable host class', () => {
    const { groupEl } = setup();
    expect(groupEl.classList).toContain('rhombus-chip-group');
  });

  it('drives single-select onto the listbox (multiple off, selectable on)', () => {
    const { listbox } = setup();
    expect(listbox.multiple).toBe(false);
    expect(listbox.selectable).toBe(true);
  });

  it('drives multi-select onto the listbox', () => {
    const { fixture, host, listbox } = setup();
    host.selection = 'multiple';
    fixture.detectChanges();
    expect(listbox.multiple).toBe(true);
    expect(listbox.selectable).toBe(true);
  });

  it('disables selection at the container for the none mode', () => {
    const { fixture, host, listbox } = setup();
    host.selection = 'none';
    fixture.detectChanges();
    expect(listbox.selectable).toBe(false);
  });

  it('re-emits the chosen chip value under selectionChange', async () => {
    const { host, loader } = setup();
    const listboxHarness = await loader.getHarness(MatChipListboxHarness);
    const chips = await listboxHarness.getChips();
    await chips[1].select();
    expect(host.emitted).toContain('published');
  });

  it('suppresses selectionChange while selection is none', () => {
    const { fixture, host, listbox } = setup();
    host.selection = 'none';
    fixture.detectChanges();
    listbox.change.emit({
      source: listbox,
      value: 'draft',
    } as unknown as MatChipListboxChange);
    expect(host.emitted).toEqual([]);
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
