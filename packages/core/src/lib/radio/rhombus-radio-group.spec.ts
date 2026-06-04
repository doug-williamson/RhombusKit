import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { axe } from '../../testing/axe';
import {
  RadioOption,
  RhombusRadioGroupComponent,
} from './rhombus-radio-group.component';

@Component({
  standalone: true,
  imports: [RhombusRadioGroupComponent, ReactiveFormsModule],
  template: `
    <rhombus-radio-group
      [label]="label"
      [options]="options"
      [control]="control"
      [value]="value"
      (valueChange)="lastEmitted = $event"
    />
  `,
})
class HostComponent {
  label = 'Priority';
  options: RadioOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'high', label: 'High' },
    { value: 'blocked', label: 'Blocked', disabled: true },
  ];
  control: FormControl<string | null> | null = null;
  value: string | null = null;
  lastEmitted: string | null = null;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function radios(el: HTMLElement): HTMLInputElement[] {
  return Array.from(el.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
}

describe('rhombus-radio-group', () => {
  it('renders one radio per option', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(radios(el).length).toBe(3);
  });

  it('reflects a bound FormControl value as the selected radio', () => {
    const { fixture, host, el } = setup();
    host.control = new FormControl('high');
    fixture.detectChanges();
    const checked = radios(el).find((r) => r.checked);
    expect(checked?.value).toBe('high');
  });

  it('emits valueChange when an option is chosen (uncontrolled)', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    radios(el)[0].click();
    fixture.detectChanges();
    expect(host.lastEmitted).toBe('low');
  });

  it('disables the radio for a disabled option', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    const blocked = radios(el).find((r) => r.value === 'blocked');
    expect(blocked?.disabled).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
