import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatActionListHarness,
  MatListOptionHarness,
  MatSelectionListHarness,
} from '@angular/material/list/testing';
import { axe } from '../../testing/axe';
import { RhombusSelectionListComponent } from './rhombus-selection-list.component';
import {
  SelectionListMode,
  SelectionListOption,
} from './selection-list.types';

interface Person {
  id: string;
  name: string;
}

@Component({
  standalone: true,
  imports: [RhombusSelectionListComponent, ReactiveFormsModule],
  template: `
    <rhombus-selection-list
      [label]="label"
      [ariaLabel]="ariaLabel"
      [mode]="mode"
      [multiple]="multiple"
      [options]="options"
      [disabled]="disabled"
      [required]="required"
      [togglePosition]="togglePosition"
      [compareWith]="compareWith"
      [control]="control"
      [(value)]="value"
      (selectionChange)="lastSelection = $event"
      (itemAction)="actions.push($any($event))"
    />
  `,
})
class HostComponent {
  label = 'Toppings';
  ariaLabel = '';
  mode: SelectionListMode = 'selection';
  multiple = true;
  options: SelectionListOption<string>[] = [
    { value: 'cheese', label: 'Cheese' },
    { value: 'mushroom', label: 'Mushroom', description: 'Fresh cremini' },
    { value: 'olive', label: 'Olive' },
    { value: 'anchovy', label: 'Anchovy', disabled: true },
  ];
  disabled = false;
  required = false;
  togglePosition: 'before' | 'after' = 'after';
  compareWith: (a: string, b: string) => boolean = (a, b) => a === b;
  control: FormControl<string[] | null> | null = null;
  value: string[] = [];
  lastSelection: string[] | undefined = undefined;
  actions: SelectionListOption<string>[] = [];
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  loader: HarnessLoader;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  const loader = TestbedHarnessEnvironment.loader(fixture);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    loader,
  };
}

describe('rhombus-selection-list', () => {
  describe('selection mode', () => {
    it('renders a listbox with one option per entry', async () => {
      const { el, loader } = setup();
      expect(el.querySelector('[role="listbox"]')).not.toBeNull();
      const list = await loader.getHarness(MatSelectionListHarness);
      const items = await list.getItems();
      expect(items.length).toBe(4);
    });

    it('selects values and emits selectionChange plus updates value (lightweight)', async () => {
      const { host, loader } = setup();
      const list = await loader.getHarness(MatSelectionListHarness);
      await list.selectItems({ text: 'Cheese' }, { text: 'Olive' });
      expect(host.value).toEqual(['cheese', 'olive']);
      expect(host.lastSelection).toEqual(['cheese', 'olive']);
    });

    it('reflects the value model into the selected options (lightweight)', async () => {
      const { fixture, host, loader } = setup();
      host.value = ['mushroom'];
      fixture.detectChanges();
      const list = await loader.getHarness(MatSelectionListHarness);
      const mushroom = await list.getItems({ text: /Mushroom/ });
      expect(await mushroom[0].isSelected()).toBe(true);
    });

    it('writes selection into a bound control and emits (control mode)', async () => {
      const { fixture, host, loader } = setup();
      host.control = new FormControl<string[]>([]);
      fixture.detectChanges();
      const list = await loader.getHarness(MatSelectionListHarness);
      await list.selectItems({ text: 'Cheese' });
      expect(host.control.value).toEqual(['cheese']);
      expect(host.lastSelection).toEqual(['cheese']);
    });

    it('seeds selection from an already-populated control', async () => {
      const { fixture, host, loader } = setup();
      host.control = new FormControl<string[]>(['olive']);
      fixture.detectChanges();
      const list = await loader.getHarness(MatSelectionListHarness);
      const olive = await list.getItems({ text: 'Olive' });
      expect(await olive[0].isSelected()).toBe(true);
    });

    it('single-select mode yields a 0/1-length array', async () => {
      // `multiple` must be set before init — Material forbids changing it after.
      TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
      const fixture = TestBed.createComponent(HostComponent);
      const loader = TestbedHarnessEnvironment.loader(fixture);
      fixture.componentInstance.multiple = false;
      fixture.detectChanges();
      const list = await loader.getHarness(MatSelectionListHarness);
      await list.selectItems({ text: 'Cheese' });
      expect(fixture.componentInstance.value).toEqual(['cheese']);
    });

    it('disables an option flagged disabled', async () => {
      const { loader } = setup();
      const list = await loader.getHarness(MatSelectionListHarness);
      const anchovy = await list.getItems({ text: 'Anchovy' });
      expect(await anchovy[0].isDisabled()).toBe(true);
    });

    it('disables the whole list via the lightweight disabled input', async () => {
      const { fixture, host, loader } = setup();
      host.disabled = true;
      fixture.detectChanges();
      const list = await loader.getHarness(MatSelectionListHarness);
      expect(await list.isDisabled()).toBe(true);
    });

    it('ignores the lightweight disabled input once a control is bound', async () => {
      const { fixture, host, loader } = setup();
      host.disabled = true;
      host.control = new FormControl<string[]>([]);
      fixture.detectChanges();
      const list = await loader.getHarness(MatSelectionListHarness);
      expect(await list.isDisabled()).toBe(false);
      host.control.disable();
      fixture.detectChanges();
      expect(await list.isDisabled()).toBe(true);
    });

    it('matches object values with compareWith', async () => {
      TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
      const fixture = TestBed.createComponent(ObjectHost);
      const loader = TestbedHarnessEnvironment.loader(fixture);
      fixture.detectChanges();
      const list = await loader.getHarness(MatSelectionListHarness);
      const ada = await list.getItems({ text: 'Ada' });
      expect(await ada[0].isSelected()).toBe(true);
    });

    it('renders a description as a secondary line', async () => {
      const { loader } = setup();
      const list = await loader.getHarness(MatSelectionListHarness);
      const mushroom = await list.getItems({ text: /Mushroom/ });
      expect(await mushroom[0].getSecondaryText()).toBe('Fresh cremini');
    });

    it('names the listbox via the visible label', () => {
      const { el } = setup();
      const listbox = el.querySelector('[role="listbox"]') as HTMLElement;
      const labelledby = listbox.getAttribute('aria-labelledby');
      expect(labelledby).toBeTruthy();
      expect(el.querySelector(`#${labelledby}`)?.textContent?.trim()).toBe(
        'Toppings'
      );
    });

    it('names the listbox via ariaLabel when no visible label', () => {
      const { fixture, host, el } = setup();
      host.label = '';
      host.ariaLabel = 'Pizza toppings';
      fixture.detectChanges();
      const listbox = el.querySelector('[role="listbox"]') as HTMLElement;
      expect(listbox.getAttribute('aria-label')).toBe('Pizza toppings');
    });

    it('reflects aria-required on the listbox when required', () => {
      const { fixture, host, el } = setup();
      host.required = true;
      fixture.detectChanges();
      const listbox = el.querySelector('[role="listbox"]') as HTMLElement;
      expect(listbox.getAttribute('aria-required')).toBe('true');
    });

    it('places the toggle before the label when requested', async () => {
      const { fixture, host, loader } = setup();
      host.togglePosition = 'before';
      fixture.detectChanges();
      const list = await loader.getHarness(MatSelectionListHarness);
      const items = await list.getItems();
      expect(await items[0].getCheckboxPosition()).toBe('before');
    });

    it('has no accessibility violations', async () => {
      const { el } = setup();
      expect(await axe(el)).toHaveNoViolations();
    });
  });

  describe('action mode', () => {
    function setupAction(): {
      fixture: ComponentFixture<HostComponent>;
      host: HostComponent;
      el: HTMLElement;
      loader: HarnessLoader;
    } {
      const ctx = setup();
      ctx.host.mode = 'action';
      ctx.host.options = [
        { value: 'edit', label: 'Edit' },
        { value: 'duplicate', label: 'Duplicate' },
        { value: 'delete', label: 'Delete', danger: true },
      ];
      ctx.fixture.detectChanges();
      return ctx;
    }

    it('renders an action list (not a listbox)', async () => {
      const { el, loader } = setupAction();
      expect(el.querySelector('[role="listbox"]')).toBeNull();
      const list = await loader.getHarness(MatActionListHarness);
      const items = await list.getItems();
      expect(items.length).toBe(3);
    });

    it('emits itemAction with the clicked option', async () => {
      const { host, loader } = setupAction();
      const list = await loader.getHarness(MatActionListHarness);
      const items = await list.getItems();
      await items[0].click();
      expect(host.actions.length).toBe(1);
      expect(host.actions[0].value).toBe('edit');
    });

    it('marks a danger row with the danger class', async () => {
      const { el } = setupAction();
      const danger = el.querySelector('.rhombus-selection-list__danger');
      expect(danger).not.toBeNull();
      expect(danger?.textContent).toContain('Delete');
    });

    it('does not emit itemAction for a disabled action', async () => {
      const { fixture, host } = setupAction();
      host.options = [{ value: 'edit', label: 'Edit', disabled: true }];
      fixture.detectChanges();
      const button = (fixture.nativeElement as HTMLElement).querySelector(
        'button[mat-list-item]'
      ) as HTMLButtonElement;
      button.click();
      expect(host.actions.length).toBe(0);
    });

    it('has no accessibility violations', async () => {
      const { el } = setupAction();
      expect(await axe(el)).toHaveNoViolations();
    });
  });
});

@Component({
  standalone: true,
  imports: [RhombusSelectionListComponent],
  template: `
    <rhombus-selection-list
      label="People"
      [options]="options"
      [compareWith]="compareWith"
      [value]="value"
    />
  `,
})
class ObjectHost {
  readonly ada: Person = { id: '1', name: 'Ada' };
  options: SelectionListOption<Person>[] = [
    { value: this.ada, label: 'Ada' },
    { value: { id: '2', name: 'Alan' }, label: 'Alan' },
  ];
  compareWith = (a: Person, b: Person) => a.id === b.id;
  // A distinct object instance with the same id — only compareWith can match it.
  value: Person[] = [{ id: '1', name: 'Ada' }];
}
