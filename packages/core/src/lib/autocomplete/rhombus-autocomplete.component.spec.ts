import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import {
  FormFieldAppearance,
  FormFieldSize,
} from '../form-field/form-field.types';
import { axe } from '../../testing/axe';
import {
  AutocompleteFilterFn,
  AutocompleteOption,
  RhombusAutocompleteComponent,
} from './rhombus-autocomplete.component';

interface Fruit {
  id: string;
  name: string;
}

/** Host-local label-substring filter, matching the component's built-in default. */
const SUBSTRING: AutocompleteFilterFn<string> = (opt, query) =>
  opt.label.toLowerCase().includes(query.toLowerCase());

@Component({
  standalone: true,
  imports: [RhombusAutocompleteComponent, ReactiveFormsModule],
  template: `
    <rhombus-autocomplete
      [label]="label"
      [appearance]="appearance"
      [size]="size"
      [required]="required"
      [hint]="hint"
      [options]="options"
      [filterWith]="filterWith"
      [displayWith]="displayWith"
      [minChars]="minChars"
      [debounceMs]="debounceMs"
      [loading]="loading"
      [noResultsText]="noResultsText"
      [disabled]="disabled"
      [control]="control"
      (optionSelected)="selected.push($any($event))"
      (queryChange)="queries.push($event)"
    />
  `,
})
class HostComponent {
  label = 'Fruit';
  appearance: FormFieldAppearance = 'outline';
  size: FormFieldSize = 'md';
  required = false;
  hint: string | null = null;
  options: AutocompleteOption<string>[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'apricot', label: 'Apricot' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry', disabled: true },
  ];
  filterWith: AutocompleteFilterFn<string> | null = SUBSTRING;
  displayWith: ((value: string | null) => string) | null = null;
  minChars = 0;
  debounceMs = 0;
  loading = false;
  noResultsText = 'No results';
  disabled = false;
  control: FormControl<string | null> | null = null;
  selected: string[] = [];
  queries: string[] = [];
}

/** Minimal fixture that leaves `filterWith` unbound, exercising the built-in default. */
@Component({
  standalone: true,
  imports: [RhombusAutocompleteComponent],
  template: `
    <rhombus-autocomplete label="Fruit" [options]="options" />
  `,
})
class DefaultFilterHost {
  options: AutocompleteOption<string>[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ];
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

function liveText(el: HTMLElement): string {
  return (
    el.querySelector('.rhombus-autocomplete__live')?.textContent?.trim() ?? ''
  );
}

function overlay(el: HTMLElement): HTMLElement {
  return el.ownerDocument.querySelector(
    '.cdk-overlay-container'
  ) as HTMLElement;
}

describe('rhombus-autocomplete', () => {
  it('renders the label', () => {
    const { el } = setup();
    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe('Fruit');
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

  it('renders every option when the panel opens with an empty query', async () => {
    const { loader } = setup();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.focus();
    const texts = await Promise.all(
      (await auto.getOptions()).map((o) => o.getText())
    );
    expect(texts).toEqual(['Apple', 'Apricot', 'Banana', 'Cherry']);
  });

  it('filters options by the typed query', async () => {
    const { loader } = setup();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.enterText('ap');
    const texts = await Promise.all(
      (await auto.getOptions()).map((o) => o.getText())
    );
    expect(texts).toEqual(['Apple', 'Apricot']);
  });

  it('applies a case-insensitive label-substring filter by default', async () => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(DefaultFilterHost);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.enterText('BAN');
    const texts = await Promise.all(
      (await auto.getOptions()).map((o) => o.getText())
    );
    expect(texts).toEqual(['Banana']);
  });

  it('does not filter locally when filterWith is null (server mode)', async () => {
    const { fixture, host, loader } = setup();
    host.filterWith = null;
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.enterText('zzz');
    const texts = await Promise.all(
      (await auto.getOptions()).map((o) => o.getText())
    );
    expect(texts).toEqual(['Apple', 'Apricot', 'Banana', 'Cherry']);
  });

  it('honours a custom filterWith predicate', async () => {
    const { fixture, host, loader } = setup();
    host.filterWith = (opt, query) => opt.value.startsWith(query);
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.enterText('ban');
    const texts = await Promise.all(
      (await auto.getOptions()).map((o) => o.getText())
    );
    expect(texts).toEqual(['Banana']);
  });

  it('disables an option flagged disabled', async () => {
    const { loader } = setup();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.focus();
    const options = await auto.getOptions();
    expect(await options[3].isDisabled()).toBe(true);
  });

  it('emits optionSelected and writes the value to the bound control', async () => {
    const { fixture, host, loader } = setup();
    host.control = new FormControl<string | null>(null);
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.selectOption({ text: 'Banana' });
    expect(host.selected).toEqual(['banana']);
    expect(host.control.value).toBe('banana');
  });

  it('allows free text when requireSelection is false (default)', async () => {
    const { fixture, host, loader } = setup();
    host.control = new FormControl<string | null>(null);
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.enterText('dragonfruit');
    expect(host.control.value).toBe('dragonfruit');
  });

  it('emits queryChange as the user types', fakeAsync(() => {
    const { fixture, host, el } = setup();
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'ap';
    input.dispatchEvent(new Event('input'));
    tick(0);
    fixture.detectChanges();
    expect(host.queries).toContain('ap');
    flush();
  }));

  it('debounces queryChange by debounceMs', fakeAsync(() => {
    const { fixture, host, el } = setup();
    host.debounceMs = 200;
    fixture.detectChanges();
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'ba';
    input.dispatchEvent(new Event('input'));
    tick(100);
    expect(host.queries).toEqual([]);
    tick(100);
    expect(host.queries).toEqual(['ba']);
    flush();
  }));

  it('gates the query below minChars', fakeAsync(() => {
    const { fixture, host, el } = setup();
    host.minChars = 3;
    fixture.detectChanges();
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'ap';
    input.dispatchEvent(new Event('input'));
    tick(0);
    expect(host.queries).toEqual([]);
    input.value = 'app';
    input.dispatchEvent(new Event('input'));
    tick(0);
    expect(host.queries).toEqual(['app']);
    flush();
  }));

  it('shows a disabled no-results option and announces it', async () => {
    const { loader, el } = setup();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.enterText('zzz');
    const options = await auto.getOptions();
    expect(options.length).toBe(1);
    expect(await options[0].getText()).toBe('No results');
    expect(await options[0].isDisabled()).toBe(true);
    expect(liveText(el)).toContain('No results');
  });

  it('shows a disabled loading option and announces loading', async () => {
    const { fixture, host, loader, el } = setup();
    host.loading = true;
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.focus();
    const options = await auto.getOptions();
    expect(options.length).toBe(1);
    expect(await options[0].isDisabled()).toBe(true);
    expect(liveText(el).toLowerCase()).toContain('loading');
  });

  it('renders the input display via displayWith', async () => {
    const { fixture, host, loader } = setup();
    const objectOptions: AutocompleteOption<unknown>[] = [
      { value: { id: 'a', name: 'Ada' } as Fruit, label: 'Ada' },
    ];
    host.options = objectOptions as AutocompleteOption<string>[];
    host.displayWith = ((v: Fruit | string | null) =>
      v && typeof v === 'object' ? v.name : (v ?? '')) as (
      value: string | null
    ) => string;
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.selectOption({ text: 'Ada' });
    expect(await auto.getValue()).toBe('Ada');
  });

  it('ignores the lightweight disabled input once a control is bound', async () => {
    const { fixture, host, loader } = setup();
    host.disabled = true;
    host.control = new FormControl<string | null>(null);
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    // control is enabled, so the field is enabled despite [disabled]="true"
    expect(await auto.isDisabled()).toBe(false);
    host.control.disable();
    fixture.detectChanges();
    expect(await auto.isDisabled()).toBe(true);
  });

  it('disables the field via the lightweight disabled input', async () => {
    const { fixture, host, loader } = setup();
    host.disabled = true;
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    expect(await auto.isDisabled()).toBe(true);
  });

  it('seeds the input from an already-populated bound control', async () => {
    const { fixture, host, loader } = setup();
    host.control = new FormControl<string | null>('banana');
    fixture.detectChanges();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    expect(await auto.getValue()).toBe('banana');
  });

  it('renders a hint only when provided', () => {
    const { fixture, host, el } = setup();
    expect(el.querySelector('mat-hint')).toBeNull();
    host.hint = 'Start typing to search.';
    fixture.detectChanges();
    expect(el.querySelector('mat-hint')?.textContent?.trim()).toBe(
      'Start typing to search.'
    );
  });

  it('has no accessibility violations for the field and the open panel', async () => {
    const { el, loader } = setup();
    expect(await axe(el)).toHaveNoViolations();
    const auto = await loader.getHarness(MatAutocompleteHarness);
    await auto.focus();
    expect(await axe(overlay(el))).toHaveNoViolations();
  });
});
