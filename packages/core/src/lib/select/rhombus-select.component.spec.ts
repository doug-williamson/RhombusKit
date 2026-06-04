import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectHarness } from '@angular/material/select/testing';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { axe } from '../../testing/axe';
import {
  RhombusSelectComponent,
  SelectOption,
  SelectOptionGroup,
} from './rhombus-select.component';

@Component({
  standalone: true,
  imports: [RhombusSelectComponent, ReactiveFormsModule],
  template: `
    <rhombus-select
      [label]="label"
      [appearance]="appearance"
      [size]="size"
      [required]="required"
      [multiple]="multiple"
      [hint]="hint"
      [options]="options"
      [groups]="groups"
      [control]="control"
      (selectionChange)="lastEmitted = $event"
    />
  `,
})
class HostComponent {
  label = 'Priority';
  appearance: FormFieldAppearance = 'outline';
  size: FormFieldSize = 'md';
  required = false;
  multiple = false;
  hint: string | null = null;
  options: SelectOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'high', label: 'High' },
    { value: 'blocked', label: 'Blocked', disabled: true },
  ];
  groups: SelectOptionGroup[] = [];
  control: FormControl | null = null;
  lastEmitted: unknown = undefined;
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

function formField(el: HTMLElement): HTMLElement {
  return el.querySelector('mat-form-field') as HTMLElement;
}

describe('rhombus-select', () => {
  it('renders the label', () => {
    const { el } = setup();
    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe('Priority');
  });

  it('applies the default appearance and size host classes', () => {
    const { el } = setup();
    const cls = formField(el).classList;
    expect(cls).toContain('rhombus-form-field');
    expect(cls).toContain('rhombus-form-field--outline');
    expect(cls).toContain('rhombus-form-field--md');
  });

  it('reflects appearance and size into the host classes', () => {
    const { fixture, host, el } = setup();
    host.appearance = 'fill';
    host.size = 'lg';
    fixture.detectChanges();
    const cls = formField(el).classList;
    expect(cls).toContain('rhombus-form-field--fill');
    expect(cls).toContain('rhombus-form-field--lg');
    expect(cls).not.toContain('rhombus-form-field--outline');
  });

  it('renders one option per flat entry', async () => {
    const { loader } = setup();
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const texts = await Promise.all(
      (await select.getOptions()).map((o) => o.getText())
    );
    expect(texts).toEqual(['Low', 'High', 'Blocked']);
  });

  it('renders grouped options when groups are provided', async () => {
    const { fixture, host, loader } = setup();
    host.options = [];
    host.groups = [
      { groupLabel: 'Urgent', options: [{ value: 'now', label: 'Now' }] },
      {
        groupLabel: 'Later',
        options: [
          { value: 'soon', label: 'Soon' },
          { value: 'someday', label: 'Someday' },
        ],
      },
    ];
    fixture.detectChanges();
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const groups = await select.getOptionGroups();
    const labels = await Promise.all(groups.map((g) => g.getLabelText()));
    expect(labels).toEqual(['Urgent', 'Later']);
    expect((await select.getOptions()).length).toBe(3);
  });

  it('disables an option flagged as disabled', async () => {
    const { loader } = setup();
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const [, , blocked] = await select.getOptions();
    expect(await blocked.isDisabled()).toBe(true);
  });

  it('emits selectionChange and updates the bound control', async () => {
    const { host, loader } = setup();
    host.control = new FormControl<string | null>(null);
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    await select.clickOptions({ text: 'High' });
    expect(host.control.value).toBe('high');
    expect(host.lastEmitted).toBe('high');
  });

  it('selects an array of values in multiple mode', async () => {
    const { fixture, host, loader } = setup();
    host.multiple = true;
    host.options = [
      { value: 'low', label: 'Low' },
      { value: 'high', label: 'High' },
    ];
    host.control = new FormControl<string[]>([]);
    fixture.detectChanges();
    const select = await loader.getHarness(MatSelectHarness);
    expect(await select.isMultiple()).toBe(true);
    await select.open();
    const options = await select.getOptions();
    await options[0].click();
    await options[1].click();
    expect(host.control.value).toEqual(['low', 'high']);
    expect(Array.isArray(host.lastEmitted)).toBe(true);
  });

  it('reflects the required state to the select', async () => {
    const { fixture, host, loader } = setup();
    host.required = true;
    fixture.detectChanges();
    const select = await loader.getHarness(MatSelectHarness);
    expect(await select.isRequired()).toBe(true);
  });

  it('renders a hint only when one is provided', () => {
    const { fixture, host, el } = setup();
    expect(el.querySelector('mat-hint')).toBeNull();
    host.hint = 'Pick the most urgent.';
    fixture.detectChanges();
    expect(el.querySelector('mat-hint')?.textContent?.trim()).toBe(
      'Pick the most urgent.'
    );
  });

  it('has no accessibility violations for the trigger and open panel', async () => {
    const { el, loader } = setup();
    expect(await axe(el)).toHaveNoViolations();
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const overlay = el.ownerDocument.querySelector(
      '.cdk-overlay-container'
    ) as HTMLElement;
    expect(await axe(overlay)).toHaveNoViolations();
  });
});
